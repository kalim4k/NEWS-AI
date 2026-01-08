import React from 'react';
import { LayoutDashboard, FileText, MessageSquare, PlusCircle, LayoutGrid } from 'lucide-react';

interface MobileNavProps {
  currentView: string;
  onChangeView: (view: string) => void;
  onOpenCreate: () => void;
  onOpenSidebar: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onChangeView, onOpenCreate, onOpenSidebar }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Accueil' },
    { id: 'posts', icon: FileText, label: 'Articles' },
    { id: 'create', icon: PlusCircle, label: 'Créer', isAction: true },
    { id: 'comments', icon: MessageSquare, label: 'Comms' },
    { id: 'menu', icon: LayoutGrid, label: '', isTrigger: true },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-6 py-2 z-40 pb-safe-area shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          if (item.isAction) {
             return (
                <button
                  key={item.id}
                  onClick={onOpenCreate}
                  className="flex flex-col items-center justify-center -mt-8"
                >
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-95 transition-transform text-white">
                    <Icon size={24} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-600 mt-1">{item.label}</span>
                </button>
             )
          }

          if (item.isTrigger) {
              return (
                <button
                  key={item.id}
                  onClick={onOpenSidebar}
                  className="flex flex-col items-center justify-center p-2 space-y-1 transition-colors text-slate-400 hover:text-indigo-600"
                >
                  <Icon size={24} />
                  {/* Label supprimé */}
                </button>
              )
          }

          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex flex-col items-center justify-center p-2 space-y-1 transition-colors ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {/* Optional Label for better UX */}
              {/* <span className="text-[10px] font-medium">{item.label}</span> */}
            </button>
          );
        })}
      </div>
    </div>
  );
};