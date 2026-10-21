'use client';
import { useEffect, useState } from 'react';
import { mockEvents, mockNews } from './mock';
import type { Event, NewsPost } from './types';
/** Public hook reads only public-shaped collections; reservation contacts never enter its return value. */
export function usePublicData() {
  const [data, setData] = useState<{
    events: Event[];
    news: NewsPost[];
    ready: boolean;
  }>({ events: mockEvents, news: mockNews, ready: false });
  useEffect(() => {
    const update = () => {
      try {
        const stored = JSON.parse(
          localStorage.getItem('saida-2027-demo-v1') || 'null',
        );
        setData({
          events: stored?.events || mockEvents,
          news: stored?.news_posts || mockNews,
          ready: true,
        });
      } catch {
        setData({ events: mockEvents, news: mockNews, ready: true });
      }
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('saida-data', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('saida-data', update);
    };
  }, []);
  return data;
}
