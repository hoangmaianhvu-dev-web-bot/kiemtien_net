
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { UserProfile } from '../types';

interface UserExt extends UserProfile {
  task_count: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'withdrawals' | 'users'>('submissions');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
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
      const { data: withdrawData } = await supabase
        .from('withdrawals')
        .select(`*, profiles(username)`)
        .order('created_at', { ascending: false });
      
      const { data: subData } = await supabase
        .from('submissions')
        .select(`*, profiles(username), tasks(platform, reward)`)
        .order('created_at', { ascending: false });

      const { data: userData } = await supabase.from('profiles').select('*');
      
      if (userData) {
        const usersWithTasks = userData.map(user => ({
          ...user,
          task_count: subData?.filter(s => s.user_id === user.id && s.status === 'approved').length || 0
        }));
        setUsers(usersWithTasks);
        
        setStats({
          totalUsers: userData.length,
          totalXu: userData.reduce((sum, u) => sum + (u.xu_balance || 0), 0),
          pendingWithdraws: withdrawData?.filter(w => w.status === 'pending').length || 0,
          totalTasks: subData?.length || 0
        });
      }

      if (withdrawData) setWithdrawals(withdrawData);
      if (subData) setSubmissions(subData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleWithdrawAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await supabase.from('withdrawals').update({ status: action }).eq('id', id);
      fetchData();
    } catch (err) { alert('Lỗi'); }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Người dùng</p>
          <h3 className="text-2xl font-black">{stats.totalUsers}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Xu hệ thống</p>
          <h3 className="text-2xl font-black text-indigo-600">{stats.totalXu.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-b-4 border-orange-500">
          <p className="text-[10px] font-black uppercase text-orange-400 mb-1 tracking-widest">Đang chờ rút</p>
          <h3 className="text-2xl font-black">{stats.pendingWithdraws}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-b-4 border-blue-500">
          <p className="text-[10px] font-black uppercase text-blue-400 mb-1 tracking-widest">Lịch sử nhiệm vụ</p>
          <h3 className="text-2xl font-black">{stats.totalTasks}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-50">
          <button onClick={() => setActiveTab('submissions')} className={`flex-1 py-6 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'submissions' ? 'text-blue-500 border-b-4 border-blue-500' : 'text-slate-400'}`}>Lịch sử Task</button>
          <button onClick={() => setActiveTab('withdrawals')} className={`flex-1 py-6 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'withdrawals' ? 'text-orange-500 border-b-4 border-orange-500' : 'text-slate-400'}`}>Duyệt Rút ({stats.pendingWithdraws})</button>
          <button onClick={() => setActiveTab('users')} className={`flex-1 py-6 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'users' ? 'text-slate-900 border-b-4 border-slate-900' : 'text-slate-400'}`}>Thành viên</button>
        </div>

        <div className="p-4">
          {activeTab === 'submissions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Thành viên</th>
                    <th className="px-6 py-4">Mã / Platform</th>
                    <th className="px-6 py-4 text-center">Tiền thưởng</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-black text-slate-900">{s.profiles?.username}</td>
                      <td className="px-6 py-4">
                        <p className="text-[10px] font-black text-blue-500 uppercase">{s.tasks?.platform}</p>
                        <p className="font-mono text-xs">{s.verification_code}</p>
                      </td>
                      <td className="px-6 py-4 text-center font-black text-green-600">+{s.tasks?.reward?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[10px] font-black uppercase text-green-500 bg-green-50 px-3 py-1 rounded-full">Tự động</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'withdrawals' && (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Người dùng</th>
                      <th className="px-6 py-4">Phương thức</th>
                      <th className="px-6 py-4 text-right">Số tiền</th>
                      <th className="px-6 py-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-black text-slate-900 uppercase">{w.profiles?.username}</td>
                        <td className="px-6 py-4 uppercase text-[10px] font-black text-orange-500">{w.method}</td>
                        <td className="px-6 py-4 text-right font-black">{w.amount?.toLocaleString()} Xu</td>
                        <td className="px-6 py-4">
                           {w.status === 'pending' ? (
                             <div className="flex justify-center space-x-2">
                               <button onClick={() => handleWithdrawAction(w.id, 'approved')} className="px-4 py-2 bg-green-500 text-white rounded-lg text-[10px] font-black uppercase">Duyệt</button>
                               <button onClick={() => handleWithdrawAction(w.id, 'rejected')} className="px-4 py-2 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase">Huỷ</button>
                             </div>
                           ) : <p className="text-center text-[10px] font-black uppercase opacity-30">{w.status}</p>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          )}

          {activeTab === 'users' && (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Thành viên</th>
                      <th className="px-6 py-4 text-right">Số dư</th>
                      <th className="px-6 py-4 text-right">Hoa hồng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 font-black text-slate-900 uppercase">{u.username}</td>
                        <td className="px-6 py-4 text-right font-black text-[#0095FF]">{u.xu_balance.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-black text-green-500">{u.referral_earned?.toLocaleString() || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
