import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LAXUS SYSTEM',
    short_name: 'LAXUS',
    description: 'Level up your real life',
    start_url: '/',
    display: 'standalone',
    background_color: '#080810',
    theme_color: '#080810',
    orientation: 'portrait',
    icons: [
      { src: '/icon', sizes: '192x192', type: 'image/png' },
      { src: '/icon', sizes: '512x512', type: 'image/png' },
    ],
  };
}
