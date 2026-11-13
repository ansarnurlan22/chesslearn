'use client';

import { sfx } from '@/lib/sound-effects';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';

type Mode = 'white' | 'black' | 'both';

interface PieceCount {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  symbol: string;
  label: string;
  remaining: number;
}

// Standard starting squares for white and black pieces
const CORRECT_SQUARES: Record<string, string> = {
  // White
  a1: 'wR', b1: 'wN', c1: 'wB', d1: 'wQ', e1: 'wK', f1: 'wB', g1: 'wN', h1: 'wR',
  a2: 'wP', b2: 'wP', c2: 'wP', d2: 'wP', e2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP',
  // Black
  a8: 'bR', b8: 'bN', c8: 'bB', d8: 'bQ', e8: 'bK', f8: 'bB', g8: 'bN', h8: 'bR',
  a7: 'bP', b7: 'bP', c7: 'bP', d7: 'bP', e7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
};

function buildFenFromBoard(placed: Record<string, string>): string {
  const rows: string[] = [];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  for (let r = 8; r >= 1; r--) {
    let empty = 0;
    let rowStr = '';
    for (const f of files) {
      const sq = `${f}${r}`;
      const piece = placed[sq];
      if (piece) {
        if (empty > 0) {
          rowStr += empty;
          empty = 0;
        }
        const char = piece[1];
        rowStr += piece[0] === 'w' ? char.toUpperCase() : char.toLowerCase();
      } else {
        empty++;
      }
    }
    if (empty > 0) rowStr += empty;
    rows.push(rowStr);
  }

  return `${rows.join('/')} w - - 0 1`;
}

