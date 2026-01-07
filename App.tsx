
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Withdraw from './pages/Withdraw';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Support from './pages/Support';
import { UserProfile, UserRole } from './types';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setUser(data as UserProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0095FF]"></div>
           <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Đang kết nối LinkGold...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {user ? (
          <div className="flex flex-1 flex-col md:flex-row overflow-hidden h-screen">
            <Sidebar user={user} onLogout={handleLogout} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Navbar user={user} />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F8FAFC]">
                <Routes>
                  <Route path="/" element={<Dashboard user={user} />} />
                  <Route path="/tasks" element={<Tasks user={user} />} />
                  <Route path="/withdraw" element={<Withdraw user={user} setUser={setUser} />} />
                  <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
                  <Route path="/support" element={<Support />} />
                  {user.role === UserRole.ADMIN && (
                    <Route path="/admin" element={<AdminDashboard />} />
                  )}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={() => {}} />} />
            <Route path="/register" element={<Register onLogin={() => {}} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </HashRouter>
  );
};

export default App;
