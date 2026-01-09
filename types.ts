
export interface UserProfile {
  id: string;
  email: string;
  blog_id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  blogs?: {
    slug: string;
  };
}

export interface Post {
  id: string;
  title: string;
  content: string; // HTML content
  status: 'published' | 'draft';
  author: string;
  date: string;
  views: number;
  category: string;
  tags: string[];
  imageUrl?: string;
  blog_id?: string; // Optional for now to support legacy/mock data
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'hidden';
  lastModified: string;
  blog_id?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  postTitle: string;
  date: string;
  status: 'approved' | 'pending';
}

export interface StatData {
  name: string;
  views: number;
  visitors: number;
}

export interface LayoutConfig {
  postsPerPage: number;
  footerText: string;
  showCategoriesInMenu: boolean;
  logoUrl: string; // Base64 or URL
  headerMenu: string[]; // Array of Page IDs
  footerMenu: string[]; // Array of Page IDs
  // Ad Codes (HTML)
  adCodeHeader: string;
  adCodeSidebar: string;
  adCodeSidebarBottom: string; // New field replacing newsletter
  adCodeArticleTop: string;
  adCodeArticleBottom: string;
}

export interface BlogSettings {
  name: string;
  description: string;
  themeColor: string;
  language: string;
  useSubdomains: boolean; // New setting for routing mode
  layout: LayoutConfig;
}
