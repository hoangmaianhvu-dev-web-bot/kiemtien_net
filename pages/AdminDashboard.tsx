
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { ShortLinkTask, Product } from '../types';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'withdrawals' | 'deposits' | 'tasks' | 'store'>('tasks');
  const [users, setUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [tasks, setTasks] = useState<ShortLinkTask[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newTask, setNewTask] = useState({ title: '', xu: '', url: '', type: 'normal', max_slots: '100' });
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image_url: '', link: '', type: 'mod', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: u } = await supabase.from('users').select('*').order('xu', { ascending: false });
      const { data: w } = await supabase.from('withdrawals').select('*, users(username)').order('created_at', { ascending: false });
      const { data: d } = await supabase.from('deposits').select('*, users(username)').order('created_at', { ascending: false });
      const { data: t } = await supabase.from('tasks').select('*').order('created_at', { ascending: true });
      const { data: p } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      
      setUsers(u || []);
      setWithdrawals(w || []);
      setDeposits(d || []);
      setTasks(t || []);
      setProducts(p || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('tasks').insert([{
      title: newTask.title,
      xu: parseInt(newTask.xu) || 0,
      url: newTask.url,
      type: newTask.type,
      max_slots: parseInt(newTask.max_slots) || 100,
      completed_count: 0,
      status: 'active'
    }]);
    if (error) alert(error.message);
    else { setNewTask({ title: '', xu: '', url: '', type: 'normal', max_slots: '100' }); fetchData(); }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('products').insert([{
      name: newProduct.name,
      price: parseInt(newProduct.price) || 0,
      image_url: newProduct.image_url,
      link: newProduct.link,
      type: newProduct.type,
      description: newProduct.description
    }]);
    if (error) alert(error.message);
    else { setNewProduct({ name: '', price: '', image_url: '', link: '', type: 'mod', description: '' }); fetchData(); }
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Xác nhận xóa?')) return;
    await supabase.from(table).delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex space-x-2 overflow-x-auto">
        {[
          { id: 'tasks', label: 'Quản lý Nhiệm vụ' },
          { id: 'store', label: 'Quản lý Cửa hàng' },
          { id: 'withdrawals', label: 'Duyệt Rút' },
          { id: 'deposits', label: 'Duyệt Nạp' },
          { id: 'users', label: 'Thành viên' }
        ].map((tab: any) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {activeTab === 'tasks' && (
          <div className="space-y-8">
            <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-lg">
               <input type="text" placeholder="Tên NV / Tên Dòng Ngang" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="px-4 py-2 rounded border" />
               <input type="number" placeholder="Số Xu" value={newTask.xu} onChange={e => setNewTask({...newTask, xu: e.target.value})} className="px-4 py-2 rounded border" />
               <input type="text" placeholder="URL" value={newTask.url} onChange={e => setNewTask({...newTask, url: e.target.value})} className="px-4 py-2 rounded border" />
               <select value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})} className="px-4 py-2 rounded border">
                 <option value="normal">Nhiệm vụ thường</option>
                 <option value="special">Nhiệm vụ Đặc biệt</option>
                 <option value="separator">Dòng ngang ngăn cách</option>
               </select>
               <input type="number" placeholder="Tổng lượt làm" value={newTask.max_slots} onChange={e => setNewTask({...newTask, max_slots: e.target.value})} className="px-4 py-2 rounded border" />
               <button type="submit" className="bg-blue-600 text-white py-2 rounded font-bold">Thêm</button>
            </form>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase"><tr><th className="p-4">Tên</th><th>Loại</th><th>Số lượt</th><th>Hành động</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map(t => (
                    <tr key={t.id}>
                      <td className="p-4 font-semibold">{t.title}</td>
                      <td className="p-4 text-xs">{t.type}</td>
                      <td className="p-4 font-bold">{t.completed_count}/{t.max_slots}</td>
                      <td className="p-4"><button onClick={() => handleDelete('tasks', t.id)} className="text-red-500 font-bold">Xóa</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'store' && (
          <div className="space-y-8">
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-lg">
               <input type="text" placeholder="Tên sản phẩm" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="px-4 py-2 rounded border" />
               <input type="number" placeholder="Giá Xu" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="px-4 py-2 rounded border" />
               <input type="text" placeholder="Link ảnh (URL)" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} className="px-4 py-2 rounded border" />
               <input type="text" placeholder="Link tải/Shopee" value={newProduct.link} onChange={e => setNewProduct({...newProduct, link: e.target.value})} className="px-4 py-2 rounded border" />
               <select value={newProduct.type} onChange={e => setNewProduct({...newProduct, type: e.target.value as any})} className="px-4 py-2 rounded border">
                 <option value="mod">MOD GAME</option>
                 <option value="toy">ĐỒ CHƠI GAME</option>
                 <option value="free">FREE</option>
                 <option value="shopee">SHOPEE</option>
               </select>
               <input type="text" placeholder="Mô tả ngắn" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="px-4 py-2 rounded border md:col-span-3" />
               <button type="submit" className="md:col-span-3 bg-indigo-600 text-white py-2 rounded font-bold">Thêm sản phẩm</button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="p-4 border rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={p.image_url} className="w-10 h-10 rounded object-cover" />
                    <div><p className="font-bold text-xs">{p.name}</p><p className="text-[10px] text-slate-400">{p.type}</p></div>
                  </div>
                  <button onClick={() => handleDelete('products', p.id)} className="text-red-500"><i className="fa-solid fa-trash"></i></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (/* code tương tự file cũ */ <div className="p-4">Quản lý rút tiền</div>)}
        {activeTab === 'deposits' && (/* code tương tự file cũ */ <div className="p-4">Quản lý nạp tiền</div>)}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase"><tr><th>User</th><th>Xu</th><th>Vai trò</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{users.map(u => (<tr key={u.id}><td className="p-4 font-bold">{u.username}</td><td className="p-4 text-blue-600">{u.xu.toLocaleString()}</td><td className="p-4 text-[10px]">{u.role}</td></tr>))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
