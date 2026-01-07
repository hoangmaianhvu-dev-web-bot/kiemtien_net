
import React from 'react';
import { UserProfile } from '../types';
import { SOCIAL_LINKS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const stats = [
    { label: 'Số dư hiện tại', value: `${user.xu_balance.toLocaleString()} Xu`, icon: 'fa-wallet', color: 'bg-green-500' },
    { label: 'Nhiệm vụ đã làm', value: '128', icon: 'fa-check-circle', color: 'bg-indigo-500' },
    { label: 'Tổng tiền đã rút', value: '450.000đ', icon: 'fa-money-bill-wave', color: 'bg-orange-500' },
    { label: 'Thành viên mới', value: '2,491', icon: 'fa-users', color: 'bg-blue-500' },
  ];

  const chartData = [
    { name: 'T2', amount: 4500 },
    { name: 'T3', amount: 5200 },
    { name: 'T4', amount: 3800 },
    { name: 'T5', amount: 6500 },
    { name: 'T6', amount: 4900 },
    { name: 'T7', amount: 8000 },
    { name: 'CN', amount: 9500 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Chào mừng trở lại, {user.username}!</h2>
          <p className="text-indigo-100 text-lg opacity-90">Hôm nay có hơn 100+ nhiệm vụ mới đang chờ bạn.</p>
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
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className={`${stat.color} p-3 rounded-xl text-white shadow-inner`}>
              <i className={`fa-solid ${stat.icon} text-xl w-6 text-center`}></i>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <h3 className="text-xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Hiệu suất kiếm tiền</h3>
            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">7 ngày qua</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#4f46e5' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Social Links & Support */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800">Cộng đồng LinkGold</h3>
          <div className="space-y-3">
            <a href={SOCIAL_LINKS.ZALO} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
              <i className="fa-solid fa-comment-dots text-2xl w-10"></i>
              <div className="flex-1">
                <p className="font-bold">Nhóm Zalo</p>
                <p className="text-xs opacity-75">Hơn 5000+ thành viên</p>
              </div>
              <i className="fa-solid fa-chevron-right text-sm"></i>
            </a>
            <a href={SOCIAL_LINKS.TELEGRAM} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-2xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors">
              <i className="fa-brands fa-telegram text-2xl w-10"></i>
              <div className="flex-1">
                <p className="font-bold">Kênh Telegram</p>
                <p className="text-xs opacity-75">Cập nhật tin tức nhanh nhất</p>
              </div>
              <i className="fa-solid fa-chevron-right text-sm"></i>
            </a>
            <a href={SOCIAL_LINKS.YOUTUBE} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-2xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
              <i className="fa-brands fa-youtube text-2xl w-10"></i>
              <div className="flex-1">
                <p className="font-bold">Kênh YouTube</p>
                <p className="text-xs opacity-75">Hướng dẫn kiếm tiền</p>
              </div>
              <i className="fa-solid fa-chevron-right text-sm"></i>
            </a>
          </div>
          
          <div className="bg-indigo-600 rounded-2xl p-4 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <i className="fa-solid fa-shield-halved text-2xl"></i>
              <p className="font-bold">Đảm bảo uy tín</p>
            </div>
            <p className="text-xs opacity-80 leading-relaxed">
              LinkGold cam kết thanh toán 100% các nhiệm vụ hợp lệ trong vòng 24h làm việc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
