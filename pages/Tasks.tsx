

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
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await supabase.from('tasks').select('*').eq('status', 'active').order('xu', { ascending: false });
    setTasks(data || []);
    setLoading(false);
  };

  const handleStartTask = async (task: ShortLinkTask) => {
    setProcessingId(task.id);
    
    // BOT TỰ TẠO LINK RÚT GỌN (Dùng Proxy để xóa lỗi Failed to fetch) [cite: 2025-12-30]
    localStorage.setItem('waiting_xu', task.xu.toString());
    
    // Đích đến sau khi vượt link [cite: 2026-01-08]
    const destinationUrl = `${window.location.origin}/#/dashboard?status=success`;
    
    // Sử dụng Proxy miễn phí để không bị chặn bởi CORS [cite: 2025-12-30]
    const proxyUrl = "https://api.allorigins.win/get?url=";
    let targetApi = "";

    if (task.provider === 'link4m') {
      targetApi = `https://link4m.co/api-shorten/v2?api=${task.api_token}&url=${encodeURIComponent(destinationUrl)}`;
    } else if (task.provider === 'yeumoney') {
      targetApi = `https://yeumoney.com/QL_api.php?token=${task.api_token}&format=json&url=${encodeURIComponent(destinationUrl)}`;
    } else if (task.provider === 'linktot') {
      targetApi = `https://linktot.net/JSON_QL_API.php?token=${task.api_token}&url=${encodeURIComponent(destinationUrl)}`;
    } else {
      // Mặc định nếu không có cấu hình API riêng biệt
      targetApi = task.url; // Nếu task.url đã là link rút gọn sẵn
    }

    // Nếu targetApi rỗng hoặc không có api_token, dùng link gốc (fallback)
    if (!targetApi || !task.api_token) {
       window.location.href = task.url || destinationUrl;
       return;
    }

    try {
      // Fix: commented out citation marker to resolve syntax error
      const response = await fetch(proxyUrl + encodeURIComponent(targetApi)); // [cite: 2025-12-30]
      const data = await response.json();
      const result = JSON.parse(data.contents); // Giải mã dữ liệu từ Proxy

      const shortLink = result.shortenedUrl || result.url || (result.data ? result.data.url : null);
      
      if (shortLink) {
        // Fix: commented out citation marker to resolve syntax error
        window.location.href = shortLink; // [cite: 2025-12-30]
      } else {
        alert("❌ Lỗi: API Token không đúng hoặc hết hạn!");
        setProcessingId(null);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi kết nối! Hãy thử lại sau giây lát.");
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-12 h-12 border-4 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đang tải nhiệm vụ...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">NHIỆM VỤ AUTO</h2>
          <p className="text-slate-500 font-bold text-sm mt-3 uppercase tracking-tight opacity-70">Hoàn thành vượt link - Cộng tiền ngay lập tức.</p>
        </div>
        <button onClick={fetchTasks} className="bg-white px-8 py-3 rounded-xl border border-slate-200 font-black text-[10px] uppercase tracking-widest hover:border-blue-500 transition-all">Làm mới danh sách</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-[2.5rem] border border-slate-50 p-10 shadow-sm hover:shadow-2xl transition-all flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-5">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner">
                    <i className="fa-solid fa-link text-2xl"></i>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-xl tracking-tighter uppercase mb-1">{task.title}</h4>
                    <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase">{task.provider}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">+{task.xu}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase">XU THƯỞNG</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-bold mb-8 uppercase leading-relaxed italic opacity-60">
                {task.description || "Nhiệm vụ vượt link rút gọn. Tiền được cộng tự động vào tài khoản sau khi hoàn tất qua Bot."}
              </p>
            </div>
            
            <button 
              onClick={() => handleStartTask(task)} 
              disabled={!!processingId} 
              className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-[12px] uppercase tracking-[0.2em] hover:bg-black shadow-lg transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
            >
              {processingId === task.id ? <><i className="fa-solid fa-spinner fa-spin mr-3"></i>Đang xử lý...</> : 'Bắt đầu nhiệm vụ'}
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Hiện tại không có nhiệm vụ nào.</p>
          </div>
        )}
      </div>
      
      <div className="p-10 bg-blue-50 rounded-[3rem] text-center border border-blue-100">
         <h3 className="text-xl font-black text-blue-800 uppercase tracking-tight mb-3">Thông báo từ Admin</h3>
         <p className="text-xs font-bold text-blue-600 uppercase tracking-widest leading-loose">
           Hệ thống sử dụng Bot tự động cộng tiền qua Proxy. Nếu gặp lỗi, vui lòng liên hệ hỗ trợ Admin 0337117930.
         </p>
      </div>
    </div>
  );
};

export default Tasks;