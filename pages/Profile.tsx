
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, setUser }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState<{type: 's'|'e', text: string} | null>(null);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'e', text: 'Mật khẩu mới không khớp.' });
      return;
    }
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setMsg({ type: 's', text: 'Đổi mật khẩu thành công!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center text-white text-5xl font-black shadow-xl">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg text-slate-600 hover:text-indigo-600 border border-slate-100 transition-colors">
            <i className="fa-solid fa-camera"></i>
          </button>
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">{user.username}</h2>
          <p className="text-slate-500 mb-4">ID Thành viên: #LG{user.id.slice(0, 8)}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">Tài khoản thực</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">{user.role}</span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">Tham gia: 12/2023</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Đổi mật khẩu</h3>
          {msg && (
            <div className={`p-4 rounded-xl mb-4 text-sm ${msg.type === 's' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {msg.text}
            </div>
          )}
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu hiện tại</label>
              <input 
                type="password" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu mới</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Xác nhận mật khẩu</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:outline-none transition-all"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={updating}
              className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg disabled:opacity-50"
            >
              {updating ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Thông tin khác</h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-envelope text-slate-400"></i>
                <span className="font-medium text-slate-700">Email xác thực</span>
              </div>
              <span className="text-green-600 font-bold text-sm">Đã xác minh</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-phone text-slate-400"></i>
                <span className="font-medium text-slate-700">Số điện thoại</span>
              </div>
              <span className="text-slate-500 text-sm">Chưa cập nhật</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <i className="fa-solid fa-clock-rotate-left text-slate-400"></i>
                <span className="font-medium text-slate-700">Lần đăng nhập cuối</span>
              </div>
              <span className="text-slate-500 text-sm">Vừa xong</span>
            </div>
          </div>
          
          <div className="mt-8 p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center">
            <p className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-widest">Mã mời của bạn</p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl font-mono font-bold text-indigo-600">LINKGOLD2024</span>
              <button className="text-slate-400 hover:text-indigo-600"><i className="fa-solid fa-copy"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
