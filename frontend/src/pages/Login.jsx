import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="bg-slate-800 p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Login to Your Account</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-slate-400 mb-1 text-sm">Email</label>
            <input 
              type="email" 
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 text-sm">Password</label>
            <input 
              type="password" 
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg mt-2 transition-colors">
            Login
          </button>
        </form>
        <p className="text-center mt-6 text-slate-400 text-sm">
          Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
