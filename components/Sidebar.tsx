
import React from 'react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  logout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, logout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: '📊', roles: ['ADMIN', 'TEACHER'] },
    { id: 'attendance', label: 'تسجيل الغياب', icon: '📝', roles: ['ADMIN', 'TEACHER'] },
    { id: 'students', label: 'التلاميذ', icon: '🎓', roles: ['ADMIN'] },
    { id: 'teachers', label: 'الأساتذة', icon: '👨‍🏫', roles: ['ADMIN'] },
    { id: 'schedule', label: 'توزيع الحصص', icon: '📅', roles: ['ADMIN'] },
  ];

  return (
    <aside className="w-64 bg-blue-900 text-white flex flex-col shadow-2xl z-20">
      <div className="p-6 text-center border-b border-blue-800">
        <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-inner">
           🏫
        </div>
        <h1 className="text-xl font-bold leading-tight">ثانوية بوطالب محمد</h1>
        <p className="text-blue-400 text-xs font-semibold mt-1">السوقر - ولاية تيارت</p>
      </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-2">
        {menuItems
          .filter(item => item.roles.includes(user.role))
          .map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 space-x-reverse p-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-blue-700 text-white shadow-md' : 'text-blue-100 hover:bg-blue-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
      </nav>

      <div className="p-6 border-t border-blue-800">
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
           <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white">
              {user.name.charAt(0)}
           </div>
           <div>
              <div className="text-sm font-bold truncate w-32">{user.name}</div>
              <div className="text-xs text-blue-300 uppercase">{user.role === 'ADMIN' ? 'مدير' : 'أستاذ'}</div>
           </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 space-x-reverse p-2 bg-red-600/20 hover:bg-red-600 text-red-100 rounded-lg transition"
        >
          <span>خروج</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
