import React, { useState, useRef, useEffect } from 'react';
import { RichEditor } from '../components/RichEditor';
import { ArrowRight, ArrowLeft, Check, Image as ImageIcon, X, Upload, User } from 'lucide-react';
import { Post } from '../types';

interface CreatePostProps {
  initialPost?: Post | null;
  onPublish: (post: Omit<Post, 'id' | 'date' | 'views'>) => void;
  onCancel: () => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ initialPost, onPublish, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    newCategory: '',
    tags: [] as string[],
    tagInput: '',
    imageUrl: '',
    author: 'Admin User',
    status: 'published' as 'published' | 'draft'
  });
  
  // Initialize form if editing
  useEffect(() => {
    if (initialPost) {
      setFormData({
        title: initialPost.title,
        content: initialPost.content,
        category: initialPost.category,
        newCategory: '',
        tags: initialPost.tags || [],
        tagInput: '',
        imageUrl: initialPost.imageUrl || '',
        author: initialPost.author || 'Admin User',
        status: initialPost.status
      });
    }
  }, [initialPost]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const CATEGORIES = ['Tech', 'Développement', 'Design', 'Marketing', 'Lifestyle', 'Intelligence Artificielle'];

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formData.tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(formData.tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, formData.tagInput.trim()], tagInput: '' });
      }
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setFormData({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const selectCategory = (cat: string) => setFormData({ ...formData, category: cat, newCategory: '' });
  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, newCategory: e.target.value, category: '' });

  const handleFinish = () => {
    onPublish({
      title: formData.title,
      content: formData.content,
      category: formData.newCategory.trim() || formData.category || 'Général',
      tags: formData.tags,
      imageUrl: formData.imageUrl || 'https://picsum.photos/800/600',
      status: formData.status,
      author: formData.author.trim() || 'Admin User'
    });
  };

  const renderProgressBar = () => (
    <div className="w-full bg-gray-100 h-2 rounded-full mb-8 overflow-hidden">
      <div className="h-full bg-indigo-600 transition-all duration-500 ease-in-out" style={{ width: `${(step / 4) * 100}%` }}></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{initialPost ? "Modifier l'article" : "Nouvel Article"}</h1>
          <p className="text-slate-500">Étape {step} sur 4</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">Annuler</button>
      </div>

      {renderProgressBar()}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[400px] flex flex-col">
        
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-300">
            <label className="text-lg font-semibold text-slate-700 mb-4 block">Quel est le titre de votre article ?</label>
            <input 
              type="text" 
              placeholder="Ex: Les 10 tendances du web en 2024..." 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full text-4xl font-bold text-slate-900 border-b-2 border-gray-200 focus:border-indigo-600 focus:outline-none py-4 bg-transparent"
              autoFocus
            />
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col animate-in fade-in duration-300">
             <label className="text-sm font-semibold text-slate-700 mb-2 block">Rédigez votre contenu</label>
             <RichEditor content={formData.content} onChange={(html) => setFormData({...formData, content: html})} minHeight="400px" />
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 animate-in fade-in duration-300 space-y-8">
            <div>
               <label className="text-lg font-semibold text-slate-700 mb-2 block flex items-center"><User size={20} className="mr-2 text-indigo-600" />Auteur</label>
               <input type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <hr className="border-gray-100" />
            <div>
              <label className="text-lg font-semibold text-slate-700 mb-4 block">Catégorie</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => selectCategory(cat)} className={`px-4 py-3 rounded-xl border text-left transition-all ${formData.category === cat ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}>{cat}</button>
                ))}
              </div>
              <input type="text" placeholder="Ou nouvelle catégorie..." value={formData.newCategory} onChange={handleNewCategoryChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-lg font-semibold text-slate-700 mb-2 block">Tags</label>
              <div className="flex flex-wrap items-center gap-2 border border-gray-200 rounded-xl p-3 bg-gray-50">
                {formData.tags.map(tag => <span key={tag} className="bg-white border px-2 py-1 rounded-md text-sm flex items-center">#{tag} <button onClick={() => removeTag(tag)}><X size={14} className="ml-1" /></button></span>)}
                <input type="text" value={formData.tagInput} onChange={(e) => setFormData({...formData, tagInput: e.target.value})} onKeyDown={handleAddTag} placeholder="Ajouter tag..." className="bg-transparent focus:outline-none flex-1" />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Finalisation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Image</label>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-2xl h-64 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer overflow-hidden relative">
                  {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <Upload className="text-indigo-500 w-8 h-8" />}
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                   <h3 className="text-sm font-bold uppercase mb-4">Récapitulatif</h3>
                   <p className="font-medium text-slate-900">{formData.title}</p>
                   <p className="text-slate-500 text-sm mt-1">{formData.author} • {formData.newCategory || formData.category}</p>
                </div>
                <div className="flex flex-col space-y-3">
                   <label className="flex items-center space-x-3 p-4 border border-indigo-100 bg-indigo-50 rounded-xl cursor-pointer"><input type="radio" checked={formData.status === 'published'} onChange={() => setFormData({...formData, status: 'published'})} className="text-indigo-600" /><span className="font-bold text-indigo-900">Publier</span></label>
                   <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer"><input type="radio" checked={formData.status === 'draft'} onChange={() => setFormData({...formData, status: 'draft'})} className="text-gray-500" /><span className="font-bold text-slate-700">Brouillon</span></label>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between">
          <button onClick={handlePrev} disabled={step === 1} className="flex items-center px-6 py-2.5 rounded-lg text-slate-600 hover:bg-gray-100 disabled:opacity-50"><ArrowLeft size={18} className="mr-2" />Précédent</button>
          {step < 4 ? <button onClick={handleNext} disabled={step === 1 && !formData.title} className="flex items-center bg-indigo-600 text-white px-8 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50">Suivant<ArrowRight size={18} className="ml-2" /></button> : <button onClick={handleFinish} className="flex items-center bg-green-600 text-white px-8 py-2.5 rounded-lg hover:bg-green-700">{formData.status === 'published' ? 'Publier' : 'Enregistrer'}<Check size={18} className="ml-2" /></button>}
        </div>
      </div>
    </div>
  );
};