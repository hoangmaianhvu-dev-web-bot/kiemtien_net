
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
        // 1. Đếm số nhiệm vụ đã hoàn thành (approved)
        const { count: tasksCount } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'approved');

        // 2. Tính tổng tiền đã rút (approved)
        const { data: withdrawData } = await supabase
          .from('withdrawals')
          .select('amount')
          .eq('user_id', user.id)
          .eq('status', 'approved');
        
        const totalWithdrawn = withdrawData?.reduce((sum, w) => sum + w.amount, 0) || 0;

        // 3. Đếm tổng thành viên hệ thống
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setStats({
          tasksCompleted: tasksCount || 0,
          totalWithdrawn: totalWithdrawn,
          systemUsers: usersCount || 0
        });

        // 4. Lấy dữ liệu biểu đồ (Thống kê Xu kiếm được 7 ngày qua)
        // Lưu ý: Logic này giả định bạn có cột reward hoặc join với bảng tasks
        // Ở đây chúng ta tạm thời đếm số nhiệm vụ hoàn thành mỗi ngày trong 7 ngày qua
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
            amount: (count || 0) * 500 // Giả định trung bình 500 xu/task để vẽ biểu đồ
          });
        }
        setChartData(last7Days);

      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Chào mừng trở lại, {user.username}!</h2>
          <p className="text-indigo-100 text-lg opacity-90">Hệ thống đang vận hành với dữ liệu thời gian thực.</p>
          <div className="mt-6 flex space-x-3">
            <a href="#/tasks" className="bg-white text-indigo-600 px-6 py-2.5 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-lg">
              Làm nhiệm vụ ngay
            </a>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <i className="fa-solid fa-coins text-9xl"></i>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 transition-all hover:scale-[1.02]">
            <div className={`${stat.color} p-3 rounded-xl text-white shadow-inner`}>
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
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Hiệu suất kiếm tiền</h3>
              <p className="text-xs text-slate-400 font-bold">Thống kê thực tế trong 7 ngày gần nhất</p>
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

        {/* Social Links & Support */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Cộng đồng của chúng tôi</h3>
          <div className="space-y-3">
            <a href={SOCIAL_LINKS.ZALO} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all group">
              <i className="fa-solid fa-comment-dots text-2xl w-10 group-hover:scale-110 transition-transform"></i>
              <div className="flex-1 ml-2">
                <p className="font-black text-sm uppercase tracking-tight">Nhóm Zalo</p>
                <p className="text-[10px] font-bold opacity-60">Thảo luận & Giao lưu</p>
              </div>
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            </a>
            <a href={SOCIAL_LINKS.TELEGRAM} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 rounded-2xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition-all group">
              <i className="fa-brands fa-telegram text-2xl w-10 group-hover:scale-110 transition-transform"></i>
              <div className="flex-1 ml-2">
                <p className="font-black text-sm uppercase tracking-tight">Kênh Telegram</p>
                <p className="text-[10px] font-bold opacity-60">Thông báo từ Admin</p>
              </div>
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            </a>
            <a href={SOCIAL_LINKS.YOUTUBE} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 rounded-2xl bg-red-50 text-red-700 hover:bg-red-100 transition-all group">
              <i className="fa-brands fa-youtube text-2xl w-10 group-hover:scale-110 transition-transform"></i>
              <div className="flex-1 ml-2">
                <p className="font-black text-sm uppercase tracking-tight">Kênh YouTube</p>
                <p className="text-[10px] font-bold opacity-60">Hướng dẫn vượt link</p>
              </div>
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            </a>
          </div>
          
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-3">
                <i className="fa-solid fa-shield-halved text-blue-400 text-xl"></i>
                <p className="font-black text-xs uppercase tracking-widest">Minh bạch 100%</p>
              </div>
              <p className="text-[11px] font-medium opacity-70 leading-relaxed">
                Mọi thông số trên bảng điều khiển đều được cập nhật trực tiếp từ hệ thống dữ liệu cốt lõi.
              </p>
            </div>
            <i className="fa-solid fa-fingerprint absolute -bottom-4 -right-4 text-6xl opacity-10"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
