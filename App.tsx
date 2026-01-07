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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session) {
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        handleGlobalError(err, 'Lỗi hệ thống');
        setLoading(false);
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGlobalError = (err: any, context: string) => {
    console.error(`${context}:`, err);
    let msg = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
    
    if (typeof err === 'string') {
      msg = err;
    } else if (err && typeof err === 'object') {
      // Ưu tiên trích xuất thông điệp dễ đọc
      msg = err.message || err.error_description || err.error || (err.toString && err.toString() !== '[object Object]' ? err.toString() : JSON.stringify(err));
    }

    if (msg.includes('Failed to fetch') || msg.includes('network')) {
      setError('Mất kết nối Internet. Vui lòng kiểm tra lại đường truyền của bạn.');
    } else if (msg.includes('JWT') || msg.includes('session')) {
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      handleLogout();
    } else {
      setError(`${context}: ${msg}`);
    }
  };

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!data) {
        const username = email ? email.split('@')[0] : 'User_' + userId.slice(0, 5);
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: username,
            role: 'USER',
            xu_balance: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        setUser(newProfile as UserProfile);
      } else {
        const profile = data as UserProfile;
        if (profile.username === '0337117930' || profile.id === '0337117930') {
          profile.role = UserRole.ADMIN;
        }
        setUser(profile);
      }
    } catch (err: any) {
      handleGlobalError(err, 'Lỗi tải hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0095FF]"></div>
           <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl text-center border border-slate-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4">Sự cố kết nối</h2>
          <p className="text-slate-500 mb-8 leading-relaxed font-medium text-sm">
            {error}
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => { setError(null); window.location.reload(); }}
              className="w-full bg-[#0095FF] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#0077CC] transition-all"
            >
              Thử lại ngay
            </button>
            <button 
              onClick={handleLogout}
              className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Về trang đăng nhập
            </button>
          </div>
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
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </HashRouter>
  );
};

export default App;
