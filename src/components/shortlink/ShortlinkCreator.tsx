'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  Copy,
  Check,
  QrCode,
  Plus,
  Loader2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import { t } from '@/lib/i18n';

interface LinkResult {
  slug: string;
  shortUrl: string;
  originalUrl: string;
  title?: string;
}

export default function ShortlinkCreator() {
  const { language, settings, showNotification } = useAppStore();
  const lang = language;

  // Form state
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [expiration, setExpiration] = useState('');
  const [maxClicks, setMaxClicks] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LinkResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkUrls, setBulkUrls] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState<LinkResult[]>([]);

  // URL validation
  const isValidUrl = (str: string): boolean => {
    try {
      const parsed = new URL(str);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Get today's date in YYYY-MM-DD for min date
  const today = new Date().toISOString().split('T')[0];

  // Create single link
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !isValidUrl(url.trim())) {
      showNotification('error', t('create.error.url', lang));
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, string | number | undefined> = {
        url: url.trim(),
      };
      if (customSlug.trim()) body.customSlug = customSlug.trim();
      if (title.trim()) body.title = title.trim();
      if (showPassword && password.trim()) body.password = password.trim();
      if (expiration) body.expiresAt = expiration;
      if (maxClicks) body.maxClicks = parseInt(maxClicks, 10);

      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        showNotification('error', data.error || t('common.error', lang));
        setLoading(false);
        return;
      }

      const siteUrl = settings?.siteUrl || window.location.origin;
      const linkData: LinkResult = {
        slug: data.data.slug,
        shortUrl: `${siteUrl}/${data.data.slug}`,
        originalUrl: data.data.originalUrl,
        title: data.data.title || undefined,
      };
      setResult(linkData);
      showNotification('success', t('common.success', lang));
    } catch {
      showNotification('error', t('common.error', lang));
    } finally {
      setLoading(false);
    }
  };

  // Bulk create
  const handleBulkSubmit = async () => {
    const urls = bulkUrls
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urls.length === 0) {
      showNotification('error', t('create.error.url', lang));
      return;
    }

    setBulkLoading(true);
    const results: LinkResult[] = [];
    const siteUrl = settings?.siteUrl || window.location.origin;

    for (const u of urls) {
      try {
        const res = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: u }),
        });
        const data = await res.json();
        if (data.success) {
          results.push({
            slug: data.data.slug,
            shortUrl: `${siteUrl}/${data.data.slug}`,
            originalUrl: data.data.originalUrl,
          });
        }
      } catch {
        // skip failed
      }
    }

    setBulkResults(results);
    setBulkLoading(false);
    if (results.length > 0) {
      showNotification('success', `Created ${results.length} links!`);
    }
  };

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  // Reset form
  const resetForm = () => {
    setUrl('');
    setCustomSlug('');
    setTitle('');
    setPassword('');
    setShowPassword(false);
    setExpiration('');
    setMaxClicks('');
    setResult(null);
  };

  // Generate simple QR code SVG
  const QrCodePlaceholder = ({ shortUrl }: { shortUrl: string }) => {
    const handleDownload = () => {
      const svg = document.getElementById('qr-svg');
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${shortUrl.split('/').pop()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    };

    // Generate a deterministic pattern from URL
    const hash = shortUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const cells = Array.from({ length: 21 }, (_, i) =>
      Array.from({ length: 21 }, (_, j) => {
        const idx = i * 21 + j;
        const val = (hash * (idx + 1) * 7 + idx * 13) % 100;
        return val < 45 ? 1 : 0;
      })
    );

    // Add finder patterns (top-left, top-right, bottom-left)
    const addFinder = (r: number, c: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
            cells[r + i][c + j] = 1;
          }
        }
      }
    };
    addFinder(0, 0);
    addFinder(0, 14);
    addFinder(14, 0);

    const cellSize = 10;
    const size = 21 * cellSize + 2 * cellSize;

    return (
      <div className="flex flex-col items-center gap-3">
        <div className="bg-white rounded-xl p-3">
          <svg
            id="qr-svg"
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width={size} height={size} fill="white" rx="8" />
            {cells.map((row, r) =>
              row.map((cell, c) =>
                cell ? (
                  <rect
                    key={`${r}-${c}`}
                    x={c * cellSize + cellSize}
                    y={r * cellSize + cellSize}
                    width={cellSize}
                    height={cellSize}
                    fill="#1a1a2e"
                    rx="1"
                  />
                ) : null
              )
            )}
          </svg>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="gap-2 text-xs"
        >
          <QrCode className="w-3.5 h-3.5" />
          {t('create.result.qr', lang)}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
              <Link2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {t('create.title', lang)}
            </h1>
            <p className="text-muted-foreground text-sm">
              Paste your long URL and get a short, smart link instantly.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* ── Result View ── */}
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
                  {/* Success gradient top */}
                  <div className="h-1 bg-gradient-to-r from-purple-500 to-cyan-500" />
                  <CardContent className="p-6 sm:p-8">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6 text-emerald-500" />
                      </div>
                      <h2 className="text-lg font-semibold text-foreground mb-1">
                        {t('create.result.title', lang)}
                      </h2>

                      {/* Short URL */}
                      <div className="mt-6 flex items-center gap-2 bg-muted/50 border border-border/50 rounded-xl p-3">
                        <Input
                          readOnly
                          value={result.shortUrl}
                          className="border-0 bg-transparent shadow-none text-center font-mono text-sm text-purple-500 dark:text-purple-400 h-auto p-0 focus-visible:ring-0"
                        />
                        <Button
                          size="sm"
                          variant={copied ? 'default' : 'outline'}
                          onClick={() => copyToClipboard(result.shortUrl)}
                          className={`flex-shrink-0 gap-1.5 rounded-lg ${copied ? 'bg-emerald-500 text-white border-0' : 'border-border/50'}`}
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              {t('create.result.copied', lang)}
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              {t('create.result.copy', lang)}
                            </>
                          )}
                        </Button>
                      </div>

                      {/* QR Code */}
                      <div className="mt-8">
                        <QrCodePlaceholder shortUrl={result.shortUrl} />
                      </div>

                      {/* Original URL */}
                      <p className="mt-6 text-xs text-muted-foreground truncate max-w-md mx-auto">
                        {t('safelink.continue', lang)}: {result.originalUrl}
                      </p>

                      {/* Create Another */}
                      <Button
                        variant="outline"
                        onClick={resetForm}
                        className="mt-6 gap-2 rounded-xl border-border/50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {t('create.result.new', lang)}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              /* ── Form View ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
                  {/* Gradient top line */}
                  <div className="h-0.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500" />
                  <CardContent className="p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Destination URL */}
                      <div className="space-y-2">
                        <Label htmlFor="url" className="text-sm font-medium">
                          {t('create.url', lang)} <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="url"
                            type="url"
                            placeholder={t('create.url.placeholder', lang)}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="pl-10 h-11"
                            required
                          />
                        </div>
                      </div>

                      {/* Custom Slug + Title row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="slug" className="text-sm font-medium">
                            {t('create.slug', lang)}
                          </Label>
                          <Input
                            id="slug"
                            placeholder={t('create.slug.placeholder', lang)}
                            value={customSlug}
                            onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="link-title" className="text-sm font-medium">
                            {t('create.title_field', lang)}
                          </Label>
                          <Input
                            id="link-title"
                            placeholder="My awesome link"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-10"
                          />
                        </div>
                      </div>

                      {/* Advanced Options Toggle */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowBulk(!showBulk)}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          Advanced Options
                          {showBulk ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        <AnimatePresence>
                          {showBulk && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 space-y-4">
                                {/* Password Toggle */}
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="pw-toggle" className="text-sm font-medium">
                                    {t('create.password', lang)}
                                  </Label>
                                  <Switch
                                    id="pw-toggle"
                                    checked={showPassword}
                                    onCheckedChange={setShowPassword}
                                  />
                                </div>
                                {showPassword && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                  >
                                    <Input
                                      type="text"
                                      placeholder="Enter password"
                                      value={password}
                                      onChange={(e) => setPassword(e.target.value)}
                                      className="h-10"
                                    />
                                  </motion.div>
                                )}

                                {/* Expiration + Max Clicks row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="expires" className="text-sm font-medium">
                                      {t('create.expires', lang)}
                                    </Label>
                                    <Input
                                      id="expires"
                                      type="date"
                                      min={today}
                                      value={expiration}
                                      onChange={(e) => setExpiration(e.target.value)}
                                      className="h-10"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="max-clicks" className="text-sm font-medium">
                                      {t('create.maxClicks', lang)}
                                    </Label>
                                    <Input
                                      id="max-clicks"
                                      type="number"
                                      min="1"
                                      placeholder="100"
                                      value={maxClicks}
                                      onChange={(e) => setMaxClicks(e.target.value)}
                                      className="h-10"
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <Separator className="bg-border/30" />

                      {/* Submit */}
                      <Button
                        type="submit"
                        disabled={loading || !url.trim()}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-90 transition-all border-0 rounded-xl"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {t('common.loading', lang)}
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            {t('create.submit', lang)}
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* ── Bulk Create Section ── */}
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => setShowBulk(!showBulk)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-purple-500" />
                    {t('create.bulk', lang)}
                    {showBulk ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showBulk && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <Card className="mt-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Multiple URLs (one per line)
                                </Label>
                                <Textarea
                                  placeholder={"https://example.com/page1\nhttps://example.com/page2\nhttps://example.com/page3"}
                                  value={bulkUrls}
                                  onChange={(e) => setBulkUrls(e.target.value)}
                                  rows={5}
                                  className="resize-none"
                                />
                              </div>
                              <Button
                                onClick={handleBulkSubmit}
                                disabled={bulkLoading || !bulkUrls.trim()}
                                className="w-full gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0"
                              >
                                {bulkLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('common.loading', lang)}
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4" />
                                    {t('create.submit', lang)}
                                  </>
                                )}
                              </Button>

                              {/* Bulk Results */}
                              {bulkResults.length > 0 && (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {bulkResults.map((r, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/30"
                                    >
                                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                      <span className="text-xs font-mono text-purple-500 dark:text-purple-400 truncate">
                                        {r.shortUrl}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 ml-auto flex-shrink-0"
                                        onClick={() => copyToClipboard(r.shortUrl)}
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
