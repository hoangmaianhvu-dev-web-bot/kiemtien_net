
import React, { useState, useEffect } from 'react';
import { UserProfile, WithdrawalRequest } from '../types';
import { WITHDRAW_METHODS, XU_TO_VND } from '../constants';
import { supabase } from '../supabase';

interface WithdrawProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

const Withdraw: React.FC<WithdrawProps> = ({ user, setUser }) => {
  const [method, setMethod] = useState('BANK');
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [user.id]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) setHistory(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseInt(amount);

    if (isNaN(withdrawAmount) || withdrawAmount < 20000) {
      setMessage({ type: 'error', text: 'Số tiền rút tối thiểu là 20,000 Xu.' });
      return;
    }

    // Fix: Changed xu_balance to xu to match UserProfile type definition
    if (withdrawAmount > user.xu) {
      setMessage({ type: 'error', text: 'Số dư không đủ để thực hiện giao dịch.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const { error: withdrawError } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount: withdrawAmount,
          method,
          details,
          status: 'pending'
        });

      if (withdrawError) throw withdrawError;
      
      // Fix: Changed xu_balance to xu to match UserProfile type definition
      const newBalance = user.xu - withdrawAmount;
      setUser({ ...user, xu: newBalance });
      
      setMessage({ type: 'success', text: 'Yêu cầu rút tiền thành công! Vui lòng chờ hệ thống xử lý trong vòng 24h.' });
      setAmount('');
      setDetails('');
      fetchHistory();
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setMessage({ type: 'error', text: 'Lỗi khi gửi yêu cầu: ' + (err.message || 'Vui lòng thử lại sau.') });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-black uppercase">Chờ duyệt</span>;
      case 'approved': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">Đã duyệt</span>;
      case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase">Từ chối</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
            <p className="text-slate-400 mb-2 font-black uppercase tracking-widest text-[10px]">Số dư khả dụng</p>
            {/* Fix: Changed xu_balance to xu to match UserProfile type definition */}
            <h3 className="text-4xl font-black text-[#0095FF] mb-1">{user.xu.toLocaleString()}</h3>
            {/* Fix: Changed xu_balance to xu to match UserProfile type definition */}
            <p className="text-sm font-bold text-slate-400 tracking-tight">Xu (≈ {(user.xu * XU_TO_VND).toLocaleString()}đ)</p>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-[2rem] text-white">
            <h4 className="font-bold mb-3 flex items-center">
              <i className="fa-solid fa-circle-info mr-2 text-blue-400"></i>
              Lưu ý rút tiền
            </h4>
            <ul className="text-xs space-y-2 opacity-80 font-medium">
              <li>• Rút tối thiểu: 20,000 Xu</li>
              <li>• Thời gian duyệt: 1h - 24h</li>
              <li>• Kiểm tra kỹ thông tin STK</li>
              <li>• Thẻ Garena gửi vào Email/SĐT</li>
            </ul>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-8">Tạo yêu cầu rút tiền</h2>
            
            {message && (
              <div className={`p-5 rounded-2xl mb-8 font-bold text-sm flex items-start animate-in fade-in duration-300 ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                <i className={`fa-solid ${message.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} mt-0.5 mr-3 text-lg`}></i>
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Phương thức thanh toán</label>
                <div className="grid grid-cols-2 gap-4">
                  {WITHDRAW_METHODS.map((m) => (
                    <button 
                      key={m.id} 
                      type="button" 
                      onClick={() => setMethod(m.id)} 
                      className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 ${
                        method === m.id 
                          ? 'border-[#0095FF] bg-blue-50 text-[#0095FF] shadow-inner' 
                          : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <i className={`fa-solid ${m.icon} mb-3 text-2xl`}></i>
                      <span className="font-black text-xs uppercase tracking-widest">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Số tiền muốn rút (Xu)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white focus:border-[#0095FF] outline-none transition-all font-black text-2xl text-slate-900" 
                    placeholder="Tối thiểu 20,000" 
                    required 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold uppercase text-[10px] tracking-widest">XU</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Thông tin nhận tiền chi tiết</label>
                <textarea 
                  rows={3} 
                  value={details} 
                  onChange={(e) => setDetails(e.target.value)} 
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white focus:border-[#0095FF] outline-none transition-all font-bold text-slate-900" 
                  placeholder={method === 'BANK' ? "Ngân hàng - Số tài khoản - Chủ tài khoản" : "Số điện thoại hoặc Email nhận mã thẻ"} 
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full bg-[#0095FF] text-white py-6 rounded-[1.5rem] font-black text-xl shadow-xl shadow-blue-100 hover:bg-[#0077CC] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest"
              >
                {submitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Xác nhận rút tiền'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Lịch sử rút tiền */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-xl font-black text-slate-900">Lịch sử giao dịch</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Mã đơn</th>
                <th className="px-8 py-4">Thời gian</th>
                <th className="px-8 py-4">Phương thức</th>
                <th className="px-8 py-4 text-right">Số tiền</th>
                <th className="px-8 py-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 font-mono text-xs text-indigo-600 font-bold">#{h.id.slice(0, 8)}</td>
                  <td className="px-8 py-5 text-sm text-slate-500 font-medium">{new Date(h.created_at).toLocaleString('vi-VN')}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center text-xs font-bold text-slate-700">
                      <i className={`fa-solid ${h.method === 'BANK' ? 'fa-university text-blue-500' : 'fa-gamepad text-orange-500'} mr-2`}></i>
                      {h.method === 'BANK' ? 'Ngân hàng' : 'Garena'}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-slate-900">{h.amount.toLocaleString()} Xu</td>
                  <td className="px-8 py-5 text-center">{getStatusBadge(h.status)}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">Bạn chưa có giao dịch nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
