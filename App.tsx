
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
        // Kiểm tra kết nối Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          // Nếu có lỗi session (thường do API Key sai/hết hạn)
          if (sessionError.status === 401 || sessionError.message.includes('Invalid API key')) {
            throw new Error('API Key Supabase đã bị vô hiệu hóa hoặc không chính xác. Vui lòng cập nhật lại khóa mới trong supabase.ts.');
          }
          throw sessionError;
        }

        if (session) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Connection Error:', err);
        setError(err.message || 'Không thể kết nối tới cơ sở dữ liệu. Vui lòng kiểm tra lại cấu hình Supabase.');
        setLoading(false);
      }
    };

    initApp();

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
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      
      if (data) {
        const profile = data as UserProfile;
        // Kiểm tra ID Admin đặc biệt: 0337117930
        if (profile.username === '0337117930' || profile.id === '0337117930') {
          profile.role = UserRole.ADMIN;
        }
        setUser(profile);
      }
    } catch (err: any) {
      console.error('Profile fetch failed:', err);
      if (err.status === 401) {
        setError('Phiên đăng nhập không hợp lệ hoặc API Key đã bị thay đổi.');
      }
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
           <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Đang kiểm tra kết nối...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl text-center border border-red-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4">Lỗi Hệ Thống</h2>
          <p className="text-slate-500 mb-8 leading-relaxed font-medium">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-[#0095FF] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#0077CC] transition-all"
          >
            Tải lại trang
          </button>
          <p className="mt-4 text-xs text-slate-400">Nếu lỗi vẫn tiếp diễn, hãy kiểm tra lại Service Role Key trong file supabase.ts</p>
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
