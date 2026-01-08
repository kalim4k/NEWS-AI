
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
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'hidden';
  lastModified: string;
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
  layout: LayoutConfig;
}