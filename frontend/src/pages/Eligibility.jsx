import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Building2, CheckCircle2, XCircle, Search, AlertTriangle, Briefcase, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Eligibility = () => {
  const { user } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (job) => {
    setApplyingTo(job._id);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/applications', {
        companyName: job.companyName,
        role: job.role,
        status: 'Applied',
        date: new Date().toISOString().split('T')[0],
        deadline: '',
        notes: 'Applied automatically via Smart Recommender Eligibility Match'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg(`Successfully registered for ${job.companyName}! Track it in your Dashboard.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error(error);
      setSuccessMsg(`Failed to register for ${job.companyName}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
    setApplyingTo(null);
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/jobs/recommendations/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecommendations(res.data.recommendations || []);
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchRecommendations();
  }, [user]);

  const filteredRecs = recommendations.filter(rec => 
    rec.job.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const eligibleCount = recommendations.filter(r => r.isEligible).length;

  return (
    <div className="w-full flex-col flex gap-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
        <h2 className="text-2xl font-bold text-white mb-2">Smart Eligibility Matcher</h2>
        <p className="text-slate-400 mb-6">
          AI-driven matching based on your profile (CGPA, Backlogs, Branch, and Parsed Resume Skills).
        </p>

        {successMsg && (
          <div className="bg-emerald-900/30 border border-emerald-800 p-4 rounded-lg flex items-center gap-2 mb-6 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {!loading && recommendations.length > 0 && (
          <div className="bg-indigo-900/30 border border-indigo-800 p-4 rounded-lg flex items-start gap-4 mb-6">
            <Briefcase className="text-indigo-400 w-6 h-6 shrink-0 mt-1" />
            <div>
              <p className="text-indigo-200 font-medium text-lg">
                You are currently fully eligible for <span className="text-white font-bold">{eligibleCount}</span> positions out of {recommendations.length}.
              </p>
              <p className="text-indigo-400 text-sm mt-1">Keep learning to increase your match percentage on other roles!</p>
            </div>
          </div>
        )}
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search Company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Analyzing your profile...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-slate-700">
          {filteredRecs.map((rec, index) => {
            const { job, matchPercentage, isEligible, reasons } = rec;
            
            return (
              <div 
                key={index} 
                className={`p-5 rounded-xl border flex flex-col justify-between ${isEligible ? 'bg-emerald-900/10 border-emerald-800/40 relative overflow-hidden' : 'bg-slate-800/80 border-slate-700'}`}
              >
                {isEligible && (
                  <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
                )}
                
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isEligible ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className={`font-semibold text-lg ${isEligible ? 'text-emerald-100' : 'text-slate-300'}`}>
                          {job.companyName}
                        </h3>
                        <p className="text-xs text-slate-400">{job.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      {isEligible ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
                      ) : (
                        <XCircle className="w-6 h-6 text-slate-600 mb-1" />
                      )}
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${matchPercentage >= 70 ? 'bg-emerald-900/50 text-emerald-400' : matchPercentage >= 40 ? 'bg-amber-900/50 text-amber-400' : 'bg-red-900/50 text-red-400'}`}>
                        {matchPercentage}% Match
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm mt-4">
                    {!isEligible && reasons.length > 0 && (
                      <div className="bg-red-900/20 border border-red-900/50 rounded p-3 mb-2">
                        <p className="text-red-400 text-xs font-semibold mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Why you are not eligible:</p>
                        <ul className="text-red-300/80 text-xs list-disc pl-4 space-y-1">
                          {reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                        </ul>
                      </div>
                    )}
                    {isEligible && reasons.length > 0 && (
                      <div className="bg-amber-900/20 border border-amber-900/50 rounded p-3 mb-2">
                         <p className="text-amber-400 text-xs font-semibold mb-1">Missing Preferred Skills:</p>
                         <ul className="text-amber-300/80 text-xs list-disc pl-4 space-y-1">
                          {reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-end text-xs text-slate-500">
                   <div className="flex flex-col gap-1">
                     <span>Min CGPA: {job.cgpaRequired}</span>
                     <span>Max Backlogs: {job.maxBacklogs}</span>
                   </div>
                   {isEligible && (
                     <button
                       disabled={applyingTo === job._id}
                       onClick={() => handleRegister(job)}
                       className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
                     >
                       {applyingTo === job._id ? 'Registering...' : 'Register Now'}
                     </button>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredRecs.length === 0 && (
         <div className="text-center py-10 bg-slate-800 rounded-xl border border-slate-700">
           <p className="text-slate-400">No companies found matching "{searchTerm}"</p>
         </div>
      )}
    </div>
  );
};

export default Eligibility;
