'use client';

import {
  CLASSIFICATION_META,
  classifyGameMoves,
} from '@/lib/chess-classifier';
import type {
  CriticalMove,
  CriticalMoveType,
  GameReviewData,
  MoveClassificationType,
} from '@/types/review';
import {
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Loader2,
  RotateCcw,
  Sparkles,
  Star,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface GameReviewProps {
  pgn: string;
  playerColor?: 'white' | 'black';
  username?: string;
  onSelectMovePly: (ply: number) => void;
  onRetryMove: (ply: number, betterMove: string) => void;
  onReviewLoaded?: (data: GameReviewData) => void;
  activePly?: number;
}

const TYPE_CONFIG: Record<
  CriticalMoveType,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  brilliant: {
    label: 'Блестящий',
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-300',
    border: 'border-cyan-500/40',
    icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
  },
  best: {
    label: 'Лучший',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  },
  inaccuracy: {
    label: 'Неточность',
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-300',
    border: 'border-yellow-500/40',
    icon: <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />,
  },
  mistake: {
    label: 'Ошибка',
    bg: 'bg-orange-500/15',
    text: 'text-orange-300',
    border: 'border-orange-500/40',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />,
  },
  blunder: {
    label: 'Зевок',
    bg: 'bg-rose-500/15',
    text: 'text-rose-300',
    border: 'border-rose-500/40',
    icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
  },
};

const STATS_CATEGORIES: Array<{
  type: MoveClassificationType;
  label: string;
  glyph: string;
  icon: React.ReactNode;
  bg: string;
  text: string;
  border: string;
}> = [
  {
    type: 'brilliant',
    label: 'Бриллиантовые',
    glyph: '!!',
    icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
    bg: 'bg-cyan-950/60',
    text: 'text-cyan-300',
    border: 'border-cyan-500/50',
  },
  {
    type: 'great',
    label: 'Отличные',
    glyph: '!',
    icon: <Star className="w-3.5 h-3.5 text-blue-400" />,
    bg: 'bg-blue-950/60',
    text: 'text-blue-300',
    border: 'border-blue-500/50',
  },
  {
    type: 'best',
    label: 'Лучшие',
    glyph: '★',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-300',
    border: 'border-emerald-500/50',
  },
  {
    type: 'good',
    label: 'Хорошие',
    glyph: '✓',
    icon: <Check className="w-3.5 h-3.5 text-zinc-400" />,
    bg: 'bg-zinc-800/80',
    text: 'text-zinc-300',
    border: 'border-zinc-700/60',
  },
  {
    type: 'book',
    label: 'Дебютная книга',
    glyph: '📖',
    icon: <BookOpen className="w-3.5 h-3.5 text-amber-400" />,
    bg: 'bg-amber-950/60',
    text: 'text-amber-300',
    border: 'border-amber-700/50',
  },
  {
    type: 'inaccuracy',
    label: 'Неточности',
    glyph: '?!',
    icon: <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />,
    bg: 'bg-yellow-950/60',
    text: 'text-yellow-300',
    border: 'border-yellow-600/50',
  },
  {
    type: 'mistake',
    label: 'Ошибки',
    glyph: '?',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />,
    bg: 'bg-orange-950/60',
    text: 'text-orange-300',
    border: 'border-orange-600/50',
  },
  {
    type: 'blunder',
    label: 'Зевки',
    glyph: '??',
    icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
    bg: 'bg-rose-950/60',
    text: 'text-rose-300',
    border: 'border-rose-600/50',
  },
];

