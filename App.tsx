
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './pages/Dashboard';
import { Posts } from './pages/Posts';
import { CreatePost } from './pages/CreatePost';
import { Pages } from './pages/Pages';
import { Settings } from './pages/Settings';
import { LayoutEditor } from './pages/LayoutEditor';
import { PublicBlog } from './pages/PublicBlog';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import { Comments } from './pages/Comments'; 
import { StatData, Post, BlogSettings, Page, UserProfile } from './types';
import { Loader2, AlertOctagon } from 'lucide-react';
import { supabase, SUPABASE_URL } from './lib/supabase';

// Helper pour générer une semaine vide 
const getEmptyWeekStats = (): StatData[] => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  return days.map(d => ({ name: d, views: 0, visitors: 0 }));
};

const INITIAL_POSTS: Post[] = []; 
const INITIAL_PAGES: Page[] = [];

const INITIAL_SETTINGS: BlogSettings = {
  name: "NEWS AI",
  description: "L'actualité de l'IA, décryptée pour vous.",
  themeColor: "#0f172a",
  language: "fr",
  useSubdomains: true, // Activé par défaut selon votre demande
  layout: {
    postsPerPage: 6,
    footerText: "© 2024 NEWS AI Inc. Fait avec passion.",
    showCategoriesInMenu: true,
    logoUrl: "",
    headerMenu: [],
    footerMenu: [],
    adCodeHeader: "",
    adCodeSidebar: "",
    adCodeSidebarBottom: "",
    adCodeArticleTop: "",
    adCodeArticleBottom: ""
  }
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Routing State
  const [isPublicMode, setIsPublicMode] = useState(false);
  const [publicSlug, setPublicSlug] = useState<string | null>(null);
  const [blogNotFound, setBlogNotFound] = useState(false);

  const [currentView, setCurrentView] = useState('dashboard'); 
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [pages, setPages] = useState<Page[]>(INITIAL_PAGES);
  const [settings, setSettings] = useState<BlogSettings>(INITIAL_SETTINGS);
  
  const [dashboardStats, setDashboardStats] = useState<StatData[]>(getEmptyWeekStats());
  const [globalStats, setGlobalStats] = useState({ totalViews: 0, totalVisitors: 0, totalArticles: 0 });

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // 0. Initialisation : Détection du mode (Public via Sous-domaine vs Admin)
    
    const hostname = window.location.hostname; // ex: jean.newsai.fun
    let detectedSlug = null;

    // Ignorer les domaines techniques Netlify/Vercel pour éviter les faux positifs
    const isProviderDomain = hostname.includes('netlify.app') || hostname.includes('vercel.app') || hostname.includes('herokuapp.com');

    if (!isProviderDomain) {
        const parts = hostname.split('.');
        
        // Cas Localhost (ex: jean.localhost)
        if (hostname.includes('localhost')) {
            if (parts.length > 1 && parts[0] !== 'www') {
                detectedSlug = parts[0];
            }
        } 
        // Cas Production (ex: jean.newsai.fun)
        // On suppose que le domaine racine a au moins une extension (ex: newsai.fun = 2 parties)
        // Donc si on a 3 parties ou plus, la première est probablement un sous-domaine
        else if (parts.length >= 3) {
            const subdomain = parts[0];
            const reservedSubdomains = ['www', 'app', 'admin', 'dashboard', 'api'];
            
            if (!reservedSubdomains.includes(subdomain)) {
                detectedSlug = subdomain;
            }
        }
    }

    // Support fallback (optionnel, pour tests locaux ou liens legacy)
    const searchParams = new URLSearchParams(window.location.search);
    const slugFromUrl = searchParams.get('blog');

    // Priorité absolue au sous-domaine détecté
    const finalSlug = detectedSlug || slugFromUrl;

    if (finalSlug) {
      console.log("🔍 Mode Public détecté pour le slug:", finalSlug);
      setIsPublicMode(true);
      setPublicSlug(finalSlug);
      fetchPublicData(finalSlug);
      return; // On arrête ici, pas besoin de charger la session admin
    }

    // Si aucun slug -> MODE ADMIN
    if (SUPABASE_URL.includes('votre-projet')) {
        console.warn("Supabase non configuré. Mode démo local.");
        setLoading(false);
        return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    }).catch(err => {
      console.error("Erreur session:", err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- RECALCUL DES STATS ---
  useEffect(() => {
    if (posts.length >= 0) {
      const totalViews = posts.reduce((acc, post) => acc + (post.views || 0), 0);
      const totalArticles = posts.length;
      setGlobalStats({
        totalViews: totalViews,
        totalArticles: totalArticles,
        totalVisitors: 0 
      });
    }
  }, [posts]);

  // --- FETCHING DATA ---

  const fetchUserProfile = async (userId: string) => {
    try {
      if (SUPABASE_URL.includes('votre-projet')) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*, blogs(slug, id)')
        .eq('id', userId)
        .single();
      
      if (data) {
        setUserProfile(data as UserProfile);
        if (data.blog_id) fetchAdminData(data.blog_id);
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async (blogId: string) => {
      if (SUPABASE_URL.includes('votre-projet')) return;

      try {
        const { data: postsData } = await supabase.from('posts').select('*').eq('blog_id', blogId).order('date', { ascending: false });
        if (postsData) setPosts(postsData as Post[]);

        const { data: pagesData } = await supabase.from('pages').select('*').eq('blog_id', blogId);
        if (pagesData) setPages(pagesData as Page[]);
      } catch (e) {
        console.error("Erreur fetch admin data:", e);
      }
  };

  const fetchPublicData = async (slug: string) => {
    if (SUPABASE_URL.includes('votre-projet')) {
        setLoading(false);
        return; 
    }

    try {
      setLoading(true);
      setBlogNotFound(false);

      const { data: blogData, error: blogError } = await supabase
        .from('blogs')
        .select('id, name')
        .eq('slug', slug)
        .single();

      if (blogError || !blogData) {
        console.error("Blog introuvable:", slug);
        setBlogNotFound(true);
        setLoading(false);
        return;
      }

      setSettings(prev => ({ ...prev, name: blogData.name || prev.name }));

      const { data: postsData } = await supabase.from('posts').select('*').eq('blog_id', blogData.id).eq('status', 'published').order('date', { ascending: false });
      if (postsData) setPosts(postsData as Post[]);

      const { data: pagesData } = await supabase.from('pages').select('*').eq('blog_id', blogData.id).eq('status', 'published');
      if (pagesData) setPages(pagesData as Page[]);

    } catch (e) {
      console.error("Erreur fetch public data:", e);
      setBlogNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS (Admin Mode) ---

  const handlePublishPost = async (newPostData: Omit<Post, 'id' | 'date' | 'views'>) => {
    let postToSave: Post;
    if (editingPost) {
        postToSave = { ...newPostData, id: editingPost.id, date: editingPost.date, views: editingPost.views };
    } else {
        postToSave = { ...newPostData, id: Date.now().toString(), date: new Date().toLocaleDateString('fr-FR'), views: 0 };
    }

    if (editingPost) setPosts(posts.map(p => p.id === postToSave.id ? postToSave : p));
    else setPosts([postToSave, ...posts]);

    if (session && userProfile && !SUPABASE_URL.includes('votre-projet')) {
       await supabase.from('posts').upsert({...postToSave, blog_id: userProfile.blog_id});
    }

    setEditingPost(null);
    setCurrentView('posts');
  };

  const handleDeletePost = async (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
    if (session && !SUPABASE_URL.includes('votre-projet')) {
      await supabase.from('posts').delete().eq('id', id);
    }
  };

  const handleEditPost = (post: Post) => { setEditingPost(post); setCurrentView('create-post'); };
  const handleViewPost = (post: Post) => { setViewingPostId(post.id); setCurrentView('public'); }; 
  
  const handleAddPage = async (pageData: { title: string; slug: string; content: string }) => {
    const newPage: Page = {
      id: Date.now().toString(),
      ...pageData,
      status: 'published',
      lastModified: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    setPages([...pages, newPage]);
    if (session && userProfile && !SUPABASE_URL.includes('votre-projet')) {
       await supabase.from('pages').insert({...newPage, blog_id: userProfile.blog_id});
    }
  };

  const handleUpdatePage = async (updatedPage: Page) => {
    setPages(pages.map(pg => pg.id === updatedPage.id ? updatedPage : pg));
    if (session && !SUPABASE_URL.includes('votre-projet')) {
      await supabase.from('pages').upsert(updatedPage);
    }
  };

  const handleDeletePage = async (id: string) => {
    setPages(pages.filter(p => p.id !== id));
    if (session && !SUPABASE_URL.includes('votre-projet')) {
      await supabase.from('pages').delete().eq('id', id);
    }
  };
  
  const navigateTo = (view: string) => {
    if (view !== 'create-post') setEditingPost(null);
    if (view === 'create') { setEditingPost(null); setCurrentView('create-post'); } 
    else setCurrentView(view);
  };

  const handleLogout = async () => {
    if (!SUPABASE_URL.includes('votre-projet')) {
        await supabase.auth.signOut();
    }
    setSession(null);
    setUserProfile(null);
    window.location.href = window.location.origin;
  };

  const handleLoginSuccess = () => {
      if (SUPABASE_URL.includes('votre-projet')) {
          const fakeUser = { id: 'demo-user', email: 'demo@newsai.com' };
          setSession({ user: fakeUser });
          setUserProfile({ id: 'demo-user', email: 'demo@newsai.com', blog_id: 'demo-blog', username: 'Demo User', full_name: 'Utilisateur Démo', blogs: { slug: 'demo-blog' } });
      } else {
          setLoading(true);
      }
  };

  // --- RENDERING ---

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Chargement...</p>
      </div>
    );
  }

  // A. VIEW PUBLIC (VISITOR)
  if (isPublicMode) {
    if (blogNotFound) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
          <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
             <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertOctagon size={32} />
             </div>
             <h1 className="text-2xl font-bold text-slate-900 mb-2">Blog Introuvable</h1>
             <p className="text-slate-500 mb-8">
               Le blog <strong>{publicSlug}</strong> n'existe pas ou le domaine est mal configuré.
             </p>
             <div className="text-xs bg-gray-100 p-4 rounded text-left mb-6 font-mono text-slate-600">
                <p>Debug info:</p>
                <p>Host: {window.location.hostname}</p>
                <p>Slug détecté: {publicSlug}</p>
             </div>
             <a href={window.location.protocol + '//' + window.location.hostname.split('.').slice(-2).join('.')} className="block w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
               Retour à l'accueil
             </a>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-white">
        <PublicBlog 
          settings={settings} 
          posts={posts} 
          pages={pages} 
          initialPostId={null} 
          onBackToAdmin={() => {}} 
          isVisitorMode={true}
        />
      </div>
    );
  }

  // B. VIEW AUTH
  if (!session) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  const uniqueCategories = Array.from(new Set(posts.map(p => p.category).filter(Boolean))).sort();
  const currentUserName = userProfile?.username || userProfile?.full_name || session?.user?.email?.split('@')[0] || 'Auteur';

  // C. VIEW ADMIN
  const renderAdminContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard stats={dashboardStats} globalStats={globalStats} />;
      case 'posts': return <Posts posts={posts} onCreatePost={() => navigateTo('create')} onView={handleViewPost} onEdit={handleEditPost} onDelete={handleDeletePost} />;
      case 'create-post': return (
        <CreatePost 
          initialPost={editingPost} 
          onPublish={handlePublishPost} 
          onCancel={() => navigateTo('posts')}
          existingCategories={uniqueCategories} 
          currentUser={currentUserName}
        />
      );
      case 'pages': return <Pages pages={pages} onUpdatePage={handleUpdatePage} onAddPage={handleAddPage} onDeletePage={handleDeletePage} />;
      case 'settings': return <Settings settings={settings} onUpdate={setSettings} />;
      case 'layout': return <LayoutEditor settings={settings} pages={pages} onUpdate={setSettings} />;
      case 'profile': return <Profile />;
      case 'comments': return <Comments posts={posts} blogId={userProfile?.blog_id} />;
      default: return <Dashboard stats={dashboardStats} globalStats={globalStats} />;
    }
  };

  if (currentView === 'public') {
    return (
      <PublicBlog 
        settings={settings} 
        posts={posts} 
        pages={pages} 
        initialPostId={viewingPostId} 
        onBackToAdmin={() => { setViewingPostId(null); setCurrentView('dashboard'); }} 
        isVisitorMode={false}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-800 font-sans overflow-hidden">
      <Sidebar 
        currentView={currentView === 'create-post' ? 'posts' : currentView} 
        onChangeView={navigateTo} 
        onViewBlog={() => {}} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        userEmail={userProfile?.email || session.user.email}
        userName={userProfile?.username || "Utilisateur"}
        blogSlug={userProfile?.blogs?.slug}
        onLogout={handleLogout}
        useSubdomains={settings.useSubdomains} 
      />
      <div className="flex-1 md:ml-64 flex flex-col h-screen relative transition-all duration-300">
        <Header onNavigate={navigateTo} onLogout={handleLogout} userEmail={userProfile?.email || session.user.email} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto min-h-[calc(100vh-140px)]">{renderAdminContent()}</div>
        </main>
        <MobileNav currentView={currentView === 'create-post' ? 'posts' : currentView} onChangeView={navigateTo} onOpenCreate={() => navigateTo('create')} onOpenSidebar={() => setIsSidebarOpen(true)} />
      </div>
    </div>
  );
};

export default App;
