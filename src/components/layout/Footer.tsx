'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ArrowUp,
  Home,
  Plus,
  Facebook,
  Twitter,
  Github,
  Youtube,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import { t } from '@/lib/i18n';

export default function Footer() {
  const { settings, language, goHome, navigate } = useAppStore();
  const [showTop, setShowTop] = useState(false);
  const lang = language;

  const siteName = settings?.siteName || 'LinkGuard';
  const siteDescription = settings?.siteDescription || '';
  const footerText = settings?.footerText || t('common.footer', lang);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { label: t('nav.home', lang), icon: Home, action: goHome },
    { label: t('nav.create', lang), icon: Plus, action: () => navigate('create') },
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Github, label: 'GitHub', href: '#' },
    { icon: Youtube, label: 'YouTube', href: '#' },
  ];

  return (
    <footer className="mt-auto bg-card border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                {siteName}
              </span>
            </div>
            {siteDescription && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {siteDescription}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit cursor-pointer"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Connect
            </h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-border/50" />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteName}. {footerText}
          </p>
          <p className="text-xs text-muted-foreground/60">
            Built with Next.js &middot; Powered by LinkGuard
          </p>
        </div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <Button
              size="icon"
              onClick={scrollToTop}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow border-0"
            >
              <ArrowUp className="w-4 h-4" />
              <span className="sr-only">Back to top</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
