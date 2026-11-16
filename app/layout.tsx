import './globals.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';

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
      <body className="min-h-screen bg-[#161512] text-white font-sans antialiased">
        {children}
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="c16ef132-45c8-4d47-86b7-d1c2f6816aa7"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
