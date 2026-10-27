'use client';

import {
  evaluatePositionHeuristic,
  type PositionEvaluation,
} from '@/lib/eval-parser';
import { useMemo } from 'react';

interface EvalBarProps {
  fen: string;
  orientation?: 'white' | 'black';
  engineEval?: PositionEvaluation | null;
}

export function EvalBar({
  fen,
  orientation = 'white',
  engineEval,
}: EvalBarProps) {
  // If engineEval from PGN comments is available, use it; otherwise compute positional heuristic
  const currentEval = useMemo(() => {
    if (engineEval) return engineEval;
    return evaluatePositionHeuristic(fen);
  }, [fen, engineEval]);

  const { score, text } = currentEval;

  // Convert score into percentage for White (clamp between 6% and 94%)
  const whitePercent = useMemo(() => {
    const clampedScore = Math.max(-10, Math.min(10, score));
    return 50 + (clampedScore / 10) * 44;
  }, [score]);

  // If orientation is white: White is at bottom, Black is at top
  const bottomPercent = orientation === 'white' ? whitePercent : 100 - whitePercent;

  return (
    <div
      className="relative w-5 sm:w-6 self-stretch my-0.5 rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950 flex flex-col justify-end shadow-xl select-none shrink-0"
      title={`Оценка позиции: ${text} ${currentEval.isEngine ? '(Stockfish PGN)' : '(Позиционный анализ)'}`}
    >
      {/* Top section (Black if white orientation) */}
      <div className="w-full flex-1 bg-zinc-900 transition-all duration-300 relative" />

      {/* Bottom section (White if white orientation) */}
      <div
        className="w-full bg-zinc-100 transition-all duration-300 relative"
        style={{ height: `${bottomPercent}%` }}
      />

      {/* Numerical score badge */}
      <div className="absolute inset-x-0 bottom-2 flex justify-center pointer-events-none px-0.5">
        <span
          className={`text-[9px] sm:text-[10px] font-mono font-bold px-1 py-0.5 rounded shadow-sm leading-none ${
            bottomPercent > 50
              ? 'bg-zinc-900/80 text-zinc-100 border border-zinc-700/60'
              : 'bg-zinc-100/90 text-zinc-950 border border-zinc-300'
          }`}
        >
          {text}
        </span>
      </div>
    </div>
  );
}
