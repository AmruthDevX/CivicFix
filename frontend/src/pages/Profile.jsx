import React, { useState, useEffect } from 'react';
import { getReports, signOut } from '../api';
import { LogOut, CheckCircle, Clock, MapPin } from 'lucide-react';

export default function Profile({ session }) {
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReports();
  }, [session]);

  const fetchMyReports = async () => {
    try {
      const { data } = await getReports({ user_id: session?.user?.id });
      setMyReports(data || []);
    } catch (e) {
      console.warn('Could not load user reports:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVisuals = (status) => {
     if (status === 'resolved') return { color: 'text-green-600', bg: 'bg-green-100', text: 'Resolved' };
     if (status === 'in_progress') return { color: 'text-amber-600', bg: 'bg-amber-100', text: 'In Progress' };
     return { color: 'text-slate-600', bg: 'bg-slate-100', text: 'Reported' };
  };

  return (
    <div className="w-full h-full pb-24 overflow-y-auto bg-slate-50 flex flex-col items-center">
       <div className="w-full max-w-lg p-5">
         
         {/* Profile Header */}
         <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between mb-6">
            <div>
               <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">My Reports</h1>
               <p className="text-sm font-medium text-slate-500">{session?.user?.email}</p>
            </div>
            <button 
              onClick={() => signOut()}
              className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-full transition-colors flex items-center gap-2"
            >
               <LogOut size={20} />
            </button>
         </div>

         {/* Issue Tracking Timeline */}
         <div className="flex flex-col gap-4">
           <h2 className="font-bold text-slate-700 ml-2">Tracking History</h2>
           
           {loading ? (
             <div className="p-4 text-center text-slate-500">Loading your reports...</div>
           ) : myReports.length === 0 ? (
             <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-slate-100">
               <CheckCircle size={48} className="mx-auto text-slate-300 mb-3" />
               <p className="text-slate-600 font-medium">You haven't reported any issues yet.</p>
               <p className="text-sm text-slate-400 mt-1">Head over to the Map to drop a pin.</p>
             </div>
           ) : (
             myReports.map(r => {
               const st = getStatusVisuals(r.status);
               return (
                 <div key={r.id} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100">
                    <div className="flex justify-between items-start mb-3">
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-800 uppercase">{r.category}</span>
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>
                               {st.text}
                            </span>
                         </div>
                         <div className="text-xs text-slate-400 font-mono">Ticket: {r.ticket_id}</div>
                       </div>
                       <div className="text-left flex flex-col items-end">
                         <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> {new Date(r.created_at).toLocaleDateString()}</span>
                       </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl">{r.description}</p>
                    
                    {/* Status History mini-timeline */}
                    <div className="pt-4 border-t border-slate-100">
                       <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Updates</h3>
                       <div className="flex flex-col gap-3">
                         {r.status_history?.map((h, i) => (
                           <div key={i} className="flex gap-3 text-sm">
                              <div className="flex flex-col items-center">
                                 <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1"></div>
                                 {i !== r.status_history.length - 1 && <div className="w-0.5 h-full bg-slate-200 my-1"></div>}
                              </div>
                              <div className="pb-1">
                                 <span className="font-semibold capitalize text-slate-700">{h.status.replace('_', ' ')}</span>
                                 {h.note && <p className="text-xs text-slate-500 mt-0.5">{h.note}</p>}
                                 <span className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleString()}</span>
                              </div>
                           </div>
                         ))}
                       </div>
                    </div>
                 </div>
               )
             })
           )}
         </div>

       </div>
    </div>
  );
}
