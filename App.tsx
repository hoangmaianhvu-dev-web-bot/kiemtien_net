
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Withdraw from './pages/Withdraw';
import Deposit from './pages/Deposit';
import Store from './pages/Store';
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
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Lỗi khởi tạo App:', err);
        setLoading(false);
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      let profileData: UserProfile;

      if (!data) {
        const username = email ? email.split('@')[0] : 'User_' + userId.slice(0, 5);
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({ 
            id: userId, 
            username, 
            role: 'user', 
            xu: 0 
          })
          .select('*')
          .single();
          
        if (createError) throw createError;
        profileData = newProfile as UserProfile;
      } else {
        profileData = data as UserProfile;
      }

      // Kiểm tra quyền Admin
      if (profileData.username === '0337117930' || email === 'admin@linkgold.pro') {
        profileData.role = 'admin';
      }

      setUser(profileData);
    } catch (err) {
      console.error('Lỗi fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Lỗi đăng xuất:', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F1F5F9]">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Đang tải hệ thống...</p>
      </div>
    </div>
  );

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {user ? (
          <div className="flex flex-1 flex-col md:flex-row h-screen overflow-hidden">
            <Sidebar user={user} onLogout={handleLogout} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Navbar user={user} />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F8FAFC]">
                <Routes>
                  <Route path="/" element={<Dashboard user={user} />} />
                  <Route path="/tasks" element={<Tasks user={user} setUser={setUser} />} />
                  <Route path="/store" element={<Store user={user} />} />
                  <Route path="/withdraw" element={<Withdraw user={user} setUser={setUser} />} />
                  <Route path="/deposit" element={<Deposit user={user} />} />
                  <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
                  <Route path="/support" element={<Support />} />
                  {user.role === 'admin' && <Route path="/admin" element={<AdminDashboard />} />}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={() => {}} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </HashRouter>
  );
};

export default App;
