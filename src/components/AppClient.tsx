'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Notification from '@/components/shared/Notification';
import HomePage from '@/components/home/HomePage';
import SafelinkPage from '@/components/safelink/SafelinkPage';
import ShortlinkCreator from '@/components/shortlink/ShortlinkCreator';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import DeploymentGuide from '@/components/deploy/DeploymentGuide';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingView() {
  return (
    <div className="flex-1 flex items-center justify-center py-32">
      <div className="space-y-4 w-full max-w-md px-4">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl mt-6" />
      </div>
    </div>
  );
}

function AppRouter() {
  const { currentView, setSettings, setAdSlots, isAdmin, navigate, safelinkSlug } = useAppStore();
  const searchParams = useSearchParams();

  // Handle URL query params for deep linking
  useEffect(() => {
    const slug = searchParams.get('l');
    if (slug && currentView === 'home') {
      navigate('safelink', slug);
    }
  }, [searchParams, navigate, currentView]);

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setSettings(data.data);
          }
        }
      } catch {
        // silent
      }
      try {
        const res = await fetch('/api/ads');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setAdSlots(data.data);
          }
        }
      } catch {
        // silent
      }
    }
    loadInitialData();
  }, [setSettings, setAdSlots]);

  // Update document title based on current view
  useEffect(() => {
    const titles: Record<string, string> = {
      home: 'LinkGuard - Smart Shortlink & Safelink Platform',
      create: 'Create Short Link - LinkGuard',
      safelink: safelinkSlug || 'LinkGuard',
      'admin-login': 'Admin Login - LinkGuard',
      admin: 'Dashboard - LinkGuard Admin',
      article: 'Article - LinkGuard',
      deploy: 'Deployment Guide - LinkGuard',
    };
    document.title = titles[currentView] || 'LinkGuard';
  }, [currentView, safelinkSlug]);

  const showLayout = currentView !== 'safelink';

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'safelink':
        return <SafelinkPage />;
      case 'create':
        return <ShortlinkCreator />;
      case 'admin-login':
        return <AdminLogin />;
      case 'admin':
        return isAdmin ? <AdminDashboard /> : <AdminLogin />;
      case 'article':
        return <HomePage />;
      case 'deploy':
        return <DeploymentGuide />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {showLayout && <Header />}
      <main className="flex-1">
        <Suspense fallback={<LoadingView />}>
          {renderView()}
        </Suspense>
      </main>
      {showLayout && <Footer />}
      <Notification />
    </div>
  );
}

export default function AppClient() {
  return <AppRouter />;
}
