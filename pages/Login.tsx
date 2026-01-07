
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { APP_NAME, XU_TO_VND } from '../constants';
import { supabase } from '../supabase';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = () => {
  const navigate = useNavigate();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refCodeInput, setRefCodeInput] = useState('');
  
  // Real Global Stats
  const [globalStats, setGlobalStats] = useState({ users: 0, paid: 0 });

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { data: paidData } = await supabase.from('withdrawals').select('amount').eq('status', 'approved');
        const totalPaid = paidData?.reduce((sum, w) => sum + w.amount, 0) || 0;
        
        setGlobalStats({
          users: usersCount || 0,
          paid: totalPaid * XU_TO_VND
        });
      } catch (e) {
        console.error("Error fetching landing stats:", e);
      }
    };
    fetchGlobalStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) throw loginError;
    } catch (err: any) {
      setError(err.message || 'Tài khoản hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWithRef = () => {
    const target = refCodeInput ? `/register?ref=${refCodeInput}` : '/register';
    navigate(target);
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
          <a href="#" className="hover:text-[#0095FF] transition-colors uppercase tracking-widest text-[10px]">Tài liệu</a>
          <a href="#" className="hover:text-[#0095FF] transition-colors uppercase tracking-widest text-[10px]">Cộng đồng</a>
          <button onClick={() => setShowLoginForm(true)} className="text-[#0095FF] font-black uppercase tracking-widest text-[10px]">Đăng nhập</button>
          <Link to="/register" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition-all font-black uppercase tracking-widest text-[10px]">Đăng ký</Link>
        </div>
      </nav>

      {!showLoginForm ? (
        <main className="max-w-7xl mx-auto px-6 pt-12 md:pt-24 flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-[#0095FF] px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest mb-8">
            <i className="fa-solid fa-shield-check"></i>
            <span>Dữ liệu hệ thống thời gian thực</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-8 uppercase italic">
            KIẾM TIỀN ONLINE <span className="text-gradient">MIỄN PHÍ</span> TẠI NHÀ <br className="hidden md:block"/>
            RÚT BANK - THẺ GAME <span className="text-gradient">FREE UY TÍN 100%</span>
          </h1>
          
          {/* Referral Entry Box */}
          <div className="w-full max-w-xl bg-slate-50 p-2 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row gap-2 mb-12 shadow-sm">
            <input 
              type="text" 
              placeholder="Nhập mã giới thiệu (nếu có)..." 
              value={refCodeInput}
              onChange={(e) => setRefCodeInput(e.target.value)}
              className="flex-1 bg-transparent px-6 py-4 outline-none font-bold text-slate-700"
            />
            <button 
              onClick={handleJoinWithRef}
              className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-black transition-all"
            >
              Bắt đầu kiếm tiền
            </button>
          </div>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-12 font-medium">
            Rút ngắn khoảng cách thu nhập bằng cách vượt link rút gọn. 
            Mọi con số bạn thấy đều là thật 100%.
          </p>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
            <div>
              <p className="text-3xl font-black text-slate-900">{globalStats.users.toLocaleString()}</p>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Thành viên</p>
            </div>
            <div>
              <p className="text-3xl font-black text-[#0095FF]">{globalStats.paid.toLocaleString()}đ</p>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Đã thanh toán</p>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">24/7</p>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Hỗ trợ LIVE</p>
            </div>
            <div>
              <p className="text-3xl font-black text-green-500">REAL</p>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Số liệu thật</p>
            </div>
          </div>
        </main>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white md:bg-slate-900/40 md:backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-[480px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-slate-100 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowLoginForm(false)} 
              className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            
            <div className="p-10 md:p-14">
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase italic">{APP_NAME}</h2>
                <p className="text-slate-500 font-bold text-sm">Đăng nhập vào bảng điều khiển thực tế</p>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-xs flex items-center border border-red-100">
                  <i className="fa-solid fa-circle-exclamation mr-3 text-sm"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email của bạn</label>
                  <div className="relative group">
                    <i className="fa-solid fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0095FF] transition-colors"></i>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold text-slate-900" 
                      placeholder="tenban@gmail.com" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mật khẩu</label>
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
                  className="w-full bg-[#0095FF] text-white py-5 rounded-[1.5rem] font-black text-xl shadow-xl shadow-blue-100 hover:bg-[#0077CC] active:scale-[0.98] transition-all disabled:opacity-50 mt-4 uppercase tracking-widest"
                >
                  {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Bắt đầu ngay'}
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                <p className="text-slate-500 font-bold text-xs mb-4 uppercase tracking-widest">Lần đầu tham gia?</p>
                <Link to="/register" className="inline-block px-10 py-3 bg-slate-100 text-slate-900 rounded-full font-black text-[10px] hover:bg-slate-200 transition-all uppercase tracking-widest">Tạo tài khoản mới</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;