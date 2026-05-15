'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  Globe,
  Menu,
  Shield,
  Link2,
  Home,
  Plus,
  LogOut,
  LogIn,
  Server,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { useAppStore } from '@/store/app-store';
import { t } from '@/lib/i18n';

export default function Header() {
  const {
    currentView,
    language,
    setLanguage,
    navigate,
    goHome,
    isAdmin,
    logoutAdmin,
    settings,
  } = useAppStore();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const siteName = settings?.siteName || 'LinkGuard';
  const lang = language;

  const navItems = [
    {
      label: t('nav.home', lang),
      icon: Home,
      action: () => goHome(),
      view: 'home' as const,
    },
    {
      label: t('nav.create', lang),
      icon: Plus,
      action: () => navigate('create'),
      view: 'create' as const,
    },
    {
      label: t('nav.deploy', lang),
      icon: Server,
      action: () => navigate('deploy'),
      view: 'deploy' as const,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Neon gradient accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500" />

      {/* Glassmorphism header */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={goHome}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                {siteName}
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.view}
                  variant={currentView === item.view ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    item.action();
                    setMobileOpen(false);
                  }}
                  className={`gap-2 ${
                    currentView === item.view
                      ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-purple-500 dark:text-purple-400'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* Right side controls */}
            <div className="hidden md:flex items-center gap-1.5">
              {/* Language Switcher */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                className="text-muted-foreground hover:text-foreground"
                title="Switch Language"
              >
                <Globe className="w-4 h-4" />
                <span className="sr-only">Switch Language</span>
              </Button>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[20px] text-center">
                {language}
              </span>

              {/* Theme Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="text-muted-foreground hover:text-foreground"
                  title={theme === 'dark' ? t('common.lightMode', lang) : t('common.darkMode', lang)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={theme}
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      {theme === 'dark' ? (
                        <Sun className="w-4 h-4" />
                      ) : (
                        <Moon className="w-4 h-4" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Button>
              )}

              {/* Admin Button */}
              {isAdmin ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logoutAdmin();
                    setMobileOpen(false);
                  }}
                  className="gap-2 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout', lang)}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate('admin-login');
                    setMobileOpen(false);
                  }}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <LogIn className="w-4 h-4" />
                  {t('nav.login', lang)}
                </Button>
              )}
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Menu className="w-5 h-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <SheetHeader className="p-6 pb-4">
                    <SheetTitle className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                        {siteName}
                      </span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="px-3 flex flex-col gap-1">
                    {/* Nav Items */}
                    {navItems.map((item) => (
                      <button
                        key={item.view}
                        onClick={() => {
                          item.action();
                          setMobileOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          currentView === item.view
                            ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-purple-500 dark:text-purple-400'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}

                    <div className="my-3 h-px bg-border/50" />

                    {/* Language Toggle */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        Language
                      </div>
                      <div className="flex items-center bg-muted rounded-lg p-0.5">
                        <button
                          onClick={() => setLanguage('en')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            language === 'en'
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => setLanguage('id')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            language === 'id'
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          ID
                        </button>
                      </div>
                    </div>

                    {/* Theme Toggle */}
                    {mounted && (
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                      >
                        {theme === 'dark' ? (
                          <Sun className="w-4 h-4" />
                        ) : (
                          <Moon className="w-4 h-4" />
                        )}
                        {theme === 'dark'
                          ? t('common.lightMode', lang)
                          : t('common.darkMode', lang)}
                      </button>
                    )}

                    <div className="my-3 h-px bg-border/50" />

                    {/* Admin */}
                    {isAdmin ? (
                      <button
                        onClick={() => {
                          logoutAdmin();
                          setMobileOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout', lang)}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          navigate('admin-login');
                          setMobileOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        {t('nav.login', lang)}
                      </button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
