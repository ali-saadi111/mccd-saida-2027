import type { MetadataRoute } from 'next';
import en from '@/messages/en.json';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: en.site.name,
    short_name: 'MCCD Saida',
    description: en.home.subtitle,
    start_url: '/en',
    display: 'standalone',
    background_color: '#f7f5ef',
    theme_color: '#245a63',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
