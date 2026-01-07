
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { SOCIAL_LINKS, XU_TO_VND } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '../supabase';

interface DashboardProps {
  user: UserProfile;
}

interface UserStats {
  tasksCompleted: number;
  totalWithdrawn: number;
  systemUsers: number;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState<UserStats>({
    tasksCompleted: 0,
    totalWithdrawn: 0,
    systemUsers: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealStats = async () => {
      setLoading(true);
      try {
        const { count: tasksCount } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'approved');

        const { data: withdrawData } = await supabase
          .from('withdrawals')
          .select('amount')
          .eq('user_id', user.id)
          .eq('status', 'approved');
        
        const totalWithdrawn = withdrawData?.reduce((sum, w) => sum + w.amount, 0) || 0;

        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setStats({
          tasksCompleted: tasksCount || 0,
          totalWithdrawn: totalWithdrawn,
          systemUsers: usersCount || 0
        });

        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          
          const { count } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .gte('created_at', `${dateStr}T00:00:00`)
            .lte('created_at', `${dateStr}T23:59:59`);
          
          last7Days.push({
            name: days[d.getDay()],
            amount: (count || 0) * 500
          });
        }
        setChartData(last7Days);

      } catch (err) {
        console.error("Error stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealStats();
  }, [user.id]);

  const displayStats = [
    { label: 'Số dư hiện tại', value: `${user.xu_balance.toLocaleString()} Xu`, icon: 'fa-wallet', color: 'bg-green-500' },
    { label: 'Nhiệm vụ hoàn tất', value: stats.tasksCompleted.toString(), icon: 'fa-check-circle', color: 'bg-indigo-500' },
    { label: 'Tổng tiền đã rút', value: `${(stats.totalWithdrawn * XU_TO_VND).toLocaleString()}đ`, icon: 'fa-money-bill-wave', color: 'bg-orange-500' },
    { label: 'Thành viên hệ thống', value: stats.systemUsers.toLocaleString(), icon: 'fa-users', color: 'bg-blue-500' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Chào mừng trở lại, {user.username}!</h2>
          <p className="text-indigo-100 text-lg opacity-90">Hệ thống đang vận hành tự động 100%.</p>
          <div className="mt-6 flex space-x-3">
            <a href="#/tasks" className="bg-white text-indigo-600 px-6 py-2.5 rounded-full font-black hover:bg-indigo-50 transition-all uppercase text-xs">
              Làm nhiệm vụ ngay
            </a>
          </div>
        </div>
        <i className="fa-solid fa-coins absolute top-0 right-0 p-8 text-9xl opacity-20"></i>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 transition-all hover:scale-[1.02]">
            <div className={`${stat.color} p-3 rounded-xl text-white`}>
              <i className={`fa-solid ${stat.icon} text-xl w-6 text-center`}></i>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-800">{loading ? '...' : stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Hiệu suất kiếm tiền</h3>
              <p className="text-xs text-slate-400 font-bold">Thống kê thực tế 7 ngày gần nhất</p>
            </div>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-widest">Live Update</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 12}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#4f46e5' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Cộng đồng</h3>
          <div className="space-y-3">
            <a href={SOCIAL_LINKS.ZALO} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all">
              <i className="fa-solid fa-comment-dots text-2xl w-10"></i>
              <div className="flex-1 ml-2">
                <p className="font-black text-sm uppercase">Nhóm Zalo</p>
                <p className="text-[10px] font-bold opacity-60 uppercase">Thảo luận & Giao lưu</p>
              </div>
            </a>
            <a href={SOCIAL_LINKS.TELEGRAM} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 rounded-2xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition-all">
              <i className="fa-brands fa-telegram text-2xl w-10"></i>
              <div className="flex-1 ml-2">
                <p className="font-black text-sm uppercase">Kênh Telegram</p>
                <p className="text-[10px] font-bold opacity-60 uppercase">Thông báo từ Admin</p>
              </div>
            </a>
            <a href={SOCIAL_LINKS.YOUTUBE} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 rounded-2xl bg-red-50 text-red-700 hover:bg-red-100 transition-all">
              <i className="fa-brands fa-youtube text-2xl w-10"></i>
              <div className="flex-1 ml-2">
                <p className="font-black text-sm uppercase">Kênh YouTube</p>
                <p className="text-[10px] font-bold opacity-60 uppercase">Hướng dẫn vượt link</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
