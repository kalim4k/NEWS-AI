import React from 'react';
import { LayoutDashboard, FileText, Layers, MessageSquare, Settings, ExternalLink, LogOut, LayoutTemplate, X, Zap } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  onViewBlog: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onViewBlog, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'posts', label: 'Articles', icon: FileText },
    { id: 'pages', label: 'Pages', icon: Layers },
    { id: 'comments', label: 'Commentaires', icon: MessageSquare },
    { id: 'layout', label: 'Mise en page', icon: LayoutTemplate },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const handleItemClick = (id: string) => {
    onChangeView(id);
    onClose(); // Close sidebar on mobile when item clicked
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 w-64 transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:z-10
      `}>
        <div className="p-6 flex items-center justify-between border-b border-gray-100 h-20 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">NEWS AI</span>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-900">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Menu Principal</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} className={isActive ? "text-indigo-600" : "text-slate-500"} />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-gray-100">
             <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Externe</p>
            <button
              onClick={() => { onViewBlog(); onClose(); }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
            >
              <ExternalLink size={20} />
              <span>Voir le Blog Public</span>
            </button>
          </div>
        </nav>

        {/* User / Logout Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="relative">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                AU
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-900 truncate">Admin User</span>
              <span className="text-xs text-slate-500 truncate">admin@newsai.com</span>
            </div>
          </div>
          
          <button 
            className="w-full flex items-center space-x-3 px-2 py-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-colors group"
            onClick={() => alert("Déconnexion...")}
          >
            <LogOut size={18} className="text-slate-400 group-hover:text-slate-600" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};