
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserProfile } from '../types';
import { supabase } from '../supabase';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState({ completed: 0, withdrawn: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);

  useEffect(() => {
    // Logic BOT TỰ ĐỘNG CỘNG TIỀN [cite: 2025-12-30]
    const checkReward = async () => {
      if (searchParams.get('status') === 'success') {
        const pendingXu = localStorage.getItem('waiting_xu');
        if (pendingXu && user) {
          try {
            // Gọi RPC increment_xu để cộng tiền trực tiếp vào DB
            const { error } = await supabase.rpc('increment_xu', { 
              user_id: user.id, 
              amount: parseInt(pendingXu) 
            });

            if (!error) {
              setRewardMsg(`✅ Bot đã tự cộng ${pendingXu} Xu thành công!`);
              localStorage.removeItem('waiting_xu');
              
              // Reset URL sạch [cite: 2026-01-08]
              const timer = setTimeout(() => {
                setSearchParams({});
                setRewardMsg(null);
              }, 3000);
              return () => clearTimeout(timer);
            } else {
              console.error("RPC Error:", error);
            }
          } catch (err) {
            console.error("Reward check error:", err);
          }
        }
      }
    };
    
    checkReward();
  }, [searchParams, user, setSearchParams]);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: tasks } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'approved');
      const { data: withdraws } = await supabase.from('withdrawals').select('amount').eq('user_id', user.id).eq('status', 'approved');
      const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      
      setStats({
        completed: tasks || 0,
        withdrawn: withdraws?.reduce((a, b) => a + b.amount, 0) || 0,
        totalUsers: usersCount || 0
      });
      setLoading(false);
    };
    fetchStats();
  }, [user.id]);

  const cards = [
    { label: 'SỐ DƯ HIỆN TẠI', value: `${(user.xu || 0).toLocaleString()} XU`, icon: 'fa-wallet', color: 'bg-blue-500' },
    { label: 'NHIỆM VỤ ĐÃ XONG', value: stats.completed, icon: 'fa-check-double', color: 'bg-green-500' },
    { label: 'TIỀN ĐÃ RÚT', value: `${stats.withdrawn.toLocaleString()} XU`, icon: 'fa-money-bill-transfer', color: 'bg-orange-500' },
    { label: 'THÀNH VIÊN', value: stats.totalUsers, icon: 'fa-users', color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {rewardMsg && (
        <div className="bg-[#0095FF] text-white p-6 rounded-2xl font-black text-center shadow-2xl animate-bounce border-4 border-white">
          {rewardMsg}
        </div>
      )}

      <div className="bg-gradient-to-br from-[#0095FF] to-[#0055BB] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-2 uppercase tracking-tight">XIN CHÀO, {user.username}!</h2>
          <p className="text-blue-100 font-bold uppercase tracking-widest text-[10px]">Hệ thống cộng tiền tự động 100% • Admin: 0337117930</p>
          <div className="mt-10 flex space-x-4">
            <a href="#/tasks" className="bg-white text-[#0095FF] px-8 py-3 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:scale-105 transition-all shadow-xl">Bắt đầu kiếm tiền</a>
          </div>
        </div>
        <i className="fa-solid fa-bolt-lightning absolute bottom-[-50px] right-[-30px] text-[20rem] opacity-10 pointer-events-none"></i>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all">
            <div className={`${card.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
              <i className={`fa-solid ${card.icon} text-xl`}></i>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{card.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{loading ? '...' : card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm">
           <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-8">Danh mục kiếm tiền</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors">
                 <h4 className="font-black text-slate-800 uppercase text-sm mb-4">Hướng dẫn Publisher</h4>
                 <p className="text-xs text-slate-500 font-medium leading-relaxed">Cung cấp tài liệu và kiến thức chuyên sâu để bạn tối ưu hóa thu nhập từ LinkGold.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors">
                 <h4 className="font-black text-slate-800 uppercase text-sm mb-4">Chiến dịch HOT</h4>
                 <p className="text-xs text-slate-500 font-medium leading-relaxed">Luôn cập nhật các link rút gọn có giá trị cao nhất thị trường 2026.</p>
              </div>
           </div>
        </div>
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col justify-center text-center">
           <i className="fa-solid fa-shield-halved text-5xl text-blue-400 mb-6"></i>
           <h4 className="text-xl font-black uppercase tracking-tight mb-4">Uy tín tuyệt đối</h4>
           <p className="text-xs font-medium opacity-60 leading-relaxed tracking-wider">Hệ thống của Admin 0337117930 cam kết thanh toán đúng hạn, hỗ trợ 24/7.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
