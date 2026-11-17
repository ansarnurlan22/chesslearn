import './globals.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ChessCheese — Бесплатный анализ шахматных партий • Stockfish',
  description:
    'Анализируй партии с Lichess и Chess.com на движке Stockfish: точность ходов, классификация ошибок и интерактивный разбор без подписок и дневных лимитов.',
  metadataBase: new URL('https://chesscheese.site'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ChessCheese — Бесплатный анализ шахматных партий',
    description:
      'Разбирай партии с Lichess и Chess.com прямо в браузере: движок Stockfish вычисляет точность, классифицирует ошибки и помогает стать сильнее.',
    url: 'https://chesscheese.site',
    siteName: 'ChessCheese',
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChessCheese — Бесплатный анализ шахматных партий',
    description:
      'Разбирай партии с Lichess и Chess.com на движке Stockfish без дневных лимитов и подписок.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <head>
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="c7a2a4c8-b975-46aa-abf4-9563b5973183"
          data-domains="chesscheese.site,www.chesscheese.site"
        />
      </head>
      <body className="min-h-screen bg-[#161512] text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
