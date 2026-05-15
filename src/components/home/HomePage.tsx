'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Shield,
  Eye,
  BarChart3,
  Globe,
  QrCode,
  Code2,
  ArrowRight,
  TrendingUp,
  Link2,
  Users,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import { t } from '@/lib/i18n';
import type { ArticleData, StatsData } from '@/types';

/* ─── Animated Counter Hook ─── */
function useAnimatedCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  const start = useCallback(() => {
    if (started.current) return;
    started.current = true;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return { count, start };
}

/* ─── Feature Data ─── */
const features = [
  {
    key: 'safelink',
    icon: Shield,
    gradient: 'from-purple-500 to-violet-600',
    shadowColor: 'shadow-purple-500/20',
  },
  {
    key: 'cloaking',
    icon: Eye,
    gradient: 'from-cyan-500 to-teal-600',
    shadowColor: 'shadow-cyan-500/20',
  },
  {
    key: 'analytics',
    icon: BarChart3,
    gradient: 'from-fuchsia-500 to-pink-600',
    shadowColor: 'shadow-fuchsia-500/20',
  },
  {
    key: 'custom',
    icon: Globe,
    gradient: 'from-violet-500 to-purple-600',
    shadowColor: 'shadow-violet-500/20',
  },
  {
    key: 'qr',
    icon: QrCode,
    gradient: 'from-teal-500 to-cyan-600',
    shadowColor: 'shadow-teal-500/20',
  },
  {
    key: 'api',
    icon: Code2,
    gradient: 'from-pink-500 to-fuchsia-600',
    shadowColor: 'shadow-pink-500/20',
  },
];

/* ─── Stats Card ─── */
function StatCard({
  icon: Icon,
  label,
  value,
  targetValue,
  onStart,
  gradient,
}: {
  icon: typeof Link2;
  label: string;
  value: number;
  targetValue: number;
  onStart: () => void;
  gradient: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (inView) onStart();
  }, [inView, onStart]);

  return (
    <div ref={ref} className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <Card className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl py-5 hover:border-purple-500/30 transition-colors">
        <CardContent className="flex flex-col items-center gap-2 p-0">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${gradient.includes('purple') ? 'shadow-purple-500/20' : gradient.includes('cyan') ? 'shadow-cyan-500/20' : 'shadow-fuchsia-500/20'}`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">
            {value.toLocaleString()}+
          </span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {label}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Main Component ─── */
export default function HomePage() {
  const { language, navigate, settings } = useAppStore();
  const lang = language;
  const siteName = settings?.siteName || 'LinkGuard';

  const [stats, setStats] = useState<StatsData | null>(null);
  const [trendingArticles, setTrendingArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats counters
  const linksCounter = useAnimatedCounter(stats?.totalLinks || 0);
  const clicksCounter = useAnimatedCounter(stats?.totalClicks || 0);
  const articlesCounter = useAnimatedCounter(stats?.totalArticles || 0);
  const visitorsCounter = useAnimatedCounter(stats?.uniqueVisitors || 0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, articlesRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/articles?published=true'),
        ]);
        if (statsRes.ok) {
          const data = await statsRes.json();
          if (data.success) setStats(data.data);
        }
        if (articlesRes.ok) {
          const data = await articlesRes.json();
          if (data.success && Array.isArray(data.data)) {
            setTrendingArticles(data.data.slice(0, 3));
          }
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleScrollToFeatures = () => {
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 text-sm text-purple-500 dark:text-purple-400 font-medium mb-6"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {t('home.hero.subtitle', lang).split('.')[0]}
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              {t('home.hero.title', lang).split(', ').map((part, i) =>
                i === 1 ? (
                  <span
                    key={i}
                    className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent"
                  >
                    {part}
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              {t('home.hero.subtitle', lang)}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                onClick={() => navigate('create')}
                className="px-8 py-6 text-base font-semibold bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-90 transition-all border-0 rounded-xl"
              >
                <Link2 className="w-5 h-5 mr-2" />
                {t('home.hero.cta', lang)}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleScrollToFeatures}
                className="px-8 py-6 text-base font-semibold rounded-xl border-border/50 hover:border-purple-500/30"
              >
                {t('home.hero.cta2', lang)}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative -mt-8 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))
            ) : (
              <>
                <StatCard
                  icon={Link2}
                  label={t('home.stats.links', lang)}
                  value={linksCounter.count}
                  targetValue={stats?.totalLinks || 0}
                  onStart={linksCounter.start}
                  gradient="from-purple-500 to-violet-600"
                />
                <StatCard
                  icon={BarChart3}
                  label={t('home.stats.clicks', lang)}
                  value={clicksCounter.count}
                  targetValue={stats?.totalClicks || 0}
                  onStart={clicksCounter.start}
                  gradient="from-cyan-500 to-teal-600"
                />
                <StatCard
                  icon={FileText}
                  label={t('home.stats.articles', lang)}
                  value={articlesCounter.count}
                  targetValue={stats?.totalArticles || 0}
                  onStart={articlesCounter.start}
                  gradient="from-fuchsia-500 to-pink-600"
                />
                <StatCard
                  icon={Users}
                  label={t('home.stats.visitors', lang)}
                  value={visitorsCounter.count}
                  targetValue={stats?.uniqueVisitors || 0}
                  onStart={visitorsCounter.start}
                  gradient="from-violet-500 to-purple-600"
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features-section" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t('home.features.title', lang)}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg ${feature.shadowColor} mb-4`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {t(`home.features.${feature.key}`, lang)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(`home.features.${feature.key}.desc`, lang)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-cyan-500/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20" style={{ opacity: 0.03 }} />
            <div className="absolute top-0 left-1/3 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />

            <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 sm:p-12 lg:p-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {t('home.hero.title', lang)}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                {t('home.hero.subtitle', lang)}
              </p>
              <Button
                size="lg"
                onClick={() => navigate('create')}
                className="px-8 py-6 text-base font-semibold bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-90 transition-all border-0 rounded-xl"
              >
                {t('home.hero.cta', lang)}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trending Articles ── */}
      {trendingArticles.length > 0 && (
        <section className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {t('safelink.trending', lang)}
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                </div>
                <Badge
                  variant="outline"
                  className="text-purple-500 dark:text-purple-400 border-purple-500/30"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Hot
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendingArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => navigate('article', article.slug)}
                      className="group w-full text-left cursor-pointer"
                    >
                      <Card className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:border-purple-500/30 transition-all duration-300 overflow-hidden h-full">
                        {/* Thumbnail */}
                        {article.thumbnail ? (
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={article.thumbnail}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                          </div>
                        ) : (
                          <div className="h-40 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 flex items-center justify-center">
                            <FileText className="w-10 h-10 text-purple-500/30" />
                          </div>
                        )}
                        <CardContent className="p-5">
                          {article.category && (
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium mb-3"
                            >
                              {article.category}
                            </Badge>
                          )}
                          <h3 className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors mb-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{article.author}</span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                            <span>
                              {article.readTime} {t('safelink.readTime', lang)}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                            <span>
                              {article.fakeViews.toLocaleString()} {t('safelink.views', lang)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
