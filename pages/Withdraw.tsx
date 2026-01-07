
import React, { useState } from 'react';
import { UserProfile } from '../types';
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
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseInt(amount);

    if (isNaN(withdrawAmount) || withdrawAmount < 20000) {
      setMessage({ type: 'error', text: 'Số tiền rút tối thiểu là 20,000 Xu.' });
      return;
    }

    if (withdrawAmount > user.xu_balance) {
      setMessage({ type: 'error', text: 'Số dư không đủ.' });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount: withdrawAmount,
          method,
          details,
          status: 'pending'
        });

      if (error) throw error;
      
      // Update balance locally for instant feedback
      const newBalance = user.xu_balance - withdrawAmount;
      setUser({ ...user, xu_balance: newBalance });
      
      setMessage({ type: 'success', text: 'Yêu cầu rút tiền thành công. Vui lòng chờ 24h.' });
      setAmount('');
      setDetails('');
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Lỗi khi gửi yêu cầu. Vui lòng thử lại.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
            <p className="text-slate-500 mb-2 font-bold uppercase tracking-widest text-[10px]">Số dư khả dụng</p>
            <h3 className="text-3xl font-black text-indigo-600 mb-1">{user.xu_balance.toLocaleString()}</h3>
            <p className="text-sm font-bold text-slate-400">Xu (≈ {user.xu_balance * XU_TO_VND}đ)</p>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Rút tiền</h2>
            {message && <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message.text}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {WITHDRAW_METHODS.map((m) => (
                  <button key={m.id} type="button" onClick={() => setMethod(m.id)} className={`flex items-center justify-center p-4 rounded-2xl border-2 transition-all ${method === m.id ? 'border-[#0095FF] bg-blue-50 text-[#0095FF]' : 'border-slate-50 text-slate-500'}`}>
                    <i className={`fa-solid ${m.icon} mr-3 text-xl`}></i>
                    <span className="font-bold">{m.name}</span>
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Số tiền (Xu)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-xl" placeholder="Ví dụ: 50000" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Thông tin nhận tiền</label>
                <textarea rows={3} value={details} onChange={(e) => setDetails(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none" placeholder="Tên NH - STK - Tên CTK" required></textarea>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-[#0095FF] text-white py-5 rounded-2xl font-bold text-xl shadow-lg active:scale-[0.98] disabled:opacity-50">
                {submitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Xác nhận rút tiền'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
