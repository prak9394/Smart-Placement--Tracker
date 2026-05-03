import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, TrendingUp, Clock, Target, Activity } from 'lucide-react';
import ApplicationForm from '../components/ApplicationForm';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [filter, setFilter] = useState('All');
  const [alerts, setAlerts] = useState([]);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const checkAlerts = async () => {
    try {
      const res = await api.get('/applications/alerts/check');
      const activeAlerts = res.data.alerts || [];
      setAlerts(activeAlerts);
      
      // Trigger Native Browser Notifications
      if (activeAlerts.length > 0 && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Application Deadline Alert!', {
            body: `You have ${activeAlerts.length} application(s) with an upcoming deadline within 2 days.`,
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('Application Deadline Alert!', {
                body: `You have ${activeAlerts.length} application(s) with an upcoming deadline within 2 days.`,
              });
            }
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApplications();
    checkAlerts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await api.delete(`/applications/${id}`);
        setApplications(applications.filter((app) => app._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openEditModal = (app) => {
    setEditingApp(app);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingApp(null);
    setIsModalOpen(false);
    fetchApplications();
  };

  // Analytics Computation
  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'Applied').length,
    interview: applications.filter(a => a.status === 'Interview').length,
    offer: applications.filter(a => a.status === 'Offer').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  const successRate = (stats.offer + stats.rejected) > 0 
    ? ((stats.offer / (stats.offer + stats.rejected)) * 100).toFixed(1) 
    : 0;

  const calculateAvgResponseTime = () => {
    let totalTime = 0;
    let count = 0;
    applications.forEach(app => {
      if (app.status !== 'Applied' && app.createdAt && app.updatedAt) {
        const createdDate = new Date(app.createdAt);
        const updatedDate = new Date(app.updatedAt);
        const diffTime = Math.abs(updatedDate - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Only count if it's not instant update (e.g. diffDays >= 1 or at least > 0)
        totalTime += diffDays;
        count++;
      }
    });
    return count > 0 ? Math.round(totalTime / count) : 0;
  };
  const avgResponseTime = calculateAvgResponseTime();

  // Chart Data Preparation
  const pieData = [
    { name: 'Applied', value: stats.applied, color: '#3b82f6' }, // blue
    { name: 'Interview', value: stats.interview, color: '#eab308' }, // yellow
    { name: 'Offer', value: stats.offer, color: '#22c55e' }, // green
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' }, // red
  ].filter(d => d.value > 0);

  const sortedApps = [...applications].sort((a,b) => new Date(a.date) - new Date(b.date));
  const barDataMap = new Map();
  sortedApps.forEach(app => {
    const month = new Date(app.date).toLocaleString('default', { month: 'short', year: '2-digit' });
    barDataMap.set(month, (barDataMap.get(month) || 0) + 1);
  });
  const barData = Array.from(barDataMap.entries()).map(([name, count]) => ({ name, count }));

  const filteredApps = filter === 'All' ? applications : applications.filter(a => a.status === filter);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-5 h-5" />
          <span>Add Application</span>
        </button>
      </div>

      {alerts.length > 0 && (
        <div className="mb-6 bg-red-900/30 border-l-4 border-red-500 p-4 rounded text-red-200">
          <p className="font-bold flex items-center gap-2"><span className="text-red-400">⚠️ Deadline Alert:</span> You have {alerts.length} application(s) with an upcoming deadline within 2 days.</p>
          <ul className="list-disc ml-8 mt-1 text-sm">
            {alerts.map(a => (
              <li key={a._id}>{a.companyName} ({a.role}) - Due: {new Date(a.deadline).toLocaleDateString()}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Advanced Analytics Section */}
      {applications.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Key Insights Overview */}
          <div className="lg:col-span-1 grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-center items-center text-center">
              <div className="bg-indigo-900/30 p-3 rounded-full mb-2"><Activity className="w-6 h-6 text-indigo-400"/></div>
              <p className="text-sm text-slate-400 font-medium">Total Apps</p>
              <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-center items-center text-center">
              <div className="bg-green-900/30 p-3 rounded-full mb-2"><Target className="w-6 h-6 text-green-400"/></div>
              <p className="text-sm text-slate-400 font-medium">Success Rate</p>
              <h3 className="text-2xl font-bold text-green-400">{successRate}%</h3>
              <p className="text-[10px] text-slate-500 mt-1">(Offers / Decided)</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-center items-center text-center col-span-2">
              <div className="bg-amber-900/30 p-3 rounded-full mb-2"><Clock className="w-6 h-6 text-amber-400"/></div>
              <p className="text-sm text-slate-400 font-medium">Avg Response Time</p>
              <h3 className="text-2xl font-bold text-amber-400">{avgResponseTime} {avgResponseTime === 1 ? 'day' : 'days'}</h3>
              <p className="text-xs text-slate-500 mt-1">From application to status change</p>
            </div>
          </div>

          {/* Status Breakdown Pie Chart */}
          <div className="p-5 bg-slate-800 rounded-xl border border-slate-700 shadow-sm flex flex-col items-center">
            <h3 className="text-white font-semibold mb-2 self-start"><TrendingUp className="inline w-5 h-5 mr-2 text-indigo-400"/>Status Breakdown</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 text-xs font-medium text-slate-400 mt-2 flex-wrap justify-center">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span> {d.name} ({Math.round(d.value/stats.total*100)}%)</div>
              ))}
            </div>
          </div>

          {/* Applications Per Month Bar Chart */}
          <div className="p-5 bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
             <h3 className="text-white font-semibold mb-4"><Activity className="inline w-5 h-5 mr-2 text-indigo-400"/>Activity Timeline</h3>
             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      cursor={{ fill: '#334155', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.5rem' }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

        </div>
      )}

      {/* Legacy Filter Bar */}
      <h3 className="text-xl font-bold text-white mb-4">Application History</h3>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Applied', 'Interview', 'Offer', 'Rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === status ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
                <th className="p-5 font-medium">Company</th>
                <th className="p-5 font-medium">Role</th>
                <th className="p-5 font-medium">Status</th>
                <th className="p-5 font-medium">Date Applied</th>
                <th className="p-5 font-medium">Deadline</th>
                <th className="p-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-slate-900 p-4 rounded-full">
                        <Plus className="w-8 h-8 text-slate-600" />
                      </div>
                      <p>No applications found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="p-5">
                      <div className="font-semibold text-white text-base bg-gradient-to-r gap-2 flex items-center">
                        {app.companyName}
                      </div>
                      {app.notes && <div className="text-xs text-slate-400 truncate max-w-[250px] mt-1.5">{app.notes}</div>}
                    </td>
                    <td className="p-5 text-slate-300 font-medium">{app.role}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                        app.status === 'Applied' ? 'bg-blue-900/20 text-blue-400 border-blue-800' :
                        app.status === 'Interview' ? 'bg-yellow-900/20 text-yellow-500 border-yellow-800' :
                        app.status === 'Offer' ? 'bg-green-900/20 text-green-400 border-green-800' :
                        'bg-red-900/20 text-red-500 border-red-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-5 text-slate-400 text-sm">
                      {new Date(app.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-5 text-red-300 font-medium text-sm">
                      {app.deadline ? new Date(app.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                    </td>
                    <td className="p-5 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(app)} className="p-2 text-slate-400 hover:text-indigo-400 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-all hover:scale-105">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(app._id)} className="p-2 text-slate-400 hover:text-red-400 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-all hover:scale-105">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ApplicationForm 
          onClose={closeModal} 
          editingApp={editingApp} 
        />
      )}
    </div>
  );
};

export default Dashboard;
