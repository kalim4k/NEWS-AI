
import React, { useState, useEffect } from 'react';
import { Comment, Post } from '../types';
import { CheckCircle, XCircle, Trash2, Edit2, Loader2, MessageCircle, AlertCircle, Save, X, AlertTriangle } from 'lucide-react';
import { supabase, SUPABASE_URL } from '../lib/supabase';

interface CommentsProps {
  posts: Post[]; // Nécessaire pour afficher le titre de l'article associé
  blogId?: string;
}

export const Comments: React.FC<CommentsProps> = ({ posts, blogId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; commentId: string | null }>({
    isOpen: false,
    commentId: null
  });

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const fetchComments = async () => {
    if (SUPABASE_URL.includes('votre-projet')) {
        setComments([]); // Empty for demo initially
        setLoading(false);
        return;
    }
    
    setLoading(true);
    let query = supabase.from('comments').select('*').order('created_at', { ascending: false });
    
    // Si on a un blogId, on filtre (sécurité)
    if (blogId) {
        query = query.eq('blog_id', blogId);
    }

    const { data, error } = await query;
    if (data) setComments(data as Comment[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: 'approved' | 'pending') => {
    // Optimistic update
    setComments(comments.map(c => c.id === id ? { ...c, status: newStatus } : c));
    
    if (!SUPABASE_URL.includes('votre-projet')) {
        await supabase.from('comments').update({ status: newStatus }).eq('id', id);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, commentId: id });
  };

  const confirmDelete = async () => {
    const id = deleteModal.commentId;
    if (!id) return;

    setComments(comments.filter(c => c.id !== id));
    
    if (!SUPABASE_URL.includes('votre-projet')) {
        await supabase.from('comments').delete().eq('id', id);
    }
    setDeleteModal({ isOpen: false, commentId: null });
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
  };

  const saveEdit = async () => {
    if (!editingComment) return;

    setComments(comments.map(c => c.id === editingComment.id ? { ...c, content: editContent } : c));
    
    if (!SUPABASE_URL.includes('votre-projet')) {
        await supabase.from('comments').update({ content: editContent }).eq('id', editingComment.id);
    }
    
    setEditingComment(null);
  };

  const getPostTitle = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    return post ? post.title : "Article supprimé ou inconnu";
  };

  if (loading) {
     return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-indigo-600" /></div>;
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
              <h3 className="text-xl font-bold text-slate-900">Supprimer le commentaire ?</h3>
            </div>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              Cette action est irréversible. Le commentaire sera définitivement effacé de la base de données.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, commentId: null })}
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

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commentaires</h1>
          <p className="text-slate-500 mt-1">Gérez et modérez les commentaires de vos lecteurs.</p>
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center flex flex-col items-center">
            <div className="bg-indigo-50 p-4 rounded-full mb-4">
                <MessageCircle size={32} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Aucun commentaire</h3>
            <p className="text-slate-500">Les commentaires de vos visiteurs apparaîtront ici.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-slate-500 text-sm">
                            <th className="px-6 py-4 font-medium">Auteur</th>
                            <th className="px-6 py-4 font-medium w-1/3">Commentaire</th>
                            <th className="px-6 py-4 font-medium">Article</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium">Statut</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {comments.map(comment => (
                            <tr key={comment.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">{comment.author}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {editingComment?.id === comment.id ? (
                                        <div className="flex items-start space-x-2">
                                            <textarea 
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
                                                rows={3}
                                            />
                                            <div className="flex flex-col space-y-1">
                                                <button onClick={saveEdit} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"><Save size={16} /></button>
                                                <button onClick={() => setEditingComment(null)} className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"><X size={16} /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-600 text-sm">{comment.content}</p>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded truncate max-w-[150px] inline-block" title={getPostTitle(comment.post_id)}>
                                        {getPostTitle(comment.post_id)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    {comment.status === 'approved' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Approuvé
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            En attente
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        {comment.status === 'pending' ? (
                                            <button onClick={() => updateStatus(comment.id, 'approved')} className="p-1.5 hover:bg-green-50 rounded-md text-slate-400 hover:text-green-600" title="Approuver">
                                                <CheckCircle size={18} />
                                            </button>
                                        ) : (
                                            <button onClick={() => updateStatus(comment.id, 'pending')} className="p-1.5 hover:bg-yellow-50 rounded-md text-slate-400 hover:text-yellow-600" title="Mettre en attente">
                                                <XCircle size={18} />
                                            </button>
                                        )}
                                        
                                        <button onClick={() => startEdit(comment)} className="p-1.5 hover:bg-blue-50 rounded-md text-slate-400 hover:text-blue-600" title="Modifier">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteClick(comment.id)} className="p-1.5 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-600" title="Supprimer">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};
