// === Core Types ===

export type Language = 'en' | 'id';

export interface LinkData {
  id: string;
  slug: string;
  originalUrl: string;
  customSlug: string | null;
  title: string | null;
  password: string | null;
  expiresAt: string | null;
  maxClicks: number | null;
  geoTarget: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { clicks: number };
}

export interface ArticleData {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  thumbnail: string | null;
  category: string | null;
  tags: string | null;
  author: string;
  readTime: number;
  trendingScore: number;
  fakeViews: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClickData {
  id: string;
  linkId: string;
  ip: string | null;
  country: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  referer: string | null;
  isBot: boolean;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  accentColor: string;
  footerText: string;
  customDomain: string;
  language: 'en' | 'id';
  theme: 'light' | 'dark' | 'auto';
  maintenanceMode: boolean;
  adminPath: string;
  redirectDelay: number;
  enableAds: boolean;
  customHeadScript: string;
  customBodyScript: string;
  ogDefaultImage: string;
  enableCloaking: boolean;
  fakeLiveVisitors: boolean;
}

export interface AdSlotData {
  id: string;
  name: string;
  position: string;
  scriptHtml: string | null;
  isEnabled: boolean;
  deviceTarget: string | null;
  frequencyCap: number | null;
  priority: number;
}

export interface StatsData {
  totalClicks: number;
  todayClicks: number;
  uniqueVisitors: number;
  totalLinks: number;
  totalArticles: number;
  topLinks: { slug: string; title: string | null; clicks: number }[];
  topArticles: { slug: string; title: string; views: number }[];
  deviceStats: { device: string; count: number }[];
  browserStats: { browser: string; count: number }[];
  referrerStats: { referrer: string; count: number }[];
  dailyClicks: { date: string; clicks: number }[];
}

export type AppView = 
  | 'home'
  | 'safelink'
  | 'create'
  | 'admin-login'
  | 'admin'
  | 'article'
  | 'deploy';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SafelinkState {
  link: LinkData | null;
  article: ArticleData | null;
  countdown: number;
  isVerified: boolean;
  isLoading: boolean;
  redirectUrl: string | null;
}

export type AdminTab = 
  | 'dashboard'
  | 'links'
  | 'articles'
  | 'ads'
  | 'settings'
  | 'branding'
  | 'security'
  | 'export';
