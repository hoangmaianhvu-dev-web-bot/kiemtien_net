
import React, { useState, useEffect } from 'react';
import { UserProfile, DepositRequest } from '../types';
import { supabase } from '../supabase';

interface DepositProps {
  user: UserProfile;
}

const Deposit: React.FC<DepositProps> = ({ user }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{type: 's'|'e', text: string} | null>(null);
  const [history, setHistory] = useState<DepositRequest[]>([]);

  useEffect(() => {
    fetchHistory();
  }, [user.id]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amount);
    if (!amount || val < 10000) {
      setMsg({ type: 'e', text: 'Nạp tối thiểu 10,000 Xu' });
      return;
    }
    
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.from('deposits').insert([{
      user_id: user.id,
      amount: val,
      status: 'pending'
    }]);
    
    setLoading(false);
    if (error) setMsg({ type: 'e', text: error.message });
    else {
      setMsg({ type: 's', text: 'Yêu cầu nạp đã gửi thành công. Vui lòng chuyển khoản đúng nội dung.' });
      setAmount('');
      fetchHistory();
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-black uppercase">Chờ duyệt</span>;
      case 'approved': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">Hoàn thành</span>;
      case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase">Đã hủy</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Nạp */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="border-l-4 border-blue-600 pl-4">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Nạp Xu qua Ngân hàng</h2>
            <p className="text-sm text-slate-500">Nạp nhanh 24/7, tỷ lệ 1:1 (1000đ = 1000 Xu)</p>
          </div>
          
          {msg && (
            <div className={`p-4 rounded-xl font-bold text-xs ${msg.type === 's' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {msg.text}
            </div>
          )}

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-black text-blue-800 mb-4 uppercase tracking-widest text-xs">Thông tin chuyển khoản</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Ngân hàng</span>
                  <span className="font-black text-slate-800">VIETCOMBANK (VCB)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Số tài khoản</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-blue-600">9337117930</span>
                    <button onClick={() => { navigator.clipboard.writeText('9337117930'); alert('Đã copy STK'); }} className="text-slate-300 hover:text-blue-600"><i className="fa-solid fa-copy"></i></button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Chủ tài khoản</span>
                  <span className="font-black text-slate-800">HOANG MAI ANH VU</span>
                </div>
                <div className="p-4 bg-blue-100 rounded-xl border border-blue-200">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 text-center">Nội dung chuyển khoản (BẮT BUỘC)</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg font-black text-blue-800 uppercase">NAP {user.username}</span>
                    <button onClick={() => { navigator.clipboard.writeText(`NAP ${user.username}`); alert('Đã copy nội dung'); }} className="text-blue-400 hover:text-blue-800"><i className="fa-solid fa-copy"></i></button>
                  </div>
                </div>
              </div>
            </div>
            <i className="fa-solid fa-building-columns absolute -bottom-6 -right-6 text-8xl text-slate-200/50"></i>
          </div>

          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Số tiền muốn nạp (VNĐ)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-slate-50 outline-none focus:bg-white focus:border-blue-600 font-black text-xl" 
                placeholder="Ví dụ: 50000" 
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-slate-900 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              {loading ? <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> : 'Xác nhận đã chuyển khoản'}
            </button>
          </form>
        </div>

        {/* Lịch sử Nạp */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Lịch sử nạp tiền</h3>
            <button onClick={fetchHistory} className="text-blue-600 text-xs font-bold uppercase hover:underline">Làm mới</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4 text-center">Số Xu</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(d.created_at).toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4 text-center font-black text-blue-600">+{d.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(d.status)}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-300 font-bold italic text-sm">Chưa có giao dịch nạp nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
