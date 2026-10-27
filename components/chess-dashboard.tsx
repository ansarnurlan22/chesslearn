'use client';

import { ChessViewer } from '@/components/chess-viewer';
import { GameReview } from '@/components/game-review';
import type { ChessPlatform, UnifiedGame, UnifiedPlayerProfile } from '@/lib/api/types';
import type { GameReviewData } from '@/types/review';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  ExternalLink,
  Flame,
  Globe,
  Loader2,
  MinusCircle,
  Search,
  Swords,
  Trophy,
  User,
  XCircle,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

export interface ChessDashboardProps {
  initialUsername?: string;
  initialPlatform?: ChessPlatform;
  profile: UnifiedPlayerProfile | null;
  error?: string | null;
}

const PLATFORM_CHIPS: Record<ChessPlatform, string[]> = {
  lichess: ['MagnusCarlsen', 'Hikaru', 'DanielNaroditsky'],
  chesscom: ['Hikaru', 'MagnusCarlsen', 'GothamChess', 'DanielNaroditsky'],
};

export function ChessDashboard({
  initialUsername = '',
  initialPlatform = 'lichess',
  profile,
  error,
}: ChessDashboardProps) {
  const router = useRouter();
  const [platform, setPlatform] = useState<ChessPlatform>(initialPlatform);
  const [usernameInput, setUsernameInput] = useState(initialUsername);
  const [isPending, startTransition] = useTransition();

  const isChessCom = platform === 'chesscom';

  const games: UnifiedGame[] = profile?.recentGames ?? [];
  const [selectedGameId, setSelectedGameId] = useState<string | null>(
    games.length > 0 ? games[0].id : null,
  );
  const [targetStep, setTargetStep] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isLargeBoard, setIsLargeBoard] = useState<boolean>(false);
  const [loadedReview, setLoadedReview] = useState<GameReviewData | null>(null);
  const [retryMove, setRetryMove] = useState<{
    moveNumber: number;
    ply: number;
    betterMove: string;
  } | null>(null);

  // Sync state when props change
  useEffect(() => {
    setPlatform(initialPlatform);
  }, [initialPlatform]);

  useEffect(() => {
    if (initialUsername) {
      setUsernameInput(initialUsername);
    }
  }, [initialUsername]);

  useEffect(() => {
    const nextGames = profile?.recentGames ?? [];
    if (nextGames.length > 0) {
      setSelectedGameId(nextGames[0].id);
    } else {
      setSelectedGameId(null);
    }
    setTargetStep(null);
    setRetryMove(null);
  }, [profile?.username, profile?.platform]);

  // Reset targetStep, retry and loadedReview when game selection changes
  useEffect(() => {
    setTargetStep(null);
    setRetryMove(null);
    setLoadedReview(null);
  }, [selectedGameId]);

  const handleSelectMovePly = (ply: number) => {
    setTargetStep(ply);
    setRetryMove(null);
  };

  const handleRetryMove = (ply: number, betterMove: string) => {
    const prevPly = Math.max(0, ply - 1);
    setTargetStep(prevPly);
    setRetryMove({
      moveNumber: Math.ceil(ply / 2),
      ply,
      betterMove,
    });
  };

  const handleSearch = (targetName: string, targetPlatform: ChessPlatform = platform) => {
    const trimmed = targetName.trim();
    if (!trimmed) return;
    startTransition(() => {
      router.push(`/?u=${encodeURIComponent(trimmed)}&p=${targetPlatform}`);
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(usernameInput, platform);
  };

  const onPlatformChange = (newPlatform: ChessPlatform) => {
    setPlatform(newPlatform);
    if (usernameInput.trim()) {
      handleSearch(usernameInput, newPlatform);
    }
  };

  // Selected game
  const selectedGame = games.find((g) => g.id === selectedGameId) ?? games[0] ?? null;

  // Selected game orientation
  const selectedOrientation: 'white' | 'black' = selectedGame?.white ? 'white' : 'black';

  // Winrate calculation
  const totalGamesCount =
    profile ? profile.record.win + profile.record.loss + profile.record.draw : 0;
  const wins = profile?.record.win ?? 0;
  const losses = profile?.record.loss ?? 0;
  const draws = profile?.record.draw ?? 0;
  const winRate =
    totalGamesCount > 0 ? Math.round((wins / totalGamesCount) * 100) : 0;
  const lossRate =
    totalGamesCount > 0 ? Math.round((losses / totalGamesCount) * 100) : 0;
  const drawRate =
    totalGamesCount > 0 ? Math.max(0, 100 - winRate - lossRate) : 0;

  return (
    <div className={`min-h-screen ${isChessCom ? 'bg-[#161512]' : 'bg-[#161512]'} text-white font-sans antialiased flex flex-col transition-colors duration-200`}>
      {/* Sticky Header Navbar */}
      <header className={`sticky top-0 z-50 backdrop-blur-md ${isChessCom ? 'bg-[#161512]/95 border-[#302e2b]' : 'bg-[#161512]/95 border-[#33312c]'} border-b transition-colors`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className={`w-9 h-9 rounded-lg ${isChessCom ? 'bg-[#211f1c] border-[#302e2b] text-[#81b64c]' : 'bg-[#24221f] border-[#33312c] text-[#3692e7]'} border flex items-center justify-center transition-colors`}>
              <Crown className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white block leading-none">
                ChessPulse
              </span>
            </div>
          </a>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <button
              type="button"
              onClick={() => onPlatformChange('lichess')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                platform === 'lichess'
                  ? 'bg-[#3692e7] text-white border-[#3692e7] font-bold'
                  : isChessCom
                    ? 'bg-[#211f1c] hover:bg-[#262421] text-[#c3c2c1] border-[#302e2b]'
                    : 'bg-[#24221f] hover:bg-[#292723] text-[#bababa] border-[#33312c]'
              }`}
            >
              Lichess
            </button>
            <button
              type="button"
              onClick={() => onPlatformChange('chesscom')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                platform === 'chesscom'
                  ? 'bg-[#81b64c] text-white border-[#81b64c] font-bold'
                  : isChessCom
                    ? 'bg-[#211f1c] hover:bg-[#262421] text-[#c3c2c1] border-[#302e2b]'
                    : 'bg-[#24221f] hover:bg-[#292723] text-[#bababa] border-[#33312c]'
              }`}
            >
              Chess.com
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="w-full flex flex-col gap-10 pt-10 pb-16">
          {/* Hero Section */}
          <section className="flex flex-col items-center text-center max-w-3xl mx-auto px-4">
            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
              Анализ партий{' '}
              <span className={isChessCom ? 'text-[#81b64c]' : 'text-[#3692e7]'}>
                нового поколения
              </span>
            </h1>

            <p className={`text-base sm:text-lg max-w-xl mb-8 leading-relaxed ${isChessCom ? 'text-[#c3c2c1]' : 'text-[#bababa]'}`}>
              Изучай статистику, просматривай партии и получай подробный анализ ходов с точностью и оценкой позиции.
            </p>

            {/* Matte Search & Platform Selector Card */}
            <div className={`w-full max-w-xl ${isChessCom ? 'bg-[#211f1c] border-[#302e2b]' : 'bg-[#24221f] border-[#33312c]'} border p-3 sm:p-4 rounded-3xl shadow-sm flex flex-col gap-3`}>
              {/* Platform Switcher Tabs */}
              <div className={`grid grid-cols-2 p-1 rounded-2xl ${isChessCom ? 'bg-[#191815] border-[#302e2b]' : 'bg-[#1c1a17] border-[#33312c]'} border`}>
                <button
                  type="button"
                  onClick={() => onPlatformChange('lichess')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    platform === 'lichess'
                      ? 'bg-[#3692e7] text-white font-bold'
                      : 'text-[#bababa] hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4 text-white" />
                  <span>Lichess.org</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPlatformChange('chesscom')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    platform === 'chesscom'
                      ? 'bg-[#81b64c] text-white font-bold'
                      : 'text-[#c3c2c1] hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>Chess.com</span>
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2.5 sm:gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Никнейм игрока..."
                    className={`w-full ${
                      isChessCom
                        ? 'bg-[#191815] border-[#302e2b] focus:border-[#81b64c]'
                        : 'bg-[#1c1a17] border-[#33312c] focus:border-[#3692e7]'
                    } border text-white placeholder:text-zinc-500 rounded-xl px-4 py-3.5 pl-11 text-sm sm:text-base outline-none transition-all`}
                    disabled={isPending}
                  />
                  {isPending && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className={`w-5 h-5 ${isChessCom ? 'text-[#81b64c]' : 'text-[#3692e7]'} animate-spin`} />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isPending || !usernameInput.trim()}
                  className={`w-full sm:w-auto h-12 sm:h-auto ${
                    isChessCom
                      ? 'bg-[#81b64c] hover:bg-[#74a643]'
                      : 'bg-[#3692e7] hover:bg-[#2b7ecc]'
                  } text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0 active:scale-[0.98] cursor-pointer touch-manipulation`}
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Search className="w-4 h-4 text-white stroke-[2.5]" />
                  )}
                  <span>Анализировать</span>
                </button>
              </form>
            </div>

            {/* Quick select chip pills */}
            <div className={`flex flex-wrap items-center justify-center gap-2 mt-4 text-xs ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} px-2`}>
              <span className="w-full sm:w-auto text-center sm:text-left mb-0.5 sm:mb-0">
                {platform === 'chesscom' ? 'Топ на Chess.com:' : 'Топ на Lichess:'}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {PLATFORM_CHIPS[platform].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setUsernameInput(name);
                      handleSearch(name, platform);
                    }}
                    disabled={isPending}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium ${
                      isChessCom
                        ? 'bg-[#211f1c] hover:bg-[#262421] text-[#c3c2c1] border-[#302e2b]'
                        : 'bg-[#24221f] hover:bg-[#292723] text-[#bababa] border-[#33312c]'
                    } hover:text-white border transition-all cursor-pointer touch-manipulation`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Error notification */}
          {error && (
            <div className="max-w-xl mx-auto w-full px-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-sm shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-300">Ошибка поиска</p>
                  <p className="text-rose-400/90 text-xs mt-0.5">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results View */}
          {profile && (
            <div className="flex flex-col gap-10 max-w-6xl mx-auto w-full">
              {/* Profile Overview Card */}
              <section className={`${isChessCom ? 'bg-[#211f1c] border-[#302e2b]' : 'bg-[#24221f] border-[#33312c]'} border rounded-3xl p-6 sm:p-8 shadow-sm`}>
                {/* Header row */}
                <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b ${isChessCom ? 'border-[#302e2b]' : 'border-[#33312c]'}`}>
                  <div className="flex items-center gap-5">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.username}
                        className={`w-16 h-16 rounded-2xl object-cover border ${isChessCom ? 'border-[#302e2b] bg-[#191815]' : 'border-[#33312c] bg-[#1c1a17]'} shrink-0`}
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl ${isChessCom ? 'bg-[#262421] border-[#302e2b] text-[#81b64c]' : 'bg-[#292723] border-[#33312c] text-[#3692e7]'} border flex items-center justify-center font-black text-2xl shrink-0`}>
                        {profile.title ? profile.title : <User className="w-8 h-8" />}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          {profile.name || profile.username}
                        </h2>
                        {profile.name && (
                          <span className={`text-sm ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} font-mono`}>
                            (@{profile.username})
                          </span>
                        )}
                        {profile.title && (
                          <span className="px-2.5 py-0.5 text-xs font-black rounded bg-amber-400 text-zinc-950 uppercase tracking-wider shadow-sm">
                            {profile.title}
                          </span>
                        )}
                        {/* Platform Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border font-semibold ${
                            profile.platform === 'chesscom'
                              ? 'border-[#81b64c]/40 bg-[#81b64c]/15 text-[#81b64c]'
                              : 'border-[#3692e7]/40 bg-[#3692e7]/15 text-[#3692e7]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              profile.platform === 'chesscom' ? 'bg-[#81b64c]' : 'bg-[#3692e7]'
                            }`}
                          />
                          {profile.platform === 'chesscom' ? 'Chess.com' : 'Lichess'}
                        </span>
                        {profile.online !== undefined && (
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border ${
                              profile.online
                                ? isChessCom
                                  ? 'border-[#81b64c]/40 bg-[#81b64c]/15 text-[#81b64c]'
                                  : 'border-[#3692e7]/40 bg-[#3692e7]/15 text-[#3692e7]'
                                : 'border-zinc-700 bg-zinc-800/60 text-zinc-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                profile.online
                                  ? isChessCom ? 'bg-[#81b64c] animate-pulse' : 'bg-[#3692e7] animate-pulse'
                                  : 'bg-zinc-500'
                              }`}
                            />
                            {profile.online ? 'В сети' : 'Офлайн'}
                          </span>
                        )}
                      </div>
                      {profile.profileUrl && (
                        <a
                          href={profile.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 text-xs ${isChessCom ? 'text-[#8b8987] hover:text-[#81b64c]' : 'text-[#7e7b76] hover:text-[#3692e7]'} transition-colors mt-1.5 font-mono`}
                        >
                          <span className="truncate max-w-[280px]">{profile.profileUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Match Stats Counters */}
                  <div className={`flex items-center gap-6 sm:gap-8 ${isChessCom ? 'bg-[#191815] border-[#302e2b]' : 'bg-[#1c1a17] border-[#33312c]'} px-6 py-3.5 rounded-2xl border`}>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-black text-emerald-400">{wins}</div>
                      <div className={`text-xs ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} font-medium`}>Победы</div>
                    </div>
                    <div className={`w-px h-8 ${isChessCom ? 'bg-[#302e2b]' : 'bg-[#33312c]'}`} />
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-black text-amber-400">{draws}</div>
                      <div className={`text-xs ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} font-medium`}>Ничьи</div>
                    </div>
                    <div className={`w-px h-8 ${isChessCom ? 'bg-[#302e2b]' : 'bg-[#33312c]'}`} />
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-black text-rose-400">{losses}</div>
                      <div className={`text-xs ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} font-medium`}>Поражения</div>
                    </div>
                  </div>
                </div>

                {/* Ratings Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {/* Blitz */}
                  <div className={`${isChessCom ? 'bg-[#191815] border-[#302e2b] hover:bg-[#262421]' : 'bg-[#1c1a17] border-[#33312c] hover:bg-[#292723]'} border rounded-2xl p-5 transition-all group`}>
                    <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                      <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                        <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        Блиц
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">Blitz</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                      {profile.ratings.blitz ?? '—'}
                    </div>
                    <div className={`text-[11px] ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} mt-1`}>Рейтинг Blitz</div>
                  </div>

                  {/* Rapid */}
                  <div className={`${isChessCom ? 'bg-[#191815] border-[#302e2b] hover:bg-[#262421]' : 'bg-[#1c1a17] border-[#33312c] hover:bg-[#292723]'} border rounded-2xl p-5 transition-all group`}>
                    <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                      <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                        <Clock className={`w-4 h-4 ${isChessCom ? 'text-[#81b64c]' : 'text-[#3692e7]'} group-hover:scale-110 transition-transform`} />
                        Рапид
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">Rapid</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                      {profile.ratings.rapid ?? '—'}
                    </div>
                    <div className={`text-[11px] ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} mt-1`}>Рейтинг Rapid</div>
                  </div>

                  {/* Bullet */}
                  <div className={`${isChessCom ? 'bg-[#191815] border-[#302e2b] hover:bg-[#262421]' : 'bg-[#1c1a17] border-[#33312c] hover:bg-[#292723]'} border rounded-2xl p-5 transition-all group`}>
                    <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                      <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                        <Flame className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                        Пуля
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">Bullet</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                      {profile.ratings.bullet ?? '—'}
                    </div>
                    <div className={`text-[11px] ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} mt-1`}>Рейтинг Bullet</div>
                  </div>

                  {/* Classical / Daily */}
                  <div className={`${isChessCom ? 'bg-[#191815] border-[#302e2b] hover:bg-[#262421]' : 'bg-[#1c1a17] border-[#33312c] hover:bg-[#292723]'} border rounded-2xl p-5 transition-all group`}>
                    <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                      <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                        <Trophy className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                        {profile.platform === 'chesscom' ? 'Заочные' : 'Классика'}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {profile.platform === 'chesscom' ? 'Daily' : 'Classical'}
                      </span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                      {profile.ratings.classical ?? '—'}
                    </div>
                    <div className={`text-[11px] ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} mt-1`}>
                      {profile.platform === 'chesscom' ? 'Рейтинг Daily' : 'Рейтинг Classical'}
                    </div>
                  </div>
                </div>

                {/* Colored Segmented Progress Bar */}
                <div className={`mt-6 pt-5 border-t ${isChessCom ? 'border-[#302e2b]' : 'border-[#33312c]'}`}>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2.5">
                    <span className="font-medium text-zinc-300">Соотношение результатов</span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> {winRate}% побед
                      </span>
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-amber-400" /> {drawRate}% ничьих
                      </span>
                      <span className="flex items-center gap-1 text-rose-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-rose-400" /> {lossRate}% поражений
                      </span>
                    </div>
                  </div>
                  <div className={`w-full h-2.5 rounded-full ${isChessCom ? 'bg-[#191815] border-[#302e2b]' : 'bg-[#1c1a17] border-[#33312c]'} overflow-hidden flex border`}>
                    <div
                      style={{ width: `${winRate}%` }}
                      title={`Победы: ${winRate}%`}
                      className="bg-emerald-500 h-full transition-all duration-700"
                    />
                    <div
                      style={{ width: `${drawRate}%` }}
                      title={`Ничьи: ${drawRate}%`}
                      className="bg-amber-400 h-full transition-all duration-700"
                    />
                    <div
                      style={{ width: `${lossRate}%` }}
                      title={`Поражения: ${lossRate}%`}
                      className="bg-rose-500 h-full transition-all duration-700"
                    />
                  </div>
                </div>
              </section>

              {/* Main Layout: 2 columns (Left: Matches, Right: Board + Review) */}
              <section className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
                {/* Interactive Chessboard & AI Game Review */}
                <div
                  className={`w-full order-1 lg:order-2 ${
                    isLargeBoard ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-7'
                  } flex flex-col gap-6 transition-all duration-300`}
                >
                  {selectedGame ? (
                    <>
                      <div className="flex flex-col gap-2.5">
                        <div className="text-xs px-1 font-medium flex items-center justify-between">
                          <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isChessCom ? 'bg-[#81b64c]' : 'bg-[#3692e7]'}`} />
                            Интерактивная доска & Оценка
                          </span>
                          {selectedGame.url && (
                            <a
                              href={selectedGame.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${isChessCom ? 'text-[#81b64c] hover:underline' : 'text-[#3692e7] hover:underline'} flex items-center gap-1 transition-colors font-medium touch-manipulation`}
                            >
                              <span>
                                {profile.platform === 'chesscom'
                                  ? 'Смотреть на Chess.com'
                                  : 'Смотреть на Lichess'}
                              </span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <ChessViewer
                          pgn={selectedGame.pgn}
                          moves={selectedGame.moves}
                          whitePlayer={selectedGame.white ? profile.username : selectedGame.opponent}
                          blackPlayer={selectedGame.white ? selectedGame.opponent : profile.username}
                          whiteRating={selectedGame.white ? undefined : selectedGame.opponentRating}
                          blackRating={selectedGame.white ? selectedGame.opponentRating : undefined}
                          initialOrientation={selectedOrientation}
                          openingName={selectedGame.opening}
                          targetStep={targetStep}
                          onStepChange={setActiveStep}
                          retryMove={retryMove}
                          onClearRetry={() => setRetryMove(null)}
                          criticalMoves={loadedReview?.criticalMoves}
                          isLarge={isLargeBoard}
                          onToggleSize={() => setIsLargeBoard((prev) => !prev)}
                          platform={platform}
                        />
                      </div>

                      {/* AI Game Review Card */}
                      <GameReview
                        key={selectedGame.id}
                        pgn={selectedGame.pgn}
                        playerColor={selectedOrientation}
                        username={profile.username}
                        onSelectMovePly={handleSelectMovePly}
                        onRetryMove={handleRetryMove}
                        onReviewLoaded={setLoadedReview}
                        activePly={activeStep}
                        platform={platform}
                      />
                    </>
                  ) : (
                    <div className={`p-16 text-center ${isChessCom ? 'bg-[#211f1c] border-[#302e2b] text-[#8b8987]' : 'bg-[#24221f] border-[#33312c] text-[#7e7b76]'} rounded-3xl border text-sm`}>
                      Выбери партию в списке для анализа
                    </div>
                  )}
                </div>

                {/* Match Archive List */}
                <div
                  className={`w-full order-2 lg:order-1 ${
                    isLargeBoard ? 'lg:col-span-4 xl:col-span-3' : 'lg:col-span-5'
                  } flex flex-col gap-3.5 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-1 px-1">
                    <div className="flex items-center gap-2">
                      <Swords className={`w-4 h-4 ${isChessCom ? 'text-[#81b64c]' : 'text-[#3692e7]'}`} />
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        Недавние партии
                      </h3>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full ${isChessCom ? 'bg-[#191815] border-[#302e2b] text-[#8b8987]' : 'bg-[#1c1a17] border-[#33312c] text-[#7e7b76]'} border font-mono`}>
                      {games.length} {games.length === 1 ? 'партия' : 'партий'}
                    </span>
                  </div>

                  {games.length === 0 ? (
                    <div className={`p-12 text-center ${isChessCom ? 'bg-[#211f1c] border-[#302e2b] text-[#8b8987]' : 'bg-[#24221f] border-[#33312c] text-[#7e7b76]'} rounded-2xl border text-sm`}>
                      Недавние партии не найдены в архиве игрока
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {games.map((game) => {
                        let resultBadge = (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
                            <MinusCircle className="w-3.5 h-3.5" /> Ничья
                          </span>
                        );
                        if (game.result === 'win') {
                          resultBadge = (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Победа
                            </span>
                          );
                        } else if (game.result === 'loss') {
                          resultBadge = (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold">
                              <XCircle className="w-3.5 h-3.5" /> Поражение
                            </span>
                          );
                        }

                        const isSelected = selectedGame?.id === game.id;

                        return (
                          <button
                            key={game.id}
                            type="button"
                            onClick={() => setSelectedGameId(game.id)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2.5 cursor-pointer touch-manipulation ${
                              isSelected
                                ? isChessCom
                                  ? 'bg-[#262421] border-[#81b64c] ring-1 ring-[#81b64c]'
                                  : 'bg-[#292723] border-[#3692e7] ring-1 ring-[#3692e7]'
                                : isChessCom
                                  ? 'bg-[#191815] border-[#302e2b] hover:bg-[#262421]'
                                  : 'bg-[#1c1a17] border-[#33312c] hover:bg-[#292723]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`text-xs px-2 py-0.5 rounded-md ${isChessCom ? 'bg-[#211f1c] text-[#c3c2c1] border-[#302e2b]' : 'bg-[#24221f] text-[#bababa] border-[#33312c]'} border font-mono shrink-0`}>
                                  {game.white ? '♔ Белые' : '♚ Чёрные'}
                                </span>
                                <span className="font-bold text-sm text-zinc-100 truncate">
                                  vs {game.opponent}
                                </span>
                                {game.opponentRating && (
                                  <span className={`text-xs ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} font-mono shrink-0`}>
                                    ({game.opponentRating})
                                  </span>
                                )}
                              </div>
                              <div className="shrink-0">{resultBadge}</div>
                            </div>

                            <div className={`flex items-center justify-between text-xs pt-1.5 border-t ${isChessCom ? 'border-[#302e2b]' : 'border-[#33312c]'}`}>
                              <span
                                className={`truncate max-w-[200px] ${isChessCom ? 'text-[#c3c2c1]' : 'text-[#bababa]'} font-medium`}
                                title={game.opening}
                              >
                                {game.opening ?? 'Стандартное начало'}
                              </span>
                              <div className={`flex items-center gap-2 shrink-0 ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'}`}>
                                <span className="capitalize">{game.timeControl}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-mono">
                                  <Calendar className="w-3 h-3" />
                                  {game.date}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Initial Empty State */}
          {!profile && !error && (
            <div className="max-w-md mx-auto text-center py-12 px-4">
              <div className={`w-16 h-16 rounded-3xl ${isChessCom ? 'bg-[#211f1c] border-[#302e2b] text-[#81b64c]' : 'bg-[#24221f] border-[#33312c] text-[#3692e7]'} border flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                <Trophy className="w-8 h-8" />
              </div>
              <h4 className="text-white font-bold text-lg mb-1.5">Готов к анализу</h4>
              <p className={`text-xs sm:text-sm leading-relaxed ${isChessCom ? 'text-[#c3c2c1]' : 'text-[#bababa]'}`}>
                Выбери платформу (Lichess или Chess.com), введи никнейм или нажми на одного из гроссмейстеров выше, чтобы мгновенно загрузить статистику и разобрать партии.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t ${isChessCom ? 'border-[#302e2b] bg-[#161512] text-[#8b8987]' : 'border-[#33312c] bg-[#161512] text-[#7e7b76]'} py-8 text-center text-xs transition-colors`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crown className={`w-4 h-4 ${isChessCom ? 'text-[#81b64c]' : 'text-[#3692e7]'}`} />
            <span className="font-semibold text-zinc-300">ChessPulse</span>
            <span>— Анализ шахматных партий</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Открытые API:</span>
            <a
              href="https://lichess.org/api"
              target="_blank"
              rel="noopener noreferrer"
              className={`${isChessCom ? 'hover:text-[#81b64c]' : 'hover:text-[#3692e7]'} transition-colors`}
            >
              Lichess
            </a>
            <span>•</span>
            <a
              href="https://www.chess.com/news/view/published-data-api"
              target="_blank"
              rel="noopener noreferrer"
              className={`${isChessCom ? 'hover:text-[#81b64c]' : 'hover:text-[#3692e7]'} transition-colors`}
            >
              Chess.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
