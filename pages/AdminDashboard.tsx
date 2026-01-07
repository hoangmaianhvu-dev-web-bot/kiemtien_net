import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { UserProfile, WithdrawalRequest, TaskSubmission } from '../types';

interface UserExt extends UserProfile {
  task_count: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'users'>('withdrawals');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [users, setUsers] = useState<UserExt[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalXu: 0,
    pendingWithdraws: 0,
    totalTasks: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Withdrawals with User Profile
      const { data: withdrawData } = await supabase
        .from('withdrawals')
        .select(`*, profiles(username)`)
        .order('created_at', { ascending: false });
      
      // 2. Fetch All Users
      const { data: userData } = await supabase.from('profiles').select('*');
      
      // 3. Fetch Submissions count for each user
      const { data: submissions } = await supabase.from('submissions').select('user_id');

      if (userData) {
        const usersWithTasks = userData.map(user => ({
          ...user,
          task_count: submissions?.filter(s => s.user_id === user.id).length || 0
        }));
        setUsers(usersWithTasks);
        
        const totalXu = userData.reduce((sum, u) => sum + (u.xu_balance || 0), 0);
        const pending = withdrawData?.filter(w => w.status === 'pending').length || 0;

        setStats({
          totalUsers: userData.length,
          totalXu,
          pendingWithdraws: pending,
          totalTasks: submissions?.length || 0
        });
      }

      if (withdrawData) setWithdrawals(withdrawData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ status: action })
        .eq('id', id);
      
      if (error) throw error;
      fetchData(); // Refresh
    } catch (err) {
      alert('Lỗi thao tác');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Thành viên</p>
          <h3 className="text-3xl font-black text-slate-900">{stats.totalUsers.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Tổng Xu tồn</p>
          <h3 className="text-3xl font-black text-indigo-600">{stats.totalXu.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Chờ duyệt rút</p>
          <h3 className="text-3xl font-black text-orange-500">{stats.pendingWithdraws}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Nhiệm vụ đã làm</p>
          <h3 className="text-3xl font-black text-green-600">{stats.totalTasks.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        {/* Tabs */}
        <div className="flex border-b border-slate-50">
          <button 
            onClick={() => setActiveTab('withdrawals')}
            className={`flex-1 py-6 font-black text-sm uppercase tracking-widest transition-all ${
              activeTab === 'withdrawals' ? 'text-[#0095FF] border-b-4 border-[#0095FF]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Duyệt rút tiền ({stats.pendingWithdraws})
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-6 font-black text-sm uppercase tracking-widest transition-all ${
              activeTab === 'users' ? 'text-[#0095FF] border-b-4 border-[#0095FF]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Quản lý thành viên
          </button>
        </div>

        {activeTab === 'withdrawals' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Mã / Người dùng</th>
                  <th className="px-8 py-4">Chi tiết nhận tiền</th>
                  <th className="px-8 py-4">Số tiền</th>
                  <th className="px-8 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-mono text-xs text-indigo-600 font-bold mb-1">#{w.id.slice(0,8)}</p>
                      <p className="font-black text-slate-900">{w.profiles?.username || 'Unknown'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${w.method === 'BANK' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                          {w.method}
                        </span>
                        <span className="text-[10px] text-slate-400">{new Date(w.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium whitespace-pre-wrap max-w-xs">{w.details}</p>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-900 text-lg">
                      {w.amount.toLocaleString()} <span className="text-xs text-slate-400 font-bold">Xu</span>
                    </td>
                    <td className="px-8 py-6">
                      {w.status === 'pending' ? (
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handleAction(w.id, 'approved')}
                            className="bg-green-500 text-white w-10 h-10 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-100"
                          >
                            <i className="fa-solid fa-check"></i>
                          </button>
                          <button 
                            onClick={() => handleAction(w.id, 'rejected')}
                            className="bg-red-500 text-white w-10 h-10 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-100"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                            w.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {w.status === 'approved' ? 'Thành công' : 'Đã từ chối'}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {withdrawals.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">Không có yêu cầu nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Thành viên</th>
                  <th className="px-8 py-4 text-center">Nhiệm vụ</th>
                  <th className="px-8 py-4 text-right">Số dư Xu</th>
                  <th className="px-8 py-4 text-center">Vai trò</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{u.username}</p>
                          <p className="text-[10px] text-slate-400 font-medium">ID: #{u.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black">
                        {u.task_count} hoàn thành
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-900">
                      {u.xu_balance.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        u.role === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;