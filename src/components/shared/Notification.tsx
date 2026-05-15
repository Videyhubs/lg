'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

export default function Notification() {
  const { notification, clearNotification } = useAppStore();

  const colorMap = {
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      textColor: 'text-emerald-500 dark:text-emerald-400',
    },
    error: {
      bg: 'bg-destructive/10 border-destructive/30',
      icon: XCircle,
      iconColor: 'text-destructive',
      textColor: 'text-destructive',
    },
    info: {
      bg: 'bg-sky-500/10 border-sky-500/30',
      icon: Info,
      iconColor: 'text-sky-500',
      textColor: 'text-sky-500 dark:text-sky-400',
    },
  };

  if (!notification) return null;

  const config = colorMap[notification.type];
  const Icon = config.icon;

  return (
    <div className="fixed bottom-6 right-6 z-[60] pointer-events-none">
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.message + notification.type}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto max-w-sm"
          >
            <div
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg ${config.bg}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
              <p className={`text-sm font-medium flex-1 ${config.textColor}`}>
                {notification.message}
              </p>
              <button
                onClick={clearNotification}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
