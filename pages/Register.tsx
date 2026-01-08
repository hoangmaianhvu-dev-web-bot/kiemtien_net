
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME } from '../constants';
import { supabase } from '../supabase';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) { setError('Mật khẩu không khớp!'); return; }
    setLoading(true);
    setError('');
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email: formData.email, 
        password: formData.password 
      });
      
      if (signUpError) { 
        setError(signUpError.message); 
        setLoading(false); 
        return; 
      }

      if (data.user) {
        // Sử dụng role: 'user' (chữ thường) đồng nhất với App.tsx
        const { error: insertError } = await supabase
          .from('users')
          .insert({ 
            id: data.user.id, 
            username: formData.username, 
            xu: 0, 
            role: 'user' 
          });

        if (insertError) {
          console.error("Insert user error:", insertError);
          setError("Không thể tạo thông tin người dùng. Vui lòng liên hệ Admin.");
        } else {
          alert('Đăng ký thành công! Vui lòng đăng nhập.');
          navigate('/login');
        }
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
       <div className="w-full max-w-xl bg-white rounded-[3rem] p-12 shadow-2xl space-y-10">
          <div className="text-center">
             <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Tham gia hệ thống</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cùng {APP_NAME} tạo ra thu nhập tự động</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold text-xs border border-red-100">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên hiển thị</label>
                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-3xl outline-none font-bold" required />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email tài khoản</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-3xl outline-none font-bold" required />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mật khẩu</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-3xl outline-none font-bold" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nhập lại</label>
                  <input type="password" value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-3xl outline-none font-bold" required />
                </div>
             </div>
             <button disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-black shadow-xl">
               {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
             </button>
          </form>

          <div className="text-center pt-6 border-t border-slate-100">
             <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đã có tài khoản? Đăng nhập</Link>
          </div>
       </div>
    </div>
  );
};

export default Register;
