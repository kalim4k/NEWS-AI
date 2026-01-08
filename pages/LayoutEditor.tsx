import React, { useRef } from 'react';
import { BlogSettings, Page } from '../types';
import { Upload, X, Layout, Type, DollarSign, Menu as MenuIcon, Save } from 'lucide-react';

interface LayoutEditorProps {
  settings: BlogSettings;
  pages: Page[];
  onUpdate: (settings: BlogSettings) => void;
}

export const LayoutEditor: React.FC<LayoutEditorProps> = ({ settings, pages, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdate({
            ...settings,
            layout: { ...settings.layout, logoUrl: reader.result }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePageInMenu = (pageId: string, menuType: 'header' | 'footer') => {
    const currentMenu = menuType === 'header' ? settings.layout.headerMenu : settings.layout.footerMenu;
    const newMenu = currentMenu.includes(pageId)
      ? currentMenu.filter(id => id !== pageId)
      : [...currentMenu, pageId];
    
    onUpdate({
      ...settings,
      layout: {
        ...settings.layout,
        [menuType === 'header' ? 'headerMenu' : 'footerMenu']: newMenu
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Éditeur de Mise en page</h1>
        <p className="text-slate-500 mt-1">Personnalisez l'apparence, les menus et la monétisation de votre blog.</p>
      </div>

      {/* 1. Identité Visuelle */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Layout size={20} /></div>
          <h2 className="text-lg font-bold text-slate-900">Identité Visuelle</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Logo du site</label>
            <div className="flex items-start space-x-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer overflow-hidden relative"
              >
                {settings.layout.logoUrl ? (
                  <img src={settings.layout.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Upload className="text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-md text-slate-700 hover:bg-gray-50 mb-2">Importer un fichier</button>
                {settings.layout.logoUrl && (
                  <button onClick={() => onUpdate({...settings, layout: {...settings.layout, logoUrl: ''}})} className="block text-sm text-red-500 hover:underline">Supprimer le logo</button>
                )}
                <p className="text-xs text-slate-400 mt-2">Format recommandé : PNG transparent. Max 200x80px.</p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Texte du pied de page (Copyright)</label>
            <textarea 
              rows={4}
              value={settings.layout.footerText}
              onChange={(e) => onUpdate({...settings, layout: {...settings.layout, footerText: e.target.value}})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="© 2024 Mon Site de News. Tous droits réservés."
            />
          </div>
        </div>
      </div>

      {/* 2. Navigation & Menus */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
          <div className="p-2 bg-pink-50 rounded-lg text-pink-600"><MenuIcon size={20} /></div>
          <h2 className="text-lg font-bold text-slate-900">Menus de Navigation</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Menu Principal (Header)</h3>
            <div className="space-y-2 border border-gray-100 rounded-lg p-4 bg-gray-50/50">
              <label className="flex items-center space-x-2">
                 <input 
                   type="checkbox" 
                   checked={settings.layout.showCategoriesInMenu}
                   onChange={(e) => onUpdate({...settings, layout: {...settings.layout, showCategoriesInMenu: e.target.checked}})}
                   className="rounded text-indigo-600 focus:ring-indigo-500"
                 />
                 <span className="text-sm font-medium">Afficher automatiquement les catégories</span>
              </label>
              <hr className="border-gray-200 my-2" />
              <p className="text-xs font-bold uppercase text-slate-400 mb-2">Pages à inclure :</p>
              {pages.map(page => (
                <label key={page.id} className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.layout.headerMenu.includes(page.id)}
                    onChange={() => togglePageInMenu(page.id, 'header')}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">{page.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Menu Pied de page (Footer)</h3>
            <div className="space-y-2 border border-gray-100 rounded-lg p-4 bg-gray-50/50">
              {pages.map(page => (
                <label key={page.id} className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.layout.footerMenu.includes(page.id)}
                    onChange={() => togglePageInMenu(page.id, 'footer')}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">{page.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
           <label className="block text-sm font-medium text-slate-700 mb-2">Nombre d'articles par page</label>
           <div className="flex items-center space-x-4">
             <input 
               type="range" 
               min="3" 
               max="20" 
               step="1"
               value={settings.layout.postsPerPage}
               onChange={(e) => onUpdate({...settings, layout: {...settings.layout, postsPerPage: parseInt(e.target.value)}})}
               className="w-full max-w-xs h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
             />
             <span className="font-bold text-indigo-600 text-lg">{settings.layout.postsPerPage} articles</span>
           </div>
        </div>
      </div>

      {/* 3. Espaces Publicitaires */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
          <div className="p-2 bg-green-50 rounded-lg text-green-600"><DollarSign size={20} /></div>
          <h2 className="text-lg font-bold text-slate-900">Monétisation (Publicités)</h2>
        </div>
        
        <p className="text-sm text-slate-500 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
           Insérez ici vos codes HTML/JS (Google AdSense, etc.). Ils s'afficheront aux emplacements indiqués sur le blog public.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">En-tête (Header) - 728x90</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500"
              placeholder="<!-- Code pub header -->"
              value={settings.layout.adCodeHeader}
              onChange={(e) => onUpdate({...settings, layout: {...settings.layout, adCodeHeader: e.target.value}})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Barre Latérale (Sidebar) - 300x250</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500"
              placeholder="<!-- Code pub sidebar -->"
              value={settings.layout.adCodeSidebar}
              onChange={(e) => onUpdate({...settings, layout: {...settings.layout, adCodeSidebar: e.target.value}})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Haut de l'article</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500"
              placeholder="<!-- Code pub article top -->"
              value={settings.layout.adCodeArticleTop}
              onChange={(e) => onUpdate({...settings, layout: {...settings.layout, adCodeArticleTop: e.target.value}})}
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bas de l'article</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500"
              placeholder="<!-- Code pub article bottom -->"
              value={settings.layout.adCodeArticleBottom}
              onChange={(e) => onUpdate({...settings, layout: {...settings.layout, adCodeArticleBottom: e.target.value}})}
            />
          </div>
        </div>
      </div>
      
    </div>
  );
};
