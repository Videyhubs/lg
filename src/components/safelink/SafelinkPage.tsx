'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Eye,
  User,
  Calendar,
  Share2,
  Facebook,
  Twitter,
  MessageCircle,
  ChevronRight,
  AlertTriangle,
  Lock,
  FileText,
  TrendingUp,
  Loader2,
  ArrowRight,
  Home,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import { t, tWithParams } from '@/lib/i18n';
import type { ArticleData, LinkData } from '@/types';
import AdSlot from '@/components/ads/AdSlot';

interface SafelinkError {
  type: 'expired' | 'maxClicks' | 'disabled' | 'notFound' | 'unknown';
  message: string;
}

export default function SafelinkPage() {
  const { safelinkSlug, language, goHome, settings, showNotification, setSafelinkCountdown, safelinkCountdown } =
    useAppStore();
  const lang = language;

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<SafelinkError | null>(null);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [link, setLink] = useState<LinkData | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [countdownReady, setCountdownReady] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [relatedArticles, setRelatedArticles] = useState<ArticleData[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<ArticleData[]>([]);
  const [liveVisitors] = useState(() => Math.floor(Math.random() * 151) + 50);
  const [showCta, setShowCta] = useState(false);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Fetch safelink data
  useEffect(() => {
    const fetchData = async () => {
      if (!safelinkSlug) {
        setError({ type: 'notFound', message: t('safelink.notFound', lang) });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/safelink?slug=${encodeURIComponent(safelinkSlug)}`);
        const data = await res.json();

        if (!data.success) {
          const errType = data.error as string;
          let type: SafelinkError['type'] = 'unknown';
          if (errType === 'EXPIRED') type = 'expired';
          else if (errType === 'MAX_CLICKS') type = 'maxClicks';
          else if (errType === 'DISABLED') type = 'disabled';
          else type = 'notFound';

          setError({
            type,
            message:
              type === 'expired'
                ? t('safelink.expired', lang)
                : type === 'maxClicks'
                  ? t('safelink.maxClicks', lang)
                  : type === 'disabled'
                    ? t('safelink.disabled', lang)
                    : t('safelink.notFound', lang),
          });
          setLoading(false);
          return;
        }

        // Handle password requirement
        if (data.requiresPassword) {
          setRequiresPassword(true);
          setLink(data.link);
          setLoading(false);
          return;
        }

        // Set data
        setArticle(data.article);
        setLink(data.link);
        setRedirectUrl(data.redirectUrl || data.link?.originalUrl || null);
        document.title = data.article?.title || 'LinkGuard - Safelink';

        // Fetch related & trending articles
        try {
          const [relRes, trendRes] = await Promise.all([
            fetch('/api/articles?published=true&limit=3'),
            fetch('/api/articles?published=true&limit=5&trending=true'),
          ]);
          if (relRes.ok) {
            const relData = await relRes.json();
            if (relData.success && Array.isArray(relData.data)) {
              setRelatedArticles(relData.data.filter((a: ArticleData) => a.id !== data.article?.id).slice(0, 3));
            }
          }
          if (trendRes.ok) {
            const trendData = await trendRes.json();
            if (trendData.success && Array.isArray(trendData.data)) {
              setTrendingArticles(trendData.data.slice(0, 5));
            }
          }
        } catch {
          // silent
        }

        setLoading(false);
      } catch {
        setError({ type: 'unknown', message: t('common.error', lang) });
        setLoading(false);
      }
    }

    fetchData();
  }, [safelinkSlug, lang]);

  // Countdown timer with human behavior simulation
  useEffect(() => {
    if (!redirectUrl || !article) return;

    const baseCountdown = settings?.redirectDelay || 10;
    // Simulate human behavior: random variation ±2s
    const variation = Math.floor(Math.random() * 4000) - 2000;
    const totalMs = Math.max(5000, baseCountdown * 1000 + variation);
    const totalSeconds = Math.ceil(totalMs / 1000);

    const id = requestAnimationFrame(() => {
      setCountdown(totalSeconds);
      setCountdownReady(false);
    });

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setCountdownReady(true);
          setSafelinkCountdown(0);
          return 0;
        }
        setSafelinkCountdown(prev - 1);
        return prev - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(id);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [redirectUrl, article, settings, setSafelinkCountdown]);

  // Intersection observer for CTA
  useEffect(() => {
    if (!ctaRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShowCta(true);
      },
      { threshold: 0.3 }
    );
    observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, [article]);

  // Password submit
  const handlePasswordSubmit = async () => {
    if (!passwordInput.trim() || !safelinkSlug) return;
    setPasswordLoading(true);
    setPasswordError('');

    try {
      const res = await fetch('/api/safelink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: safelinkSlug, password: passwordInput }),
      });
      const data = await res.json();

      if (!data.success) {
        setPasswordError(t('safelink.password.error', lang));
        setPasswordLoading(false);
        return;
      }

      setRequiresPassword(false);
      setArticle(data.article);
      setLink(data.link);
      setRedirectUrl(data.redirectUrl || data.link?.originalUrl || null);
      document.title = data.article?.title || 'LinkGuard - Safelink';
      setPasswordLoading(false);

      // Fetch related articles
      try {
        const [relRes, trendRes] = await Promise.all([
          fetch('/api/articles?published=true&limit=3'),
          fetch('/api/articles?published=true&limit=5&trending=true'),
        ]);
        if (relRes.ok) {
          const relData = await relRes.json();
          if (relData.success && Array.isArray(relData.data)) {
            setRelatedArticles(relData.data.filter((a: ArticleData) => a.id !== data.article?.id).slice(0, 3));
          }
        }
        if (trendRes.ok) {
          const trendData = await trendRes.json();
          if (trendData.success && Array.isArray(trendData.data)) {
            setTrendingArticles(trendData.data.slice(0, 5));
          }
        }
      } catch {
        // silent
      }
    } catch {
      setPasswordError(t('common.error', lang));
      setPasswordLoading(false);
    }
  };

  // Redirect handler
  const handleRedirect = useCallback(() => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    }
  }, [redirectUrl]);

  // Share URLs
  const getShareUrls = () => {
    if (!article) return { facebook: '#', twitter: '#', whatsapp: '#' };
    const pageUrl = window.location.href;
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedTitle = encodeURIComponent(article.title);
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    };
  };

  // ─── Loading Skeleton ───
  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Hero skeleton */}
          <Skeleton className="w-full h-64 sm:h-80 rounded-2xl mb-6" />
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-20 h-6 rounded-full" />
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-16 h-4" />
          </div>
          <Skeleton className="w-3/4 h-8 mb-2" />
          <Skeleton className="w-1/2 h-4 mb-8" />

          {/* Content skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-4" />
            ))}
            <Skeleton className="w-2/3 h-4" />
          </div>

          {/* Sidebar skeleton */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-20 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ───
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">{error.message}</h2>
          <p className="text-muted-foreground mb-6">
            {error.type === 'expired' || error.type === 'maxClicks'
              ? t('common.error', lang)
              : 'Please check the URL and try again.'}
          </p>
          <Button onClick={goHome} variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            {t('article.back', lang)}
          </Button>
        </motion.div>
      </div>
    );
  }

  // ─── Main Safelink Page ───
  const shareUrls = getShareUrls();
  const progressPercent = countdown > 0 ? ((countdownReady ? 0 : countdown) / 10) * 100 : 0;

  return (
    <div className="min-h-screen">
      {/* Fake Live Visitor Counter */}
      <div className="fixed bottom-4 left-4 z-30">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2, duration: 0.4 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 text-xs text-muted-foreground shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-medium">{liveVisitors}</span>
          <span>{t('safelink.liveVisitors', lang)}</span>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Ad Slot */}
        <AdSlot position="banner_top" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main Article Column ── */}
          <div className="lg:col-span-2">
            {article && (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Hero Image */}
                {article.thumbnail && (
                  <div className="relative rounded-2xl overflow-hidden mb-6">
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-56 sm:h-72 md:h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      {article.category && (
                        <Badge className="mb-2 bg-white/20 text-white backdrop-blur-sm border-white/20 hover:bg-white/30">
                          {article.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
                  {article.category && !article.thumbnail && (
                    <Badge variant="secondary">{article.category}</Badge>
                  )}
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {article.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readTime} {t('safelink.readTime', lang)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {article.fakeViews.toLocaleString()} {t('safelink.views', lang)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(article.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-6">
                  {article.title}
                </h1>

                {/* Share Buttons */}
                <div className="flex items-center gap-2 mb-8">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" />
                    {t('safelink.share', lang)}:
                  </span>
                  <a
                    href={shareUrls.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:border-blue-500/30 transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href={shareUrls.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-sky-500 hover:border-sky-500/30 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href={shareUrls.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:border-emerald-500/30 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>

                <Separator className="mb-8 bg-border/50" />

                {/* Article Content */}
                <div
                  className="prose prose-neutral dark:prose-invert max-w-none
                    prose-headings:text-foreground prose-headings:font-bold
                    prose-p:text-muted-foreground prose-p:leading-relaxed
                    prose-a:text-purple-500 dark:prose-a:text-purple-400
                    prose-strong:text-foreground
                    prose-img:rounded-xl prose-img:border prose-img:border-border/50
                    prose-blockquote:border-l-purple-500 prose-blockquote:text-muted-foreground
                    prose-code:text-purple-500 dark:prose-code:text-purple-400
                    prose-li:text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* ── In-Article Ad Slot ── */}
                <div className="my-8">
                  <AdSlot position="in_article" />
                </div>

                {/* ── CTA: Continue to Destination ── */}
                <div ref={ctaRef} className="my-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={showCta ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="relative"
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl blur-xl" />

                    <Card className="relative bg-card/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden">
                      {/* Top gradient line */}
                      <div className="h-0.5 w-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500" />

                      <CardContent className="p-6 sm:p-8 text-center">
                        {!countdownReady ? (
                          <>
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                              <Lock className="w-7 h-7 text-purple-500" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">
                              {t('safelink.verify', lang)}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {tWithParams('safelink.countdown', { seconds: countdown }, lang)}
                            </p>
                            <div className="max-w-xs mx-auto mb-4">
                              <Progress
                                value={progressPercent}
                                className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-cyan-500"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {t('safelink.countdown.button', lang)}
                            </p>
                          </>
                        ) : (
                          <AnimatePresence>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4 }}
                            >
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
                                <ExternalLink className="w-7 h-7 text-white" />
                              </div>
                              <h3 className="text-xl font-bold text-foreground mb-2">
                                {t('safelink.continue', lang)}
                              </h3>
                              <Button
                                size="lg"
                                onClick={handleRedirect}
                                className="mt-4 px-8 py-6 text-base font-semibold bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-90 transition-all border-0 rounded-xl"
                              >
                                {t('safelink.download', lang)}
                                <ArrowRight className="w-5 h-5 ml-2" />
                              </Button>
                            </motion.div>
                          </AnimatePresence>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* ── Bottom Ad Slot ── */}
                <AdSlot position="banner_bottom" />
              </motion.article>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Widget */}
            {trendingArticles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                        {t('safelink.trending', lang)}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {trendingArticles.map((trend, index) => (
                        <button
                          key={trend.id}
                          onClick={() => {
                            if (trend.slug) {
                              window.open(`/article/${trend.slug}`, '_blank');
                            }
                          }}
                          className="flex items-start gap-3 w-full text-left group cursor-pointer"
                        >
                          <span className="text-lg font-bold text-purple-500/50 mt-0.5 min-w-[24px]">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                              {trend.title}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {trend.fakeViews.toLocaleString()} {t('safelink.views', lang)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl">
                  <CardContent className="p-5">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                      {t('safelink.related', lang)}
                    </h3>
                    <div className="space-y-4">
                      {relatedArticles.map((rel) => (
                        <button
                          key={rel.id}
                          onClick={() => {
                            if (rel.slug) {
                              window.open(`/article/${rel.slug}`, '_blank');
                            }
                          }}
                          className="flex items-start gap-3 w-full text-left group cursor-pointer"
                        >
                          {rel.thumbnail ? (
                            <img
                              src={rel.thumbnail}
                              alt={rel.title}
                              className="w-16 h-12 rounded-lg object-cover flex-shrink-0 group-hover:opacity-80 transition-opacity"
                            />
                          ) : (
                            <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-purple-500/10 to-cyan-500/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-purple-500/30" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                              {rel.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>{rel.author}</span>
                              <span>&middot;</span>
                              <span>{rel.readTime} {t('safelink.readTime', lang)}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Password Dialog ── */}
      <Dialog open={requiresPassword} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-500" />
              {t('safelink.password.title', lang)}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This link is password protected. Please enter the password to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Input
              type="password"
              placeholder={t('safelink.password.placeholder', lang)}
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePasswordSubmit();
              }}
              className="h-11"
              autoFocus
            />
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={goHome}
              className="gap-2"
            >
              {t('common.cancel', lang)}
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              disabled={!passwordInput.trim() || passwordLoading}
              className="gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0"
            >
              {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('safelink.password.submit', lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
