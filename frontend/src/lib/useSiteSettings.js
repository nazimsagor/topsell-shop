'use client';
import { useEffect, useState } from 'react';
import { settingsApi } from './api';

const CACHE_KEY = 'topsell:site-settings';

export const DEFAULT_SETTINGS = {
  store_name:          'TopSell',
  store_email:         'support@topsell.shop',
  store_phone:         '+8801797515010',
  store_address:       'Banani, Dhaka, Bangladesh',
  social_facebook:     '',
  social_instagram:    '',
  social_youtube:      '',
  free_ship_threshold: 5000,
  tax_rate:            0,
};

// Tiny module-level pub/sub so a single PATCH from the admin page
// updates every Header/Footer/etc on the same client without a refresh.
const listeners = new Set();
function notify(values) { for (const fn of listeners) fn(values); }

/** Manually push an updated map (e.g. right after admin Save). */
export function setSiteSettings(map) {
  if (typeof window === 'undefined') return;
  const next = { ...DEFAULT_SETTINGS, ...map };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch {}
  notify(next);
}

export default function useSiteSettings() {
  const [settings, setSettings] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    let alive = true;
    settingsApi.get()
      .then(({ data }) => {
        if (!alive || !data || typeof data !== 'object') return;
        const merged = { ...DEFAULT_SETTINGS, ...data };
        setSettings(merged);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(merged)); } catch {}
      })
      .catch(() => {});
    const fn = (v) => alive && setSettings(v);
    listeners.add(fn);
    return () => { alive = false; listeners.delete(fn); };
  }, []);

  return settings;
}
