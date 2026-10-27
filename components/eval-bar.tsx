'use client';

import { useMemo } from 'react';

interface EvalBarProps {
  fen: string;
  orientation?: 'white' | 'black';
}

/**
 * Fast material balance evaluation heuristic
 */
function evaluateFen(fen: string): { score: number; text: string; isCheckmate: boolean } {
  const parts = fen.split(' ');
  const position = parts[0] ?? '';

  const values: Record<string, number> = {
    p: -1,
    n: -3.1,
    b: -3.3,
    r: -5,
    q: -9.2,
    P: 1,
    N: 3.1,
    B: 3.3,
    R: 5,
    Q: 9.2,
  };

  let materialBalance = 0;
  for (const char of position) {
    if (values[char] !== undefined) {
      materialBalance += values[char];
    }
  }

  // Round to 1 decimal place
  const rounded = Math.round(materialBalance * 10) / 10;
  const sign = rounded > 0 ? `+${rounded.toFixed(1)}` : `${rounded.toFixed(1)}`;
  const text = rounded === 0 ? '0.0' : sign;

  return {
    score: rounded,
    text,
    isCheckmate: false,
  };
}

export function EvalBar({ fen, orientation = 'white' }: EvalBarProps) {
  const { score, text } = useMemo(() => evaluateFen(fen), [fen]);

  // Convert score into percentage for White (clamp between 6% and 94%)
  // Score = 0 -> 50%
  // Score = +5 -> 75%
  // Score = -5 -> 25%
  const whitePercent = useMemo(() => {
    const clampedScore = Math.max(-10, Math.min(10, score));
    return 50 + (clampedScore / 10) * 44;
  }, [score]);

  // If orientation is white: White is at bottom, Black is at top
  // If orientation is black: Black is at bottom, White is at top
  const bottomPercent = orientation === 'white' ? whitePercent : 100 - whitePercent;

  return (
    <div
      className="relative w-5 sm:w-6 self-stretch my-0.5 rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950 flex flex-col justify-end shadow-xl select-none shrink-0"
      title={`Оценка позиции: ${text}`}
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
