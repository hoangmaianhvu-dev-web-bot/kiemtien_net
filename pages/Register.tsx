
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { APP_NAME } from '../constants';
import { supabase } from '../supabase';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
    refCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) setFormData(prev => ({ ...prev, refCode: ref }));
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailClean = formData.email.toLowerCase().trim();
    const usernameClean = formData.username.trim();

    if (formData.password !== formData.confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      setLoading(false);
      return;
    }

    try {
      let referrerId = null;
      if (formData.refCode) {
        const { data: refUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', formData.refCode.trim())
          .maybeSingle();
        
        if (refUser) {
          referrerId = refUser.id;
        }
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailClean,
        password: formData.password,
        options: { data: { username: usernameClean } }
      });

      if (signUpError) throw signUpError;
      
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username: usernameClean,
          role: 'USER',
          xu_balance: 0,
          referrer_id: referrerId
        });

        if (profileError) throw profileError;

        await supabase.auth.signOut();
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
       <Link to="/" className="flex items-center space-x-2 mb-10">
          <div className="w-10 h-10 bg-[#0095FF] rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="fa-solid fa-link text-xl"></i>
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">{APP_NAME}</span>
       </Link>

       <div className="w-full max-w-[540px] bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10 md:p-14 border border-slate-100 animate-in fade-in zoom-in duration-500">
          {isSuccess ? (
            <div className="text-center space-y-8 py-4">
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <i className="fa-solid fa-check text-5xl"></i>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Đăng ký thành công!</h3>
              <p className="text-slate-500 font-bold px-4">Tài khoản đã sẵn sàng. Hãy đăng nhập ngay.</p>
              <Link to="/login" className="w-full bg-[#0095FF] text-white py-5 rounded-[1.5rem] font-black text-xl shadow-xl shadow-blue-100 block uppercase tracking-widest hover:scale-105 transition-all">ĐĂNG NHẬP NGAY</Link>
            </div>
          ) : (
            <>
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">Tham gia cộng đồng</h2>
                <p className="text-slate-500 font-bold text-sm">Kiếm tiền online an toàn & minh bạch</p>
              </div>

              {error && (
                <div className="mb-8 p-4 rounded-2xl bg-red-50 text-red-600 font-bold text-xs border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tên tài khoản</label>
                      <input 
                        type="text" 
                        value={formData.username} 
                        onChange={(e) => setFormData({...formData, username: e.target.value})} 
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold" 
                        placeholder="username" 
                        required 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mã giới thiệu (Nếu có)</label>
                      <input 
                        type="text" 
                        value={formData.refCode} 
                        onChange={(e) => setFormData({...formData, refCode: e.target.value})} 
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-green-400 outline-none transition-all font-bold text-green-600" 
                        placeholder="Mã giới thiệu" 
                      />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Địa chỉ Email</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold" 
                    placeholder="example@gmail.com" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mật khẩu</label>
                      <input 
                        type="password" 
                        value={formData.password} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold" 
                        required 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Xác nhận lại</label>
                      <input 
                        type="password" 
                        value={formData.confirm} 
                        onChange={(e) => setFormData({...formData, confirm: e.target.value})} 
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold" 
                        required 
                      />
                   </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-xl shadow-xl hover:bg-black transition-all disabled:opacity-50 uppercase tracking-widest mt-4"
                >
                  {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ NGAY'}
                </button>

                <div className="text-center mt-6">
                  <Link to="/login" className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-[#0095FF]">Đã có tài khoản? Đăng nhập</Link>
                </div>
              </form>
            </>
          )}
       </div>
    </div>
  );
};

export default Register;
