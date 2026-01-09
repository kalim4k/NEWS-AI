
import React, { useState } from 'react';
import { Page } from '../types';
import { RichEditor } from '../components/RichEditor';
import { Edit2, Eye, Calendar, Globe, Save, ArrowLeft, CheckCircle, EyeOff, Plus, X, Trash2, AlertTriangle } from 'lucide-react';

interface PagesProps {
  pages: Page[];
  onUpdatePage: (page: Page) => void;
  onAddPage: (page: { title: string; slug: string; content: string }) => void;
  onDeletePage: (id: string) => void;
}

export const Pages: React.FC<PagesProps> = ({ pages, onUpdatePage, onAddPage, onDeletePage }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [newPage, setNewPage] = useState({ title: '', slug: '', content: '' });

  // Delete State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; pageId: string | null }>({
    isOpen: false,
    pageId: null
  });

  const handleEdit = (page: Page) => {
    setEditingId(page.id);
    setEditContent(page.content);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      const page = pages.find(p => p.id === editingId);
      if (page) {
        onUpdatePage({
          ...page,
          content: editContent,
          lastModified: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
        });
        setEditingId(null);
      }
    }
  };

  const handleCreate = () => {
    if (newPage.title && newPage.slug) {
      onAddPage(newPage);
      setIsCreating(false);
      setNewPage({ title: '', slug: '', content: '' });
    }
  };

  const confirmDelete = () => {
    if (deleteModal.pageId) {
        onDeletePage(deleteModal.pageId);
        setDeleteModal({ isOpen: false, pageId: null });
    }
  };

  if (editingId) {
    const page = pages.find(p => p.id === editingId);
    if (!page) return null;

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button onClick={() => setEditingId(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Édition : {page.title}</h1>
              <p className="text-slate-500 text-sm">Dernière modification : {page.lastModified}</p>
            </div>
          </div>
          <button 
            onClick={handleSaveEdit}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-all shadow-md"
          >
            <Save size={18} />
            <span>Enregistrer</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
           <RichEditor 
             content={editContent} 
             onChange={setEditContent} 
             minHeight="500px" 
           />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Supprimer la page ?</h3>
            </div>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer cette page ? <br/>
              <span className="text-sm text-slate-400">Elle disparaîtra de vos menus si elle y était liée.</span>
            </p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, pageId: null })}
                className="px-5 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform hover:scale-105"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-slate-900">Nouvelle Page</h2>
               <button onClick={() => setIsCreating(false)}><X className="text-slate-400 hover:text-slate-600" /></button>
             </div>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Titre de la page</label>
                 <input 
                    type="text" 
                    value={newPage.title}
                    onChange={(e) => setNewPage({...newPage, title: e.target.value})}
                    placeholder="Ex: Mentions Légales"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
                 <input 
                    type="text" 
                    value={newPage.slug}
                    onChange={(e) => setNewPage({...newPage, slug: e.target.value})}
                    placeholder="Ex: /mentions-legales"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 font-mono text-sm"
                 />
               </div>
             </div>

             <div className="flex justify-end space-x-3 mt-8">
               <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600 hover:bg-gray-100 rounded-lg">Annuler</button>
               <button 
                  onClick={handleCreate}
                  disabled={!newPage.title || !newPage.slug}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
               >
                 Créer la page
               </button>
             </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pages Statiques</h1>
          <p className="text-slate-500 mt-1">Gérez le contenu des pages essentielles de votre site.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          <span>Nouvelle Page</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map(page => (
          <div key={page.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full group">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${page.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                   <Globe size={24} />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  page.status === 'published' 
                    ? 'bg-green-50 text-green-700 border-green-100' 
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}>
                  {page.status === 'published' ? 'En ligne' : 'Masqué'}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">{page.title}</h3>
              <div className="text-sm text-slate-500 space-y-2">
                <div className="flex items-center space-x-2">
                   <span className="bg-gray-100 text-slate-600 px-1.5 py-0.5 rounded text-xs font-mono">{page.slug}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={14} />
                  <span>Modifié le {page.lastModified}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
               <button className="text-slate-500 hover:text-indigo-600 text-sm font-medium flex items-center transition-colors">
                 <Eye size={16} className="mr-1.5" />
                 Aperçu
               </button>
               
               <div className="flex space-x-2">
                   <button 
                    onClick={() => setDeleteModal({ isOpen: true, pageId: page.id })}
                    className="bg-white border border-gray-200 text-slate-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50 px-2 py-2 rounded-lg transition-all shadow-sm flex items-center justify-center"
                    title="Supprimer la page"
                   >
                     <Trash2 size={16} />
                   </button>
                   <button 
                    onClick={() => handleEdit(page)}
                    className="bg-white border border-gray-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center"
                   >
                     <Edit2 size={16} className="mr-1.5" />
                     Modifier
                   </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
