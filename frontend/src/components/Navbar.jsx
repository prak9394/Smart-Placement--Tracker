import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 py-4 px-6 md:px-12 flex justify-between items-center shadow-md">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
        <Briefcase className="w-6 h-6" />
        <span>Placement Tracker</span>
      </Link>
      
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-slate-300 hover:text-white px-3 py-2 transition-colors hidden md:block">Dashboard</Link>
            <Link to="/eligibility" className="text-slate-300 hover:text-white px-3 py-2 transition-colors">Eligibility</Link>
            <Link to="/profile" className="text-slate-300 hover:text-white px-3 py-2 transition-colors">Profile</Link>
            <span className="text-indigo-400 font-medium hidden md:inline-block ml-2">Hello, {user.name}</span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm transition-colors text-slate-200 ml-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="text-slate-300 hover:text-white px-3 py-2 transition-colors">Login</Link>
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
