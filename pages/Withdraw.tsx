
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { WITHDRAW_METHODS, XU_TO_VND } from '../constants';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseInt(amount);

    if (isNaN(withdrawAmount) || withdrawAmount < 20000) {
      setMessage({ type: 'error', text: 'Số tiền rút tối thiểu là 20,000 Xu.' });
      return;
    }

    if (withdrawAmount > user.xu_balance) {
      setMessage({ type: 'error', text: 'Số dư không đủ để thực hiện giao dịch.' });
      return;
    }

    setSubmitting(true);
    // Simulate withdrawal processing
    setTimeout(() => {
      setSubmitting(false);
      setUser({ ...user, xu_balance: user.xu_balance - withdrawAmount });
      setMessage({ type: 'success', text: 'Yêu cầu rút tiền đã được gửi. Chúng tôi sẽ xử lý trong vòng 24h.' });
      setAmount('');
      setDetails('');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
            <p className="text-slate-500 mb-2">Số dư khả dụng</p>
            <h3 className="text-3xl font-black text-indigo-600 mb-1">{user.xu_balance.toLocaleString()}</h3>
            <p className="text-sm font-bold text-slate-400">Xu (≈ {user.xu_balance * XU_TO_VND}đ)</p>
          </div>

          <div className="bg-indigo-600 p-6 rounded-3xl text-white">
            <h4 className="font-bold mb-3 flex items-center">
              <i className="fa-solid fa-circle-info mr-2"></i>
              Lưu ý rút tiền
            </h4>
            <ul className="text-sm space-y-2 opacity-90 list-disc ml-4">
              <li>Rút tối thiểu: 20,000 Xu.</li>
              <li>Thời gian xử lý: 08:00 - 22:00 hàng ngày.</li>
              <li>Kiểm tra kỹ thông tin ngân hàng tránh mất tiền.</li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Yêu cầu thanh toán</h2>

            {message && (
              <div className={`p-4 rounded-xl mb-6 flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <i className={`fa-solid ${message.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} mr-3`}></i>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Hình thức rút tiền</label>
                <div className="grid grid-cols-2 gap-4">
                  {WITHDRAW_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`flex items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        method === m.id 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                          : 'border-slate-100 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      <i className={`fa-solid ${m.icon} mr-3 text-xl`}></i>
                      <span className="font-bold">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Số Xu muốn rút</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="Ví dụ: 50000" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:outline-none transition-all font-bold text-lg"
                    required
                  />
                  <i className="fa-solid fa-coins absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 text-lg"></i>
                </div>
                <p className="mt-2 text-xs text-slate-400">Ước tính nhận được: <span className="text-green-600 font-bold">{(parseInt(amount) || 0) * XU_TO_VND}đ</span></p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {method === 'BANK' ? 'Thông tin Ngân hàng (Tên NH - STK - Tên CTK)' : 'Email nhận mã thẻ'}
                </label>
                <textarea 
                  rows={3}
                  placeholder={method === 'BANK' ? 'MB Bank - 123456789 - NGUYEN VAN A' : 'example@gmail.com'}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:outline-none transition-all"
                  required
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
              >
                {submitting ? (
                  <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Đang gửi yêu cầu...</>
                ) : (
                  'Gửi yêu cầu rút tiền'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
