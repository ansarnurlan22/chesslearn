import { ChessDashboard } from '@/components/chess-dashboard';
import type { ChessPlatform, UnifiedPlayerProfile } from '@/lib/api/types';
import { getUnifiedPlayerProfile, PlatformApiError } from '@/lib/api/unified';
import { Crown, Sparkles } from 'lucide-react';
import { Suspense } from 'react';

interface PageProps {
  searchParams: Promise<{ u?: string; p?: string }>;
}

async function DashboardContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const username = params?.u?.trim();
  const rawPlatform = params?.p?.trim().toLowerCase();
  const platform: ChessPlatform = rawPlatform === 'chesscom' ? 'chesscom' : 'lichess';

  let profile: UnifiedPlayerProfile | null = null;
  let errorMessage: string | null = null;

  if (username) {
    try {
      profile = await getUnifiedPlayerProfile(username, platform);
    } catch (err: unknown) {
      if (err instanceof PlatformApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'Произошла непредвиденная ошибка при запросе данных.';
      }
    }
  }

  return (
    <ChessDashboard
      initialUsername={username ?? ''}
      initialPlatform={platform}
      profile={profile}
      error={errorMessage}
    />
  );
}

export default function Home({ searchParams }: PageProps) {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-white font-sans antialiased overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] sm:w-[900px] h-[450px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-80 -left-32 w-[450px] h-[450px] bg-violet-600/10 blur-3xl rounded-full" />
        <div className="absolute top-[38rem] -right-32 w-[500px] h-[500px] bg-emerald-600/10 blur-3xl rounded-full" />
      </div>

      {/* Sticky Glass Navbar */}
      <header className="relative z-50 backdrop-blur-md bg-zinc-900/60 border-b border-zinc-800/60 sticky top-0 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-zinc-950 group-hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20">
              <Crown className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white block leading-none">
                  ChessPulse
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Universal
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">
                Lichess & Chess.com Companion
              </span>
            </div>
          </a>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Двойная интеграция</span>
            </div>
            <a
              href="https://lichess.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 transition-all"
            >
              Lichess ↗
            </a>
            <a
              href="https://chess.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 transition-all"
            >
              Chess.com ↗
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6">
        <Suspense
          fallback={
            <div className="w-full flex flex-col items-center justify-center py-24 gap-3 text-zinc-400">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
              <span className="text-sm">Загрузка шахматных данных...</span>
            </div>
          }
        >
          <DashboardContent searchParams={searchParams} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900/80 bg-zinc-950/80 backdrop-blur-md py-8 text-center text-xs text-zinc-500 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-zinc-400">ChessPulse</span>
            <span>— Единая аналитика для Lichess и Chess.com</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-500">
            <span>Открытые API:</span>
            <a
              href="https://lichess.org/api"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              Lichess
            </a>
            <span>•</span>
            <a
              href="https://www.chess.com/news/view/published-data-api"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              Chess.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
