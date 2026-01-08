
import React, { useState } from 'react';
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
import { StatData, Post, BlogSettings, Page } from './types';
import { MessageSquare } from 'lucide-react';

const MOCK_STATS: StatData[] = [
  { name: 'Lun', views: 2400, visitors: 1200 },
  { name: 'Mar', views: 1398, visitors: 800 },
  { name: 'Mer', views: 9800, visitors: 2000 },
  { name: 'Jeu', views: 3908, visitors: 1890 },
  { name: 'Ven', views: 4800, visitors: 2390 },
  { name: 'Sam', views: 3800, visitors: 2000 },
  { name: 'Dim', views: 4300, visitors: 2100 },
];

const INITIAL_POSTS: Post[] = [
  { id: '1', title: 'L\'avenir du développement web en 2024', content: '<p>Le paysage du développement web évolue...</p>', status: 'published', author: 'Jean Dupont', date: '12 Oct, 2023', views: 1250, category: 'Tech', tags: ['web'] },
  { id: '2', title: 'Comprendre l\'IA générative', content: '<p>L\'intelligence artificielle générative...</p>', status: 'published', author: 'Marie Curie', date: '15 Oct, 2023', views: 3400, category: 'AI', tags: ['ai'] },
  { id: '3', title: '10 astuces Tailwind CSS', content: '<p>Tailwind CSS est devenu...', status: 'draft', author: 'Jean Dupont', date: '18 Oct, 2023', views: 0, category: 'Design', tags: ['css'] },
];

const INITIAL_PAGES: Page[] = [
  { id: 'contact', title: 'Contact', slug: '/contact', content: '<h2>Contactez-nous</h2>', status: 'published', lastModified: '10 Oct, 2023' },
  { id: 'about', title: 'À Propos', slug: '/about', content: '<h2>Notre Mission</h2>', status: 'published', lastModified: '12 Sept, 2023' },
];

const INITIAL_SETTINGS: BlogSettings = {
  name: "NEWS AI",
  description: "L'actualité de l'IA, décryptée pour vous.",
  themeColor: "#0f172a",
  language: "fr",
  layout: {
    postsPerPage: 6,
    footerText: "© 2024 NEWS AI Inc. Fait avec passion.",
    showCategoriesInMenu: true,
    logoUrl: "",
    headerMenu: ['about'],
    footerMenu: ['contact', 'about'],
    adCodeHeader: "",
    adCodeSidebar: "",
    adCodeSidebarBottom: "",
    adCodeArticleTop: "",
    adCodeArticleBottom: ""
  }
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [pages, setPages] = useState<Page[]>(INITIAL_PAGES);
  const [settings, setSettings] = useState<BlogSettings>(INITIAL_SETTINGS);
  
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Calculate derived stats for Dashboard consistency
  const totalViews = MOCK_STATS.reduce((acc, curr) => acc + curr.views, 0);
  const totalVisitors = MOCK_STATS.reduce((acc, curr) => acc + curr.visitors, 0);
  const totalArticles = posts.length;

  const handlePublishPost = (newPostData: Omit<Post, 'id' | 'date' | 'views'>) => {
    if (editingPost) {
        setPosts(posts.map(p => p.id === editingPost.id ? { ...newPostData, id: editingPost.id, date: editingPost.date, views: editingPost.views } : p));
        setEditingPost(null);
    } else {
        const newPost: Post = { ...newPostData, id: Date.now().toString(), date: new Date().toLocaleDateString('fr-FR'), views: 0 };
        setPosts([newPost, ...posts]);
    }
    setCurrentView('posts');
  };

  const handleDeletePost = (id: string) => setPosts(posts.filter(p => p.id !== id));
  const handleEditPost = (post: Post) => { setEditingPost(post); setCurrentView('create-post'); };
  const handleViewPost = (post: Post) => { setViewingPostId(post.id); setCurrentView('public'); };
  
  const handleAddPage = (pageData: { title: string; slug: string; content: string }) => {
    const newPage: Page = {
      id: Date.now().toString(),
      ...pageData,
      status: 'published',
      lastModified: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    setPages([...pages, newPage]);
  };
  
  const navigateTo = (view: string) => {
    if (view !== 'create-post') setEditingPost(null);
    if (view === 'create') { setEditingPost(null); setCurrentView('create-post'); } 
    else setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard stats={MOCK_STATS} globalStats={{ totalViews, totalVisitors, totalArticles }} />;
      case 'posts': return <Posts posts={posts} onCreatePost={() => navigateTo('create')} onView={handleViewPost} onEdit={handleEditPost} onDelete={handleDeletePost} />;
      case 'create-post': return <CreatePost initialPost={editingPost} onPublish={handlePublishPost} onCancel={() => navigateTo('posts')} />;
      case 'pages': return <Pages pages={pages} onUpdatePage={(p) => setPages(pages.map(pg => pg.id === p.id ? p : pg))} onAddPage={handleAddPage} />;
      case 'settings': return <Settings settings={settings} onUpdate={setSettings} />;
      case 'layout': return <LayoutEditor settings={settings} pages={pages} onUpdate={setSettings} />;
      case 'profile': return <Profile />;
      case 'comments': return <div className="flex flex-col items-center justify-center h-full text-slate-400"><MessageSquare size={48} /><p className="mt-2">Module Commentaires</p></div>;
      default: return <Dashboard stats={MOCK_STATS} globalStats={{ totalViews, totalVisitors, totalArticles }} />;
    }
  };

  if (currentView === 'public') return <PublicBlog settings={settings} posts={posts} pages={pages} initialPostId={viewingPostId} onBackToAdmin={() => { setViewingPostId(null); setCurrentView('dashboard'); }} />;

  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-800 font-sans overflow-hidden">
      <Sidebar currentView={currentView === 'create-post' ? 'posts' : currentView} onChangeView={navigateTo} onViewBlog={() => navigateTo('public')} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 md:ml-64 flex flex-col h-screen relative transition-all duration-300">
        <Header onNavigate={navigateTo} onLogout={() => alert('Déconnexion...')} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto min-h-[calc(100vh-140px)]">{renderContent()}</div>
        </main>
        <MobileNav 
            currentView={currentView === 'create-post' ? 'posts' : currentView} 
            onChangeView={navigateTo} 
            onOpenCreate={() => navigateTo('create')} 
            onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      </div>
    </div>
  );
};

export default App;