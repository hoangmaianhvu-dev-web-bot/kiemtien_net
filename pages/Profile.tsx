
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabase';

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
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    const fetchRefStats = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user.id);
      setReferralCount(count || 0);
    };
    fetchRefStats();
  }, [user.id]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'e', text: 'Mật khẩu mới không khớp.' });
      return;
    }
    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdating(false);
    if (error) setMsg({ type: 'e', text: error.message });
    else {
      setMsg({ type: 's', text: 'Đổi mật khẩu thành công!' });
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    }
  };

  const referralLink = `${window.location.origin}/#/register?ref=${user.username}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã sao chép!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center text-white text-5xl font-black shadow-xl shrink-0">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-3xl font-black text-slate-900 mb-1">{user.username}</h2>
          <p className="text-slate-400 font-bold mb-4 uppercase text-[10px] tracking-widest">Tài khoản {user.role}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Số dư</p>
              <p className="text-xl font-black text-[#0095FF]">{user.xu_balance.toLocaleString()} Xu</p>
            </div>
            <div className="bg-green-50 px-6 py-3 rounded-2xl border border-green-100">
              <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Hoa hồng kiếm được</p>
              <p className="text-xl font-black text-green-600">+{user.referral_earned?.toLocaleString() || 0} Xu</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Referral System */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 md:p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl">
             <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4 italic">Mời bạn bè - Nhận 5% trọn đời</h3>
                <p className="text-indigo-100 mb-8 font-medium leading-relaxed max-w-md">
                  Chia sẻ LinkGold với bạn bè của bạn. Bạn sẽ nhận được 5% hoa hồng trên tổng số tiền họ kiếm được mãi mãi!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3">Mã giới thiệu</p>
                      <div className="flex items-center justify-between">
                         <span className="text-2xl font-black italic tracking-tighter">{user.username}</span>
                         <button onClick={() => copyToClipboard(user.username)} className="bg-white text-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center hover:scale-105 transition-all"><i className="fa-solid fa-copy"></i></button>
                      </div>
                   </div>
                   <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3">Tổng số bạn bè</p>
                      <div className="flex items-center justify-between">
                         <span className="text-2xl font-black">{referralCount.toLocaleString()} <span className="text-sm italic opacity-60">Thành viên</span></span>
                         <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><i className="fa-solid fa-users"></i></div>
                      </div>
                   </div>
                </div>

                <div className="mt-6 bg-white/10 p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white/20 transition-all border border-white/10" onClick={() => copyToClipboard(referralLink)}>
                   <span className="text-[11px] font-black overflow-hidden text-ellipsis whitespace-nowrap opacity-60 mr-4 italic">{referralLink}</span>
                   <span className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0">Copy Link</span>
                </div>
             </div>
             <i className="fa-solid fa-gift absolute -bottom-10 -right-10 text-[15rem] opacity-10 rotate-12"></i>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6">Đổi mật khẩu</h3>
            {msg && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${msg.type === 's' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {msg.text}
              </div>
            )}
            <form onSubmit={handleUpdatePassword} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mật khẩu mới</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Xác nhận lại</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold" required />
                  </div>
               </div>
               <button type="submit" disabled={updating} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all disabled:opacity-50">
                  Cập nhật thông tin
               </button>
            </form>
          </div>
        </div>

        {/* Support Section */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Hỗ trợ nhanh</h3>
              <div className="space-y-3">
                 <div className="p-4 bg-blue-50 rounded-2xl flex items-center space-x-4 border border-blue-100">
                    <i className="fa-solid fa-headset text-blue-500 text-xl"></i>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin hỗ trợ</p>
                       <p className="text-xs font-bold text-blue-700">Online 24/7</p>
                    </div>
                 </div>
                 <div className="p-4 bg-green-50 rounded-2xl flex items-center space-x-4 border border-green-100">
                    <i className="fa-solid fa-envelope-open text-green-500 text-xl"></i>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                       <p className="text-xs font-bold text-green-700 italic">support@linkgold.pro</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
              <p className="text-xs font-bold opacity-60 mb-2 uppercase tracking-widest">Ghi chú quan trọng</p>
              <p className="text-xs leading-relaxed font-medium opacity-80">
                Hoa hồng được tính ngay khi Admin duyệt nhiệm vụ của người bạn giới thiệu. 5% sẽ cộng trực tiếp vào số dư của bạn.
              </p>
              <i className="fa-solid fa-shield-halved absolute -bottom-4 -right-4 text-6xl opacity-10"></i>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;