export function BoardSetupDrill() {
  const [mode, setMode] = useState<Mode>('white');
  const [placedPieces, setPlacedPieces] = useState<Record<string, string>>({});
  const [selectedPiece, setSelectedPiece] = useState<'p' | 'n' | 'b' | 'r' | 'q' | 'k' | null>(null);
  const [selectedColor, setSelectedColor] = useState<'w' | 'b'>('w');
  const [mistakes, setMistakes] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lastMistakeSquare, setLastMistakeSquare] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Targets count
  const targetCount = mode === 'both' ? 32 : 16;
  const currentPlacedCount = Object.keys(placedPieces).length;

  // Stop timer on completion
  useEffect(() => {
    if (currentPlacedCount >= targetCount && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (bestTime === null || elapsed < bestTime) {
        setBestTime(elapsed);
      }
    }
  }, [currentPlacedCount, targetCount, isRunning, elapsed, bestTime]);

  // Timer loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsed((t) => t + 0.1);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const resetDrill = useCallback((newMode: Mode = mode) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPlacedPieces({});
    setSelectedPiece(null);
    setSelectedColor(newMode === 'black' ? 'b' : 'w');
    setMistakes(0);
    setElapsed(0);
    setIsRunning(false);
    setIsCompleted(false);
    setLastMistakeSquare(null);
  }, [mode]);

  const handleSquareClick = (square: string) => {
    if (isCompleted || !selectedPiece) return;

    if (!isRunning) {
      setIsRunning(true);
    }

    const expectedPiece = CORRECT_SQUARES[square];
    const playerPiece = `${selectedColor}${selectedPiece.toUpperCase()}`;

    if (expectedPiece === playerPiece && !placedPieces[square]) {
      // Correct!
      setPlacedPieces((prev) => {
        const next = { ...prev, [square]: playerPiece };
        const nextCount = Object.keys(next).length;
        if (nextCount === targetCount) {
          sfx.playLevelUp();
        } else {
          sfx.playMove();
        }
        return next;
      });
      setLastMistakeSquare(null);
    } else {
      // Mistake!
      sfx.playError();
      setMistakes((m) => m + 1);
      setLastMistakeSquare(square);
      setTimeout(() => setLastMistakeSquare(null), 1000);
    }
  };

  const getRemainingCount = (type: string, color: 'w' | 'b'): number => {
    const total = type === 'p' ? 8 : type === 'k' || type === 'q' ? 1 : 2;
    const placed = Object.values(placedPieces).filter(
      (p) => p === `${color}${type.toUpperCase()}`,
    ).length;
    return Math.max(0, total - placed);
  };

  const pieceBank: PieceCount[] = [
    { type: 'r', symbol: selectedColor === 'w' ? '♖' : '♜', label: 'Ладья', remaining: getRemainingCount('r', selectedColor) },
    { type: 'n', symbol: selectedColor === 'w' ? '♘' : '♞', label: 'Конь', remaining: getRemainingCount('n', selectedColor) },
    { type: 'b', symbol: selectedColor === 'w' ? '♗' : '♝', label: 'Слон', remaining: getRemainingCount('b', selectedColor) },
    { type: 'q', symbol: selectedColor === 'w' ? '♕' : '♛', label: 'Ферзь', remaining: getRemainingCount('q', selectedColor) },
    { type: 'k', symbol: selectedColor === 'w' ? '♔' : '♚', label: 'Король', remaining: getRemainingCount('k', selectedColor) },
    { type: 'p', symbol: selectedColor === 'w' ? '♙' : '♟', label: 'Пешка', remaining: getRemainingCount('p', selectedColor) },
  ];

  const fen = buildFenFromBoard(placedPieces);

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* Modes & Stats bar */}
      <div className="pixel-card bg-[#181612] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Mode Switcher */}
        <div className="flex gap-2">
          {(['white', 'black', 'both'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                resetDrill(m);
                sfx.playMove();
              }}
              className={`pixel-btn px-3 py-1.5 text-xs font-pixel-sm cursor-pointer ${
                mode === m
                  ? 'bg-[#81b64c] text-black font-bold border-[#81b64c]'
                  : 'bg-[#211e19] text-zinc-400 hover:text-white border-[#38332b]'
              }`}
            >
              {m === 'white' ? 'БЕЛЫЕ (16)' : m === 'black' ? 'ЧЁРНЫЕ (16)' : 'ВСЕ (32)'}
            </button>
          ))}
        </div>

        {/* Live Arcade Counters */}
        <div className="flex items-center gap-4 text-xs font-pixel-sm">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Clock className="w-4 h-4" />
            <span className="font-pixel text-sm">{elapsed.toFixed(1)}s</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {currentPlacedCount}/{targetCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <AlertCircle className="w-4 h-4" />
            <span>ОШИБОК: {mistakes}</span>
          </div>
          {bestTime !== null && (
            <div className="flex items-center gap-1.5 text-amber-300">
              <Trophy className="w-4 h-4" />
              <span>ТОП: {bestTime.toFixed(1)}s</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              resetDrill();
              sfx.playMove();
            }}
            className="pixel-btn p-1.5 bg-[#211e19] text-zinc-400 hover:text-white cursor-pointer"
            title="Перезапустить"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Piece Selection Bank */}
      <div className="pixel-card bg-[#181612] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-pixel-sm text-zinc-400 uppercase tracking-wider">
            БАНК ФИГУР ДЛЯ РАССТАНОВКИ
          </span>
          {mode === 'both' && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedColor('w');
                  sfx.playMove();
                }}
                className={`pixel-btn px-2.5 py-1 text-xs font-pixel-sm ${
                  selectedColor === 'w'
                    ? 'bg-zinc-200 text-black font-bold'
                    : 'bg-[#211e19] text-zinc-400'
                }`}
              >
                БЕЛЫЕ
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedColor('b');
                  sfx.playMove();
                }}
                className={`pixel-btn px-2.5 py-1 text-xs font-pixel-sm ${
                  selectedColor === 'b'
                    ? 'bg-zinc-800 text-white font-bold border-zinc-600'
                    : 'bg-[#211e19] text-zinc-400'
                }`}
              >
                ЧЁРНЫЕ
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {pieceBank.map((p) => {
            const isSelected = selectedPiece === p.type;
            const isDepleted = p.remaining <= 0;
            return (
              <button
                key={p.type}
                type="button"
                disabled={isDepleted}
                onClick={() => {
                  setSelectedPiece(p.type);
                  sfx.playMove();
                }}
                className={`pixel-btn flex items-center gap-2 px-3 py-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                  isSelected
                    ? 'bg-[#81b64c] text-black font-bold border-[#81b64c]'
                    : 'bg-[#211e19] text-zinc-300 hover:text-white border-[#38332b]'
                }`}
              >
                <span className="text-xl leading-none">{p.symbol}</span>
                <span className="text-xs font-pixel-sm">{p.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#14120e] text-amber-400 border border-[#2b2721]">
                  {p.remaining}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-zinc-500 font-mono">
          [!] Выберите фигуру из банка, затем нажмите на клетку на доске, куда она должна встать.
        </div>
      </div>

      {/* Board Display */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-[440px] aspect-square border-4 border-[#2b2721] bg-[#211f1c] shadow-[6px_6px_0px_0px_#0c0b09] overflow-hidden relative">
          <Chessboard
            options={{
              position: fen,
              onSquareClick: ({ square }) => handleSquareClick(square),
              boardOrientation: mode === 'black' ? 'black' : 'white',
              boardStyle: { borderRadius: '0px' },
              darkSquareStyle: { backgroundColor: '#779952' },
              lightSquareStyle: { backgroundColor: '#edeed1' },
            }}
          />

          {lastMistakeSquare && (
            <div className="absolute inset-0 bg-red-500/20 pointer-events-none flex items-center justify-center animate-pulse">
              <span className="bg-red-950/90 border-2 border-red-500 text-red-300 text-xs px-3 py-1.5 font-pixel shadow-[2px_2px_0px_0px_#000]">
                НЕВЕРНАЯ КЛЕТКА!
              </span>
            </div>
          )}
        </div>

        {/* Win Banner */}
        {isCompleted && (
          <div className="mt-4 p-5 pixel-card-green bg-[#1b2216] text-center max-w-md w-full animate-in fade-in duration-200">
            <Award className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
            <h3 className="text-lg font-pixel text-white">ДОСКА РАССТАВЛЕНА!</h3>
            <p className="text-xs text-emerald-300 font-mono mt-2">
              Время: <span className="font-bold text-amber-400 font-pixel text-sm">{elapsed.toFixed(1)}s</span> • Ошибок: {mistakes}
            </p>
            <button
              type="button"
              onClick={() => {
                resetDrill();
                sfx.playSuccess();
              }}
              className="mt-4 pixel-btn px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-pixel text-xs cursor-pointer"
            >
              СЫГРАТЬ ЕЩЁ РАЗ ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
