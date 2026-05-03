import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Upload, Save, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    cgpa: '',
    backlogs: '0',
    branch: '',
    year: '',
    skills: []
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = async () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      const updatedSkills = [...profileData.skills, newSkill.trim()];
      setProfileData({ ...profileData, skills: updatedSkills });
      setNewSkill('');
      
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/profile/update', {
          userId: user.id,
          skills: updatedSkills
        }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) { console.error(err); }
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = profileData.skills.filter(s => s !== skillToRemove);
    setProfileData({ ...profileData, skills: updatedSkills });
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/profile/update', {
        userId: user.id,
        skills: updatedSkills
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/profile/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.user) {
          setProfileData({
            cgpa: res.data.user.cgpa || '',
            backlogs: res.data.user.backlogs || '0',
            branch: res.data.user.branch || '',
            year: res.data.user.year || '',
            skills: res.data.user.skills || []
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.id) fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/profile/update', {
        userId: user.id,
        cgpa: parseFloat(profileData.cgpa),
        backlogs: parseInt(profileData.backlogs),
        branch: profileData.branch,
        year: parseInt(profileData.year),
        skills: profileData.skills
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save profile');
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', user.id);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/profile/upload-resume', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setMessage('Resume parsed successfully! Skills extracted.');
      setProfileData({ ...profileData, skills: res.data.skills });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to upload/parse resume.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-4xl flex-col flex gap-6">
      <h2 className="text-2xl font-bold text-white mb-2">My Profile</h2>
      
      {message && (
        <div className="bg-emerald-900/30 text-emerald-400 p-4 rounded-lg border border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info Form */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
          <h3 className="text-xl font-semibold text-white mb-4">Academic Details</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">CGPA</label>
              <input type="number" step="0.01" name="cgpa" value={profileData.cgpa} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Active Backlogs</label>
              <input type="number" name="backlogs" value={profileData.backlogs} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Branch</label>
              <input type="text" name="branch" value={profileData.branch} onChange={handleChange} placeholder="e.g. Computer Science" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Graduation Year</label>
              <input type="number" name="year" value={profileData.year} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200" required />
            </div>
            <button disabled={loading} type="submit" className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg transition text-sm">
              <Save className="w-4 h-4" /> Save Details
            </button>
          </form>
        </div>

        {/* AI Resume Upload */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-4">AI Resume Parser</h3>
          <p className="text-sm text-slate-400 mb-4">Upload your PDF resume. Our basic NLP engine will automatically extract your technical skills to match you with top jobs.</p>
          
          <form onSubmit={handleFileUpload} className="space-y-4 mb-6">
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-900/30 file:text-indigo-400 hover:file:bg-indigo-900/50" />
            <button disabled={loading || !file} type="submit" className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg transition text-sm disabled:opacity-50">
              <Upload className="w-4 h-4" /> Extract Skills
            </button>
          </form>

          {/* Extracted/Manual Skills Map */}
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">My Skills</h4>
            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                value={newSkill} 
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add a new skill (e.g. React)"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
              <button 
                type="button" 
                onClick={handleAddSkill}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm"
              >
                Add
              </button>
            </div>

            {profileData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, idx) => (
                  <span key={idx} className="bg-slate-700 border border-slate-600 text-indigo-300 text-xs pl-2 pr-1 py-1 rounded-full flex items-center gap-1 group">
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-red-400 opacity-50 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No skills added yet. Type above or upload manual.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
