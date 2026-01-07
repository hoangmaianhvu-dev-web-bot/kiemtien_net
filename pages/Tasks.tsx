
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
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cấu hình API Key cho các nền tảng (Bạn hãy thay API Key thật của bạn vào đây)
  const API_KEYS: Record<string, string> = {
    'link4m': 'YOUR_LINK4M_API_KEY',
    'yeumoney': 'YOUR_YEUMONEY_API_KEY',
    'laymanet': 'YOUR_LAYMANET_API_KEY',
    'linktot': 'YOUR_LINKTOT_API_KEY',
    'traffictot': 'YOUR_TRAFFICTOT_API_KEY',
    'yeulink': 'YOUR_YEULINK_API_KEY',
    '4mmo': 'YOUR_4MMO_API_KEY',
    'link ngon': 'YOUR_LINKNGON_API_KEY',
    'xlink': 'YOUR_XLINK_API_KEY',
    'kiemtienngay': 'YOUR_KIEMTIENNGAY_API_KEY'
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
      setError('Lỗi tải danh sách nhiệm vụ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý rút gọn link qua API của các platform
  const getShortenedUrl = async (platform: string, destinationUrl: string) => {
    const apiKey = API_KEYS[platform.toLowerCase()];
    if (!apiKey || apiKey.startsWith('YOUR_')) {
      console.warn(`Chưa cấu hình API Key cho ${platform}, đang sử dụng link trực tiếp.`);
      return destinationUrl;
    }

    try {
      // Mỗi platform có cấu trúc API khác nhau, đây là ví dụ phổ biến:
      // const response = await fetch(`https://${platform}.com/api?api=${apiKey}&url=${encodeURIComponent(destinationUrl)}`);
      // const data = await response.json();
      // return data.shortenedUrl || destinationUrl;
      return destinationUrl; // Tạm thời trả về link gốc nếu chưa có logic fetch thực tế
    } catch (e) {
      return destinationUrl;
    }
  };

  const handleStartTask = async (task: ShortLinkTask) => {
    setProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Tạo rid (UUID) trong bảng task_requests
      const { data: reqData, error: reqError } = await supabase
        .from('task_requests')
        .insert({
          user_id: user.id,
          task_id: task.id,
          status: 'pending'
        })
        .select('id')
        .single();

      if (reqError) throw reqError;

      const rid = reqData.id;
      
      // 2. Link đích chính là Blog xác thực kèm rid
      const destinationBlogUrl = `https://avudev-verifi.blogspot.com/?rid=${rid}`;
      
      // 3. Rút gọn link này thông qua API của Platform tương ứng
      const finalUrl = await getShortenedUrl(task.platform, destinationBlogUrl);
      
      // 4. Mở link rút gọn trong tab mới
      window.open(finalUrl, '_blank');
      
      // 5. Cập nhật giao diện chờ nhập mã
      setActiveTask(task);
      setVerificationCode('');
      
    } catch (err: any) {
      setError('Lỗi khởi tạo nhiệm vụ: ' + err.message);
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
      setError('Lỗi gửi mã: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-[#0095FF] rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Đang kết nối dữ liệu...</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">NHIỆM VỤ KIẾM XU</h2>
          <p className="text-slate-500 font-bold text-sm">Vượt link rút gọn để nhận phần thưởng tức thì.</p>
        </div>
        <button onClick={fetchTasks} className="bg-white px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
          <i className="fa-solid fa-sync mr-2"></i> Làm mới
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-100 text-red-600 p-5 rounded-[2rem] flex items-center animate-in fade-in duration-300">
          <i className="fa-solid fa-triangle-exclamation mr-4 text-xl"></i>
          <span className="text-xs font-black uppercase tracking-tight">{error}</span>
        </div>
      )}

      {activeTask && (
        <div className="bg-white border-2 border-[#0095FF] rounded-[2.5rem] p-8 shadow-2xl shadow-blue-100 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
               <div className="w-14 h-14 bg-[#0095FF] text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-200">
                  <i className="fa-solid fa-bolt-lightning"></i>
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic">Đang chờ mã xác nhận</h3>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Platform: {activeTask.platform}</p>
               </div>
            </div>
            <button onClick={() => setActiveTask(null)} className="text-slate-300 hover:text-red-500 transition-colors"><i className="fa-solid fa-circle-xmark text-2xl"></i></button>
          </div>
          
          <form onSubmit={handleSubmitCode} className="space-y-4">
            <div className="relative">
               <i className="fa-solid fa-shield-keyhole absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
               <input 
                type="text" 
                placeholder="NHẬP MÃ XÁC NHẬN TỪ BLOG..." 
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value)} 
                className="w-full pl-16 pr-8 py-6 rounded-3xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-[#0095FF] outline-none transition-all font-black text-slate-900 placeholder:text-slate-300 tracking-widest" 
                required 
               />
            </div>
            <button 
              type="submit" 
              disabled={processing} 
              className="w-full bg-[#0095FF] text-white py-6 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-[#0077CC] shadow-xl shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {processing ? <i className="fa-solid fa-spinner fa-spin"></i> : 'XÁC NHẬN HOÀN THÀNH'}
            </button>
          </form>
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center">
            <i className="fa-solid fa-lightbulb text-blue-500 mr-3"></i>
            <p className="text-[10px] font-bold text-blue-700 uppercase leading-relaxed">Mẹo: Mã xác nhận nằm ở cuối trang Blog sau khi bạn vượt link thành công.</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-500 text-white p-6 rounded-[2rem] flex items-center justify-between shadow-xl shadow-green-100 animate-in slide-in-from-top-4">
          <div className="flex items-center">
            <i className="fa-solid fa-check-double text-2xl mr-4"></i>
            <p className="font-black uppercase tracking-widest text-xs">Gửi mã thành công! Đang chờ Admin duyệt...</p>
          </div>
          <button onClick={() => setSuccess(false)} className="bg-white/20 px-4 py-2 rounded-full text-[10px] font-black uppercase">Đóng</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-[#0095FF] group-hover:text-white transition-all duration-300">
                    <i className="fa-solid fa-link text-2xl"></i>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 capitalize text-lg tracking-tight leading-none mb-1">{task.platform}</h4>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">An toàn & Uy tín</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-green-600 leading-none">+{task.reward.toLocaleString()}</p>
                  <p className="text-[9px] text-green-400 font-black uppercase tracking-widest mt-1">Xu thưởng</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-8 leading-relaxed font-bold italic line-clamp-2">"{task.description}"</p>
            </div>
            
            <button 
              onClick={() => handleStartTask(task)} 
              disabled={processing || !!activeTask} 
              className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 relative z-10 ${
                activeTask 
                  ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100' 
                  : 'bg-slate-900 text-white hover:bg-black shadow-lg active:scale-[0.98]'
              }`}
            >
              {processing && activeTask?.id === task.id ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <>
                  <span>Bắt đầu nhiệm vụ</span>
                  <i className="fa-solid fa-arrow-right-long text-[10px]"></i>
                </>
              )}
            </button>
            <i className="fa-solid fa-coins absolute -bottom-6 -right-6 text-8xl text-slate-50 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-10 group-hover:translate-y-0"></i>
          </div>
        ))}
        
        {!loading && tasks.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <i className="fa-solid fa-box-open text-5xl text-slate-100 mb-6"></i>
            <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-xs">Hết nhiệm vụ, quay lại sau nhé!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
