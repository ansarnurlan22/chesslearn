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
  title: 'ChessCheese — Умный анализ твоих шахматных партий и AI-наставник',
  description:
    'Анализируй партии с Chess.com и Lichess, общайся с AI-гроссмейстером ChessCheese Bot и разбирай ходы на интерактивной доске.',
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
