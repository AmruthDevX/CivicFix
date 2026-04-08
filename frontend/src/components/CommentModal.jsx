import React, { useState, useEffect } from 'react';
import { X, Send, User, MessageCircle } from 'lucide-react';
import { getComments, postComment } from '../api';

export default function CommentModal({ report, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [report.id]);

  const fetchComments = async () => {
    try {
      const { data } = await getComments(report.id);
      setComments(data);
    } catch (e) {
      console.warn('Failed to fetch comments:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await postComment(report.id, newComment);
      setComments([...comments, data]);
      setNewComment('');
    } catch (e) {
      alert('Error posting comment: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-slide-up">
      <div className="bg-white w-full sm:w-full max-w-md rounded-t-[2rem] sm:rounded-3xl flex flex-col max-h-[80vh] shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <MessageCircle size={20} />
             </div>
             <div>
               <h2 className="text-lg font-bold">Discussion</h2>
               <p className="text-xs text-slate-500 font-medium">Ticket: {report.ticket_id}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold uppercase tracking-widest">Loading thread...</p>
             </div>
          ) : comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                  <User size={16} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-700">Neighbor</span>
                    <span className="text-[10px] text-slate-400 font-medium">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none text-sm text-slate-600 border border-slate-100 italic">
                    {c.content}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 opacity-60">
               <MessageCircle size={48} className="mb-2" />
               <p className="text-sm font-medium italic">No comments yet. Start the conversation!</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              className="w-full bg-white border border-slate-200 p-4 pr-14 rounded-2xl focus:outline-none focus:border-blue-500 shadow-sm text-sm"
              placeholder="Write a message..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:bg-slate-400 active:scale-90"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
