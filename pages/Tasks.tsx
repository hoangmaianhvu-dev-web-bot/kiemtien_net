
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

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = (task: ShortLinkTask) => {
    window.open(task.url, '_blank');
    setActiveTask(task);
    setSuccess(false);
    setVerificationCode('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !activeTask) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          task_id: activeTask.id,
          verification_code: verificationCode,
          status: 'pending'
        });

      if (error) throw error;
      setSuccess(true);
      setActiveTask(null);
      setVerificationCode('');
    } catch (err) {
      console.error('Error submitting task:', err);
      alert('Có lỗi xảy ra khi gửi mã xác nhận.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-12"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-[#0095FF]"></i></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Danh sách nhiệm vụ</h2>
          <p className="text-slate-500">Vượt link để nhận Xu. 1 Xu = 1 VND.</p>
        </div>
      </div>

      {activeTask && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-6 animate-pulse-slow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-indigo-800">Đang thực hiện: {activeTask.platform.toUpperCase()}</h3>
              <p className="text-indigo-600">Dán mã xác nhận từ trang đích vào đây.</p>
            </div>
            <button onClick={() => setActiveTask(null)} className="text-indigo-400 hover:text-indigo-600 p-2"><i className="fa-solid fa-xmark text-xl"></i></button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input type="text" placeholder="Mã xác nhận..." value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border-2 border-indigo-100 outline-none" required />
            <button type="submit" disabled={submitting} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50">
              {submitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Xác nhận & Nhận Xu'}
            </button>
          </form>
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-xl flex items-center justify-between">
          <span>Nhiệm vụ đã được gửi! Đang chờ duyệt.</span>
          <button onClick={() => setSuccess(false)}><i className="fa-solid fa-xmark"></i></button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                  <i className="fa-solid fa-link text-indigo-600 text-xl"></i>
                </div>
                <h4 className="font-bold text-slate-800 capitalize">{task.platform}</h4>
              </div>
              <p className="text-lg font-black text-green-600">+{task.reward} Xu</p>
            </div>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">{task.description}</p>
            <button onClick={() => handleStartTask(task)} disabled={!!activeTask} className={`w-full py-3 rounded-xl font-bold ${activeTask ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'}`}>Làm nhiệm vụ</button>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-slate-400 py-12 text-center col-span-2">Hiện tại không có nhiệm vụ nào.</p>}
      </div>
    </div>
  );
};

export default Tasks;
