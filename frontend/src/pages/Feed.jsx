import React, { useState, useEffect } from 'react';
import { getReports, toggleUpvote } from '../api';
import { MessageSquare, ThumbsUp, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CommentModal from '../components/CommentModal';
import { exportReportPDF, generateDCLetter } from '../lib/PDFUtils';
import { FileText, ShieldAlert } from 'lucide-react';

export default function Feed() {
  const [reports, setReports] = useState([]);
  const [activeComments, setActiveComments] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await getReports();
      setReports(data.reverse());
    } catch (e) {
      console.warn('Backend unavailable:', e.message);
    }
  };

  const handleUpvote = async (report) => {
    try {
      const updated = await toggleUpvote(report.id, report.upvotes);
      setReports(reports.map(r => r.id === report.id ? { ...r, upvotes: updated.upvotes } : r));
    } catch (e) {
       // Local optimistic update if DB fails or for hackathon feel
       setReports(reports.map(r => r.id === report.id ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r));
    }
  };

  const handleView = (report) => {
    navigate('/', { state: { focus: { lat: report.lat, lng: report.lng }, id: report.id } });
  };

  const isDelayed = (createdAt) => {
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
    return (Date.now() - new Date(createdAt).getTime()) > twoDaysInMs;
  };

  const getStatusBadge = (status) => {
     if (status === 'resolved') return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Resolved</span>;
     if (status === 'in_progress') return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">In Progress</span>;
     return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Reported</span>;
  };

  return (
    <div className="w-full h-full pb-24 bg-slate-50 flex flex-col items-center">
       <div className="w-full max-w-lg p-5">
         <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-2">Community Feed</h1>
         <p className="text-slate-500 text-sm mb-6">See what your neighbors are reporting to improve the city.</p>
         
         <div className="flex flex-col gap-6">
           {reports.map(r => (
              <div key={r.id} className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4 transition-transform hover:-translate-y-1">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {r.ticket_id?.slice(-2) || 'ID'}
                       </div>
                       <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm uppercase">{r.category}</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12} /> {new Date(r.created_at).toLocaleDateString()}</span>
                       </div>
                    </div>
                    {getStatusBadge(r.status)}
                 </div>

                 <p className="text-slate-600 text-sm leading-relaxed">{r.description}</p>
                 
                 {r.images && r.images.length > 0 && (
                   <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-100 -mx-1">
                      <img src={r.images[0]} alt="issue" className="w-full h-full object-cover" />
                   </div>
                 )}

                   <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-slate-400 text-sm font-medium p-1">
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleUpvote(r)}
                          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                        >
                           <ThumbsUp size={16} className={r.upvotes > 0 ? 'text-blue-600 fill-blue-600/20' : ''} /> 
                           <span className={`text-xs ${r.upvotes > 0 ? 'text-blue-600 font-bold' : ''}`}>
                             {r.upvotes > 0 ? `${r.upvotes}` : 'Upvote'}
                           </span>
                        </button>
                        <button 
                          onClick={() => setActiveComments(r)}
                          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                        >
                           <MessageSquare size={16} /> <span className="text-xs">Comment</span>
                        </button>
                        <button 
                          onClick={() => exportReportPDF(r)}
                          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                          title="Download PDF Report"
                        >
                           <FileText size={16} /> <span className="text-xs">PDF</span>
                        </button>
                      </div>
                      
                      <div className="flex gap-2">
                         {r.status !== 'resolved' && isDelayed(r.created_at) && (
                           <button 
                             onClick={() => generateDCLetter(r)}
                             className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full hover:bg-amber-100 transition-all border border-amber-200 group relative"
                           >
                              <ShieldAlert size={14} className="group-hover:animate-pulse" /> 
                              <span className="text-[10px] font-bold uppercase tracking-tight">Escalate to DC</span>
                           </button>
                         )}
                         <button 
                           onClick={() => handleView(r)}
                           className="flex items-center gap-1.5 hover:text-blue-600 transition-colors bg-slate-100 px-3 py-1 rounded-full"
                         >
                            <MapPin size={14} /> <span className="text-[10px] font-bold uppercase">Map</span>
                         </button>
                      </div>
                   </div>
              </div>
           ))}
           {reports.length === 0 && (
              <div className="text-center text-slate-400 py-10">No reports found yet. Be the first!</div>
           )}
         </div>
       </div>

       {activeComments && (
          <CommentModal 
            report={activeComments} 
            onClose={() => setActiveComments(null)} 
          />
       )}
    </div>
  );
}
