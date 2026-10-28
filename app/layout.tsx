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
      </body>
    </html>
  );
}
