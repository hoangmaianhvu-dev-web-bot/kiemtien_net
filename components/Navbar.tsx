
import React from 'react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center space-x-2">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest hidden md:block">
          Chào mừng, <span className="text-[#0095FF]">{user.username}</span>
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-blue-50 px-5 py-2 rounded-full border border-blue-100 shadow-inner">
          <i className="fa-solid fa-coins text-yellow-400 mr-2 shadow-sm"></i>
          <span className="font-black text-[#0095FF] text-sm">{(user.xu || 0).toLocaleString()} XU</span>
        </div>
        
        <div className="relative group">
          <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 bg-[#0095FF] rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
