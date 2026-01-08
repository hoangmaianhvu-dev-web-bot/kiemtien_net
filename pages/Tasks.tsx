
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
        .eq('status', 'active')
        .order('xu', { ascending: false });
      
      if (supabaseError) throw supabaseError;
      setTasks(data || []);
    } catch (err: any) {
      setError('Lỗi tải danh sách: ' + (err.message || 'Không thể kết nối Server.'));
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (task: ShortLinkTask) => {
    setProcessing(true);
    setError(null);

    try {
      // BƯỚC 1: Tạo rid chuẩn UUID từ Database
      const { data: request, error: reqError } = await supabase
        .from('task_requests')
        .insert([{ 
          user_id: user.id, 
          task_id: task.id, 
          status: 'pending' 
        }])
        .select('id')
        .single();

      if (reqError) throw reqError;
      const rid = request.id;
      const blogUrl = `https://avudev-verifi.blogspot.com/?rid=${rid}`;

      // BƯỚC 2: Kiểm tra nếu là nhiệm vụ thủ công
      if (task.type === 'manual' || task.manual_link) {
        const separator = (task.manual_link || '').includes('?') ? '&' : '?';
        const finalManualLink = `${task.manual_link}${separator}rid=${rid}`;
        setActiveTask(task);
        window.location.href = finalManualLink;
        return;
      }

      // BƯỚC 3: Xử lý 7 loại API rút gọn link
      let apiUrl = "";
      let fetchOptions: any = { method: 'GET' };
      const apiToken = task.api_token || "";

      switch(task.provider) {
        case 'link4m':
          apiUrl = `https://link4m.co/api-shorten/v2?api=${apiToken}&url=${encodeURIComponent(blogUrl)}`;
          break;
        case 'yeumoney':
          apiUrl = `https://yeumoney.com/QL_api.php?token=${apiToken}&format=json&url=${encodeURIComponent(blogUrl)}`;
          break;
        case 'linktot':
          apiUrl = `https://linktot.net/JSON_QL_API.php?token=${apiToken}&url=${encodeURIComponent(blogUrl)}`;
          break;
        case 'xlink':
          apiUrl = `https://xlink.co/api?token=${apiToken}&url=${encodeURIComponent(blogUrl)}`;
          break;
        case 'traffictot':
          apiUrl = `https://services.traffictot.com/api/v1/shorten?api_key=${apiToken}`;
          fetchOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: blogUrl })
          };
          break;
        case '4mmo':
          apiUrl = `https://4mmo.net/api?api=${apiToken}&url=${encodeURIComponent(blogUrl)}`;
          break;
        case 'linkngon':
          apiUrl = `https://linkngon.me/api?api=${apiToken}&url=${encodeURIComponent(blogUrl)}`;
          break;
        default:
          apiUrl = "";
      }

      let finalLink = "";
      if (apiUrl) {
        const response = await fetch(apiUrl, fetchOptions);
        const result = await response.json();
        finalLink = result.shortenedUrl || result.url || (result.data ? result.data.url : null) || result.shortened_url;
      }

      // Fallback
      if (!finalLink) {
        finalLink = (task.url && task.url.includes("{rid}")) 
          ? task.url.replace("{rid}", rid) 
          : blogUrl;
      }

      // BƯỚC 4: Tự động chuyển hướng
      setActiveTask(task);
      setVerificationCode('');
      window.location.href = finalLink;

    } catch (err: any) {
      setError('Lỗi: ' + (err.message || 'Không thể khởi tạo nhiệm vụ.'));
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
      const { error: subError } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          task_id: activeTask.id,
          verification_code: verificationCode.trim(),
          status: 'approved'
        });

      if (subError) throw subError;

      const taskXu = Number(activeTask.xu) || 0;
      const { data: profile } = await supabase.from('profiles').select('xu_balance, referrer_id').eq('id', user.id).single();
      
      const newBalance = (profile?.xu_balance || 0) + taskXu;
      await supabase.from('profiles').update({ xu_balance: newBalance }).eq('id', user.id);

      if (profile?.referrer_id) {
        const commission = Math.floor(taskXu * REFERRAL_COMMISSION);
        const { data: refProfile } = await supabase.from('profiles').select('xu_balance, referral_earned').eq('id', profile.referrer_id).single();
        if (refProfile) {
          await supabase.from('profiles').update({
            xu_balance: (refProfile.xu_balance || 0) + commission,
            referral_earned: (refProfile.referral_earned || 0) + commission
          }).eq('id', profile.referrer_id);
        }
      }

      setUser({ ...user, xu_balance: newBalance });
      setSuccess(true);
      setActiveTask(null);
      setVerificationCode('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError('Mã xác nhận không chính xác.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-[#0095FF] rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Đang tải nhiệm vụ...</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">DANH SÁCH NHIỆM VỤ</h2>
          <p className="text-slate-500 font-bold text-sm">Vượt link rút gọn để nhận Xu tự động.</p>
        </div>
        <button onClick={fetchTasks} className="bg-white px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
          Làm mới list
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-5 rounded-[1.5rem] font-bold text-xs border border-red-100 flex items-center">
          <i className="fa-solid fa-triangle-exclamation mr-3 text-xl"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500 text-white p-6 rounded-[2rem] flex items-center shadow-2xl animate-in zoom-in-95">
          <i className="fa-solid fa-check-double text-2xl mr-4"></i>
          <p className="font-black uppercase tracking-widest text-xs">Thành công! +{activeTask?.xu.toLocaleString()} Xu đã được cộng.</p>
        </div>
      )}

      {activeTask && (
        <div className="bg-white border-4 border-[#0095FF] rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="mb-10 text-center md:text-left">
             <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">NHẬP MÃ XÁC NHẬN</h3>
             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Đang làm: <span className="text-[#0095FF]">{activeTask.title}</span></p>
          </div>
          
          <form onSubmit={handleSubmitCode} className="space-y-6">
            <input 
              type="text" 
              placeholder="DÁN MÃ TẠI ĐÂY..." 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
              className="w-full px-10 py-7 rounded-[2rem] border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-[#0095FF] outline-none transition-all font-black text-slate-900 text-2xl tracking-[0.2em] uppercase" 
              required 
            />
            <div className="flex flex-col md:flex-row gap-4">
              <button 
                type="submit" 
                disabled={processing} 
                className="flex-[2] bg-[#0095FF] text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-[#0077CC] shadow-xl transition-all"
              >
                {processing ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN NHẬN TIỀN'}
              </button>
              <button 
                type="button"
                onClick={() => setActiveTask(null)}
                className="flex-1 bg-slate-100 text-slate-400 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 group-hover:bg-[#0095FF] group-hover:text-white transition-all shadow-sm">
                  <i className={`fa-solid ${task.type === 'manual' ? 'fa-location-dot' : 'fa-link'} text-2xl`}></i>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xl tracking-tighter mb-1 uppercase line-clamp-1">{task.title}</h4>
                  <span className="text-[9px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{task.platform}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900">+{Number(task.xu).toLocaleString()}</p>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">XU</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 font-bold mb-8 line-clamp-2 h-10">
              {task.description}
            </p>

            <button 
              onClick={() => handleStartTask(task)} 
              disabled={processing || !!activeTask} 
              className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-100"
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
