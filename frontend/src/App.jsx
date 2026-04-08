import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import AppLayout from './components/AppLayout';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="w-screen h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!session) {
    return <Auth onLogin={setSession} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home session={session} />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile" element={<Profile session={session} />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
