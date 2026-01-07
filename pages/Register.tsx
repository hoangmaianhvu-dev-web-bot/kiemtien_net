import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME } from '../constants';
import { supabase } from '../supabase';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

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

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      setLoading(false);
      return;
    }

    try {
      // 1. Đăng ký tài khoản Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailClean,
        password: formData.password,
        options: { data: { username: usernameClean } }
      });

      if (signUpError) throw signUpError;
      
      if (data.user) {
        // 2. Tạo profile trong bảng profiles
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username: usernameClean,
          role: 'USER',
          xu_balance: 0
        });

        if (profileError) {
          console.warn("Profile creation error (might already exist):", profileError);
        }

        // 3. Đăng xuất ngay lập tức (để ép người dùng phải đăng nhập lại)
        await supabase.auth.signOut();

        // 4. Hiển thị màn hình thành công
        setIsSuccess(true);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Có lỗi xảy ra trong quá trình đăng ký.');
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
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">{APP_NAME}</span>
       </Link>

       <div className="w-full max-w-[540px] bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10 md:p-14 border border-slate-100 animate-in fade-in zoom-in duration-500">
          {isSuccess ? (
            <div className="text-center space-y-8 py-4">
              <div className="relative">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <i className="fa-solid fa-check text-5xl"></i>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-500 shadow-md">
                   <i className="fa-solid fa-sparkles"></i>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Đăng ký thành công!</h3>
                <p className="text-slate-500 font-bold px-4">Tài khoản <span className="text-[#0095FF]">{formData.email}</span> đã sẵn sàng. Hãy đăng nhập để bắt đầu kiếm tiền.</p>
              </div>

              <div className="pt-4">
                <Link 
                  to="/login" 
                  className="w-full bg-[#0095FF] text-white py-5 rounded-[1.5rem] font-black text-xl shadow-xl shadow-blue-100 hover:bg-[#0077CC] hover:-translate-y-1 active:scale-[0.98] transition-all block uppercase tracking-widest"
                >
                  ĐĂNG NHẬP NGAY
                </Link>
                <p className="mt-6 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Hệ thống đã ghi nhận thông tin của bạn</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">Tạo tài khoản mới</h2>
                <p className="text-slate-500 font-bold text-sm">Gia nhập cộng đồng LinkGold ngay hôm nay</p>
              </div>

              {error && (
                <div className="mb-8 p-4 rounded-2xl font-bold text-xs flex items-start bg-red-50 text-red-600 border border-red-100 animate-in slide-in-from-top-2">
                  <i className="fa-solid fa-circle-exclamation mt-0.5 mr-3 text-lg"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tên hiển thị</label>
                      <div className="relative group">
                        <i className="fa-solid fa-id-card absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0095FF] transition-colors"></i>
                        <input 
                          type="text" 
                          value={formData.username} 
                          onChange={(e) => setFormData({...formData, username: e.target.value})} 
                          className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold text-slate-900" 
                          placeholder="kiemtien247" 
                          required 
                        />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Địa chỉ Gmail</label>
                      <div className="relative group">
                        <i className="fa-solid fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0095FF] transition-colors"></i>
                        <input 
                          type="email" 
                          value={formData.email} 
                          onChange={(e) => setFormData({...formData, email: e.target.value})} 
                          className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold text-slate-900" 
                          placeholder="tenban@gmail.com" 
                          required 
                        />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mật khẩu</label>
                      <input 
                        type="password" 
                        value={formData.password} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold text-slate-900" 
                        placeholder="********" 
                        required 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Xác nhận</label>
                      <input 
                        type="password" 
                        value={formData.confirm} 
                        onChange={(e) => setFormData({...formData, confirm: e.target.value})} 
                        className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold text-slate-900" 
                        placeholder="********" 
                        required 
                      />
                   </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-xl shadow-xl hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 mt-4 uppercase tracking-widest flex items-center justify-center space-x-3"
                >
                  {loading ? (
                    <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
                  ) : (
                    <>
                      <span>ĐĂNG KÝ NGAY</span>
                      <i className="fa-solid fa-arrow-right text-sm"></i>
                    </>
                  )}
                </button>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                  <p className="text-slate-400 font-bold text-xs mb-4 uppercase tracking-widest">Đã có tài khoản LinkGold?</p>
                  <Link to="/login" className="text-[#0095FF] font-black text-lg hover:underline decoration-2 uppercase italic tracking-tighter">ĐĂNG NHẬP TẠI ĐÂY</Link>
                </div>
              </form>
            </>
          )}
       </div>
    </div>
  );
};

export default Register;