'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/app-store';
import type { AdSlotData } from '@/types';

interface AdSlotProps {
  position: string;
}

// Track impressions per session
const impressionTracker = new Map<string, number>();

export default function AdSlot({ position }: AdSlotProps) {
  const { adSlots } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);
  const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    const handleMount = () => {
      setIsMounted(true);
      setDevice(window.innerWidth < 768 ? 'mobile' : 'desktop');
    };
    const id = requestAnimationFrame(handleMount);
    const checkDevice = () => {
      setDevice(window.innerWidth < 768 ? 'mobile' : 'desktop');
    };
    window.addEventListener('resize', checkDevice, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  // Find matching ad slot
  const matchedSlot = useMemo(() => {
    if (!isMounted) return null;
    return adSlots.find(
      (slot: AdSlotData) =>
        slot.position === position &&
        slot.isEnabled &&
        slot.scriptHtml &&
        (!slot.deviceTarget || slot.deviceTarget === 'all' || slot.deviceTarget === device)
    );
  }, [adSlots, position, isMounted, device]);

  // Track impression
  useEffect(() => {
    if (!matchedSlot) return;
    const count = impressionTracker.get(matchedSlot.id) || 0;
    const cap = matchedSlot.frequencyCap || 999;
    if (count < cap) {
      impressionTracker.set(matchedSlot.id, count + 1);
    }
  }, [matchedSlot]);

  if (!isMounted || !matchedSlot) {
    // Show placeholder
    return (
      <div className="w-full rounded-xl border border-dashed border-border/30 bg-muted/20 flex items-center justify-center py-3">
        <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
          Ad Space
        </span>
      </div>
    );
  }

  return (
    <div className="w-full ad-slot-wrapper" data-position={position}>
      <div dangerouslySetInnerHTML={{ __html: matchedSlot.scriptHtml || '' }} />
    </div>
  );
}
