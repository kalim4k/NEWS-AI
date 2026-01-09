
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
import { Comments } from './pages/Comments'; // Import
import { StatData, Post, BlogSettings, Page, UserProfile } from './types';
import { Loader2, AlertOctagon } from 'lucide-react';
import { supabase, SUPABASE_URL } from './lib/supabase';

// Helper pour générer une semaine vide (Données réelles à 0 par défaut)
const getEmptyWeekStats = (): StatData[] => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  return days.map(d => ({ name: d, views: 0, visitors: 0 }));
};

const INITIAL_POSTS: Post[] = []; // On commence vide pour charger la DB
const INITIAL_PAGES: Page[] = [];

const INITIAL_SETTINGS: BlogSettings = {
  name: "NEWS AI",
  description: "L'actualité de l'IA, décryptée pour vous.",
  themeColor: "#0f172a",
  language: "fr",
  useSubdomains: false, // Par défaut désactivé pour éviter les erreurs DNS
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
  
  // Real Time Stats State
  const [dashboardStats, setDashboardStats] = useState<StatData[]>(getEmptyWeekStats());
  const [globalStats, setGlobalStats] = useState({ totalViews: 0, totalVisitors: 0, totalArticles: 0 });

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // 0. Initialisation : Vérifier si on est en "Mode Public" (Visiteur) ou "Mode Admin"
    
    // --- NOUVELLE LOGIQUE SOUS-DOMAINE ---
    const hostname = window.location.hostname; // ex: jean.monsite.com
    const parts = hostname.split('.');
    let detectedSlug = null;

    // IMPORTANT: Ignorer les domaines de déploiement par défaut où le sous-domaine est l'app elle-même
    // ex: my-app.netlify.app -> 'my-app' n'est pas un blog, c'est l'admin.
    const isProviderDomain = hostname.includes('netlify.app') || hostname.includes('vercel.app') || hostname.includes('herokuapp.com');

    // Cas Localhost (ex: jean.localhost)
    if (hostname.includes('localhost') && parts.length > 1) {
        detectedSlug = parts[0]; 
    } 
    // Cas Production (ex: jean.newsai.com)
    else if (!isProviderDomain && parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'app') {
        detectedSlug = parts[0];
    }

    // Support fallback paramètre URL (?blog=slug) pour le dev facile si pas de DNS wildcard
    const searchParams = new URLSearchParams(window.location.search);
    const slugFromUrl = searchParams.get('blog');

    const finalSlug = detectedSlug || slugFromUrl;

    if (finalSlug) {
      // MODE PUBLIC : On affiche le blog correspondant au slug
      setIsPublicMode(true);
      setPublicSlug(finalSlug);
      fetchPublicData(finalSlug);
      // On ne set PAS loading à false ici, on attend le fetch
      return;
    }

    // MODE ADMIN : On vérifie l'authentification
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
  // À chaque fois que 'posts' change (chargement initial ou ajout/suppression), on met à jour les stats
  useEffect(() => {
    if (posts.length >= 0) {
      const totalViews = posts.reduce((acc, post) => acc + (post.views || 0), 0);
      const totalArticles = posts.length;
      // Note: Pour les visiteurs uniques et les courbes historiques, il faudrait une table 'analytics' dédiée.
      // Pour l'instant, on affiche 0 visiteurs uniques réels (car non trackés) et les totaux calculés.
      setGlobalStats({
        totalViews: totalViews,
        totalArticles: totalArticles,
        totalVisitors: 0 
      });
    }
  }, [posts]);

  // --- FETCHING DATA ---

  // 1. Fetch User Profile (Admin Mode)
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
        // Une fois le profil chargé, on charge les données du blog de cet utilisateur
        if (data.blog_id) fetchAdminData(data.blog_id);
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Blog Data for Admin (Filtered by blog_id)
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

  // 3. Fetch Public Blog Data (Visitor Mode)
  const fetchPublicData = async (slug: string) => {
    if (SUPABASE_URL.includes('votre-projet')) {
        setLoading(false);
        return; // Mock data déjà chargé par défaut
    }

    try {
      setLoading(true);
      setBlogNotFound(false);

      // Trouver l'ID du blog via le slug
      const { data: blogData, error: blogError } = await supabase
        .from('blogs')
        .select('id, name')
        .eq('slug', slug)
        .single();

      if (blogError || !blogData) {
        console.error("Blog introuvable:", slug);
        setBlogNotFound(true); // Affiche la page 404
        setLoading(false);
        return;
      }

      // Mettre à jour le nom du blog dans les settings pour l'affichage
      setSettings(prev => ({ ...prev, name: blogData.name || prev.name }));

      // Charger les posts et pages de ce blog
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
  const handleViewPost = (post: Post) => { setViewingPostId(post.id); setCurrentView('public'); }; // Aperçu interne
  
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
    // Rediriger vers l'accueil admin (nettoyer URL)
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
               Le blog <strong>{publicSlug}</strong> n'existe pas ou a été supprimé.
             </p>
             <a href={window.location.origin} className="block w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
               Créer mon propre blog
             </a>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-white">
        {/* On masque le bouton retour admin pour les visiteurs */}
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

  // Calculate derived stats
  // CES VARIABLES NE SONT PLUS UTILISÉES DIRECTEMENT, ON UTILISE globalStats
  
  // NOUVEAU : Récupérer les catégories uniques et le nom d'utilisateur
  const uniqueCategories = Array.from(new Set(posts.map(p => p.category).filter(Boolean))).sort();
  const currentUserName = userProfile?.username || userProfile?.full_name || session?.user?.email?.split('@')[0] || 'Auteur';

  // C. VIEW ADMIN
  const renderAdminContent = () => {
    switch (currentView) {
      // ON PASSE MAINTENANT dashboardStats (vide/plat) et globalStats (calculé)
      case 'dashboard': return <Dashboard stats={dashboardStats} globalStats={globalStats} />;
      case 'posts': return <Posts posts={posts} onCreatePost={() => navigateTo('create')} onView={handleViewPost} onEdit={handleEditPost} onDelete={handleDeletePost} />;
      case 'create-post': return (
        <CreatePost 
          initialPost={editingPost} 
          onPublish={handlePublishPost} 
          onCancel={() => navigateTo('posts')}
          existingCategories={uniqueCategories} // Passer les catégories existantes
          currentUser={currentUserName} // Passer l'utilisateur actuel
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

  // Preview Mode inside Admin
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
        onViewBlog={() => { /* Handled by href in Sidebar now */ }} 
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
