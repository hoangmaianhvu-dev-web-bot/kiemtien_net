
import React, { useState, useEffect } from 'react';
import { UserProfile, ShortLinkTask } from '../types';
import { supabase } from '../supabase';
import { REFERRAL_COMMISSION } from '../constants';

interface TasksProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

const Tasks: React.FC<TasksProps> = ({ user, setUser }) => {
  const [tasks, setTasks] = useState<ShortLinkTask[]>([]);
  const [activeTask, setActiveTask] = useState<ShortLinkTask | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API Keys (Giả định)
  const API_KEYS: Record<string, string> = {
    'link4m': 'YOUR_KEY', 'yeumoney': 'YOUR_KEY', 'laymanet': 'YOUR_KEY'
    // ...
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'active');
      
      if (supabaseError) throw supabaseError;
      setTasks(data || []);
    } catch (err: any) {
      setError('Lỗi tải danh sách: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (task: ShortLinkTask) => {
    setProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: reqData, error: reqError } = await supabase
        .from('task_requests')
        .insert({ user_id: user.id, task_id: task.id, status: 'pending' })
        .select('id').single();

      if (reqError) throw reqError;
      
      const destinationBlogUrl = `https://avudev-verifi.blogspot.com/?rid=${reqData.id}`;
      window.open(destinationBlogUrl, '_blank');
      
      setActiveTask(task);
      setVerificationCode('');
    } catch (err: any) {
      setError('Lỗi khởi tạo: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !activeTask) return;

    setProcessing(true);
    setError(null);
    try {
      // 1. Lưu kết quả với trạng thái APPROVED ngay lập tức (Tự động 100%)
      const { error: subError } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          task_id: activeTask.id,
          verification_code: verificationCode.trim(),
          status: 'approved' // Chuyển sang approved luôn
        });

      if (subError) throw subError;

      // 2. Tự động cộng tiền cho người dùng
      const reward = activeTask.reward;
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('xu_balance, referrer_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const newBalance = (profile.xu_balance || 0) + reward;
      
      await supabase.from('profiles').update({ xu_balance: newBalance }).eq('id', user.id);

      // 3. Tự động cộng hoa hồng cho người giới thiệu (nếu có)
      if (profile.referrer_id) {
        const commission = Math.floor(reward * REFERRAL_COMMISSION);
        const { data: refProfile } = await supabase.from('profiles').select('xu_balance, referral_earned').eq('id', profile.referrer_id).single();
        if (refProfile) {
          await supabase.from('profiles').update({
            xu_balance: (refProfile.xu_balance || 0) + commission,
            referral_earned: (refProfile.referral_earned || 0) + commission
          }).eq('id', profile.referrer_id);
        }
      }

      // Cập nhật giao diện local
      setUser({ ...user, xu_balance: newBalance });
      setSuccess(true);
      setActiveTask(null);
      setVerificationCode('');
      
      // Tự động ẩn thông báo thành công sau 3s
      setTimeout(() => setSuccess(false), 3000);

    } catch (err: any) {
      setError('Lỗi hệ thống: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-[#0095FF] rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Đang tải...</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">NHIỆM VỤ KIẾM XU</h2>
          <p className="text-slate-500 font-bold text-sm">Hệ thống tự động 100% - Hoàn thành là có tiền ngay.</p>
        </div>
        <button onClick={fetchTasks} className="bg-white px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
          Làm mới danh sách
        </button>
      </div>

      {success && (
        <div className="bg-green-500 text-white p-6 rounded-[2rem] flex items-center shadow-xl animate-in slide-in-from-top-4">
          <i className="fa-solid fa-circle-check text-2xl mr-4"></i>
          <p className="font-black uppercase tracking-widest text-xs">Chúc mừng! Bạn đã nhận được xu thưởng ngay lập tức.</p>
        </div>
      )}

      {activeTask && (
        <div className="bg-white border-2 border-[#0095FF] rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
               <div className="w-14 h-14 bg-[#0095FF] text-white rounded-2xl flex items-center justify-center text-2xl">
                  <i className="fa-solid fa-bolt"></i>
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase">Xác nhận hoàn thành</h3>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{activeTask.platform}</p>
               </div>
            </div>
            <button onClick={() => setActiveTask(null)} className="text-slate-300 hover:text-red-500"><i className="fa-solid fa-circle-xmark text-2xl"></i></button>
          </div>
          
          <form onSubmit={handleSubmitCode} className="space-y-4">
            <input 
              type="text" 
              placeholder="NHẬP MÃ XÁC NHẬN..." 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
              className="w-full px-8 py-6 rounded-3xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-[#0095FF] outline-none transition-all font-black text-slate-900 placeholder:text-slate-300 tracking-widest" 
              required 
            />
            <button 
              type="submit" 
              disabled={processing} 
              className="w-full bg-[#0095FF] text-white py-6 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-[#0077CC] shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {processing ? 'ĐANG KIỂM TRA...' : 'NHẬN XU NGAY'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-[#0095FF] group-hover:text-white transition-all">
                  <i className="fa-solid fa-link text-2xl"></i>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 capitalize text-lg tracking-tight leading-none mb-1">{task.platform}</h4>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hệ thống tự động</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-green-600 leading-none">+{task.reward.toLocaleString()}</p>
                <p className="text-[9px] text-green-400 font-black uppercase tracking-widest mt-1">Xu thưởng</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-8 leading-relaxed font-bold line-clamp-2">"{task.description}"</p>
            
            <button 
              onClick={() => handleStartTask(task)} 
              disabled={processing || !!activeTask} 
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black shadow-lg transition-all"
            >
              Bắt đầu ngay
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
