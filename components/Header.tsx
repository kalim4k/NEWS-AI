import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Zap, User, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (view: string) => {
    onNavigate(view);
    setIsProfileOpen(false);
  };

  return (
    <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm/30">
      
      {/* Left: Mobile Logo & Title */}
      <div className="flex items-center gap-4">
        {/* Mobile Logo Only */}
        <div className="md:hidden flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">NEWS AI</span>
        </div>

        {/* Desktop Breadcrumbs (Hidden on Mobile) */}
        <div className="hidden md:flex flex-col justify-center">
            <span className="text-xs md:text-sm font-medium text-slate-400 uppercase tracking-wide">Administration</span>
            <span className="text-sm md:text-base font-bold text-slate-800 leading-none">Vue d'ensemble</span>
        </div>
      </div>

      {/* Right: Tools & Profile */}
      <div className="flex items-center space-x-2 md:space-x-6">
        
        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Recherche..." 
            className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-full text-sm text-slate-700 w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all placeholder-slate-400" 
          />
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Notification Bell */}
          <button className="relative p-2 text-slate-500 hover:bg-gray-100 rounded-full transition-colors group">
            <Bell size={20} className="group-hover:text-indigo-600 transition-colors" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Profile Dropdown Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center space-x-2 md:space-x-3 cursor-pointer p-1 pr-2 rounded-full border transition-all ${
                isProfileOpen 
                ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                : 'border-transparent hover:bg-indigo-50/50 hover:border-indigo-100'
              }`}
            >
              <img 
                src="https://ui-avatars.com/api/?name=Admin+User&background=4f46e5&color=fff&bold=true" 
                alt="Admin Profile" 
                className="w-8 h-8 md:w-9 md:h-9 rounded-full shadow-sm ring-2 ring-white object-cover" 
              />
              <div className="hidden md:block text-left">
                <p className={`text-sm font-semibold leading-none ${isProfileOpen ? 'text-indigo-900' : 'text-slate-700'}`}>Admin User</p>
              </div>
              <ChevronDown size={14} className={`hidden md:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-sm font-bold text-slate-900">Admin User</p>
                  <p className="text-xs text-slate-500 truncate">admin@newsai.com</p>
                </div>
                
                <button onClick={() => handleNavigate('profile')} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2 transition-colors">
                  <User size={16} />
                  <span>Mon Profil</span>
                </button>
                
                <button onClick={() => handleNavigate('settings')} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2 transition-colors">
                  <Settings size={16} />
                  <span>Paramètres</span>
                </button>
                
                <div className="h-px bg-gray-50 my-1"></div>
                
                <button onClick={onLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors">
                  <LogOut size={16} />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};