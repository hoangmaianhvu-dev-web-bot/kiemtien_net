
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
    if (!email.includes('@') && email === '0337117930') {
      loginIdentifier = 'admin@linkgold.pro';
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginIdentifier,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      setError('Thông tin đăng nhập không chính xác hoặc lỗi kết nối.');
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
            <button onClick={() => setShowLoginForm(true)} className="hover:text-[#0095FF] transition-colors">Đăng Nhập</button>
            <a href="#" className="hover:text-[#0095FF] transition-colors">Về Chúng Tôi</a>
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
        <main className="max-w-7xl mx-auto px-6 pt-16 md:pt-28 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-[#0095FF] px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span>Nền tảng kiếm tiền online uy tín #1</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9]">
                KIẾM TIỀN <br/>
                <span className="text-[#0095FF]">DỄ DÀNG</span> <br/>
                MỖI NGÀY.
              </h1>
              <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
                Tham gia cùng hơn 10,000+ người dùng đang gia tăng thu nhập hàng tháng thông qua các nhiệm vụ vượt link an toàn và uy tín.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button onClick={() => setShowLoginForm(true)} className="bg-[#0095FF] px-10 py-5 rounded-2xl text-white font-bold text-xl flex items-center justify-center space-x-3 shadow-2xl shadow-blue-200 hover:bg-[#0077CC] hover:-translate-y-1 transition-all">
                  <i className="fa-solid fa-rocket"></i>
                  <span>Đăng nhập ngay</span>
                </button>
                <Link to="/register" className="px-10 py-5 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-bold text-xl flex items-center justify-center hover:bg-slate-50 hover:border-slate-200 transition-all">
                  Đăng ký mới
                </Link>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[450px]">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#0095FF] to-blue-200 rounded-[3.5rem] opacity-20 blur-2xl"></div>
                <div className="relative z-10 bg-slate-900 rounded-[3.5rem] p-4 shadow-2xl overflow-hidden border-8 border-slate-800">
                  <img 
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400&h=800" 
                    alt="LinkGold Mobile" 
                    className="rounded-[2.5rem] w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
            <div className="bg-[#0095FF] p-10 text-center text-white relative">
              <button onClick={() => setShowLoginForm(false)} className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">{APP_NAME}</h2>
              <p className="text-white/80 font-medium">Đăng nhập tài khoản của bạn</p>
            </div>
            <div className="p-10">
              {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-2xl font-bold flex items-center"><i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}</div>}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email / Số điện thoại</label>
                  <div className="relative group">
                    <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0095FF] transition-colors"></i>
                    <input 
                      type="text" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold" 
                      placeholder="example@gmail.com" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Mật khẩu bảo mật</label>
                  <div className="relative group">
                    <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0095FF] transition-colors"></i>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold" 
                      placeholder="********" 
                      required 
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" className="text-sm font-bold text-slate-400 hover:text-[#0095FF]">Quên mật khẩu?</button>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#0095FF] text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-50">
                  {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Đăng nhập ngay'}
                </button>
              </form>
              <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                <p className="text-slate-500 font-medium mb-1">Chưa có tài khoản {APP_NAME}?</p>
                <Link to="/register" className="text-[#0095FF] font-black text-lg hover:underline decoration-2">TẠO TÀI KHOẢN MIỄN PHÍ</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
