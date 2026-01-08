
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';
import { supabase } from '../supabase';

const Login: React.FC<{onLogin: any}> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError('Email hoặc mật khẩu không chính xác!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* DINOS STYLE HEADER */}
      <header className="w-full h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-20 z-20">
        <div className="flex items-center space-x-2">
           <div className="w-10 h-10 bg-[#0095FF] rounded-xl flex items-center justify-center text-white font-black text-xl">L</div>
           <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{APP_NAME}</h1>
        </div>
        
        <nav className="hidden lg:flex items-center space-x-10 text-[13px] font-bold uppercase tracking-widest text-slate-500">
          <a href="#" className="hover:text-[#0095FF] transition-colors">Công ty <i className="fa-solid fa-chevron-down text-[10px] ml-1"></i></a>
          <a href="#" className="hover:text-[#0095FF] transition-colors">Giải pháp</a>
          <a href="#" className="hover:text-[#0095FF] transition-colors">Đối tác <i className="fa-solid fa-chevron-down text-[10px] ml-1"></i></a>
          <a href="#" className="hover:text-[#0095FF] transition-colors">Kiến thức</a>
          <a href="#" className="hover:text-[#0095FF] transition-colors">Liên hệ</a>
        </nav>

        <div className="flex items-center space-x-4">
          <button className="bg-[#0095FF] text-white px-8 py-3 rounded-xl font-bold uppercase text-[12px] tracking-widest shadow-lg shadow-blue-100 hover:bg-[#0077CC] transition-all">
            Đăng nhập/ Đăng ký
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
            <img src="https://flagcdn.com/vn.svg" alt="VN" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="flex-1 flex flex-col items-center justify-center py-16 bg-blue-50/20 relative">
        <div className="z-10 text-center max-w-4xl px-6 mb-12">
          <p className="text-[14px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4">Danh mục</p>
          <h2 className="text-6xl lg:text-7xl font-black text-[#0095FF] tracking-tighter uppercase mb-6">
            KIẾM TIỀN ONLINE
          </h2>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto opacity-80">
            Khám phá các cách kiếm tiền online trực tuyến và bí quyết thành công trong thế giới MMO.
          </p>
        </div>

        {/* LOGIN BOX */}
        <div className="z-10 w-full max-w-md bg-white p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,149,255,0.08)] border border-slate-50">
          <div className="mb-10 text-center">
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Đăng nhập ngay</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">Truy cập để bắt đầu nhiệm vụ</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold text-xs border border-red-100 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email của bạn</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0095FF] transition-all font-bold" 
                placeholder="name@gmail.com" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mật khẩu bảo mật</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0095FF] transition-all font-bold" 
                placeholder="********" 
                required 
              />
            </div>
            
            <button 
              disabled={loading} 
              className="w-full bg-[#0095FF] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[13px] shadow-xl shadow-blue-100 hover:bg-black transition-all active:scale-95"
            >
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Đăng nhập hệ thống'}
            </button>
          </form>

          <div className="pt-8 mt-8 border-t border-slate-50 text-center">
            <Link to="/register" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#0095FF] transition-colors">
              Chưa có tài khoản? <span className="text-[#0095FF]">Đăng ký ngay</span>
            </Link>
          </div>
        </div>

        {/* Mẫu trang trí phụ */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-20 filter grayscale">
           <i className="fa-brands fa-google text-4xl"></i>
           <i className="fa-brands fa-facebook text-4xl"></i>
           <i className="fa-brands fa-shopify text-4xl"></i>
           <i className="fa-brands fa-amazon text-4xl"></i>
        </div>
      </div>

      <footer className="py-8 bg-white text-center border-t border-slate-50">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">© 2026 {APP_NAME.toUpperCase()} - WEBSITE KIẾM TIỀN UY TÍN</p>
      </footer>
    </div>
  );
};

export default Login;
