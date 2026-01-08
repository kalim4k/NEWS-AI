
import React, { useState, useEffect } from 'react';
import { Post, BlogSettings, Page, Comment } from '../types';
import { ArrowLeft, Search, Menu, X, Facebook, Twitter, Linkedin, Calendar, User, MessageCircle, Clock, ChevronLeft, ChevronRight, Send, Trash2, AlertTriangle } from 'lucide-react';

interface PublicBlogProps {
  settings: BlogSettings;
  posts: Post[];
  pages: Page[];
  initialPostId?: string | null;
  onBackToAdmin: () => void;
}

type ViewState = 
  | { type: 'home'; page: number }
  | { type: 'post'; postId: string }
  | { type: 'page'; pageId: string }
  | { type: 'category'; category: string; page: number };

// Mock Comments for UI demo
const MOCK_COMMENTS: Comment[] = [
  { id: '1', author: 'Sophie Martin', date: 'Il y a 2 heures', content: 'Super article, très instructif ! J\'attends la suite avec impatience.', status: 'approved', postTitle: '' },
  { id: '2', author: 'Marc Dubois', date: 'Hier', content: 'Je ne suis pas tout à fait d\'accord sur le point 2, mais l\'analyse reste pertinente.', status: 'approved', postTitle: '' },
];

