import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let authResponse;
    if (isLogin) {
      authResponse = await supabase.auth.signInWithPassword({ email, password });
    } else {
      authResponse = await supabase.auth.signUp({ email, password });
    }

    if (authResponse.error) {
      setError(authResponse.error.message);
    } else if (authResponse.data?.user) {
      if (!isLogin && !authResponse.data.session) {
         setError('Check your email for the confirmation link to continue.');
      } else {
         onLogin(authResponse.data.session);
      }
    }
    setLoading(false);
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
       {/* Decorative backgrounds */}
       <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[100px]" />
       <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[100px]" />

       <div className="relative z-10 w-full max-w-sm px-6">
         <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
               <MapPin size={32} className="text-white" />
            </div>
         </div>
         
         <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">CivicFix</h1>
            <p className="text-slate-500 mt-2">{isLogin ? 'Welcome back! Let\'s improve our city.' : 'Join your neighbors in fixing the city.'}</p>
         </div>

         <form onSubmit={handleAuth} className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white flex flex-col gap-4">
            {error && (
               <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
                  {error}
               </div>
            )}
            <div className="flex flex-col gap-1.5">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
               <div className="relative">
                 <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="email" 
                   required
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   className="w-full bg-slate-50/50 border border-slate-200 p-3.5 pl-11 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 ring-blue-500/10 transition-all font-medium" 
                   placeholder="neighbor@city.com" 
                 />
               </div>
            </div>
            <div className="flex flex-col gap-1.5 mb-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
               <div className="relative">
                 <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="password" 
                   required
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   className="w-full bg-slate-50/50 border border-slate-200 p-3.5 pl-11 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 ring-blue-500/10 transition-all font-medium" 
                   placeholder="••••••••" 
                 />
               </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full font-bold text-lg shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
              {!loading && <ArrowRight size={20} />}
            </button>
         </form>

          <div className="mt-8 text-center flex flex-col gap-4">
            <button 
              onClick={() => {setIsLogin(!isLogin); setError(null)}} 
              className="text-slate-500 hover:text-blue-600 font-semibold transition-colors text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
            
            <div className="pt-4 border-t border-slate-200">
               <a 
                 href="/admin" 
                 className="text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
               >
                 <Lock size={12} /> Engineer Portal Access
               </a>
            </div>
          </div>
       </div>
    </div>
  );
}
