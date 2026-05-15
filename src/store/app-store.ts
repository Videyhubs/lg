import { create } from 'zustand';

import type { AppView, Language, AdminTab, SiteSettings, LinkData, ArticleData, AdSlotData, StatsData } from '@/types';

interface AppState {
  // Navigation
  currentView: AppView;
  safelinkSlug: string | null;
  articleSlug: string | null;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Navigation actions
  navigate: (view: AppView, slug?: string | null) => void;
  goHome: () => void;
  
  // Admin
  isAdmin: boolean;
  adminTab: AdminTab;
  adminToken: string | null;
  loginAdmin: (token: string) => void;
  logoutAdmin: () => void;
  setAdminTab: (tab: AdminTab) => void;
  
  // Data cache
  settings: SiteSettings | null;
  setSettings: (settings: SiteSettings) => void;
  
  links: LinkData[];
  setLinks: (links: LinkData[]) => void;
  
  articles: ArticleData[];
  setArticles: (articles: ArticleData[]) => void;
  
  adSlots: AdSlotData[];
  setAdSlots: (slots: AdSlotData[]) => void;
  
  stats: StatsData | null;
  setStats: (stats: StatsData) => void;
  
  // Safelink state
  safelinkCountdown: number;
  setSafelinkCountdown: (count: number) => void;
  
  // Notification
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  clearNotification: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'home',
  safelinkSlug: null,
  articleSlug: null,
  
  // Language
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  
  // Navigation actions
  navigate: (view, slug) => set({
    currentView: view,
    safelinkSlug: slug || null,
    articleSlug: slug || null,
  }),
  goHome: () => set({
    currentView: 'home',
    safelinkSlug: null,
    articleSlug: null,
  }),
  
  // Admin
  isAdmin: false,
  adminTab: 'dashboard',
  adminToken: typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null,
  loginAdmin: (token) => {
    localStorage.setItem('admin_token', token);
    set({ isAdmin: true, adminToken: token, currentView: 'admin' });
  },
  logoutAdmin: () => {
    localStorage.removeItem('admin_token');
    set({ isAdmin: false, adminToken: null, currentView: 'home', adminTab: 'dashboard' });
  },
  setAdminTab: (tab) => set({ adminTab: tab }),
  
  // Data cache
  settings: null,
  setSettings: (settings) => set({ settings }),
  
  links: [],
  setLinks: (links) => set({ links }),
  
  articles: [],
  setArticles: (articles) => set({ articles }),
  
  adSlots: [],
  setAdSlots: (slots) => set({ adSlots: slots }),
  
  stats: null,
  setStats: (stats) => set({ stats }),
  
  // Safelink
  safelinkCountdown: 0,
  setSafelinkCountdown: (count) => set({ safelinkCountdown: count }),
  
  // Notification
  notification: null,
  showNotification: (type, message) => {
    set({ notification: { type, message } });
    setTimeout(() => set({ notification: null }), 4000);
  },
  clearNotification: () => set({ notification: null }),
}));