export const PublicBlog: React.FC<PublicBlogProps> = ({ settings, posts, pages, initialPostId, onBackToAdmin }) => {
  const [viewState, setViewState] = useState<ViewState>(() => initialPostId ? { type: 'post', postId: initialPostId } : { type: 'home', page: 1 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  // Reset scroll on view change
  useEffect(() => window.scrollTo(0, 0), [viewState]);

  const publishedPosts = posts.filter(p => p.status === 'published');
  const publishedPages = pages.filter(p => p.status === 'published');
  
  // Menu items
  const headerPages = publishedPages.filter(p => settings.layout.headerMenu.includes(p.id));
  const footerPages = publishedPages.filter(p => settings.layout.footerMenu.includes(p.id));
  const categories = Array.from(new Set(publishedPosts.map(p => p.category))).sort();

  // Navigation Helpers
  const goHome = () => setViewState({ type: 'home', page: 1 });
  const goToPost = (id: string) => setViewState({ type: 'post', postId: id });
  const goToPage = (id: string) => setViewState({ type: 'page', pageId: id });
  const goToCategory = (cat: string) => setViewState({ type: 'category', category: cat, page: 1 });

  // Ad Component
  const AdSpace: React.FC<{ code: string; label?: string; className?: string }> = ({ code, label = "Publicité", className = "" }) => {
    if (!code) return null;
    return (
      <div className={`my-8 flex flex-col items-center justify-center bg-gray-50 border border-gray-100 py-4 ${className}`}>
        <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">{label}</span>
        <div dangerouslySetInnerHTML={{ __html: code }} />
      </div>
    );
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      author: 'Visiteur',
      content: commentInput,
      date: 'À l\'instant',
      status: 'approved',
      postTitle: ''
    };
    setComments([newComment, ...comments]);
    setCommentInput('');
  };

  const confirmDeleteComment = () => {
    if (commentToDelete) {
      setComments(comments.filter(c => c.id !== commentToDelete));
      setCommentToDelete(null);
    }
  };

  const renderPagination = (currentPage: number, totalItems: number, type: 'home' | 'category', category?: string) => {
    const totalPages = Math.ceil(totalItems / settings.layout.postsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center space-x-4 mt-12 pt-8 border-t border-gray-100">
        <button 
          onClick={() => setViewState(type === 'home' ? { type: 'home', page: currentPage - 1 } : { type: 'category', category: category!, page: currentPage - 1 })}
          disabled={currentPage === 1}
          className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} className="mr-2" /> Précédent
        </button>
        <span className="text-sm text-slate-500">Page {currentPage} sur {totalPages}</span>
        <button 
           onClick={() => setViewState(type === 'home' ? { type: 'home', page: currentPage + 1 } : { type: 'category', category: category as string, page: currentPage + 1 })}
           disabled={currentPage === totalPages}
           className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant <ChevronRight size={16} className="ml-2" />
        </button>
      </div>
    );
  };

  const renderContent = () => {
    // --- HOME VIEW ---
    if (viewState.type === 'home') {
      const startIndex = (viewState.page - 1) * settings.layout.postsPerPage;
      const visiblePosts = publishedPosts.slice(startIndex, startIndex + settings.layout.postsPerPage);
      const featuredPost = viewState.page === 1 ? visiblePosts[0] : null;
      const gridPosts = viewState.page === 1 ? visiblePosts.slice(1) : visiblePosts;

      return (
        <div className="animate-in fade-in duration-500">
          
          {/* Featured Post (Only page 1) */}
          {featuredPost && (
            <section className="mb-12 group cursor-pointer" onClick={() => goToPost(featuredPost.id)}>
              <div className="grid md:grid-cols-12 gap-6 items-center">
                 <div className="md:col-span-8 overflow-hidden rounded-xl">
                    <img src={featuredPost.imageUrl || `https://picsum.photos/1200/800`} alt={featuredPost.title} className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105" />
                 </div>
                 <div className="md:col-span-4 flex flex-col justify-center">
                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full w-fit mb-4">{featuredPost.category}</span>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight mb-4 group-hover:text-indigo-700 transition-colors">{featuredPost.title}</h1>
                    <div className="text-slate-500 text-sm flex items-center mb-6">
                       <span className="font-medium text-slate-900 mr-2">{featuredPost.author}</span>
                       <span className="w-1 h-1 bg-slate-300 rounded-full mx-2"></span>
                       <span>{featuredPost.date}</span>
                    </div>
                    <div className="line-clamp-3 text-slate-600 mb-4" dangerouslySetInnerHTML={{__html: featuredPost.content}} />
                 </div>
              </div>
            </section>
          )}

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="md:col-span-8">
               <h2 className="text-xl font-bold border-l-4 border-indigo-600 pl-3 mb-6">Derniers Articles</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {gridPosts.map(post => (
                    <article key={post.id} className="group cursor-pointer flex flex-col h-full" onClick={() => goToPost(post.id)}>
                      <div className="overflow-hidden rounded-lg mb-4 h-56">
                         <img src={post.imageUrl || `https://picsum.photos/600/400?random=${post.id}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <div className="flex-1 flex flex-col">
                         <div className="flex items-center text-xs text-slate-500 mb-2 space-x-2">
                            <span className="text-indigo-600 font-bold uppercase">{post.category}</span>
                            <span>•</span>
                            <span>{post.date}</span>
                         </div>
                         <h3 className="text-xl font-serif font-bold text-slate-900 mb-2 group-hover:text-indigo-700 leading-snug">{post.title}</h3>
                      </div>
                    </article>
                  ))}
               </div>
               {renderPagination(viewState.page, publishedPosts.length, 'home')}
            </div>

            {/* Sidebar */}
            <aside className="md:col-span-4 space-y-8">
               {/* Sidebar Ad Top */}
               <AdSpace code={settings.layout.adCodeSidebar} />
               
               <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="font-bold text-slate-900 mb-4 uppercase text-sm tracking-wider">Catégories</h3>
                  <div className="flex flex-col space-y-2">
                     {categories.map(cat => (
                        <button key={cat as string} onClick={() => goToCategory(cat as string)} className="flex justify-between items-center text-slate-600 hover:text-indigo-600 transition-colors py-2 border-b border-gray-200 last:border-0 text-sm">
                           <span>{cat as string}</span>
                           <span className="bg-white px-2 py-0.5 rounded-full text-xs text-slate-400 border">{publishedPosts.filter(p => p.category === cat).length}</span>
                        </button>
                     ))}
                  </div>
               </div>

               {/* Sidebar Ad Bottom (Replacing Newsletter) */}
               <AdSpace code={settings.layout.adCodeSidebarBottom} />
            </aside>
          </div>
        </div>
      );
    }

    // --- ARTICLE VIEW ---
    if (viewState.type === 'post') {
      const post = publishedPosts.find(p => p.id === viewState.postId);
      if (!post) return <div className="text-center py-20">Article non trouvé.</div>;

      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <article className="max-w-4xl mx-auto bg-white">
             {/* Header Ad */}
             <AdSpace code={settings.layout.adCodeArticleTop} label="Publicité" />

             {/* Breadcrumb */}
             <div className="flex items-center space-x-2 text-xs text-slate-500 mb-6 uppercase tracking-wide font-medium">
               <button onClick={goHome} className="hover:text-indigo-600">Accueil</button>
               <span className="text-slate-300">/</span>
               <button onClick={() => goToCategory(post.category)} className="hover:text-indigo-600">{post.category}</button>
             </div>

             {/* Title Block */}
             <h1 className="text-3xl md:text-5xl font-serif font-black text-slate-900 mb-6 leading-tight">{post.title}</h1>
             
             {/* Meta */}
             <div className="flex flex-wrap items-center gap-6 border-b border-gray-100 pb-6 mb-8">
                <div className="flex items-center">
                   <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold mr-3">{post.author.charAt(0)}</div>
                   <div>
                      <p className="text-sm font-bold text-slate-900 leading-none">{post.author}</p>
                      <p className="text-xs text-slate-500 mt-1">Éditeur</p>
                   </div>
                </div>
                <div className="flex items-center text-sm text-slate-500">
                   <Calendar size={16} className="mr-2" />
                   {post.date}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                   <Clock size={16} className="mr-2" />
                   5 min de lecture
                </div>
                <div className="flex-1 flex justify-end gap-2">
                   <button className="p-2 rounded-full hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"><Facebook size={18} /></button>
                   <button className="p-2 rounded-full hover:bg-sky-50 text-slate-400 hover:text-sky-500 transition-colors"><Twitter size={18} /></button>
                   <button className="p-2 rounded-full hover:bg-indigo-50 text-slate-400 hover:text-indigo-700 transition-colors"><Linkedin size={18} /></button>
                </div>
             </div>

             {/* Featured Image - NOW BELOW TITLE */}
             {post.imageUrl && (
                <div className="mb-10 rounded-xl overflow-hidden shadow-lg">
                  <img src={post.imageUrl} alt={post.title} className="w-full max-h-[500px] object-cover" />
                  <p className="text-xs text-slate-400 text-right mt-2 italic px-2">Crédit image : {post.author}</p>
                </div>
             )}

             {/* Content */}
             <div className="prose prose-lg prose-slate max-w-none font-serif leading-loose prose-a:text-indigo-600 prose-headings:font-sans prose-headings:font-bold">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
             </div>

             {/* Tags */}
             <div className="mt-12 flex flex-wrap gap-2">
               {post.tags.map(tag => (
                 <span key={tag} className="px-3 py-1 bg-gray-100 text-slate-600 rounded-full text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer">#{tag}</span>
               ))}
             </div>

             {/* Bottom Ad */}
             <AdSpace code={settings.layout.adCodeArticleBottom} />
          </article>

          {/* Comments Section */}
          <section className="max-w-3xl mx-auto mt-16 pt-10 border-t border-gray-200">
             <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
               <MessageCircle className="mr-3" /> Commentaires ({comments.length})
             </h3>

             {/* Comment Form */}
             <form onSubmit={handlePostComment} className="mb-12 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <label className="block text-sm font-bold text-slate-700 mb-2">Laisser un commentaire</label>
                <textarea 
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] mb-4 bg-white"
                  placeholder="Partagez votre avis sur cet article..."
                />
                <div className="flex justify-end">
                   <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed" disabled={!commentInput.trim()}>
                     Envoyer <Send size={16} className="ml-2" />
                   </button>
                </div>
             </form>

             {/* Comments List */}
             <div className="space-y-8">
               {comments.map(comment => (
                 <div key={comment.id} className="flex space-x-4">
                    <div className="flex-shrink-0">
                       <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                          <User size={20} />
                       </div>
                    </div>
                    <div className="flex-1">
                       <div className="flex items-baseline justify-between mb-1">
                          <h4 className="font-bold text-slate-900">{comment.author}</h4>
                          <div className="flex items-center space-x-3">
                             <span className="text-xs text-slate-500">{comment.date}</span>
                             <button onClick={() => setCommentToDelete(comment.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Supprimer">
                               <Trash2 size={14} />
                             </button>
                          </div>
                       </div>
                       <p className="text-slate-600 leading-relaxed bg-white p-4 rounded-lg border border-gray-100 shadow-sm">{comment.content}</p>
                    </div>
                 </div>
               ))}
             </div>
          </section>
        </div>
      );
    }

    // --- PAGE VIEW ---
    if (viewState.type === 'page') {
      const page = publishedPages.find(p => p.id === viewState.pageId);
      if (!page) return <div>Page non trouvée.</div>;
      return (
        <article className="max-w-3xl mx-auto animate-in fade-in duration-500 py-10">
           <h1 className="text-4xl font-serif font-bold text-slate-900 mb-8 border-b pb-4">{page.title}</h1>
           <div className="prose prose-lg prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
        </article>
      );
    }

    // --- CATEGORY VIEW ---
    if (viewState.type === 'category') {
       const categoryPosts = publishedPosts.filter(p => p.category === viewState.category);
       const startIndex = (viewState.page - 1) * settings.layout.postsPerPage;
       const visiblePosts = categoryPosts.slice(startIndex, startIndex + settings.layout.postsPerPage);
       
       return (
          <div className="animate-in fade-in duration-500">
             <div className="bg-indigo-50 p-8 rounded-xl mb-10 text-center">
                <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-2 block">Archive</span>
                <h1 className="text-3xl md:text-5xl font-serif font-black text-slate-900">{viewState.category}</h1>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {visiblePosts.map(post => (
                 <article key={post.id} className="group cursor-pointer bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all" onClick={() => goToPost(post.id as string)}>
                    <div className="h-48 overflow-hidden">
                       <img src={post.imageUrl || `https://picsum.photos/600/400?random=${post.id}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                    <div className="p-6">
                       <div className="flex items-center text-xs text-slate-500 mb-3">
                          <span className="text-indigo-600 font-bold uppercase">{post.category}</span>
                          <span className="mx-2">•</span>
                          <span>{post.date}</span>
                       </div>
                       <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-700 leading-tight mb-2">{post.title}</h3>
                       <div className="text-slate-600 text-sm line-clamp-3 mb-4" dangerouslySetInnerHTML={{__html: post.content}} />
                       <span className="text-indigo-600 text-sm font-bold flex items-center">Lire l'article <ChevronRight size={14} className="ml-1" /></span>
                    </div>
                 </article>
               ))}
             </div>
             {renderPagination(viewState.page, categoryPosts.length, 'category', viewState.category)}
          </div>
       );
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900 relative">
      
      {/* Delete Confirmation Modal */}
      {commentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Supprimer le commentaire ?</h3>
            </div>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer ce commentaire ? <br/>
              <span className="text-sm text-slate-400">Cette action est irréversible.</span>
            </p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setCommentToDelete(null)}
                className="px-4 py-2 rounded-lg text-slate-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDeleteComment}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Back Button */}
      <button onClick={onBackToAdmin} className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-3 rounded-full shadow-2xl hover:bg-slate-800 transition-transform hover:scale-110 flex items-center justify-center group" title="Retour Admin">
         <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
      </button>

      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm/50">
        {/* Main Nav */}
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo */}
          <div className="cursor-pointer flex items-center" onClick={goHome}>
             {settings.layout.logoUrl ? (
                <img src={settings.layout.logoUrl} alt={settings.name} className="h-10 md:h-12 w-auto object-contain" />
             ) : (
                <div className="flex items-center space-x-2">
                   <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-lg">N</div>
                   <span className="text-2xl font-black font-serif text-slate-900 tracking-tight">{settings.name}</span>
                </div>
             )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
             <nav className="flex space-x-6 text-sm font-bold uppercase text-slate-700 tracking-wide">
                <button onClick={goHome} className="hover:text-indigo-600 transition-colors">À la une</button>
                {/* Dynamic Categories */}
                {settings.layout.showCategoriesInMenu && categories.slice(0, 4).map(cat => (
                   <button key={cat as string} onClick={() => goToCategory(cat as string)} className="hover:text-indigo-600 transition-colors">{cat as string}</button>
                ))}
                {/* Dynamic Pages */}
                {headerPages.map(page => (
                   <button key={page.id} onClick={() => goToPage(page.id)} className="hover:text-indigo-600 transition-colors">{page.title}</button>
                ))}
             </nav>
             <button className="text-slate-400 hover:text-indigo-600">
                <Search size={20} />
             </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button className="md:hidden p-2 text-slate-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
           <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg h-screen z-50 p-6 overflow-y-auto">
              <nav className="flex flex-col space-y-4 text-lg font-bold text-slate-800">
                 <button onClick={() => { goHome(); setIsMobileMenuOpen(false); }} className="text-left py-2 border-b border-gray-50">À la une</button>
                 {categories.map(cat => (
                    <button key={cat as string} onClick={() => { goToCategory(cat as string); setIsMobileMenuOpen(false); }} className="text-left py-2 border-b border-gray-50">{cat as string}</button>
                 ))}
                 {headerPages.map(page => (
                    <button key={page.id} onClick={() => { goToPage(page.id); setIsMobileMenuOpen(false); }} className="text-left py-2 border-b border-gray-50 text-indigo-600">{page.title}</button>
                 ))}
              </nav>
           </div>
        )}
      </header>
      
      {/* Header Ad Space */}
      <div className="max-w-7xl mx-auto px-6">
         <AdSpace code={settings.layout.adCodeHeader} className="my-6" />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-grow w-full">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-20 pt-16 pb-8 border-t border-indigo-500">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
               <h3 className="text-white text-xl font-black font-serif mb-6">{settings.name}</h3>
               <p className="text-slate-400 text-sm leading-relaxed mb-6">{settings.description}</p>
               <div className="flex space-x-4">
                  <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-indigo-600 transition-colors"><Twitter size={16} /></a>
                  <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-indigo-600 transition-colors"><Facebook size={16} /></a>
               </div>
            </div>
            
            <div className="col-span-1">
               <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">Navigation</h4>
               <ul className="space-y-3 text-sm">
                  <li><button onClick={goHome} className="hover:text-white transition-colors">Accueil</button></li>
                  {categories.map(cat => (
                     <li key={cat as string}><button onClick={() => goToCategory(cat as string)} className="hover:text-white transition-colors">{cat as string}</button></li>
                  ))}
               </ul>
            </div>

            <div className="col-span-1">
               <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">Liens Utiles</h4>
               <ul className="space-y-3 text-sm">
                  {footerPages.map(page => (
                     <li key={page.id}><button onClick={() => goToPage(page.id)} className="hover:text-white transition-colors">{page.title}</button></li>
                  ))}
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            {settings.layout.footerText || `© ${new Date().getFullYear()} ${settings.name}. Tous droits réservés.`}
         </div>
      </footer>
    </div>
  );
};
