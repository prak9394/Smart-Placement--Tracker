import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, Building2, Briefcase, Calendar, FileText } from 'lucide-react';

const ApplicationForm = ({ onClose, editingApp }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    status: 'Applied',
    date: new Date().toISOString().split('T')[0],
    deadline: '',
    notes: ''
  });

  useEffect(() => {
    if (editingApp) {
      setFormData({
        ...editingApp,
        date: new Date(editingApp.date).toISOString().split('T')[0],
        deadline: editingApp.deadline ? new Date(editingApp.deadline).toISOString().split('T')[0] : ''
      });
    }
  }, [editingApp]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingApp) {
        await api.put(`/applications/${editingApp._id}`, formData);
      } else {
        await api.post('/applications', formData);
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div 
        className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700 overflow-hidden transform transition-all"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-900/30">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {editingApp ? 'Edit Application' : 'Add New Application'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="text-slate-400 mb-1.5 text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Company Name
              </label>
              <input 
                type="text" 
                name="companyName"
                autoFocus
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Google"
                required 
              />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="text-slate-400 mb-1.5 text-sm font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Role
              </label>
              <input 
                type="text" 
                name="role"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g. Frontend GenAI"
                required 
              />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-slate-400 mb-1.5 text-sm font-medium">Status</label>
              <select
                name="status"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="text-slate-400 mb-1.5 text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Date Applied
              </label>
              <input 
                type="date" 
                name="date"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [&::-webkit-calendar-picker-indicator]:invert"
                value={formData.date}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="text-slate-400 mb-1.5 text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-400" /> Deadline
              </label>
              <input 
                type="date" 
                name="deadline"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [&::-webkit-calendar-picker-indicator]:invert"
                value={formData.deadline || ''}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-span-2">
              <label className="text-slate-400 mb-1.5 text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" /> Notes
              </label>
              <textarea 
                name="notes"
                rows="3"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Interview details, important links, feedback, etc."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4 pt-5 border-t border-slate-700 py-1">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors font-medium border border-transparent hover:border-slate-600"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30 font-medium"
            >
              {editingApp ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
