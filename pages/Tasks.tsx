import React, { useState, useEffect } from 'react';
import { UserProfile, ShortLinkTask } from '../types';
import { supabase } from '../supabase';

interface TasksProps {
  user: UserProfile;
}

const Tasks: React.FC<TasksProps> = ({ user }) => {
  const [tasks, setTasks] = useState<ShortLinkTask[]>([]);
  const [activeTask, setActiveTask] = useState<ShortLinkTask | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const msg = err.message || (err.toString && err.toString() !== '[object Object]' ? err.toString() : JSON.stringify(err));
      console.error('Error fetching tasks:', msg);
      setError('Lỗi tải nhiệm vụ: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = (task: ShortLinkTask) => {
    window.open(task.url, '_blank');
    setActiveTask(task);
    setSuccess(false);
    setError(null);
    setVerificationCode('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !activeTask) return;

    setSubmitting(true);
    setError(null);
    try {
      const { error: submitError } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          task_id: activeTask.id,
          verification_code: verificationCode.trim(),
          status: 'pending'
        });

      if (submitError) throw submitError;
      setSuccess(true);
      setActiveTask(null);
      setVerificationCode('');
    } catch (err: any) {
      const msg = err.message || (err.toString && err.toString() !== '[object Object]' ? err.toString() : JSON.stringify(err));
      console.error('Error submitting task:', msg);
      setError('Lỗi xác nhận: ' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && tasks.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20">
      <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#0095FF] mb-4"></i>
      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Đang tải nhiệm vụ...</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Nhiệm vụ vượt link</h2>
          <p className="text-slate-500 text-sm">Vượt link rút gọn để tích lũy Xu (1 Xu = 1 VND).</p>
        </div>
        <button onClick={fetchTasks} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center shadow-sm">
          <i className="fa-solid fa-rotate-right mr-2"></i> Làm mới danh sách
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start animate-in fade-in slide-in-from-top-2">
          <i className="fa-solid fa-circle-exclamation mt-1 mr-3"></i>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {activeTask && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-6 relative animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-indigo-800">Thực hiện: {activeTask.platform.toUpperCase()}</h3>
              <p className="text-indigo-600 text-sm font-medium">Vượt link xong hãy dán mã xác nhận vào ô bên dưới.</p>
            </div>
            <button onClick={() => setActiveTask(null)} className="text-indigo-400 hover:text-indigo-600 p-2">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Nhập mã xác nhận tại đây..." 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
              className="flex-1 px-5 py-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-400 outline-none font-bold text-slate-800" 
              required 
            />
            <button 
              type="submit" 
              disabled={submitting} 
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center min-w-[160px]"
            >
              {submitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Hoàn thành'}
            </button>
          </form>
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-5 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4">
          <div className="flex items-center">
            <i className="fa-solid fa-circle-check text-xl mr-3"></i>
            <span className="font-bold">Nhiệm vụ đã gửi! Chờ hệ thống kiểm tra và cộng xu.</span>
          </div>
          <button onClick={() => setSuccess(false)} className="hover:opacity-70">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all group border-b-4 border-b-transparent hover:border-b-[#0095FF]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 transition-colors">
                  <i className="fa-solid fa-link text-blue-600 text-2xl"></i>
                </div>
                <div>
                  <h4 className="font-black text-slate-800 capitalize text-lg leading-tight">{task.platform}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Nhiệm vụ #{task.id.slice(0,6)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-green-600">+{task.reward.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase">Xu</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium line-clamp-2">{task.description}</p>
            <button 
              onClick={() => handleStartTask(task)} 
              disabled={!!activeTask} 
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTask 
                  ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                  : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-100 active:scale-[0.98]'
              }`}
            >
              Nhận nhiệm vụ
            </button>
          </div>
        ))}
        {!loading && tasks.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <i className="fa-solid fa-box-open text-4xl text-slate-200 mb-4"></i>
            <p className="text-slate-400 font-bold">Tạm thời hết nhiệm vụ, vui lòng quay lại sau.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
