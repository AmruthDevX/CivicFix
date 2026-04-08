import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Navigation, Key } from 'lucide-react';
import CivicMap from '../components/CivicMap';
import ReportModal from '../components/ReportModal';
import { getReports } from '../api';

export default function Home() {
  const [reports, setReports] = useState([]);
  const [isReporting, setIsReporting] = useState(false);
  const [userLoc, setUserLoc] = useState(null);
  const [locationError, setLocationError] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetchReports();
    
    // Check if we came from feed with a focus request
    if (location.state?.focus) {
      setUserLoc(location.state.focus);
    } else if (navigator.geolocation) {
       // Only auto-locate if not focused on a specific issue
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationError(''); },
        (err) => { console.warn('Location denied'); setLocationError('Location access blocked by browser.'); }
      );
    } else {
       setLocationError('Geolocation not supported by device.');
    }
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await getReports();
      setReports(data);
    } catch (err) {
      console.warn('Backend unavailable, continuing without reports:', err.message);
    }
  };

  const startReport = () => {
    setIsReporting(true);
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-0 z-10 w-full p-4 pointer-events-none">
        <div className="bg-white/90 backdrop-blur shadow-lg rounded-2xl p-4 pointer-events-auto flex justify-between items-center border border-slate-100">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CivicFix</h1>
          <button 
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => { setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationError(''); },
                  (err) => { setLocationError('Ensure location services are enabled on your Windows/Browser settings.'); alert('Location access is blocked.'); }
                );
              }
            }}
          >
            <Navigation size={18} />
            Find Me
          </button>
        </div>
        {locationError && (
          <div className="mt-3 bg-white/90 backdrop-blur shadow-md rounded-xl p-3 border-l-4 border-amber-500 pointer-events-auto flex items-center justify-between animate-slide-up">
            <span className="text-xs font-semibold text-amber-700">{locationError}</span>
            <button onClick={() => setLocationError('')} className="text-slate-400 hover:text-amber-700 ml-2">✕</button>
          </div>
        )}
      </div>

      <CivicMap reports={reports} userLoc={userLoc} />

      {!isReporting && (
         <div className="absolute bottom-28 left-0 right-0 flex justify-center z-20 pointer-events-none">
           <div className="relative pointer-events-auto group">
             <div className="absolute -inset-1 bg-blue-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
             <button 
               onClick={startReport}
               className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full flex items-center gap-3 font-extrabold text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all"
             >
               <Plus size={24} className="animate-spin-slow" />
               Report Issue
             </button>
           </div>
         </div>
      )}

      {isReporting && (
        <ReportModal 
           onClose={() => setIsReporting(false)} 
           onSuccess={() => { setIsReporting(false); fetchReports(); }} 
           initialLoc={userLoc}
        />
      )}
    </div>
  );
}
