
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../types';
import { APP_NAME } from '../constants';
import { supabase } from '../supabase';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let loginIdentifier = email;
    // Xử lý tài khoản Admin đặc biệt
    if (!email.includes('@') && email === '0337117930') {
      loginIdentifier = 'admin@linkgold.pro';
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginIdentifier,
        password,
      });

      if (error) throw error;
      // Chuyển hướng sẽ được App.tsx xử lý qua onAuthStateChange
    } catch (err: any) {
      setError('Thông tin đăng nhập không chính xác hoặc lỗi kết nối.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden hero-bg">
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="flex items-center space-x-12">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-[#0095FF] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-link text-xl"></i>
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">{APP_NAME}</span>
          </Link>
          <div className="hidden lg:flex items-center space-x-10 text-[14px] font-bold text-slate-500">
            <a href="#" className="hover:text-[#0095FF] transition-colors">Hướng Dẫn</a>
            <a href="#" className="hover:text-[#0095FF] transition-colors">Cộng Đồng</a>
            <button onClick={() => setShowLoginForm(true)} className="hover:text-[#0095FF] transition-colors font-bold">Đăng Nhập</button>
          </div>
        </div>
        <div className="flex items-center">
          <button 
            onClick={() => setShowLoginForm(true)}
            className="hidden lg:block bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg"
          >
            Bắt đầu ngay
          </button>
          <button onClick={() => setShowLoginForm(true)} className="lg:hidden text-2xl text-slate-700"><i className="fa-solid fa-bars"></i></button>
        </div>
      </nav>

      {!showLoginForm ? (
        <main className="max-w-7xl mx-auto px-6 pt-16 md:pt-28 pb-20 text-center lg:text-left">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-[#0095FF] px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest mx-auto lg:mx-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span>Hệ thống vượt link uy tín 2024</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9]">
                KIẾM TIỀN <br/>
                <span className="text-[#0095FF]">TẠI NHÀ</span> <br/>
                VỚI LINKGOLD.
              </h1>
              <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
                Làm nhiệm vụ vượt link đơn giản để nhận Xu và đổi sang tiền mặt hoặc thẻ Garena nhanh chóng.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={() => setShowLoginForm(true)} className="bg-[#0095FF] px-10 py-5 rounded-2xl text-white font-bold text-xl flex items-center justify-center space-x-3 shadow-2xl shadow-blue-200 hover:bg-[#0077CC] hover:-translate-y-1 transition-all">
                  <i className="fa-solid fa-rocket"></i>
                  <span>Đăng nhập</span>
                </button>
                <Link to="/register" className="px-10 py-5 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-bold text-xl flex items-center justify-center hover:bg-slate-50 hover:border-slate-200 transition-all">
                  Đăng ký mới
                </Link>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[400px]">
                    <div className="absolute -inset-4 bg-blue-400 rounded-[3.5rem] opacity-10 blur-3xl"></div>
                    <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800" alt="UI" className="relative z-10 rounded-[3rem] shadow-2xl border-4 border-white"/>
                </div>
            </div>
          </div>
        </main>
      ) : (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300 border border-slate-100">
            <div className="bg-[#0095FF] p-10 text-center text-white relative">
              <button onClick={() => setShowLoginForm(false)} className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">{APP_NAME}</h2>
              <p className="text-white/80 font-medium">Đăng nhập tài khoản</p>
            </div>
            <div className="p-10">
              {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-2xl font-bold border border-red-100"><i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}</div>}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tài khoản / Email</label>
                  <input 
                    type="text" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold text-slate-900" 
                    placeholder="Nhập email hoặc SĐT..." 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Mật khẩu</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold text-slate-900" 
                    placeholder="********" 
                    required 
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-[#0095FF] focus:ring-[#0095FF]"/>
                        <span className="text-sm font-medium text-slate-500">Ghi nhớ</span>
                    </label>
                    <button type="button" className="text-sm font-bold text-[#0095FF] hover:underline">Quên mật khẩu?</button>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-xl shadow-xl hover:bg-black active:scale-95 transition-all disabled:opacity-50">
                  {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Đăng nhập ngay'}
                </button>
              </form>
              <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                <p className="text-slate-500 font-medium mb-1">Chưa có tài khoản?</p>
                <Link to="/register" className="text-[#0095FF] font-black text-lg hover:underline uppercase tracking-tighter">Tạo tài khoản mới</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
