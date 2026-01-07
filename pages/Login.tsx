
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // App.tsx handles the state update via onAuthStateChange
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng nhập. Vui lòng kiểm tra lại.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden hero-bg">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center space-x-12">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-[#0095FF] rounded-lg flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-link text-xl"></i>
            </div>
            <span className="text-2xl font-black tracking-tighter text-[#1A202C] uppercase italic">{APP_NAME}</span>
          </Link>
          <div className="hidden lg:flex items-center space-x-8 text-[15px] font-semibold text-slate-600">
            <a href="#" className="hover:text-[#0095FF] transition-colors">Hướng Dẫn</a>
            <a href="#" className="hover:text-[#0095FF] transition-colors">Cộng Đồng</a>
            <button onClick={() => setShowLoginForm(true)} className="hover:text-[#0095FF] transition-colors">Đăng Nhập</button>
            <a href="#" className="hover:text-[#0095FF] transition-colors">Blog</a>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setShowLoginForm(true)} className="lg:hidden text-2xl text-slate-700"><i className="fa-solid fa-bars"></i></button>
        </div>
      </nav>

      {!showLoginForm ? (
        <main className="max-w-7xl mx-auto px-6 pt-12 md:pt-24 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <h4 className="text-lg md:text-xl font-bold text-slate-800 tracking-widest uppercase">ỨNG DỤNG KIẾM TIỀN ONLINE</h4>
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-[#0095FF] uppercase italic">{APP_NAME}</h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed font-medium">Dễ dàng gia tăng thêm thu nhập hàng chục triệu đồng mỗi tháng.</p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button onClick={() => setShowLoginForm(true)} className="btn-primary px-10 py-5 rounded-xl text-white font-bold text-xl flex items-center justify-center space-x-3 shadow-xl shadow-blue-200"><i className="fa-solid fa-circle-right"></i><span>Đăng nhập ngay</span></button>
                <Link to="/register" className="px-10 py-5 rounded-xl bg-white border-2 border-slate-100 text-slate-700 font-bold text-xl flex items-center justify-center hover:bg-slate-50 transition-all">Tham gia ngay</Link>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px]">
                <div className="relative z-10 floating">
                  <img src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=400&h=800" alt="App Preview" className="rounded-[3rem] border-[8px] border-slate-900 shadow-2xl" />
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in relative">
            <div className="bg-[#0095FF] p-10 text-center text-white">
              <button onClick={() => setShowLoginForm(false)} className="absolute top-6 right-6 text-white/80 hover:text-white"><i className="fa-solid fa-xmark text-2xl"></i></button>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">{APP_NAME}</h2>
              <p className="text-white/80 font-medium">Chào mừng bạn quay trở lại</p>
            </div>
            <div className="p-10">
              {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl font-bold">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-medium" placeholder="example@gmail.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Mật khẩu</label>
                  <div className="relative">
                    <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-medium" placeholder="********" required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#0095FF] text-white py-5 rounded-2xl font-bold text-xl shadow-lg active:scale-[0.98] disabled:opacity-50">
                  {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Đăng nhập ngay'}
                </button>
              </form>
              <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                <p className="text-slate-500 font-medium">Bạn mới biết đến {APP_NAME}?</p>
                <Link to="/register" className="text-[#0095FF] font-black text-lg uppercase tracking-tight hover:underline">Đăng ký tham gia miễn phí</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
