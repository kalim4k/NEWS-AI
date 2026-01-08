import React, { useState } from 'react';
import { Post } from '../types';
import { Search, Plus, Filter, Edit2, Trash2, Eye, AlertTriangle } from 'lucide-react';

interface PostsProps {
  posts: Post[];
  onCreatePost: () => void;
  onView: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
}

export const Posts: React.FC<PostsProps> = ({ posts, onCreatePost, onView, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; postId: string | null }>({
    isOpen: false,
    postId: null
  });

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (postId: string) => {
    setDeleteModal({ isOpen: true, postId });
  };

  const confirmDelete = () => {
    if (deleteModal.postId) {
      onDelete(deleteModal.postId);
      setDeleteModal({ isOpen: false, postId: null });
    }
  };

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
              <h3 className="text-xl font-bold text-slate-900">Confirmer la suppression</h3>
            </div>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer cet article ? <br/>
              <span className="text-sm text-slate-400">Cette action est irréversible.</span>
            </p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, postId: null })}
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Articles</h1>
          <p className="text-slate-500 mt-1">Gérez tout votre contenu éditorial ici.</p>
        </div>
        <button 
          onClick={onCreatePost}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          <span>Nouvel Article</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-50 bg-white">
            <Filter size={18} />
            <span>Filtres</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Titre</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium">Catégorie</th>
                <th className="px-6 py-4 font-medium">Auteur</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 max-w-xs truncate">{post.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{post.views.toLocaleString()} vues</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{post.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-700 font-bold">
                        {post.author.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-600">{post.author}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => onView(post)} className="p-1.5 hover:bg-indigo-50 rounded-md text-slate-400 hover:text-indigo-600" title="Voir">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => onEdit(post)} className="p-1.5 hover:bg-blue-50 rounded-md text-slate-400 hover:text-blue-600" title="Modifier">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteClick(post.id)} className="p-1.5 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-600" title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {posts.length === 0 && <div className="p-8 text-center text-slate-500">Aucun article trouvé.</div>}
      </div>
    </div>
  );
};