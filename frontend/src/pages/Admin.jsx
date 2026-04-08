import React, { useState, useEffect } from 'react';
import { getReports, updateStatus } from '../api';
import { List, MapIcon, ChevronRight } from 'lucide-react';

export default function Admin() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  
  useEffect(() => {
    if (isAuthorized) {
      fetchReports();
    }
  }, [isAuthorized]);

  const fetchReports = async () => {
    try {
      const { data } = await getReports();
      setReports(data.reverse());
    } catch (e) {
      console.warn('Could not fetch reports from backend:', e.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus(id, { status: newStatus, note: 'Admin updated from panel' });
      fetchReports();
      if (selectedReport && selectedReport.id === id) {
         setSelectedReport(prev => ({...prev, status: newStatus}));
      }
    } catch(e) {
      console.warn('Failed to update status:', e.message);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (accessCode === import.meta.env.VITE_ENGINEER_ACCESS_CODE || accessCode === 'admin123') {
      setIsAuthorized(true);
    } else {
      alert('Invalid Engineer Access Code');
    }
  };

  // Engineer Login Gate
  if (!isAuthorized) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 relative overflow-hidden pb-20">
         <div className="absolute top-20 right-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
         <div className="absolute top-40 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
         
         <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-w-md w-full relative z-10 border border-slate-100">
           <div className="mb-8 text-center">
             <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <MapIcon size={32} />
             </div>
             <h1 className="text-3xl font-extrabold text-slate-800">Engineer Portal</h1>
             <p className="text-slate-500 mt-2 font-medium">Triage & Ticketing Access</p>
           </div>
           
           <form onSubmit={handleLogin} className="flex flex-col gap-5">
             <div>
               <label className="text-sm font-bold text-slate-700 block mb-2">Access Code</label>
               <input 
                 type="password"
                 className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:outline-none focus:border-blue-500 font-mono tracking-widest text-center text-lg"
                 placeholder="••••••••"
                 value={accessCode}
                 onChange={(e) => setAccessCode(e.target.value)}
                 required
               />
             </div>
             <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-4 font-bold tracking-wide hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
               Authenticate
             </button>
           </form>
           
           <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <p className="text-xs text-slate-400 font-medium">Demo Access Note:</p>
             <p className="text-sm font-mono font-bold text-indigo-600 mt-1">admin123</p>
           </div>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full pb-20 flex flex-col md:flex-row bg-slate-50 overflow-hidden">
       <div className="w-full md:w-1/3 h-[40%] md:h-full border-r border-slate-200 bg-white flex flex-col shadow-md z-10">
         <div className="p-5 border-b border-slate-200">
           <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Worker Dashboard</h1>
           <p className="text-sm text-slate-500 mt-1">{reports.length} issues reported</p>
         </div>
         <div className="flex-1 overflow-y-auto">
           {reports.map(r => (
             <div 
               key={r.id} 
               onClick={() => setSelectedReport(r)}
               className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 flex items-start gap-3 transition-colors ${selectedReport?.id === r.id ? 'bg-blue-50/50' : ''}`}
             >
                <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${r.status === 'resolved' ? 'bg-green-500' : r.status==='in_progress' ? 'bg-amber-500' : 'bg-red-500'}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">{r.category}</span>
                    <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">{r.description}</h3>
                  <div className="text-xs text-slate-400 mt-2 font-mono">ID: {r.ticket_id}</div>
                </div>
             </div>
           ))}
         </div>
       </div>

       <div className="w-full md:w-2/3 h-[60%] md:h-full bg-slate-50 p-4 md:p-6 overflow-y-auto flex flex-col">
         {selectedReport ? (
           <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex-1 flex flex-col mb-4">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                 <div>
                   <h2 className="text-2xl font-bold">{selectedReport.category.toUpperCase()}</h2>
                   <p className="text-slate-500 font-mono text-sm mt-1">Ticket: {selectedReport.ticket_id}</p>
                 </div>
                 <div className="flex gap-2">
                   {['reported', 'in_progress', 'resolved'].map(st => (
                      <button 
                        key={st}
                        onClick={() => handleStatusChange(selectedReport.id, st)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                          selectedReport.status === st 
                            ? (st === 'resolved' ? 'bg-green-100 text-green-700' : st === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                         {st.replace('_', ' ')}
                      </button>
                   ))}
                 </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                 <h3 className="font-semibold text-slate-800 mb-2">Description</h3>
                 <p className="text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl">{selectedReport.description}</p>
                 
                 <h3 className="font-semibold text-slate-800 mb-3">Uploaded Photos</h3>
                 {selectedReport.images && selectedReport.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedReport.images.map((img, i) => (
                        <div key={i} className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                           <img src={img} alt="issue" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                 ) : (
                    <p className="text-sm text-slate-500 italic">No photos attached to this report.</p>
                 )}

                 <h3 className="font-semibold text-slate-800 mb-3 mt-8">Status History</h3>
                 <div className="flex flex-col gap-4">
                   {selectedReport.status_history?.map((h, i) => (
                     <div key={i} className="flex gap-3 text-sm">
                       <div className="flex flex-col items-center">
                         <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1"></div>
                         {i !== selectedReport.status_history.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-1"></div>}
                       </div>
                       <div className="pb-4">
                         <span className="font-semibold capitalize">{h.status.replace('_', ' ')}</span>
                         <span className="text-slate-500 ml-2">by {h.actor}</span>
                         <div className="text-xs text-slate-400 mt-1">{new Date(h.timestamp).toLocaleString()}</div>
                         {h.note && <div className="mt-1 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">{h.note}</div>}
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
           </div>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
             <List size={48} className="mb-4 opacity-50" />
             <p className="text-lg font-medium">Select a report to view details</p>
           </div>
         )}
       </div>
    </div>
  );
}
