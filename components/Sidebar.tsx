
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { UserProfile } from '../types';
import { APP_NAME } from '../constants';

interface SidebarProps {
  user: UserProfile;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/', label: 'Trang chủ', icon: 'fa-house' },
    { path: '/tasks', label: 'Nhiệm vụ tự động', icon: 'fa-link' },
    { path: '/withdraw', label: 'Rút tiền', icon: 'fa-money-bill-transfer' },
    { path: '/profile', label: 'Cá nhân', icon: 'fa-user' },
    { path: '/support', label: 'Hỗ trợ', icon: 'fa-headset' },
  ];

  // Kiểm tra role admin (chuỗi thường)
  if (user.role === 'admin') {
    menuItems.push({ path: '/admin', label: 'Quản trị Admin', icon: 'fa-user-shield' });
  }

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden bg-[#0095FF] text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <span className="font-bold text-xl tracking-tight uppercase">{APP_NAME}</span>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 z-30 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-8 hidden md:block border-b border-slate-50">
            <h1 className="text-3xl font-black text-[#0095FF] tracking-tighter uppercase">
              {APP_NAME}
            </h1>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-6">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center px-5 py-4 rounded-2xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-[#0095FF] text-white shadow-xl shadow-blue-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-[#0095FF]'}
                `}
              >
                <i className={`fa-solid ${item.icon} w-6 text-lg`}></i>
                <span className="ml-3 font-bold text-sm uppercase tracking-tight">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-50 space-y-4">
            <button 
              onClick={onLogout}
              className="flex items-center w-full px-5 py-4 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-colors font-bold text-sm"
            >
              <i className="fa-solid fa-right-from-bracket w-6 text-lg"></i>
              <span className="ml-3 uppercase tracking-tight">Đăng xuất</span>
            </button>
            <div className="px-5 text-[9px] font-black text-slate-300 uppercase tracking-widest leading-loose">
              © 2026 LinkGold<br/>Admin: 0337117930
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
