import { Suspense } from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import AppClient from '@/components/AppClient';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Dynamic OG Meta Tags for Facebook Cloaking ───
// When a safelink slug is provided via ?l=slug, we fetch the link and a random article
// to generate proper Open Graph meta tags. Facebook crawler sees the article preview,
// not the actual redirect destination.

type Props = {
  searchParams: Promise<{ l?: string; v?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const slug = params.l;

  if (slug) {
    try {
      // Find the link by slug
      const link = await db.link.findUnique({
        where: { slug },
      });

      if (link) {
        // Get a random published article for OG meta tags
        const articles = await db.article.findMany({
          where: { isPublished: true },
        });

        if (articles.length > 0) {
          const randomIndex = Math.floor(Math.random() * articles.length);
          const article = articles[randomIndex];

          const siteUrl = 'https://linkguard.app';

          return {
            title: article.title,
            description: article.excerpt || `Read "${article.title}" on LinkGuard - Your trusted source for quality content.`,
            openGraph: {
              title: article.title,
              description: article.excerpt || `Read "${article.title}" on LinkGuard.`,
              url: `${siteUrl}/?l=${slug}`,
              siteName: 'LinkGuard',
              type: 'article',
              publishedTime: article.createdAt.toISOString(),
              authors: [article.author],
              ...(article.thumbnail ? {
                images: [{
                  url: article.thumbnail,
                  width: 800,
                  height: 400,
                  alt: article.title,
                }],
              } : {}),
            },
            twitter: {
              card: 'summary_large_image',
              title: article.title,
              description: article.excerpt || `Read "${article.title}" on LinkGuard.`,
              ...(article.thumbnail ? {
                images: [article.thumbnail],
              } : {}),
            },
          };
        }
      }
    } catch {
      // Fallback to default metadata
    }
  }

  // Default metadata
  return {
    title: 'LinkGuard - Smart Shortlink & Safelink Platform',
    description: 'Professional link management with smart safelink protection, URL cloaking, analytics, and more. Facebook-safe redirect system.',
    keywords: ['shortlink', 'safelink', 'URL cloaking', 'link management', 'redirect', 'analytics', 'Facebook safe', 'link protector'],
    authors: [{ name: 'LinkGuard' }],
    openGraph: {
      title: 'LinkGuard - Smart Shortlink Platform',
      description: 'Professional link management with smart safelink protection and analytics.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'LinkGuard - Smart Shortlink Platform',
      description: 'Professional link management with smart safelink protection and analytics.',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function LoadingView() {
  return (
    <div className="min-h-screen flex items-center justify-center py-32">
      <div className="space-y-4 w-full max-w-md px-4">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl mt-6" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingView />}>
      <AppClient />
    </Suspense>
  );
}
