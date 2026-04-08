import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Map, Layers, Shield, User } from 'lucide-react';

export default function AppLayout() {
  return (
    <div className="w-screen h-screen m-0 p-0 overflow-hidden bg-slate-50 relative selection:bg-blue-100 antialiased flex flex-col">
      <div className="flex-1 w-full relative z-0 overflow-y-auto bg-slate-50">
        <Outlet />
      </div>
      
      {/* Premium Glassmorphism Bottom Navigation */}
      <nav className="absolute z-50 bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] flex justify-around items-center px-6 pb-safe">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-blue-600 scale-110 drop-shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Map size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Map</span>
        </NavLink>
        
        <NavLink 
          to="/feed" 
          className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Layers size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Feed</span>
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-blue-600 scale-110 drop-shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <User size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
        </NavLink>

        <NavLink 
          to="/admin" 
          className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-indigo-600 scale-110 drop-shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Shield size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Worker</span>
        </NavLink>
      </nav>
      
      <style dangerouslySetInnerHTML={{__html: `
        .pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 1rem); }
      `}} />
    </div>
  );
}
