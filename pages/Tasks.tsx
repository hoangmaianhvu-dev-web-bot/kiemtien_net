
import React, { useState, useEffect } from 'react';
import { UserProfile, ShortLinkTask } from '../types';
import { supabase } from '../supabase';

interface TasksProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

const Tasks: React.FC<TasksProps> = ({ user, setUser }) => {
  const [tasks, setTasks] = useState<ShortLinkTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await supabase.from('tasks').select('*').eq('status', 'active').order('created_at', { ascending: true });
    setTasks(data || []);
    setLoading(false);
  };

  const handleStartTask = (task: ShortLinkTask) => {
    if (task.completed_count >= task.max_slots) return;
    localStorage.setItem('waiting_xu', task.xu.toString());
    window.location.href = task.url;
  };

  const renderTaskItem = (task: ShortLinkTask) => {
    const isOut = task.completed_count >= task.max_slots;
    
    if (task.type === 'separator') {
      return (
        <div key={task.id} className="py-4 flex items-center space-x-4">
          <div className="flex-1 h-[1px] bg-slate-300"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{task.title}</span>
          <div className="flex-1 h-[1px] bg-slate-300"></div>
        </div>
      );
    }

    return (
      <div key={task.id} className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between transition-all ${isOut ? 'grayscale opacity-50 bg-slate-50 cursor-not-allowed' : 'hover:border-blue-400'}`}>
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 ${isOut ? 'bg-slate-200 text-slate-400' : 'bg-blue-50 text-blue-600'} rounded-lg flex items-center justify-center`}>
            <i className={`fa-solid ${task.type === 'special' ? 'fa-star' : 'fa-link'} text-xl`}></i>
          </div>
          <div>
            <h4 className="font-bold text-slate-800">{task.title}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              Lượt làm: {task.completed_count}/{task.max_slots} • {task.type === 'special' ? 'Nhiệm vụ đặc biệt' : 'Thưởng 200 Xu'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className={`font-bold ${isOut ? 'text-slate-400' : 'text-blue-600'}`}>+{task.xu} Xu</p>
          </div>
          <button 
            onClick={() => handleStartTask(task)}
            disabled={isOut}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${isOut ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {isOut ? 'Hết lượt' : 'Làm ngay'}
          </button>
        </div>
      </div>
    );
  };

  const normalTasks = tasks.filter(t => t.type === 'normal' || t.type === 'separator');
  const specialTasks = tasks.filter(t => t.type === 'special');

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* DÒNG 1: NHIỆM VỤ THƯỜNG */}
      <section className="space-y-4">
        <div className="border-l-4 border-blue-600 pl-4 mb-6">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Dòng 1: Nhiệm vụ thường (200 Xu)</h2>
          <p className="text-xs text-slate-500 font-medium">Làm các nhiệm vụ vượt link uy tín 100% nhận thưởng.</p>
        </div>
        <div className="space-y-3">
          {normalTasks.map(renderTaskItem)}
          {normalTasks.length === 0 && <p className="text-center py-10 text-slate-400 text-sm">Chưa có nhiệm vụ thường.</p>}
        </div>
      </section>

      {/* DÒNG 2: NHIỆM VỤ ĐẶC BIỆT */}
      <section className="space-y-4">
        <div className="border-l-4 border-indigo-600 pl-4 mb-6">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Dòng 2: Nhiệm vụ Đặc biệt</h2>
          <p className="text-xs text-slate-500 font-medium">Tải App, Review Google Map, Đánh giá App để nhận thưởng cao.</p>
        </div>
        <div className="space-y-3">
          {specialTasks.map(renderTaskItem)}
          {specialTasks.length === 0 && <p className="text-center py-10 text-slate-400 text-sm">Chưa có nhiệm vụ đặc biệt.</p>}
        </div>
      </section>
    </div>
  );
};

export default Tasks;
