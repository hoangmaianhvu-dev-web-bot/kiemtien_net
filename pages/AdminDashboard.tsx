
import React from 'react';

const AdminDashboard: React.FC = () => {
  const pendingWithdrawals = [
    { id: '#W001', user: 'hoang_dev', amount: 50000, method: 'BANK', date: '10:30 12/04' },
    { id: '#W002', user: 'minh_tran', amount: 20000, method: 'GARENA', date: '09:15 12/04' },
    { id: '#W003', user: 'anh_tuan', amount: 100000, method: 'BANK', date: '08:45 12/04' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Tổng Xu trên hệ thống</p>
          <h3 className="text-2xl font-bold text-indigo-600">12,500,000 Xu</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Tổng lượt vượt link hôm nay</p>
          <h3 className="text-2xl font-bold text-green-600">1,452</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Yêu cầu rút tiền chờ duyệt</p>
          <h3 className="text-2xl font-bold text-orange-600">42</h3>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Yêu cầu rút tiền chờ duyệt</h3>
          <button className="text-indigo-600 font-bold text-sm">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Số tiền</th>
                <th className="px-6 py-4">Phương thức</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingWithdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">{w.id}</td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{w.user}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{w.amount.toLocaleString()} Xu</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${w.method === 'BANK' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {w.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{w.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"><i className="fa-solid fa-check"></i></button>
                      <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><i className="fa-solid fa-xmark"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
