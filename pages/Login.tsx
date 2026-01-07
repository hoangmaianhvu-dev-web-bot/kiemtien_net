
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
    // Special admin account handling
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
      setError('Tài khoản hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-[#0095FF] rounded-2xl flex items-center justify-center text-white shadow-lg">
            <i className="fa-solid fa-link text-xl"></i>
          </div>
          <span className="text-2xl font-extrabold tracking-tighter text-slate-900 uppercase italic">{APP_NAME}</span>
        </Link>
        <div className="hidden md:flex items-center space-x-8 font-bold text-slate-500 text-sm">
          <a href="#" className="hover:text-[#0095FF] transition-colors">Tài liệu</a>
          <a href="#" className="hover:text-[#0095FF] transition-colors">Cộng đồng</a>
          <button onClick={() => setShowLoginForm(true)} className="text-[#0095FF]">Đăng nhập</button>
          <Link to="/register" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition-all">Đăng ký</Link>
        </div>
      </nav>

      {!showLoginForm ? (
        <main className="max-w-7xl mx-auto px-6 pt-12 md:pt-24 flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-[#0095FF] px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest mb-8">
            <i className="fa-solid fa-shield-check"></i>
            <span>Hệ thống kiếm tiền uy tín nhất Việt Nam</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-8">
            KIẾM TIỀN <span className="text-gradient">THẬT</span> <br/>
            DỄ DÀNG HƠN BAO GIỜ HẾT.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-12 font-medium">
            Rút ngắn khoảng cách thu nhập bằng cách vượt link rút gọn. 
            Uy tín, minh bạch và thanh toán cực nhanh.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button 
              onClick={() => setShowLoginForm(true)}
              className="flex-1 bg-[#0095FF] text-white py-5 rounded-3xl font-extrabold text-xl shadow-2xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
            >
              Bắt đầu kiếm tiền
            </button>
            <Link 
              to="/register" 
              className="flex-1 bg-white border-2 border-slate-100 text-slate-700 py-5 rounded-3xl font-extrabold text-xl hover:bg-slate-50 transition-all"
            >
              Đăng ký ngay
            </Link>
          </div>
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
            <div>
              <p className="text-3xl font-black text-slate-900">12k+</p>
              <p className="text-slate-400 font-bold text-sm uppercase">Người dùng</p>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">100m+</p>
              <p className="text-slate-400 font-bold text-sm uppercase">Đã thanh toán</p>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">24/7</p>
              <p className="text-slate-400 font-bold text-sm uppercase">Hỗ trợ</p>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">100%</p>
              <p className="text-slate-400 font-bold text-sm uppercase">Uy tín</p>
            </div>
          </div>
        </main>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white md:bg-slate-900/40 md:backdrop-blur-xl">
          <div className="w-full max-w-[480px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-slate-100 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowLoginForm(false)} 
              className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            
            <div className="p-10 md:p-14">
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase italic">{APP_NAME}</h2>
                <p className="text-slate-500 font-bold">Vui lòng đăng nhập để tiếp tục</p>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm flex items-center border border-red-100">
                  <i className="fa-solid fa-circle-exclamation mr-3"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email / Tài khoản</label>
                  <div className="relative group">
                    <i className="fa-solid fa-user absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0095FF] transition-colors"></i>
                    <input 
                      type="text" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold text-slate-900" 
                      placeholder="Nhập email hoặc SĐT" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mật khẩu bảo mật</label>
                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-[#0095FF] hover:underline">Quên?</button>
                  </div>
                  <div className="relative group">
                    <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0095FF] transition-colors"></i>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold text-slate-900" 
                      placeholder="********" 
                      required 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-[#0095FF] text-white py-5 rounded-[1.5rem] font-black text-xl shadow-xl shadow-blue-100 hover:bg-[#0077CC] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                >
                  {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Đăng nhập ngay'}
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                <p className="text-slate-500 font-bold text-sm mb-4">Bạn chưa có tài khoản?</p>
                <Link to="/register" className="inline-block px-8 py-3 bg-slate-100 text-slate-900 rounded-full font-black text-sm hover:bg-slate-200 transition-all uppercase tracking-widest">Tạo tài khoản mới</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