export function GameReview({
  pgn,
  playerColor = 'white',
  username = 'Игрок',
  onSelectMovePly,
  onRetryMove,
  onReviewLoaded,
  activePly,
}: GameReviewProps) {
  const [review, setReview] = useState<GameReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryingPly, setRetryingPly] = useState<number | null>(null);

  const startAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pgn,
          playerColor,
          username,
        }),
      });

      if (!res.ok) {
        throw new Error(`Ошибка сервера: ${res.statusText}`);
      }

      const data: GameReviewData = await res.json();
      setReview(data);
      onReviewLoaded?.(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось провести анализ партии';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const userAccuracy =
    playerColor === 'white'
      ? review?.accuracy.white ?? 0
      : review?.accuracy.black ?? 0;

  const opponentAccuracy =
    playerColor === 'white'
      ? review?.accuracy.black ?? 0
      : review?.accuracy.white ?? 0;

  // Breakdown stats for White & Black
  const stats = useMemo(() => {
    if (review?.stats) return review.stats;
    return classifyGameMoves(pgn, review?.criticalMoves || []).stats;
  }, [review, pgn]);

  return (
    <div className="w-full bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-zinc-950 font-bold shadow-md shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span>AI Game Review</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono">
                Gemini
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Гроссмейстерский разбор ходов и классификация в стиле Chess.com</p>
          </div>
        </div>

        {/* Action Button */}
        {!review && (
          <button
            type="button"
            onClick={startAnalysis}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer touch-manipulation"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                <span>Анализирую партию...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-zinc-950" />
                <span>Запустить AI-разбор партии</span>
              </>
            )}
          </button>
        )}

        {review && (
          <button
            type="button"
            onClick={startAnalysis}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Пересчитать</span>
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs">
          {error}
        </div>
      )}

      {/* Before analysis prompt */}
      {!review && !isLoading && !error && (
        <div className="py-8 text-center text-zinc-400 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-cyan-400">
            <Lightbulb className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-zinc-300">Партия готова к AI-анализу</p>
          <p className="text-xs text-zinc-500 max-w-sm">
            Нажми «Запустить AI-разбор партии», чтобы нейросеть оценила точность, выявила блестящие ходы, ошибки и составила сводную таблицу.
          </p>
        </div>
      )}

      {/* Loading animation state */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center gap-4 text-zinc-400">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <Sparkles className="w-5 h-5 text-cyan-400 absolute inset-0 m-auto" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Нейросеть анализирует партию...</p>
            <p className="text-xs text-zinc-500 mt-1">Оценка точности, поиск зевков и классификация всех ходов</p>
          </div>
        </div>
      )}

      {/* Review Content */}
      {review && (
        <div className="flex flex-col gap-6">
          {/* Accuracy Gauge Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* White Accuracy */}
            <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-1">
                <span className="flex items-center gap-1.5 text-zinc-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-zinc-300" />
                  Точность Белых {playerColor === 'white' && '(Вы)'}
                </span>
                <span className="font-mono text-zinc-400">
                  {review.accuracy.white.toFixed(1)}%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight my-1">
                {review.accuracy.white.toFixed(1)}%
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, review.accuracy.white)}%` }}
                />
              </div>
            </div>

            {/* Black Accuracy */}
            <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-1">
                <span className="flex items-center gap-1.5 text-zinc-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 border border-zinc-500" />
                  Точность Чёрных {playerColor === 'black' && '(Вы)'}
                </span>
                <span className="font-mono text-zinc-400">
                  {review.accuracy.black.toFixed(1)}%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight my-1">
                {review.accuracy.black.toFixed(1)}%
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, review.accuracy.black)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Full Move Breakdown Table (Chess.com Style) */}
          <div className="w-full bg-zinc-950/70 border border-zinc-800/90 rounded-2xl p-4 flex flex-col gap-3 shadow-inner">
            <div className="flex items-center justify-between px-1 text-xs border-b border-zinc-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white border border-zinc-300 shadow-sm" />
                <span className="font-bold text-zinc-200">Белые</span>
              </div>
              <span className="font-bold uppercase tracking-wider text-[11px] text-zinc-400">
                Сводная таблица ходов (Chess.com)
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-200">Чёрные</span>
                <span className="w-3 h-3 rounded-full bg-zinc-600 border border-zinc-500" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              {STATS_CATEGORIES.map((cat) => {
                const whiteVal = stats.white[cat.type] || 0;
                const blackVal = stats.black[cat.type] || 0;

                return (
                  <div
                    key={cat.type}
                    className="grid grid-cols-12 items-center py-1.5 px-2 rounded-xl hover:bg-zinc-900/60 transition-colors"
                  >
                    {/* White Count */}
                    <div className="col-span-3 flex items-center justify-start gap-1.5 font-mono font-bold text-zinc-100">
                      <span
                        className={`min-w-[28px] text-center px-2 py-0.5 rounded-md ${
                          whiteVal > 0 ? `${cat.bg} ${cat.text}` : 'bg-zinc-900/80 text-zinc-600'
                        }`}
                      >
                        {whiteVal}
                      </span>
                    </div>

                    {/* Category Center Badge */}
                    <div className="col-span-6 flex items-center justify-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold ${cat.bg} ${cat.text} ${cat.border} shadow-sm`}
                      >
                        {cat.icon}
                        <span>{cat.label}</span>
                        <span className="font-mono text-[10px] opacity-80">({cat.glyph})</span>
                      </span>
                    </div>

                    {/* Black Count */}
                    <div className="col-span-3 flex items-center justify-end gap-1.5 font-mono font-bold text-zinc-100">
                      <span
                        className={`min-w-[28px] text-center px-2 py-0.5 rounded-md ${
                          blackVal > 0 ? `${cat.bg} ${cat.text}` : 'bg-zinc-900/80 text-zinc-600'
                        }`}
                      >
                        {blackVal}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coach's Summary and Takeaway */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Совет тренера
                </h4>
                <p className="text-xs sm:text-sm text-zinc-200 mt-1 leading-relaxed font-medium">
                  {review.keyTakeaway}
                </p>
              </div>
            </div>
            {review.summary && (
              <p className="text-xs text-zinc-400 pl-11 leading-relaxed border-t border-zinc-800/60 pt-2.5">
                {review.summary}
              </p>
            )}
          </div>

          {/* Interactive Critical Moments List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Ключевые моменты партии</span>
                <span className="text-xs text-zinc-500 font-normal">
                  (кликни для перехода на доске)
                </span>
              </h4>
            </div>

            <div className="flex flex-col gap-2.5">
              {review.criticalMoves.map((item, idx) => {
                const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.mistake;
                const isActive = activePly === item.ply;
                const isRetrying = retryingPly === item.ply;

                return (
                  <div
                    key={`${item.ply}-${idx}`}
                    className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
                      isActive
                        ? 'bg-zinc-800/90 border-cyan-500/80 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/50'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'
                    }`}
                  >
                    {/* Top Row: Move badge, type, and jump button */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div
                        onClick={() => onSelectMovePly(item.ply)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono border border-zinc-700/60">
                          Ход {item.moveNumber} ({item.color === 'white' ? 'Белые' : 'Чёрные'})
                        </span>
                        <span className="text-sm font-bold text-white font-mono">
                          {item.san}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-semibold ${config.bg} ${config.text} ${config.border}`}
                        >
                          {config.icon}
                          <span>{config.label}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Retry Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setRetryingPly(item.ply);
                            onRetryMove(item.ply, item.betterMove);
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 font-medium cursor-pointer touch-manipulation ${
                            isRetrying
                              ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold'
                              : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700/60'
                          }`}
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Попробовать переиграть</span>
                        </button>
                      </div>
                    </div>

                    {/* Comment from AI */}
                    <p
                      onClick={() => onSelectMovePly(item.ply)}
                      className="text-xs text-zinc-300 leading-relaxed cursor-pointer"
                    >
                      {item.comment}
                    </p>

                    {/* Recommendation Row */}
                    {item.betterMove && item.type !== 'brilliant' && item.type !== 'best' && (
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                        <span className="text-zinc-400">
                          Лучше было сыграть:{' '}
                          <strong className="text-emerald-400 font-mono text-sm ml-1">
                            {item.betterMove}
                          </strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectMovePly(item.ply)}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] cursor-pointer touch-manipulation"
                        >
                          <span>Смотреть позицию</span>
                          <span className="text-cyan-400">→</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
