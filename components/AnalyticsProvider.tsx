'use client';

import { useEffect } from 'react';

// Lightweight, zero-cookie, zero-spyware client analytics
export function AnalyticsProvider() {
  useEffect(() => {
    try {
      const pageView = {
        path: window.location.pathname,
        referrer: document.referrer || 'direct',
        timestamp: Date.now(),
        screenWidth: window.innerWidth,
      };

      // Store local analytics telemetry without sending to third-party ad networks
      const existing = JSON.parse(localStorage.getItem('codeclash_metrics') || '[]');
      existing.push(pageView);
      if (existing.length > 50) existing.shift();
      localStorage.setItem('codeclash_metrics', JSON.stringify(existing));
    } catch {
      // ignore
    }
  }, []);

  return null;
}
