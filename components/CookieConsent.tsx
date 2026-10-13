'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consented = localStorage.getItem('codeclash_cookie_consent');
      if (!consented) {
        setShow(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem('codeclash_cookie_consent', 'accepted');
    } catch {
      // ignore
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-[#fdfcf9] dark:bg-[#1f1c19] border border-[#e3ded4] dark:border-[#38332c] shadow-lg rounded-xl p-4 text-xs text-stone-800 dark:text-stone-200 animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center justify-between">
            <span>Privacy & Storage Preferences</span>
            <button
              onClick={() => setShow(false)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer p-0.5"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
            We store session tokens and code progress locally to optimize duel performance. No third-party trackers are sold. Read our{' '}
            <Link href="/privacy" className="underline hover:text-amber-700 dark:hover:text-amber-400">
              Privacy Policy
            </Link>.
          </p>
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={accept}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
            >
              Accept Preferences
            </button>
            <button
              onClick={() => setShow(false)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-[11px] transition-all cursor-pointer"
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
