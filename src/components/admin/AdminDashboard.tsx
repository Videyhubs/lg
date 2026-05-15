'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Link2, FileText, Megaphone, Settings, Palette,
  Shield, Download, LogOut, Search, Plus, Trash2, Copy, Edit,
  Eye, MousePointer, Globe, Monitor, Smartphone, Tablet,
  Loader2, Check, Save, Upload, FileDown, RefreshCw,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription,
} from '@/components/ui/sheet';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

import { useAppStore } from '@/store/app-store';
import { t } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';
import type { AdminTab, LinkData, ArticleData, AdSlotData, SiteSettings, ApiResponse } from '@/types';

// ============================================================
// Constants
// ============================================================

const SIDEBAR_ITEMS: { tab: AdminTab; icon: React.ElementType; labelKey: string }[] = [
  { tab: 'dashboard', icon: LayoutDashboard, labelKey: 'admin.dashboard' },
  { tab: 'links', icon: Link2, labelKey: 'admin.links' },
  { tab: 'articles', icon: FileText, labelKey: 'admin.articles' },
  { tab: 'ads', icon: Megaphone, labelKey: 'admin.ads' },
  { tab: 'settings', icon: Settings, labelKey: 'admin.settings' },
  { tab: 'branding', icon: Palette, labelKey: 'admin.branding' },
  { tab: 'security', icon: Shield, labelKey: 'admin.security' },
  { tab: 'export', icon: Download, labelKey: 'admin.export' },
];

const chartConfig = {
  clicks: { label: 'Clicks', color: '#10b981' },
};

const ITEMS_PER_PAGE = 10;

// ============================================================
// Helper: Auth Header
// ============================================================

function authHeader(token: string | null): Record<string, string> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ============================================================
// Dashboard Stats Tab
// ============================================================

