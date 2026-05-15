'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAppStore } from '@/store/app-store';
import { t } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';
import type { ApiResponse, SiteSettings } from '@/types';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginAdmin, language, settings, setSettings, showNotification } = useAppStore();
  const lang = language as Language;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError(t('admin.login.error', lang));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data: ApiResponse<{ token: string }> = await res.json();

      if (!data.success || !data.data?.token) {
        setError(data.error || t('admin.login.error', lang));
        setIsLoading(false);
        return;
      }

      loginAdmin(data.data.token);
      showNotification('success', t('common.success', lang));

      // Fetch settings after login
      try {
        const settingsRes = await fetch('/api/settings');
        const settingsData: ApiResponse<Record<string, unknown>> = await settingsRes.json();
        if (settingsData.success && settingsData.data) {
          setSettings(settingsData.data as unknown as SiteSettings);
        }
      } catch {
        // Settings fetch is non-critical
      }
    } catch {
      setError(t('common.error', lang));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-2 pt-8 px-8">
            {/* Logo/Brand */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg"
            >
              <ShieldCheck className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {settings?.siteName || 'LinkGuard'}
              </h1>
              <p className="text-sm text-white/60 mt-1">
                {t('admin.login.title', lang)}
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/80 text-sm font-medium">
                  {t('admin.login.username', lang)}
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  disabled={isLoading}
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-colors"
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80 text-sm font-medium">
                  {t('admin.login.password', lang)}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-colors pr-10"
                    autoComplete="current-password"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-200 text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.loading', lang)}
                  </>
                ) : (
                  t('admin.login.submit', lang)
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
