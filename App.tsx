
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
        console.error('Connection Error:', err);
        setError(err.message || 'Không thể kết nối tới hệ thống.');
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

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      // Thử lấy profile hiện có
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Nếu chưa có profile (lỗi không tìm thấy dòng), tạo mới profile mặc định
        console.log('Profile not found, creating default...');
        const username = email ? email.split('@')[0] : 'User_' + userId.slice(0, 5);
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: username,
            role: 'USER'
          })
          .select()
          .single();

        if (createError) throw createError;
        setUser(newProfile as UserProfile);
      } else if (profileError) {
        throw profileError;
      } else {
        const profile = data as UserProfile;
        // Kiểm tra quyền Admin dựa trên username hoặc ID đặc biệt
        if (profile.username === '0337117930' || profile.id === '0337117930') {
          profile.role = UserRole.ADMIN;
        }
        setUser(profile);
      }
    } catch (err: any) {
      console.error('Profile handling failed:', err);
      // Nếu lỗi do schema (thiếu cột xu_balance), vẫn cho user vào nhưng hiển thị cảnh báo
      if (err.message && err.message.includes('xu_balance')) {
        setError("Lỗi cơ sở dữ liệu: Thiếu cột 'xu_balance' trong bảng profiles. Vui lòng kiểm tra lại cấu hình Supabase.");
      } else {
        setError('Phiên đăng nhập gặp sự cố. Vui lòng tải lại trang.');
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
           <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Đang tải dữ liệu...</p>
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
          <h2 className="text-2xl font-black text-slate-800 mb-4">Thông báo</h2>
          <p className="text-slate-500 mb-8 leading-relaxed font-medium">
            {error}
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-[#0095FF] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#0077CC] transition-all"
            >
              Thử lại
            </button>
            <button 
              onClick={handleLogout}
              className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Đăng xuất
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
