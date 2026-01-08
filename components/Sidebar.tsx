
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
    { path: '/', label: 'Bảng điều khiển', icon: 'fa-gauge-high' },
    { path: '/tasks', label: 'Làm nhiệm vụ', icon: 'fa-tasks' },
    { path: '/store', label: 'Cửa hàng game', icon: 'fa-shopping-cart' },
    { path: '/deposit', label: 'Nạp tiền', icon: 'fa-plus-circle' },
    { path: '/withdraw', label: 'Rút tiền', icon: 'fa-money-bill-transfer' },
    { path: '/profile', label: 'Tài khoản', icon: 'fa-user-circle' },
    { path: '/support', label: 'Hỗ trợ', icon: 'fa-life-ring' },
  ];

  if (user.role === 'admin') {
    menuItems.push({ path: '/admin', label: 'Quản trị Admin', icon: 'fa-user-shield' });
  }

  return (
    <>
      <div className="md:hidden bg-blue-800 text-white p-4 flex justify-between items-center">
        <span className="font-bold text-lg">{APP_NAME}</span>
        <button onClick={() => setIsOpen(!isOpen)}><i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i></button>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 z-30 transition-transform md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white"><i className="fa-solid fa-gem"></i></div>
            <span className="text-xl font-bold text-white tracking-tight">{APP_NAME}</span>
          </div>

          <nav className="flex-1 py-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `flex items-center px-6 py-3 hover:bg-slate-800 hover:text-white transition-colors ${isActive ? 'bg-blue-600 text-white' : ''}`}
              >
                <i className={`fa-solid ${item.icon} w-6`}></i>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button onClick={onLogout} className="w-full flex items-center px-6 py-3 text-red-400 hover:bg-slate-800 rounded-lg">
              <i className="fa-solid fa-right-from-bracket w-6"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
