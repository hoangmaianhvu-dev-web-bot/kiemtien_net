
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { UserProfile, ShortLinkTask } from '../types';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'withdrawals' | 'tasks'>('tasks');
  const [users, setUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<ShortLinkTask[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newTask, setNewTask] = useState({ 
    title: '', platform: '', xu: '', provider: 'link4m', api_token: '', url: '', description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: u } = await supabase.from('users').select('*');
    const { data: w } = await supabase.from('withdrawals').select('*, users(username)').order('created_at', { ascending: false });
    const { data: t } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    
    setUsers(u || []);
    setWithdrawals(w || []);
    setTasks(t || []);
    setLoading(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('tasks').insert([{
        title: newTask.title, platform: newTask.platform, xu: parseInt(newTask.xu),
        provider: newTask.provider, api_token: newTask.api_token, url: newTask.url,
        description: newTask.description, status: 'active', type: 'auto'
      }]);
      if (error) throw error;
      setNewTask({ title: '', platform: '', xu: '', provider: 'link4m', api_token: '', url: '', description: '' });
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleWithdraw = async (id: string, action: 'approved' | 'rejected') => {
    await supabase.from('withdrawals').update({ status: action }).eq('id', id);
    fetchData();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex space-x-4 bg-white p-4 rounded-3xl shadow-sm overflow-x-auto">
        {['tasks', 'withdrawals', 'users'].map((t: any) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === t ? 'bg-blue-500 text-white shadow-xl' : 'text-slate-400'}`}>
            {t === 'tasks' ? 'Nhiệm vụ' : t === 'withdrawals' ? 'Rút tiền' : 'Thành viên'}
          </button>
        ))}
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        {activeTab === 'tasks' && (
          <div className="space-y-12">
            <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-10 rounded-[2.5rem]">
               <input type="text" placeholder="TÊN NHIỆM VỤ" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="px-8 py-4 rounded-2xl font-bold outline-none" required />
               <input type="number" placeholder="SỐ XU (Cột 'xu')" value={newTask.xu} onChange={e => setNewTask({...newTask, xu: e.target.value})} className="px-8 py-4 rounded-2xl font-bold outline-none" required />
               <select value={newTask.provider} onChange={e => setNewTask({...newTask, provider: e.target.value})} className="px-8 py-4 rounded-2xl font-bold outline-none">
                 <option value="link4m">LINK4M</option>
                 <option value="yeumoney">YEUMONEY</option>
                 <option value="traffictot">TRAFFICTOT</option>
                 <option value="linktot">LINKTOT</option>
               </select>
               <input type="text" placeholder="API TOKEN" value={newTask.api_token} onChange={e => setNewTask({...newTask, api_token: e.target.value})} className="px-8 py-4 rounded-2xl font-bold outline-none" />
               <input type="text" placeholder="LINK ĐÍCH (Redirect về Blog)" value={newTask.url} onChange={e => setNewTask({...newTask, url: e.target.value})} className="px-8 py-4 rounded-2xl font-bold outline-none md:col-span-2" />
               <button type="submit" className="md:col-span-2 bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-black">Lưu nhiệm vụ mới</button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tasks.map(t => (
                <div key={t.id} className="p-8 border border-slate-100 rounded-[2.5rem] flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 uppercase text-lg mb-2">{t.title}</h4>
                    <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase">{t.xu} Xu • {t.provider}</span>
                  </div>
                  <button onClick={async () => { await supabase.from('tasks').delete().eq('id', t.id); fetchData(); }} className="mt-6 text-red-500 font-black uppercase text-[10px] tracking-widest hover:underline">Xóa Task</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="text-[10px] font-black uppercase text-slate-400">
                 <tr><th className="px-6 py-4">Tài khoản</th><th className="px-6 py-4">Số tiền</th><th className="px-6 py-4">Trạng thái</th><th className="px-6 py-4 text-center">Xử lý</th></tr>
               </thead>
               <tbody className="divide-y divide-slate-50 font-bold">
                 {withdrawals.map(w => (
                   <tr key={w.id}>
                     <td className="px-6 py-4 uppercase text-slate-900">{w.users?.username || 'User'}</td>
                     <td className="px-6 py-4 text-blue-500">{w.amount.toLocaleString()} Xu</td>
                     <td className="px-6 py-4 uppercase text-[10px] opacity-40">{w.status}</td>
                     <td className="px-6 py-4 text-center space-x-2">
                       {w.status === 'pending' && (
                         <>
                           <button onClick={() => handleWithdraw(w.id, 'approved')} className="bg-green-500 text-white w-8 h-8 rounded-lg"><i className="fa-solid fa-check"></i></button>
                           <button onClick={() => handleWithdraw(w.id, 'rejected')} className="bg-red-500 text-white w-8 h-8 rounded-lg"><i className="fa-solid fa-x"></i></button>
                         </>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {users.map(u => (
              <div key={u.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="font-black text-slate-900 uppercase mb-1">{u.username}</p>
                {/* Fix: Changed xu_balance to xu to match DB schema and UserProfile definition */}
                <p className="text-blue-500 font-black text-xs uppercase">{u.xu.toLocaleString()} Xu</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
