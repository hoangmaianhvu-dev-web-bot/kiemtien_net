
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';
import { supabase } from '../supabase';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. Sign up user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username
          }
        }
      });

      if (signUpError) throw signUpError;
      if (data.user) {
        // 2. Create profile entry (usually handled by database triggers, but we do it manually for reliability here)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: formData.username,
            xu_balance: 0,
            role: 'USER'
          });
          
        if (profileError) {
          console.warn('Profile creation warning:', profileError);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Đăng ký không thành công. Thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       <nav className="max-w-7xl mx-auto w-full px-6 py-8 flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-[#0095FF] rounded-lg flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-link text-xl"></i>
            </div>
            <span className="text-2xl font-black tracking-tighter text-[#1A202C] uppercase italic">{APP_NAME}</span>
          </Link>
       </nav>
       <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10 lg:p-12">
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Bắt đầu kiếm tiền</h2>
                <p className="text-slate-500 font-medium">Tham gia cùng cộng đồng LinkGold.</p>
              </div>
              {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-2xl font-bold flex items-center"><i className="fa-solid fa-circle-exclamation mr-2"></i> {error}</div>}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Username</label>
                      <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold" placeholder="Tên tài khoản..." required />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold" placeholder="example@gmail.com" required />
                   </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                   <div className="space-y-1">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Mật khẩu</label>
                      <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold" placeholder="********" required />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Xác nhận</label>
                      <input type="password" value={formData.confirm} onChange={(e) => setFormData({...formData, confirm: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold" placeholder="********" required />
                   </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-xl hover:bg-black transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 mt-4">
                    {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Đăng ký ngay'}
                </button>
              </form>
              <div className="mt-10 text-center">
                <p className="text-slate-500 font-medium">Đã có tài khoản?</p>
                <Link to="/login" className="text-[#0095FF] font-black text-lg hover:underline">Đăng nhập tại đây</Link>
              </div>
          </div>
       </div>
    </div>
  );
};

export default Register;
