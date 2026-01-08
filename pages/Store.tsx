
import React, { useState, useEffect } from 'react';
import { UserProfile, Product } from '../types';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

interface StoreProps {
  user: UserProfile;
}

const Store: React.FC<StoreProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const handleBuy = async (p: Product) => {
    if (p.type === 'shopee' || p.price === 0) {
      window.open(p.link, '_blank');
      return;
    }

    if (user.xu < p.price) {
      alert(`Số dư không đủ! Bạn cần thêm ${(p.price - user.xu).toLocaleString()} Xu.`);
      return;
    }

    if (!confirm(`Xác nhận dùng ${p.price.toLocaleString()} Xu để mua "${p.name}"?`)) return;

    setBuyingId(p.id);
    try {
      // 1. Trừ xu người dùng
      const { error: updateError } = await supabase.rpc('increment_xu', { 
        user_id: user.id, 
        amount: -p.price 
      });

      if (updateError) throw updateError;

      // 2. Chuyển hướng tới link tải/nhận hàng
      alert('Thanh toán thành công! Nhấn OK để nhận sản phẩm.');
      window.location.href = p.link;
    } catch (err: any) {
      alert('Lỗi khi thanh toán: ' + err.message);
    } finally {
      setBuyingId(null);
    }
  };

  const renderProductRow = (title: string, type: string, color: string) => {
    const rowProducts = products.filter(p => p.type === type);
    return (
      <div className="space-y-4">
        <div className={`border-l-4 ${color} pl-4 flex items-center justify-between`}>
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter italic">{title}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sản phẩm chất lượng cao</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rowProducts.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all flex flex-col group">
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                <img src={p.image_url || 'https://via.placeholder.com/300'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {p.type === 'shopee' && <div className="absolute top-3 right-3 bg-orange-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg">SHOPEE</div>}
                {p.price > 0 && p.type !== 'shopee' && <div className="absolute bottom-3 left-3 bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-lg shadow-lg">HOT</div>}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="mb-4">
                  <h4 className="font-bold text-slate-800 text-sm mb-1 truncate group-hover:text-blue-600 transition-colors">{p.name}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed h-8">{p.description}</p>
                </div>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-blue-600 text-sm">{p.price === 0 ? 'MIỄN PHÍ' : p.price.toLocaleString() + ' XU'}</span>
                  </div>
                  <button 
                    onClick={() => handleBuy(p)}
                    disabled={buyingId === p.id}
                    className={`w-full text-white text-[10px] font-black py-2.5 rounded-xl uppercase tracking-widest transition-all shadow-lg ${
                      p.type === 'shopee' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-slate-900 hover:bg-blue-600 shadow-slate-100'
                    }`}
                  >
                    {buyingId === p.id ? <i className="fa-solid fa-spinner fa-spin"></i> : (p.type === 'shopee' ? 'MUA TRÊN SHOPEE' : 'MUA NGAY')}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {rowProducts.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 text-sm font-bold uppercase tracking-widest italic opacity-50">
              Chưa có sản phẩm trong mục này
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2 italic">Premium Game Store</h2>
            <p className="text-sm text-slate-500 max-w-lg font-medium">Sở hữu những bản MOD game độc quyền, đồ chơi gaming chất lượng nhất bằng số dư của bạn.</p>
          </div>
          <i className="fa-solid fa-gamepad absolute -bottom-10 -right-10 text-9xl text-slate-50 opacity-10"></i>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 rounded-[2.5rem] shadow-xl border-4 border-white/10 shrink-0 md:w-80 group">
          <div className="flex flex-col items-center text-center">
            <div className="bg-white/20 p-4 rounded-3xl mb-4 group-hover:scale-110 transition-transform"><i className="fa-solid fa-coins text-3xl text-yellow-300"></i></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Ví của bạn</p>
            <p className="text-2xl font-black mb-4">{(user.xu || 0).toLocaleString()} XU</p>
            <Link to="/deposit" className="w-full bg-white text-blue-600 text-[10px] font-black px-6 py-3 rounded-2xl uppercase tracking-[0.2em] hover:bg-slate-100 transition-all shadow-lg">Nạp thêm Xu</Link>
          </div>
        </div>
      </div>

      <div className="space-y-20">
        {renderProductRow('Dòng 1: MOD Game Mobile', 'mod', 'border-blue-600')}
        {renderProductRow('Dòng 2: Đồ chơi Game & Gear', 'toy', 'border-indigo-600')}
        {renderProductRow('Dòng 3: Sản phẩm Miễn phí', 'free', 'border-green-600')}
        {renderProductRow('Dòng 4: Shopee Affiliate', 'shopee', 'border-orange-600')}
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white text-center">
        <h4 className="text-xl font-black uppercase tracking-widest mb-4">Bạn là người tạo nội dung?</h4>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto text-sm font-medium">Nếu bạn có các sản phẩm số, MOD game muốn kinh doanh trên nền tảng của chúng tôi, hãy liên hệ ngay.</p>
        <Link to="/support" className="inline-block bg-blue-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/50">Hợp tác ngay</Link>
      </div>
    </div>
  );
};

export default Store;