function DashboardTab() {
  const { stats, setStats, language, adminToken } = useAppStore();
  const lang = language as Language;

  useEffect(() => {
    fetch('/api/stats', { headers: authHeader(adminToken) })
      .then((r) => r.json())
      .then((data: ApiResponse<Record<string, unknown>>) => {
        if (data.success && data.data) {
          setStats(data.data as never);
        }
      })
      .catch(() => { /* silent */ });
  }, [adminToken, setStats]);

  const statCards = [
    { label: t('admin.stats.totalClicks', lang), value: stats?.totalClicks ?? 0, icon: MousePointer, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: t('admin.stats.todayClicks', lang), value: stats?.todayClicks ?? 0, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: t('admin.stats.uniqueVisitors', lang), value: stats?.uniqueVisitors ?? 0, icon: Globe, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: t('admin.stats.totalLinks', lang), value: stats?.totalLinks ?? 0, icon: Link2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  const deviceIcons: Record<string, React.ElementType> = { Mobile: Smartphone, Desktop: Monitor, Tablet: Tablet };

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Daily Clicks (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.dailyClicks && stats.dailyClicks.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={stats.dailyClicks}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="var(--color-clicks)"
                  fill="var(--color-clicks)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              {t('admin.noData', lang)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Links & Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Links</CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {stats.topLinks && stats.topLinks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slug</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topLinks.map((l) => (
                    <TableRow key={l.slug}>
                      <TableCell className="font-mono text-xs">{l.slug}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{l.title || '—'}</TableCell>
                      <TableCell className="text-right font-semibold">{l.clicks.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">{t('admin.noData', lang)}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Articles</CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {stats.topArticles && stats.topArticles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topArticles.map((a) => (
                    <TableRow key={a.slug}>
                      <TableCell className="max-w-[200px] truncate">{a.title}</TableCell>
                      <TableCell className="text-right font-semibold">{a.views.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">{t('admin.noData', lang)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Device Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Device Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.deviceStats && stats.deviceStats.length > 0 ? (
            <div className="space-y-3">
              {stats.deviceStats.map((d) => {
                const total = stats.deviceStats.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
                const Icon = deviceIcons[d.device] || Monitor;
                return (
                  <div key={d.device} className="flex items-center gap-4">
                    <div className="w-24 flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                      <Icon className="h-4 w-4" />
                      {d.device}
                    </div>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">{pct}%</span>
                    <span className="text-xs text-muted-foreground w-16 text-right">{d.count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-6">{t('admin.noData', lang)}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Manage Links Tab
// ============================================================

function ManageLinksTab() {
  const { links, setLinks, adminToken, language, settings, showNotification } = useAppStore();
  const lang = language as Language;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/links', { headers: authHeader(adminToken) })
      .then((r) => r.json())
      .then((data: ApiResponse<LinkData[]>) => {
        if (data.success && data.data) setLinks(data.data);
      })
      .catch(() => { /* silent */ });
  }, [adminToken, setLinks]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetch('/api/links', { headers: authHeader(adminToken) })
      .then((r) => r.json())
      .then((data: ApiResponse<LinkData[]>) => {
        if (data.success && data.data) setLinks(data.data);
      })
      .catch(() => { /* silent */ })
      .finally(() => setRefreshing(false));
  }, [adminToken, setLinks]);

  const filtered = links.filter(
    (l) =>
      l.slug.toLowerCase().includes(search.toLowerCase()) ||
      (l.title || '').toLowerCase().includes(search.toLowerCase()) ||
      l.originalUrl.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/links/${id}`, { method: 'DELETE', headers: authHeader(adminToken) });
      const data: ApiResponse = await res.json();
      if (data.success) {
        setLinks(links.filter((l) => l.id !== id));
        showNotification('success', t('common.success', lang));
      } else {
        showNotification('error', data.error || t('common.error', lang));
      }
    } catch {
      showNotification('error', t('common.error', lang));
    }
  };

  const copyLink = (slug: string, id: string) => {
    const base = settings?.siteUrl || window.location.origin;
    navigator.clipboard.writeText(`${base}/${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLinkStatus = (link: LinkData) => {
    if (!link.isActive) return { label: 'Disabled', variant: 'secondary' as const };
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) return { label: 'Expired', variant: 'destructive' as const };
    return { label: 'Active', variant: 'default' as const };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('admin.search', lang)}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead className="hidden md:table-cell">Original URL</TableHead>
                <TableHead className="hidden sm:table-cell">Title</TableHead>
                <TableHead className="text-center">Clicks</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t('admin.noData', lang)}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((link) => {
                  const status = getLinkStatus(link);
                  return (
                    <TableRow key={link.id}>
                      <TableCell className="font-mono text-xs font-medium">{link.slug}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px] truncate text-xs text-muted-foreground">
                        {link.originalUrl}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell max-w-[150px] truncate">{link.title || '—'}</TableCell>
                      <TableCell className="text-center font-semibold">{(link._count?.clicks ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {new Date(link.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyLink(link.slug, link.id)} title="Copy">
                            {copiedId === link.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('admin.delete', lang)}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('admin.confirm.delete', lang)}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel', lang)}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(link.id)}>
                                  {t('common.delete', lang)}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Manage Articles Tab
// ============================================================

interface ArticleForm {
  title: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  category: string;
  tags: string;
  author: string;
  readTime: string;
  isPublished: boolean;
}

const defaultArticleForm: ArticleForm = {
  title: '', content: '', excerpt: '', thumbnail: '', category: '',
  tags: '', author: 'Admin', readTime: '5', isPublished: true,
};

function ManageArticlesTab() {
  const { articles, setArticles, adminToken, language, showNotification } = useAppStore();
  const lang = language as Language;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleData | null>(null);
  const [form, setForm] = useState<ArticleForm>(defaultArticleForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/articles', { headers: authHeader(adminToken) })
      .then((r) => r.json())
      .then((data: ApiResponse<ArticleData[]>) => {
        if (data.success && data.data) setArticles(data.data);
      })
      .catch(() => { /* silent */ });
  }, [adminToken, setArticles]);

  const refreshArticles = useCallback(() => {
    fetch('/api/articles', { headers: authHeader(adminToken) })
      .then((r) => r.json())
      .then((data: ApiResponse<ArticleData[]>) => {
        if (data.success && data.data) setArticles(data.data);
      })
      .catch(() => { /* silent */ });
  }, [adminToken, setArticles]);

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openAddDialog = () => {
    setEditingArticle(null);
    setForm(defaultArticleForm);
    setDialogOpen(true);
  };

  const openEditDialog = (article: ArticleData) => {
    setEditingArticle(article);
    setForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      thumbnail: article.thumbnail || '',
      category: article.category || '',
      tags: article.tags || '',
      author: article.author,
      readTime: String(article.readTime),
      isPublished: article.isPublished,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const isEdit = !!editingArticle;
      const url = isEdit ? `/api/articles/${editingArticle.id}` : '/api/articles';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader(adminToken) },
        body: JSON.stringify({
          ...form,
          readTime: parseInt(form.readTime) || 5,
        }),
      });
      const data: ApiResponse = await res.json();
      if (data.success) {
        showNotification('success', t('common.success', lang));
        setDialogOpen(false);
        refreshArticles();
      } else {
        showNotification('error', data.error || t('common.error', lang));
      }
    } catch {
      showNotification('error', t('common.error', lang));
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE', headers: authHeader(adminToken) });
      const data: ApiResponse = await res.json();
      if (data.success) {
        setArticles(articles.filter((a) => a.id !== id));
        showNotification('success', t('common.success', lang));
      } else {
        showNotification('error', data.error || t('common.error', lang));
      }
    } catch {
      showNotification('error', t('common.error', lang));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('admin.search', lang)}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openAddDialog}>
              <Plus className="h-4 w-4" />
              {t('admin.add', lang)}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? t('admin.edit', lang) : t('admin.add', lang)} Article</DialogTitle>
              <DialogDescription>Fill in the article details below.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Content (HTML)</Label>
                  <Textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={8}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Excerpt</Label>
                  <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Thumbnail URL</Label>
                  <Input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Read Time (min)</Label>
                  <Input type="number" value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} />
                  <Label>Published</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel', lang)}
              </Button>
              <Button onClick={handleSave} disabled={saving || !form.title.trim()}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('common.save', lang)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="text-center">Views</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t('admin.noData', lang)}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{article.title}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {article.category ? <Badge variant="outline">{article.category}</Badge> : '—'}
                    </TableCell>
                    <TableCell className="text-center font-semibold">{article.fakeViews.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={article.isPublished ? 'default' : 'secondary'}>
                        {article.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(article)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('admin.delete', lang)}</AlertDialogTitle>
                              <AlertDialogDescription>{t('admin.confirm.delete', lang)}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel', lang)}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(article.id)}>
                                {t('common.delete', lang)}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Ad Manager Tab
// ============================================================

function AdManagerTab() {
  const { adSlots, setAdSlots, adminToken, language, showNotification } = useAppStore();
  const lang = language as Language;
  const [editingSlots, setEditingSlots] = useState<Record<string, Partial<AdSlotData>>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/ads', { headers: authHeader(adminToken) })
      .then((r) => r.json())
      .then((data: ApiResponse<AdSlotData[]>) => {
        if (data.success && data.data) setAdSlots(data.data);
      })
      .catch(() => { /* silent */ });
  }, [adminToken, setAdSlots]);

  const refreshAds = useCallback(() => {
    fetch('/api/ads', { headers: authHeader(adminToken) })
      .then((r) => r.json())
      .then((data: ApiResponse<AdSlotData[]>) => {
        if (data.success && data.data) setAdSlots(data.data);
      })
      .catch(() => { /* silent */ });
  }, [adminToken, setAdSlots]);

  const updateLocalSlot = (id: string, field: keyof AdSlotData, value: unknown) => {
    setEditingSlots((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const getSlotValue = (slot: AdSlotData, field: keyof AdSlotData) => {
    if (editingSlots[slot.id]?.[field] !== undefined) return editingSlots[slot.id]![field] as string;
    return slot[field] as string;
  };

  const saveSlot = async (slot: AdSlotData) => {
    setSaving(slot.id);
    try {
      const updates = editingSlots[slot.id] || {};
      const res = await fetch(`/api/ads/${slot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader(adminToken) },
        body: JSON.stringify(updates),
      });
      const data: ApiResponse = await res.json();
      if (data.success) {
        showNotification('success', t('common.success', lang));
        setEditingSlots((prev) => {
          const next = { ...prev };
          delete next[slot.id];
          return next;
        });
        refreshAds();
      } else {
        showNotification('error', data.error || t('common.error', lang));
      }
    } catch {
      showNotification('error', t('common.error', lang));
    }
    setSaving(null);
  };

  const addSlot = async () => {
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(adminToken) },
        body: JSON.stringify({ name: 'New Ad Slot', position: 'custom', priority: 0 }),
      });
      const data: ApiResponse = await res.json();
      if (data.success) refreshAds();
    } catch { /* silent */ }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={addSlot}>
          <Plus className="h-4 w-4" />
          Add New Slot
        </Button>
      </div>

      {adSlots.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('admin.noData', lang)}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adSlots.map((slot) => (
            <Card key={slot.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{slot.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{slot.position}</p>
                  </div>
                  <Switch
                    checked={getSlotValue(slot, 'isEnabled') === 'true' ? true : slot.isEnabled}
                    onCheckedChange={(v) => updateLocalSlot(slot.id, 'isEnabled', String(v))}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Script HTML</Label>
                  <Textarea
                    value={getSlotValue(slot, 'scriptHtml') ?? ''}
                    onChange={(e) => updateLocalSlot(slot.id, 'scriptHtml', e.target.value)}
                    rows={4}
                    className="font-mono text-xs"
                    placeholder="<!-- Ad script here -->"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Device Target</Label>
                    <Select
                      value={getSlotValue(slot, 'deviceTarget') ?? 'all'}
                      onValueChange={(v) => updateLocalSlot(slot.id, 'deviceTarget', v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Devices</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="desktop">Desktop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Priority</Label>
                    <Input
                      type="number"
                      value={getSlotValue(slot, 'priority') ?? '0'}
                      onChange={(e) => updateLocalSlot(slot.id, 'priority', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => saveSlot(slot)}
                  disabled={saving === slot.id}
                >
                  {saving === slot.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Settings Tab (uses dirty-field overlay pattern)
// ============================================================

function SettingsTab() {
  const { settings, setSettings, adminToken, language, showNotification } = useAppStore();
  const lang = language as Language;
  const [dirty, setDirty] = useState<Partial<SiteSettings>>({});
  const [saving, setSaving] = useState(false);

  // Derive form values: store settings overlaid with dirty changes
  const form: Partial<SiteSettings> = settings ? { ...settings, ...dirty } : {};

  const updateField = (key: keyof SiteSettings, value: unknown) => {
    setDirty((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader(adminToken) },
        body: JSON.stringify(form),
      });
      const data: ApiResponse<SiteSettings> = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
        setDirty({});
        showNotification('success', t('common.success', lang));
      } else {
        showNotification('error', data.error || t('common.error', lang));
      }
    } catch {
      showNotification('error', t('common.error', lang));
    }
    setSaving(false);
  };

  if (!settings) {
    return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Site Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">General</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Site Name</Label>
              <Input value={form.siteName ?? ''} onChange={(e) => updateField('siteName', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Site URL</Label>
              <Input value={form.siteUrl ?? ''} onChange={(e) => updateField('siteUrl', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Site Description</Label>
            <Textarea value={form.siteDescription ?? ''} onChange={(e) => updateField('siteDescription', e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Redirect Delay (seconds)</Label>
              <Input type="number" min={0} max={60} value={form.redirectDelay ?? 10} onChange={(e) => updateField('redirectDelay', parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label>Language</Label>
              <Select value={form.language ?? 'en'} onValueChange={(v) => updateField('language', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="id">Indonesian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Toggles */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              { key: 'enableAds' as const, label: 'Enable Ads' },
              { key: 'enableCloaking' as const, label: 'Enable Cloaking' },
              { key: 'fakeLiveVisitors' as const, label: 'Fake Live Visitors' },
              { key: 'maintenanceMode' as const, label: 'Maintenance Mode' },
            ]).map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                <Label className="text-sm">{label}</Label>
                <Switch
                  checked={form[key] as boolean ?? false}
                  onCheckedChange={(v) => updateField(key, v)}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Custom Scripts */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Custom Scripts</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Custom Head Script</Label>
              <Textarea value={form.customHeadScript ?? ''} onChange={(e) => updateField('customHeadScript', e.target.value)} rows={4} className="font-mono text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label>Custom Body Script</Label>
              <Textarea value={form.customBodyScript ?? ''} onChange={(e) => updateField('customBodyScript', e.target.value)} rows={4} className="font-mono text-xs" />
            </div>
          </div>
        </div>

        <Separator />

        {/* OG Image */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Social / SEO</h3>
          <div className="space-y-1.5">
            <Label>OG Default Image URL</Label>
            <Input value={form.ogDefaultImage ?? ''} onChange={(e) => updateField('ogDefaultImage', e.target.value)} />
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t('admin.save', lang)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Branding Tab (uses dirty-field overlay pattern)
// ============================================================

function BrandingTab() {
  const { settings, setSettings, adminToken, language, showNotification } = useAppStore();
  const lang = language as Language;
  const [dirty, setDirty] = useState<Partial<SiteSettings>>({});
  const [saving, setSaving] = useState(false);

  const form: Partial<SiteSettings> = settings ? { ...settings, ...dirty } : {};

  const updateField = (key: keyof SiteSettings, value: unknown) => {
    setDirty((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader(adminToken) },
        body: JSON.stringify(form),
      });
      const data: ApiResponse<SiteSettings> = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
        setDirty({});
        showNotification('success', t('common.success', lang));
      } else {
        showNotification('error', data.error || t('common.error', lang));
      }
    } catch {
      showNotification('error', t('common.error', lang));
    }
    setSaving(false);
  };

  if (!settings) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Branding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label>Logo URL</Label>
            <Input value={form.logo ?? ''} onChange={(e) => updateField('logo', e.target.value)} />
            {form.logo && (
              <div className="mt-2 rounded-lg border p-2 bg-muted/30 h-20 flex items-center justify-center">
                <img src={form.logo} alt="Logo preview" className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Favicon URL</Label>
            <Input value={form.favicon ?? ''} onChange={(e) => updateField('favicon', e.target.value)} />
            {form.favicon && (
              <div className="mt-2 rounded-lg border p-2 bg-muted/30 h-20 flex items-center justify-center">
                <img src={form.favicon} alt="Favicon preview" className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label>Primary Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor ?? '#10b981'}
                onChange={(e) => updateField('primaryColor', e.target.value)}
                className="h-10 w-14 rounded-lg border cursor-pointer bg-transparent"
              />
              <Input value={form.primaryColor ?? ''} onChange={(e) => updateField('primaryColor', e.target.value)} className="flex-1" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Accent Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.accentColor ?? '#f59e0b'}
                onChange={(e) => updateField('accentColor', e.target.value)}
                className="h-10 w-14 rounded-lg border cursor-pointer bg-transparent"
              />
              <Input value={form.accentColor ?? ''} onChange={(e) => updateField('accentColor', e.target.value)} className="flex-1" />
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label>Footer Text</Label>
            <Input value={form.footerText ?? ''} onChange={(e) => updateField('footerText', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Custom Domain</Label>
            <Input value={form.customDomain ?? ''} onChange={(e) => updateField('customDomain', e.target.value)} placeholder="link.yourdomain.com" />
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t('admin.save', lang)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Security Tab
// ============================================================

function SecurityTab() {
  const { adminToken, language, showNotification } = useAppStore();
  const lang = language as Language;
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [blacklistIps, setBlacklistIps] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/blacklist', { headers: authHeader(adminToken) })
      .then((r) => r.json())
      .then((d: ApiResponse<{ ips: string[] }>) => {
        if (d.success && d.data) setBlacklistIps(d.data.ips);
      })
      .catch(() => {});
  }, [adminToken]);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification('error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showNotification('error', 'Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader(adminToken) },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data: ApiResponse = await res.json();
      if (data.success) {
        showNotification('success', 'Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showNotification('error', data.error || 'Failed to change password');
      }
    } catch {
      showNotification('error', t('common.error', lang));
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Blacklisted IPs</CardTitle>
        </CardHeader>
        <CardContent>
          {blacklistIps.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {blacklistIps.map((ip) => (
                <Badge key={ip} variant="destructive" className="font-mono text-xs">
                  {ip}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No blacklisted IPs</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Security Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">Rate Limiting</span>
            </div>
            <Badge variant="default" className="bg-emerald-500">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">X-Frame-Options</span>
            </div>
            <Badge variant="default" className="bg-emerald-500">DENY</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">X-Content-Type-Options</span>
            </div>
            <Badge variant="default" className="bg-emerald-500">nosniff</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">X-XSS-Protection</span>
            </div>
            <Badge variant="default" className="bg-emerald-500">1; mode=block</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Export/Import Tab
// ============================================================

function ExportImportTab() {
  const { adminToken, links, articles, adSlots, settings, language, showNotification } = useAppStore();
  const lang = language as Language;
  const [exporting, setExporting] = useState(false);

  const exportAll = async () => {
    setExporting(true);
    try {
      const allData = {
        exportDate: new Date().toISOString(),
        settings,
        links,
        articles,
        adSlots,
      };
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `linkguard-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('success', 'Data exported successfully');
    } catch {
      showNotification('error', 'Failed to export data');
    }
    setExporting(false);
  };

  const exportCSV = () => {
    try {
      const headers = ['Slug', 'Original URL', 'Title', 'Clicks', 'Active', 'Created'];
      const rows = links.map((l) => [
        l.slug,
        l.originalUrl,
        l.title || '',
        String(l._count?.clicks ?? 0),
        l.isActive ? 'Yes' : 'No',
        new Date(l.createdAt).toLocaleDateString(),
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `linkguard-links-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('success', 'CSV exported successfully');
    } catch {
      showNotification('error', 'Failed to export CSV');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(adminToken) },
        body: JSON.stringify(data),
      });
      const result: ApiResponse = await res.json();
      if (result.success) {
        showNotification('success', 'Data imported successfully');
      } else {
        showNotification('error', result.error || 'Import failed');
      }
    } catch {
      showNotification('error', 'Invalid JSON file');
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Export Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Download all your data as a JSON backup file or export links as CSV.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={exportAll} disabled={exporting} variant="outline">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              Export All Data (JSON)
            </Button>
            <Button onClick={exportCSV} variant="outline">
              <FileDown className="h-4 w-4" />
              Export Links (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Import Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Upload a previously exported JSON file to restore data.</p>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4" />
                {t('admin.add', lang)} Import Data
              </span>
            </Button>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Sidebar Content (shared between desktop & mobile)
// ============================================================

function SidebarContent({
  currentTab,
  onTabChange,
  onLogout,
  lang,
}: {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  lang: Language;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-3 border-b">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-lg">LinkGuard</span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {t(item.labelKey, lang)}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <LogOut className="h-4 w-4" />
          {t('nav.logout', lang)}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Main AdminDashboard Component
// ============================================================

export default function AdminDashboard() {
  const { adminTab, setAdminTab, logoutAdmin, language } = useAppStore();
  const lang = language as Language;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTabChange = (tab: AdminTab) => {
    setAdminTab(tab);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logoutAdmin();
    setMobileOpen(false);
  };

  const renderTab = () => {
    switch (adminTab) {
      case 'dashboard': return <DashboardTab />;
      case 'links': return <ManageLinksTab />;
      case 'articles': return <ManageArticlesTab />;
      case 'ads': return <AdManagerTab />;
      case 'settings': return <SettingsTab />;
      case 'branding': return <BrandingTab />;
      case 'security': return <SecurityTab />;
      case 'export': return <ExportImportTab />;
      default: return <DashboardTab />;
    }
  };

  const currentTabLabel = SIDEBAR_ITEMS.find((i) => i.tab === adminTab)?.labelKey ?? 'admin.dashboard';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card">
        <SidebarContent
          currentTab={adminTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
          lang={lang}
        />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Admin navigation menu</SheetDescription>
          </SheetHeader>
          <SidebarContent
            currentTab={adminTab}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
            lang={lang}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between h-14 px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
                    <Settings className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>Admin navigation menu</SheetDescription>
                </SheetHeader>
                <SheetContent side="left" className="p-0 w-72">
                  <SidebarContent
                    currentTab={adminTab}
                    onTabChange={handleTabChange}
                    onLogout={handleLogout}
                    lang={lang}
                  />
                </SheetContent>
              </Sheet>
              <h1 className="text-lg font-semibold">{t(currentTabLabel, lang)}</h1>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={adminTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
