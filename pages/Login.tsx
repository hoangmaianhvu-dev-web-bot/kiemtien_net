
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserProfile, UserRole } from '../types';
import { APP_NAME } from '../constants';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth
    setTimeout(() => {
      const mockUser: UserProfile = {
        id: Math.random().toString(36).substr(2, 9),
        username: username || 'User',
        xu_balance: 1500,
        role: username.toLowerCase() === 'admin' ? UserRole.ADMIN : UserRole.USER,
        created_at: new Date().toISOString()
      };
      onLogin(mockUser);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden hero-bg">
      {/* Header Navigation */}
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
            <a href="#" className="hover:text-[#0095FF] transition-colors">Cách kiếm tiền online</a>
            <a href="#" className="hover:text-[#0095FF] transition-colors">Cộng Đồng</a>
            <button onClick={() => setShowLoginForm(true)} className="hover:text-[#0095FF] transition-colors">Đăng Nhập</button>
            <a href="#" className="hover:text-[#0095FF] transition-colors">Blog</a>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-slate-100 border-none rounded-full px-4 py-2 pl-10 text-sm focus:ring-2 focus:ring-[#0095FF] w-64 transition-all"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          </div>
          <button onClick={() => setShowLoginForm(true)} className="lg:hidden text-2xl text-slate-700">
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      {!showLoginForm ? (
        <main className="max-w-7xl mx-auto px-6 pt-12 md:pt-24 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text Content */}
            <div className="space-y-8 animate-fade-in-up">
              <h4 className="text-lg md:text-xl font-bold text-slate-800 tracking-widest uppercase">ỨNG DỤNG KIẾM TIỀN ONLINE</h4>
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-[#0095FF] uppercase italic">
                {APP_NAME}
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
                Dễ dàng gia tăng thêm thu nhập hàng chục triệu đồng mỗi tháng nhờ vào app kiếm tiền online này.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowLoginForm(true)}
                  className="btn-primary px-10 py-5 rounded-xl text-white font-bold text-xl flex items-center justify-center space-x-3 shadow-xl shadow-blue-200"
                >
                  <i className="fa-solid fa-circle-right"></i>
                  <span>Đăng nhập ngay</span>
                </button>
                <Link 
                  to="/register"
                  className="px-10 py-5 rounded-xl bg-white border-2 border-slate-100 text-slate-700 font-bold text-xl flex items-center justify-center space-x-3 hover:bg-slate-50 transition-all"
                >
                  <span>Tham gia cộng đồng</span>
                </Link>
              </div>
            </div>

            {/* Hero Visual Mockups */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px]">
                {/* Main Phone Mockup */}
                <div className="relative z-10 floating">
                  <img 
                    src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=400&h=800" 
                    alt="App Preview" 
                    className="rounded-[3rem] border-[8px] border-slate-900 shadow-2xl"
                  />
                  {/* Floating elements inside mockup */}
                  <div className="absolute top-1/2 -left-12 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce-slow">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <i className="fa-solid fa-check text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">+500 Xu</p>
                        <p className="text-[10px] text-slate-400">Nhiệm vụ hoàn tất</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Secondary Phone Shadow */}
                <div className="absolute top-10 -right-10 opacity-30 transform rotate-12 -z-0">
                   <div className="w-full h-full bg-indigo-600 rounded-[3rem] blur-3xl p-40"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Cards Section */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group overflow-hidden rounded-3xl relative h-[300px]">
              <img src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Income" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Thu nhập không giới hạn</h3>
                <p className="text-sm opacity-80">Kiếm tiền bất cứ lúc nào, bất cứ nơi đâu chỉ với chiếc điện thoại của bạn.</p>
              </div>
            </div>
            
            <div className="group bg-[#0095FF] rounded-3xl p-10 flex flex-col justify-center items-center text-center text-white space-y-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-shield-halved text-4xl"></i>
              </div>
              <h3 className="text-3xl font-black italic tracking-tighter uppercase">{APP_NAME}</h3>
              <p className="font-medium opacity-90">Ứng dụng kiếm tiền cho học sinh, sinh viên uy tín nhất 2024.</p>
            </div>

            <div className="group overflow-hidden rounded-3xl relative h-[300px]">
              <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Technology" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Thanh toán tự động</h3>
                <p className="text-sm opacity-80">Hệ thống rút tiền về ATM và Thẻ Game tự động chỉ trong vài phút.</p>
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* The Professional Login Form View */
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-[#0095FF] p-10 text-center text-white">
              <button 
                onClick={() => setShowLoginForm(false)}
                className="absolute top-6 right-6 text-white/80 hover:text-white"
              >
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">{APP_NAME}</h2>
              <p className="text-white/80 font-medium">Chào mừng bạn quay trở lại</p>
            </div>

            <div className="p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Tên đăng nhập</label>
                  <div className="relative">
                    <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-medium"
                      placeholder="Username..."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Mật khẩu</label>
                  <div className="relative">
                    <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-medium"
                      placeholder="Password..."
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 text-slate-500 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-200 text-[#0095FF] focus:ring-0" />
                    <span className="font-semibold">Lưu phiên</span>
                  </label>
                  <a href="#" className="text-[#0095FF] font-bold">Quên mật khẩu?</a>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0095FF] text-white py-5 rounded-2xl font-bold text-xl shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center space-x-3"
                >
                  {loading ? (
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                  ) : (
                    <>
                      <span>Đăng nhập ngay</span>
                      <i className="fa-solid fa-arrow-right-to-bracket"></i>
                    </>
                  )}
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

      {/* Footer Simple */}
      <footer className="bg-slate-50 py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0095FF] rounded-lg flex items-center justify-center text-white">
              <i className="fa-solid fa-link text-sm"></i>
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-800 uppercase italic">{APP_NAME}</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            &copy; 2024 LinkGold.pro - All rights reserved. Platform by Vietnamese Developers.
          </p>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-slate-400 hover:text-[#0095FF] transition-colors"><i className="fa-brands fa-facebook-f text-xl"></i></a>
            <a href="#" className="text-slate-400 hover:text-[#0095FF] transition-colors"><i className="fa-brands fa-youtube text-xl"></i></a>
            <a href="#" className="text-slate-400 hover:text-[#0095FF] transition-colors"><i className="fa-brands fa-telegram text-xl"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
