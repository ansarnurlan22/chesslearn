'use client';

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
      setPlacedPieces((prev) => ({
        ...prev,
        [square]: playerPiece,
      }));
      setLastMistakeSquare(null);
    } else {
      // Mistake!
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
    <div className="flex flex-col gap-6 w-full">
      {/* Modes & Stats bar */}
      <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Mode Switcher */}
        <div className="flex gap-2 p-1 rounded-xl bg-[#211f1c] border border-[#302e2b]">
          {(['white', 'black', 'both'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                resetDrill(m);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === m
                  ? 'bg-[#81b64c] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {m === 'white' ? 'Белые (16)' : m === 'black' ? 'Чёрные (16)' : 'Все (32)'}
            </button>
          ))}
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-sm">{elapsed.toFixed(1)}s</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {currentPlacedCount}/{targetCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Ошибок: {mistakes}</span>
          </div>
          {bestTime !== null && (
            <div className="flex items-center gap-1.5 text-amber-300">
              <Trophy className="w-4 h-4" />
              <span>Рекорд: {bestTime.toFixed(1)}s</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => resetDrill()}
            className="p-1.5 rounded-lg border border-[#302e2b] hover:bg-[#211f1c] text-zinc-400 hover:text-white cursor-pointer"
            title="Перезапустить"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Piece Selection Bank */}
      <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Банк фигур для расстановки
          </span>
          {mode === 'both' && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedColor('w')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                  selectedColor === 'w'
                    ? 'border-[#81b64c] bg-[#81b64c]/20 text-white'
                    : 'border-[#302e2b] text-zinc-400'
                }`}
              >
                Белые
              </button>
              <button
                type="button"
                onClick={() => setSelectedColor('b')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                  selectedColor === 'b'
                    ? 'border-[#81b64c] bg-[#81b64c]/20 text-white'
                    : 'border-[#302e2b] text-zinc-400'
                }`}
              >
                Чёрные
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
                onClick={() => setSelectedPiece(p.type)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                  isSelected
                    ? 'border-[#81b64c] bg-[#81b64c]/20 text-white shadow-md'
                    : 'border-[#302e2b] bg-[#211f1c] text-zinc-300 hover:border-[#81b64c]/50'
                }`}
              >
                <span className="text-xl">{p.symbol}</span>
                <span className="text-xs">{p.label}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#161512] text-zinc-400">
                  {p.remaining}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-zinc-500">
          💡 Выберите фигуру из банка, затем нажмите на клетку на доске, куда она должна встать в начальной позиции.
        </div>
      </div>

      {/* Board Display */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-[440px] aspect-square rounded-2xl overflow-hidden border border-[#302e2b] bg-[#211f1c] shadow-lg relative">
          <Chessboard
            options={{
              position: fen,
              onSquareClick: ({ square }) => handleSquareClick(square),
              boardOrientation: mode === 'black' ? 'black' : 'white',
              boardStyle: { borderRadius: '0.75rem' },
              darkSquareStyle: { backgroundColor: '#779952' },
              lightSquareStyle: { backgroundColor: '#edeed1' },
            }}
          />

          {lastMistakeSquare && (
            <div className="absolute inset-0 bg-red-500/10 pointer-events-none flex items-center justify-center animate-pulse">
              <span className="bg-red-950/80 border border-red-500/50 text-red-300 text-xs px-3 py-1.5 rounded-xl font-bold">
                Неверная клетка!
              </span>
            </div>
          )}
        </div>

        {/* Win Banner */}
        {isCompleted && (
          <div className="mt-4 p-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-center max-w-md w-full animate-in fade-in duration-200">
            <Award className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-lg font-black text-white">Доска расставлена!</h3>
            <p className="text-xs text-emerald-300 mt-1">
              Время: <span className="font-bold">{elapsed.toFixed(1)}s</span> • Ошибок: {mistakes}
            </p>
            <button
              type="button"
              onClick={() => resetDrill()}
              className="mt-3 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
            >
              Сыграть ещё раз
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
