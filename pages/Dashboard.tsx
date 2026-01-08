
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabase';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState({ completed: 0, pending: 0, totalXu: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: completed } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'approved');
      const { count: pending } = await supabase.from('withdrawals').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending');
      
      setStats({
        completed: completed || 0,
        pending: pending || 0,
        totalXu: user.xu || 0
      });
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Chào mừng trở lại, {user.username}!</h2>
        <p className="text-slate-500 mt-1">Hệ thống kiếm tiền tự động, rút tiền nhanh chóng 24/7.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Số dư hiện tại</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-1">{stats.totalXu.toLocaleString()} Xu</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <i className="fa-solid fa-wallet text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Nhiệm vụ hoàn thành</p>
              <h3 className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <i className="fa-solid fa-check-circle text-xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Đang chờ rút</p>
              <h3 className="text-3xl font-bold text-orange-600 mt-1">{stats.pending}</h3>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <i className="fa-solid fa-clock text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-600 text-white p-8 rounded-xl flex flex-col md:flex-row items-center justify-between">
        <div>
          <h4 className="text-xl font-bold">Bạn muốn kiếm thêm thu nhập?</h4>
          <p className="opacity-80 mt-1">Làm ngay các nhiệm vụ mới nhất để tích lũy Xu đổi thưởng.</p>
        </div>
        <a href="#/tasks" className="mt-4 md:mt-0 bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-slate-100 transition-colors">Bắt đầu ngay</a>
      </div>
    </div>
  );
};

export default Dashboard;
