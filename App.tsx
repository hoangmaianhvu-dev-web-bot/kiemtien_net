
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
import { UserProfile } from './types';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    };
    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user.id, session.user.email);
      else { setUser(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      // 1. Lấy đúng các cột: id, username, xu, role
      const { data, error } = await supabase
        .from('users')
        .select('id, username, xu, role')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      let profileData: UserProfile;

      // 2. Nếu không tìm thấy, tự động tạo mới role 'user' [cite: 2025-12-30]
      if (!data) {
        const username = email ? email.split('@')[0] : 'User_' + userId.slice(0, 5);
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({ 
            id: userId, 
            username: username, 
            role: 'user', 
            xu: 0 
          })
          .select('id, username, xu, role')
          .single();
        if (createError) throw createError;
        profileData = newProfile as UserProfile;
      } else {
        profileData = data as UserProfile;
      }

      // 3. ĐẶC QUYỀN ADMIN [cite: 2026-01-08]
      if (
        profileData.id === '0337117930' || 
        profileData.username === '0337117930' || 
        email === 'admin@linkgold.pro'
      ) {
        profileData.role = 'admin';
        // Cập nhật role vào DB nếu cần
        if (data && data.role !== 'admin') {
          await supabase.from('users').update({ role: 'admin' }).eq('id', userId);
        }
      }

      setUser(profileData);
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0095FF]"></div>
    </div>
  );

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
                  <Route path="/tasks" element={<Tasks user={user} setUser={setUser} />} />
                  <Route path="/withdraw" element={<Withdraw user={user} setUser={setUser} />} />
                  <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
                  <Route path="/support" element={<Support />} />
                  {user.role === 'admin' && <Route path="/admin" element={<AdminDashboard />} />}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={() => {}} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </HashRouter>
  );
};

export default App;
