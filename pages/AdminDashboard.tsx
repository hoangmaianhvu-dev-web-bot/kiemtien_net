
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { UserProfile, WithdrawalRequest, TaskSubmission } from '../types';
import { REFERRAL_COMMISSION } from '../constants';

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
    pendingSubmissions: 0,
    totalTasks: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Withdrawals
      const { data: withdrawData } = await supabase
        .from('withdrawals')
        .select(`*, profiles(username)`)
        .order('created_at', { ascending: false });
      
      // 2. Fetch Submissions
      const { data: subData } = await supabase
        .from('submissions')
        .select(`*, profiles(username, referrer_id), tasks(platform, reward)`)
        .order('created_at', { ascending: false });

      // 3. Fetch Users
      const { data: userData } = await supabase.from('profiles').select('*');
      
      if (userData) {
        const usersWithTasks = userData.map(user => ({
          ...user,
          task_count: subData?.filter(s => s.user_id === user.id && s.status === 'approved').length || 0
        }));
        setUsers(usersWithTasks);
        
        const totalXu = userData.reduce((sum, u) => sum + (u.xu_balance || 0), 0);
        
        setStats({
          totalUsers: userData.length,
          totalXu,
          pendingWithdraws: withdrawData?.filter(w => w.status === 'pending').length || 0,
          pendingSubmissions: subData?.filter(s => s.status === 'pending').length || 0,
          totalTasks: subData?.length || 0
        });
      }

      if (withdrawData) setWithdrawals(withdrawData);
      if (subData) setSubmissions(subData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase.from('withdrawals').update({ status: action }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) { alert('Lỗi'); }
  };

  const handleTaskAction = async (submission: any, action: 'approved' | 'rejected') => {
    try {
      if (action === 'approved') {
        const reward = submission.tasks.reward;
        
        // 1. Cộng tiền cho người làm task
        const { error: err1 } = await supabase.rpc('increment_balance', { 
          row_id: submission.user_id, 
          amount: reward 
        });
        if (err1) {
           // Fallback nếu không có RPC
           const { data: currUser } = await supabase.from('profiles').select('xu_balance').eq('id', submission.user_id).single();
           await supabase.from('profiles').update({ xu_balance: (currUser?.xu_balance || 0) + reward }).eq('id', submission.user_id);
        }

        // 2. Xử lý hoa hồng giới thiệu 5%
        const referrerId = submission.profiles?.referrer_id;
        if (referrerId) {
          const commission = Math.floor(reward * REFERRAL_COMMISSION);
          if (commission > 0) {
            const { data: refProfile } = await supabase.from('profiles').select('xu_balance, referral_earned').eq('id', referrerId).single();
            if (refProfile) {
              await supabase.from('profiles').update({ 
                xu_balance: (refProfile.xu_balance || 0) + commission,
                referral_earned: (refProfile.referral_earned || 0) + commission
              }).eq('id', referrerId);
            }
          }
        }
      }

      const { error } = await supabase.from('submissions').update({ status: action }).eq('id', submission.id);
      if (error) throw error;
      fetchData();
    } catch (err) { 
      console.error(err);
      alert('Lỗi duyệt task'); 
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          <p className="text-[10px] font-black uppercase text-blue-400 mb-1 tracking-widest">Đang chờ task</p>
          <h3 className="text-2xl font-black">{stats.pendingSubmissions}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Tổng nhiệm vụ</p>
          <h3 className="text-2xl font-black">{stats.totalTasks}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-50">
          <button onClick={() => setActiveTab('submissions')} className={`flex-1 py-6 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'submissions' ? 'text-blue-500 border-b-4 border-blue-500' : 'text-slate-400'}`}>Duyệt Task ({stats.pendingSubmissions})</button>
          <button onClick={() => setActiveTab('withdrawals')} className={`flex-1 py-6 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'withdrawals' ? 'text-orange-500 border-b-4 border-orange-500' : 'text-slate-400'}`}>Duyệt Rút ({stats.pendingWithdraws})</button>
          <button onClick={() => setActiveTab('users')} className={`flex-1 py-6 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'users' ? 'text-slate-900 border-b-4 border-slate-900' : 'text-slate-400'}`}>Thành viên</button>
        </div>

        <div className="p-4">
          {activeTab === 'submissions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Người làm / Platform</th>
                    <th className="px-6 py-4">Mã xác nhận</th>
                    <th className="px-6 py-4 text-center">Tiền thưởng</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-black text-slate-900">{s.profiles?.username}</p>
                        <p className="text-[10px] font-bold text-blue-500 uppercase">{s.tasks?.platform}</p>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-600 bg-slate-50 rounded-xl my-2 inline-block">
                        {s.verification_code}
                      </td>
                      <td className="px-6 py-4 text-center font-black text-green-600">
                        +{s.tasks?.reward?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {s.status === 'pending' ? (
                          <div className="flex justify-center space-x-2">
                             <button onClick={() => handleTaskAction(s, 'approved')} className="w-10 h-10 bg-green-500 text-white rounded-xl shadow-lg shadow-green-100"><i className="fa-solid fa-check"></i></button>
                             <button onClick={() => handleTaskAction(s, 'rejected')} className="w-10 h-10 bg-red-500 text-white rounded-xl shadow-lg shadow-red-100"><i className="fa-solid fa-xmark"></i></button>
                          </div>
                        ) : (
                          <p className="text-center font-black uppercase text-[10px] opacity-40">{s.status}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'withdrawals' && (
             <div className="overflow-x-auto">
                {/* Giữ nguyên logic rút tiền cũ ở đây */}
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Người dùng</th>
                      <th className="px-6 py-4">Phương thức / Chi tiết</th>
                      <th className="px-6 py-4 text-right">Số tiền</th>
                      <th className="px-6 py-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-black text-slate-900">{w.profiles?.username}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black uppercase text-orange-500">{w.method}</span>
                          <p className="text-xs font-medium text-slate-500">{w.details}</p>
                        </td>
                        <td className="px-6 py-4 text-right font-black">{w.amount?.toLocaleString()} Xu</td>
                        <td className="px-6 py-4">
                           {w.status === 'pending' ? (
                             <div className="flex justify-center space-x-2">
                               <button onClick={() => handleWithdrawAction(w.id, 'approved')} className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-black uppercase">Duyệt</button>
                               <button onClick={() => handleWithdrawAction(w.id, 'rejected')} className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-black uppercase">Huỷ</button>
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
                      <th className="px-6 py-4">Người giới thiệu</th>
                      <th className="px-6 py-4 text-right">Số dư</th>
                      <th className="px-6 py-4 text-right">Hoa hồng nhận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 font-black text-slate-900">{u.username}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-400 italic">
                          {users.find(ref => ref.id === u.referrer_id)?.username || '---'}
                        </td>
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