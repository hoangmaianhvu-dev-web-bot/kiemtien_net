
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
    
    // Reset states
    setError('');
    setLoading(true);

    const emailClean = formData.email.toLowerCase().trim();
    const usernameClean = formData.username.trim();

    // 1. Kiểm tra mật khẩu khớp
    if (formData.password !== formData.confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      setLoading(false);
      return;
    }

    // 2. Ràng buộc @gmail.com
    if (!emailClean.endsWith('@gmail.com')) {
      setError('Hệ thống chỉ chấp nhận đăng ký bằng địa chỉ @gmail.com.');
      setLoading(false);
      return;
    }

    // 3. Cảnh báo về các email admin/support (Thường bị Supabase chặn)
    if (emailClean.startsWith('admin@') || emailClean.startsWith('support@')) {
      setError('Địa chỉ email "admin" hoặc "support" đã được hệ thống bảo vệ. Vui lòng sử dụng Gmail cá nhân khác.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      setLoading(false);
      return;
    }

    try {
      // Đăng ký tài khoản Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailClean,
        password: formData.password,
        options: {
          data: {
            username: usernameClean
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('invalid')) {
          throw new Error('Địa chỉ Gmail này không khả dụng hoặc bị hệ thống từ chối. Vui lòng thử email khác.');
        }
        throw signUpError;
      }
      
      if (data.user) {
        // Tạo profile thủ công ngay lập tức để tránh delay
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: usernameClean,
            role: 'USER'
          });
        
        setIsSuccess(true);
        // Nếu session có sẵn (tự động đăng nhập), chuyển hướng sau 2s
        if (data.session) {
          setTimeout(() => navigate('/'), 2000);
        }
      }
    } catch (err: any) {
      console.error('Registration error details:', err);
      setError(err.message || 'Đăng ký không thành công. Vui lòng thử lại sau.');
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

       <div className="w-full max-w-[540px] bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10 md:p-14 border border-slate-100">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Tạo tài khoản mới</h2>
            <p className="text-slate-500 font-bold text-sm">Vui lòng sử dụng Gmail cá nhân để bảo mật.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm flex items-start border border-red-100">
              <i className="fa-solid fa-circle-exclamation mt-1 mr-3"></i>
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="mb-8 p-6 bg-green-50 text-green-700 rounded-2xl font-bold text-sm flex flex-col items-center text-center border border-green-100">
              <i className="fa-solid fa-circle-check text-3xl mb-3"></i>
              <p className="text-lg">Đăng ký thành công!</p>
              <p className="font-medium opacity-80 mt-1">Đang chuyển hướng vào hệ thống...</p>
            </div>
          )}

          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tên hiển thị</label>
                    <input 
                      type="text" 
                      value={formData.username} 
                      onChange={(e) => setFormData({...formData, username: e.target.value})} 
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold text-slate-900" 
                      placeholder="Ví dụ: HoangKiemTien" 
                      required 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Gmail cá nhân</label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold text-slate-900" 
                      placeholder="tenban@gmail.com" 
                      required 
                    />
                    <p className="text-[10px] text-slate-400 italic ml-1">* Không nên dùng các email hệ thống (admin, support...)</p>
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
                      placeholder="Tối thiểu 6 ký tự" 
                      required 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nhập lại</label>
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
                className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-xl shadow-xl hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 mt-4 uppercase tracking-widest"
              >
                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Hoàn tất đăng ký'}
              </button>
            </form>
          )}

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-bold text-sm mb-4">Đã có tài khoản {APP_NAME}?</p>
            <Link to="/login" className="text-[#0095FF] font-black text-lg hover:underline decoration-2">ĐĂNG NHẬP NGAY</Link>
          </div>
       </div>
    </div>
  );
};

export default Register;
