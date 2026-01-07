
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { UserProfile, UserRole } from '../types';
import { APP_NAME } from '../constants';

interface SidebarProps {
  user: UserProfile;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/', label: 'Trang chủ', icon: 'fa-house' },
    { path: '/tasks', label: 'Nhiệm vụ vượt link', icon: 'fa-link' },
    { path: '/withdraw', label: 'Rút tiền', icon: 'fa-money-bill-transfer' },
    { path: '/profile', label: 'Cá nhân', icon: 'fa-user' },
    { path: '/support', label: 'Hỗ trợ', icon: 'fa-headset' },
  ];

  if (user.role === UserRole.ADMIN) {
    menuItems.push({ path: '/admin', label: 'Quản trị Admin', icon: 'fa-user-shield' });
  }

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden bg-indigo-600 text-white p-4 flex justify-between items-center sticky top-0 z-30">
        <span className="font-bold text-xl tracking-tight">{APP_NAME}</span>
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
        fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-30 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 hidden md:block">
            <h1 className="text-2xl font-black text-indigo-600 tracking-tighter italic">
              {APP_NAME}<span className="text-slate-900">.pro</span>
            </h1>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}
                `}
              >
                <i className={`fa-solid ${item.icon} w-6 text-lg`}></i>
                <span className="ml-3 font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={onLogout}
              className="flex items-center w-full px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors font-medium"
            >
              <i className="fa-solid fa-right-from-bracket w-6 text-lg"></i>
              <span className="ml-3">Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
