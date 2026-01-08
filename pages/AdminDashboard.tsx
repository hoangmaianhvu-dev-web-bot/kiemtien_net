
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { UserProfile, ShortLinkTask } from '../types';

interface UserExt extends UserProfile {
  task_count: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'withdrawals' | 'users' | 'tasks'>('submissions');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [users, setUsers] = useState<UserExt[]>([]);
  const [tasks, setTasks] = useState<ShortLinkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [newTask, setNewTask] = useState({ 
    title: '', 
    platform: '', 
    xu: '', 
    url: '', 
    description: '',
    type: 'auto',
    provider: 'link4m',
    api_token: '',
    manual_link: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: withdrawData } = await supabase.from('withdrawals').select(`*, profiles(username)`).order('created_at', { ascending: false });
      const { data: subData } = await supabase.from('submissions').select(`*, profiles(username), tasks(title, xu)`).order('created_at', { ascending: false });
      const { data: userData } = await supabase.from('profiles').select('*');
      const { data: taskData } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });

      if (userData) {
        setUsers(userData.map(user => ({
          ...user,
          task_count: subData?.filter(s => s.user_id === user.id && s.status === 'approved').length || 0
        })));
      }

      setWithdrawals(withdrawData || []);
      setSubmissions(subData || []);
      setTasks(taskData || []);
    } catch (err) { 
      console.error("Admin Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSeedTasks = async () => {
    if (!confirm("Hệ thống sẽ tự động tạo 7 nhiệm vụ mẫu với API Token bạn đã cung cấp. Tiếp tục?")) return;
    
    setLoading(true);
    const sampleTasks = [
      { title: 'Vượt link Link4M nhận thưởng', platform: 'Link4M', xu: 500, url: 'https://google.com', provider: 'link4m', api_token: '68208afab6b8fc60542289b6', type: 'auto', status: 'active', description: 'Vượt link để nhận 500 Xu ngay lập tức.' },
      { title: 'Nhiệm vụ YeuMoney siêu tốc', platform: 'YeuMoney', xu: 600, url: 'https://google.com', provider: 'yeumoney', api_token: '2103f2aa67d874c161e5f4388b2312af6d43742734a8ea41716b8a2cc94b7b02', type: 'auto', status: 'active', description: 'Vượt link YeuMoney để nhận 600 Xu.' },
      { title: 'Vượt link LinkTot cực dễ', platform: 'LinkTot', xu: 450, url: 'https://google.com', provider: 'linktot', api_token: 'd121d1761f207cb9bfde19c8be5111cb8d623d83e1e05053ec914728c9ea869c', type: 'auto', status: 'active', description: 'Làm nhiệm vụ LinkTot để nhận 450 Xu.' },
      { title: 'Nhiệm vụ XLink uy tín', platform: 'XLink', xu: 550, url: 'https://google.com', provider: 'xlink', api_token: 'ac55663f-ef85-4849-8ce1-4ca99bd57ce7', type: 'auto', status: 'active', description: 'Nhận ngay 550 Xu sau khi vượt link XLink.' },
      { title: 'TrafficTot - Thưởng cực cao', platform: 'TrafficTot', xu: 700, url: 'https://google.com', provider: 'traffictot', api_token: '8ddd0436120826a3a1afd7cc4275827af4edead951fb5ec5f7dafd03ccdc95f7', type: 'auto', status: 'active', description: 'Nhiệm vụ TrafficTot thưởng lớn 700 Xu.' },
      { title: '4MMO - Kiếm tiền mỗi ngày', platform: '4MMO', xu: 400, url: 'https://google.com', provider: '4mmo', api_token: 'e60502497c3ce642ca2e4d57515bd294ae0d8d93', type: 'auto', status: 'active', description: 'Vượt link 4MMO đơn giản lấy 400 Xu.' },
      { title: 'LinkNgon - Link cực chất', platform: 'LinkNgon', xu: 650, url: 'https://google.com', provider: 'linkngon', api_token: 'AGnREGGD4gsCF9jLs5U3o6ARUuSeaeRAc8A3cL6TU4oZrq', type: 'auto', status: 'active', description: 'Nhiệm vụ LinkNgon nhận ngay 650 Xu.' },
    ];

    try {
      const { error } = await supabase.from('tasks').insert(sampleTasks);
      if (error) throw error;
      alert("Đã tạo thành công 7 nhiệm vụ mẫu!");
      fetchData();
    } catch (err: any) {
      alert("Lỗi tạo nhiệm vụ mẫu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const title = newTask.title.trim();
      const xu = parseInt(newTask.xu);
      const url = newTask.url.trim();

      if (!title) throw new Error("Tiêu đề không được để trống.");
      if (isNaN(xu) || xu <= 0) throw new Error("Số xu phải là số nguyên dương.");
      if (newTask.type === 'auto' && !url) throw new Error("Vui lòng nhập Link đích cho nhiệm vụ tự động.");

      const insertData = {
        title,
        platform: newTask.platform.trim() || 'LinkGold',
        xu,
        url: newTask.type === 'auto' ? url : '',
        description: newTask.description.trim() || 'Vượt link để nhận thưởng',
        status: 'active',
        type: newTask.type,
        provider: newTask.type === 'auto' ? newTask.provider : '',
        api_token: newTask.type === 'auto' ? newTask.api_token.trim() : '',
        manual_link: newTask.type === 'manual' ? newTask.manual_link.trim() : ''
      };

      const { error } = await supabase.from('tasks').insert([insertData]);
      if (error) throw error;

      setNewTask({ 
        title: '', platform: '', xu: '', url: '', description: '', 
        type: 'auto', provider: 'link4m', api_token: '', manual_link: '' 
      });
      fetchData();
      alert("Đã thêm nhiệm vụ thành công!");
    } catch (err: any) { 
      alert("Lỗi: " + (err.message || "Vui lòng kiểm tra lại dữ liệu.")); 
    }
  };

  const handleWithdrawAction = async (id: string, action: 'approved' | 'rejected') => {
    if (!confirm(`Xác nhận ${action === 'approved' ? 'DUYỆT' : 'TỪ CHỐI'} yêu cầu này?`)) return;
    
    setActionLoading(id);
    try {
      const { error } = await supabase.from('withdrawals').update({ status: action }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) { 
      alert('Lỗi xử lý: ' + err.message); 
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Xác nhận gỡ bỏ nhiệm vụ này?")) return;
    await supabase.from('tasks').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex items-center space-x-3 overflow-x-auto pb-4 scrollbar-hide">
        {[
          { id: 'submissions', label: 'Lịch sử Task', icon: 'fa-list-check' },
          { id: 'withdrawals', label: 'Duyệt Rút tiền', icon: 'fa-money-bill-transfer' },
          { id: 'tasks', label: 'Nhiệm vụ', icon: 'fa-link' },
          { id: 'users', label: 'Thành viên', icon: 'fa-users' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest whitespace-nowrap transition-all flex items-center shadow-sm ${
              activeTab === tab.id ? 'bg-[#0095FF] text-white shadow-xl scale-105' : 'bg-white text-slate-400 hover:text-slate-600'
            }`}
          >
            <i className={`fa-solid ${tab.icon} mr-3 text-sm`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-8 md:p-12">
        {loading ? (
          <div className="flex flex-col items-center py-20">
             <div className="w-12 h-12 border-4 border-slate-100 border-t-[#0095FF] rounded-full animate-spin mb-4"></div>
             <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {activeTab === 'submissions' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-50">
                    <tr><th className="px-6 py-6">Thành viên</th><th className="px-6 py-6">Nhiệm vụ</th><th className="px-6 py-6 text-center">Tiền thưởng</th><th className="px-6 py-6 text-center">Trạng thái</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-bold">
                    {submissions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-all">
                        <td className="px-6 py-6 text-slate-900 uppercase">{s.profiles?.username || '---'}</td>
                        <td className="px-6 py-6 text-[#0095FF] uppercase">{s.tasks?.title || '---'}</td>
                        <td className="px-6 py-6 text-center text-green-600">+{Number(s.tasks?.xu || 0).toLocaleString()} Xu</td>
                        <td className="px-6 py-6 text-center">
                           <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-4 py-1.5 rounded-full">Duyệt Auto</span>
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
                  <thead className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-50">
                    <tr><th className="px-6 py-6">Người rút</th><th className="px-6 py-6">Thông tin chi tiết</th><th className="px-6 py-6 text-right">Số tiền</th><th className="px-6 py-6 text-center">Hành động</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-bold">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50 transition-all">
                        <td className="px-6 py-6 text-slate-900 uppercase">{w.profiles?.username || '---'}</td>
                        <td className="px-6 py-6">
                           <p className="text-xs text-slate-600 uppercase font-black">{w.method}</p>
                           <p className="text-xs text-slate-400 mt-1">{w.details}</p>
                        </td>
                        <td className="px-6 py-6 text-right text-[#0095FF] font-black">{Number(w.amount).toLocaleString()} Xu</td>
                        <td className="px-6 py-6 text-center">
                          {w.status === 'pending' ? (
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                onClick={() => handleWithdrawAction(w.id, 'approved')} 
                                disabled={!!actionLoading}
                                className="bg-green-500 text-white w-10 h-10 rounded-xl hover:bg-green-600 transition-all flex items-center justify-center shadow-lg shadow-green-100"
                                title="Duyệt"
                              >
                                {actionLoading === w.id ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>}
                              </button>
                              <button 
                                onClick={() => handleWithdrawAction(w.id, 'rejected')} 
                                disabled={!!actionLoading}
                                className="bg-red-500 text-white w-10 h-10 rounded-xl hover:bg-red-600 transition-all flex items-center justify-center shadow-lg shadow-red-100"
                                title="Từ chối"
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            </div>
                          ) : (
                            <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                              w.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {w.status === 'approved' ? 'Đã thanh toán' : 'Đã từ chối'}
                            </span>
                          )}
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
                  <thead className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-50">
                    <tr><th className="px-6 py-6">Thành viên</th><th className="px-6 py-6">Ngày tham gia</th><th className="px-6 py-6 text-center">Tasks xong</th><th className="px-6 py-6 text-right">Số dư</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-bold">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-all">
                        <td className="px-6 py-6 flex items-center space-x-3">
                           <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-sm uppercase">
                             {u.username.charAt(0)}
                           </div>
                           <span className="text-slate-900 uppercase">{u.username}</span>
                        </td>
                        <td className="px-6 py-6 text-xs text-slate-400">
                          {new Date(u.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black">{u.task_count} TASKS</span>
                        </td>
                        <td className="px-6 py-6 text-right text-[#0095FF] font-black">
                          {Number(u.xu_balance).toLocaleString()} Xu
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-blue-50 p-8 rounded-[2rem] border border-blue-100">
                  <div>
                    <h3 className="text-xl font-black text-[#0095FF] uppercase tracking-tight">Cài đặt nhanh nhiệm vụ mẫu</h3>
                    <p className="text-xs text-blue-400 font-bold mt-1 uppercase">Tự động thêm 7 loại nhiệm vụ vượt link với Token bạn đã cung cấp.</p>
                  </div>
                  <button 
                    onClick={handleSeedTasks} 
                    className="bg-[#0095FF] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-100 hover:scale-105 transition-all"
                  >
                    Tạo 7 nhiệm vụ ngay
                  </button>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Thêm nhiệm vụ mới</h3>
                  <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" placeholder="Tiêu đề (Bắt buộc)" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full px-8 py-5 bg-white rounded-2xl font-bold border-2 border-transparent focus:border-[#0095FF] outline-none" required />
                    <input type="text" placeholder="Nền tảng (Ví dụ: Link4M)" value={newTask.platform} onChange={e => setNewTask({...newTask, platform: e.target.value})} className="w-full px-8 py-5 bg-white rounded-2xl font-bold border-2 border-transparent focus:border-[#0095FF] outline-none" />
                    <input type="number" placeholder="Số Xu thưởng" value={newTask.xu} onChange={e => setNewTask({...newTask, xu: e.target.value})} className="w-full px-8 py-5 bg-white rounded-2xl font-bold border-2 border-transparent focus:border-[#0095FF] outline-none" required />
                    
                    <select value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value as any})} className="w-full px-8 py-5 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#0095FF]">
                      <option value="auto">Tự động (Rút gọn link)</option>
                      <option value="manual">Thủ công (Review Maps/App)</option>
                    </select>

                    {newTask.type === 'auto' ? (
                      <>
                        <select value={newTask.provider} onChange={e => setNewTask({...newTask, provider: e.target.value})} className="w-full px-8 py-5 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#0095FF]">
                          <option value="link4m">Link4M</option>
                          <option value="yeumoney">YeuMoney</option>
                          <option value="linktot">LinkTot</option>
                          <option value="xlink">XLink</option>
                          <option value="traffictot">TrafficTot</option>
                          <option value="4mmo">4MMO</option>
                          <option value="linkngon">LinkNgon</option>
                        </select>
                        <input type="text" placeholder="API Token" value={newTask.api_token} onChange={e => setNewTask({...newTask, api_token: e.target.value})} className="w-full px-8 py-5 bg-white rounded-2xl font-bold border-2 border-transparent focus:border-[#0095FF] outline-none" />
                        <input type="text" placeholder="Link đích (Rút gọn xong sẽ về đây)" value={newTask.url} onChange={e => setNewTask({...newTask, url: e.target.value})} className="w-full px-8 py-5 bg-white rounded-2xl font-bold border-2 border-transparent focus:border-[#0095FF] outline-none md:col-span-2" />
                      </>
                    ) : (
                      <input type="text" placeholder="Link nhiệm vụ thủ công" value={newTask.manual_link} onChange={e => setNewTask({...newTask, manual_link: e.target.value})} className="w-full px-8 py-5 bg-white rounded-2xl font-bold border-2 border-transparent focus:border-[#0095FF] outline-none md:col-span-2" />
                    )}

                    <textarea placeholder="Mô tả nhiệm vụ..." value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full px-8 py-5 bg-white rounded-2xl font-bold border-2 border-transparent focus:border-[#0095FF] outline-none md:col-span-2" rows={2}></textarea>
                    
                    <button type="submit" className="bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-black transition-all md:col-span-2">
                      Lưu & Đăng nhiệm vụ
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map(t => (
                    <div key={t.id} className="p-8 bg-white rounded-[2.5rem] border-2 border-slate-50 flex flex-col justify-between hover:shadow-xl transition-all relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-black text-slate-900 uppercase text-lg line-clamp-1">{t.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{t.platform} • {t.type}</p>
                        </div>
                        <button onClick={() => handleDeleteTask(t.id)} className="text-red-400 hover:text-red-600"><i className="fa-solid fa-trash-can"></i></button>
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                        <p className="text-xs font-black text-green-600 bg-green-50 px-4 py-1.5 rounded-full uppercase">Thưởng: {Number(t.xu).toLocaleString()} Xu</p>
                        <span className={`w-3 h-3 rounded-full ${t.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
