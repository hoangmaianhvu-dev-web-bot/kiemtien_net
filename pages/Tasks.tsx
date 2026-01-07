
import React, { useState } from 'react';
import { UserProfile, ShortLinkTask } from '../types';
import { SHORTLINK_PLATFORMS } from '../constants';

interface TasksProps {
  user: UserProfile;
}

const MOCK_TASKS: ShortLinkTask[] = SHORTLINK_PLATFORMS.map((platform, index) => ({
  id: `task-${index}`,
  platform: platform,
  reward: 350 + (index * 50),
  url: `https://example.com/short/${platform}`,
  description: `Vượt link rút gọn ${platform} để nhận Xu.`,
  status: 'active'
}));

const Tasks: React.FC<TasksProps> = ({ user }) => {
  const [activeTask, setActiveTask] = useState<ShortLinkTask | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleStartTask = (task: ShortLinkTask) => {
    window.open(task.url, '_blank');
    setActiveTask(task);
    setSuccess(false);
    setVerificationCode('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) return;

    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setActiveTask(null);
      // In real app, update balance via Supabase
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Danh sách nhiệm vụ</h2>
          <p className="text-slate-500">Hoàn thành các nhiệm vụ vượt link để nhận Xu tương ứng.</p>
        </div>
        <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-slate-200">
          <i className="fa-solid fa-bolt text-yellow-500 mr-2"></i>
          <span className="text-sm font-bold text-slate-700">Tự động làm mới trong 02:45</span>
        </div>
      </div>

      {activeTask && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-6 animate-pulse-slow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-indigo-800">Đang thực hiện: {activeTask.platform.toUpperCase()}</h3>
              <p className="text-indigo-600">Bạn đã mở link. Vui lòng lấy mã xác nhận ở trang đích và dán vào bên dưới.</p>
            </div>
            <button 
              onClick={() => setActiveTask(null)}
              className="text-indigo-400 hover:text-indigo-600 p-2"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Nhập mã xác nhận tại đây..." 
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:outline-none transition-all font-mono"
              required
            />
            <button 
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
            >
              {submitting ? (
                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
              ) : (
                <i className="fa-solid fa-check mr-2"></i>
              )}
              Xác nhận & Nhận Xu
            </button>
          </form>
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-xl flex items-center justify-between border border-green-200">
          <div className="flex items-center">
            <i className="fa-solid fa-circle-check text-xl mr-3"></i>
            <span className="font-medium">Nhiệm vụ đã gửi thành công! Đang chờ hệ thống phê duyệt (Khoảng 5-10p).</span>
          </div>
          <button onClick={() => setSuccess(false)}><i className="fa-solid fa-xmark"></i></button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_TASKS.map((task) => (
          <div key={task.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                  <i className="fa-solid fa-link text-indigo-600 text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 capitalize">{task.platform}</h4>
                  <div className="flex items-center text-xs text-slate-400">
                    <i className="fa-solid fa-clock mr-1"></i>
                    ~ 2 phút làm
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-green-600">+{task.reward} Xu</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Thưởng</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Yêu cầu: Click quảng cáo, đợi 60s, lấy mã và xác nhận. 100% uy tín.
            </p>

            <button 
              onClick={() => handleStartTask(task)}
              disabled={!!activeTask}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center
                ${activeTask ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-[0.98]'}
              `}
            >
              Làm nhiệm vụ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
