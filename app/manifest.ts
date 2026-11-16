import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ChessCheese — Анализ шахматных партий',
    short_name: 'ChessCheese',
    description: 'Анализ шахматных партий с Lichess и Chess.com на движке Stockfish в ретро 8-bit стиле.',
    start_url: '/',
    display: 'standalone',
    background_color: '#141310',
    theme_color: '#f59e0b',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
