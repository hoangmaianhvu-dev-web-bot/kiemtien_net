
import React from 'react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center space-x-2">
        <h2 className="text-xl font-bold text-slate-800 hidden md:block">
          Chào mừng, <span className="text-indigo-600">{user.username}</span>
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
          <i className="fa-solid fa-coins text-yellow-500 mr-2"></i>
          <span className="font-bold text-indigo-700">{user.xu_balance.toLocaleString()} Xu</span>
        </div>
        
        <div className="relative group">
          <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition-colors">
            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
