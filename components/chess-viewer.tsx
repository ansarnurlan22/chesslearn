'use client';

import { EvalBar } from '@/components/eval-bar';
import { useChessGame } from '@/hooks/use-chess-game';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';

export interface RetryMoveInfo {
  moveNumber: number;
  ply: number;
  betterMove: string;
}

export interface ChessViewerProps {
  pgn?: string;
  moves?: string;
  whitePlayer?: string;
  blackPlayer?: string;
  whiteRating?: number;
  blackRating?: number;
  initialOrientation?: 'white' | 'black';
  openingName?: string;
  targetStep?: number | null;
  onStepChange?: (step: number) => void;
  retryMove?: RetryMoveInfo | null;
  onClearRetry?: () => void;
}

export function ChessViewer({
  pgn,
  moves,
  whitePlayer = 'Белые',
  blackPlayer = 'Чёрные',
  whiteRating,
  blackRating,
  initialOrientation = 'white',
  openingName,
  targetStep,
  onStepChange,
  retryMove,
  onClearRetry,
}: ChessViewerProps) {
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>(initialOrientation);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState<number>(360);

  // Dynamically compute width via ResizeObserver to guarantee responsive fit on 320px-768px+ screens
  useEffect(() => {
    const el = boardContainerRef.current;
    if (!el) return;

    const updateSize = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setBoardWidth(Math.floor(width));
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setBoardWidth(Math.floor(width));
        }
      }
    });

    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Sync orientation with props when changed externally
  useEffect(() => {
    setBoardOrientation(initialOrientation);
  }, [initialOrientation]);

  const {
    fen,
    currentStep,
    totalSteps,
    isStart,
    isEnd,
    moveNotation,
    goToStart,
    goBack,
    goForward,
    goToEnd,
    goToStep,
  } = useChessGame({ pgn, moves });

  // Sync targetStep from parent (e.g. clicking on critical move in GameReview)
  useEffect(() => {
    if (typeof targetStep === 'number' && targetStep >= 0 && targetStep <= totalSteps) {
      goToStep(targetStep);
    }
  }, [targetStep, totalSteps, goToStep]);

  // Notify parent on step change
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  const customBoardStyle = useMemo(
    () => ({
      borderRadius: '16px',
      boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      overflow: 'hidden',
      width: boardWidth > 0 ? `${boardWidth}px` : '100%',
      height: boardWidth > 0 ? `${boardWidth}px` : '100%',
    }),
    [boardWidth],
  );

  const toggleOrientation = () => {
    setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  const topPlayer =
    boardOrientation === 'white'
      ? { name: blackPlayer, rating: blackRating, color: 'Чёрные' }
      : { name: whitePlayer, rating: whiteRating, color: 'Белые' };

  const bottomPlayer =
    boardOrientation === 'white'
      ? { name: whitePlayer, rating: whiteRating, color: 'Белые' }
      : { name: blackPlayer, rating: blackRating, color: 'Чёрные' };

  return (
    <div className="flex flex-col items-center w-full max-w-[500px] mx-auto bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl">
      {/* Top Player Row */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-3 h-3 rounded-full bg-zinc-500 border border-zinc-400 shrink-0" />
          <span className="font-semibold text-sm text-zinc-200 truncate">
            {topPlayer.name}
          </span>
          {topPlayer.rating && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 font-mono border border-zinc-700/50">
              {topPlayer.rating}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={toggleOrientation}
          title="Перевернуть доску"
          className="text-xs text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 px-2.5 py-1.5 rounded-lg border border-zinc-700/60 cursor-pointer touch-manipulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Перевернуть</span>
        </button>
      </div>

      {/* Retry Banner if user clicked "Попробовать переиграть" */}
      {retryMove && (
        <div className="w-full mb-3 p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-between gap-3 text-xs shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Позиция перед ошибкой (ход {retryMove.moveNumber}). Рекомендованный ход:{' '}
              <strong className="text-white font-mono bg-emerald-900/70 px-2 py-0.5 rounded-md border border-emerald-500/50 text-sm ml-1">
                {retryMove.betterMove}
              </strong>
            </span>
          </div>
          {onClearRetry && (
            <button
              type="button"
              onClick={onClearRetry}
              title="Закрыть режим переигрывания"
              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800/60 transition-colors touch-manipulation"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Main Board Area with Vertical Eval Bar on the left */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 w-full my-1">
        {/* Vertical Eval Bar */}
        <EvalBar fen={fen} orientation={boardOrientation} />

        {/* Chessboard Container */}
        <div
          ref={boardContainerRef}
          className="w-full max-w-[480px] aspect-square mx-auto relative select-none min-w-0 overflow-hidden flex items-center justify-center"
        >
          <div
            style={{
              width: boardWidth > 0 ? `${boardWidth}px` : '100%',
              height: boardWidth > 0 ? `${boardWidth}px` : '100%',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            <Chessboard
              options={{
                position: fen,
                boardOrientation,
                allowDragging: false,
                boardStyle: customBoardStyle,
                darkSquareStyle: { backgroundColor: '#334155' },
                lightSquareStyle: { backgroundColor: '#cbd5e1' },
                animationDurationInMs: 180,
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Player Row */}
      <div className="w-full flex items-center justify-between mt-3 mb-3 px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-3 h-3 rounded-full bg-white border border-zinc-300 shrink-0 shadow-sm" />
          <span className="font-semibold text-sm text-zinc-200 truncate">
            {bottomPlayer.name}
          </span>
          {bottomPlayer.rating && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 font-mono border border-zinc-700/50">
              {bottomPlayer.rating}
            </span>
          )}
        </div>
        {openingName && (
          <span
            className="text-xs text-zinc-400 truncate max-w-[160px] sm:max-w-[200px]"
            title={openingName}
          >
            {openingName}
          </span>
        )}
      </div>

      {/* Move Status Box */}
      <div className="w-full bg-zinc-950/80 border border-zinc-800/90 rounded-xl px-3.5 sm:px-4 py-2.5 flex items-center justify-between text-xs text-zinc-300 mb-3 shadow-inner">
        <span className="font-medium text-emerald-300 truncate mr-2">
          {moveNotation}
        </span>
        <span className="text-zinc-400 font-mono whitespace-nowrap bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
          Ход: {currentStep} / {totalSteps}
        </span>
      </div>

      {/* Navigation Controls: В начало, Назад, Вперед, В конец (h-11 touch-manipulation >= 44px) */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full">
        <button
          type="button"
          onClick={goToStart}
          disabled={isStart}
          aria-label="В начало"
          className="h-11 touch-manipulation flex items-center justify-center gap-1.5 px-2 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-all border border-zinc-700/60 cursor-pointer active:scale-95 shadow-sm"
        >
          <ChevronsLeft className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="hidden sm:inline">В начало</span>
        </button>

        <button
          type="button"
          onClick={goBack}
          disabled={isStart}
          aria-label="Назад"
          className="h-11 touch-manipulation flex items-center justify-center gap-1.5 px-2 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-all border border-zinc-700/60 cursor-pointer active:scale-95 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Назад</span>
        </button>

        <button
          type="button"
          onClick={goForward}
          disabled={isEnd}
          aria-label="Вперед"
          className="h-11 touch-manipulation flex items-center justify-center gap-1.5 px-2 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-all border border-zinc-700/60 cursor-pointer active:scale-95 shadow-sm"
        >
          <span>Вперед</span>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        </button>

        <button
          type="button"
          onClick={goToEnd}
          disabled={isEnd}
          aria-label="В конец"
          className="h-11 touch-manipulation flex items-center justify-center gap-1.5 px-2 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-all border border-zinc-700/60 cursor-pointer active:scale-95 shadow-sm"
        >
          <span className="hidden sm:inline">В конец</span>
          <ChevronsRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        </button>
      </div>
    </div>
  );
}
