'use client';

import { usePieceMovesDrill } from '@/hooks/use-piece-moves-drill';
import {
  Award,
  Check,
  CheckCircle2,
  Heart,
  HelpCircle,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { Chessboard } from 'react-chessboard';

const PIECE_VALUES: Array<{ piece: string; val: number; symbol: string; desc: string }> = [
  { piece: 'Пешка', val: 1, symbol: '♙', desc: 'Ходит на 1 поле вперед (на 2 со старта), бьет по диагонали' },
  { piece: 'Конь', val: 3, symbol: '♘', desc: 'Ходит буквой «Г» (2 клетки прямо, 1 вбок), прыгает через фигуры' },
  { piece: 'Слон', val: 3, symbol: '♗', desc: 'Ходит по диагоналям любого цвета на любое расстояние' },
  { piece: 'Ладья', val: 5, symbol: '♖', desc: 'Ходит по прямым вертикалям и горизонталям' },
  { piece: 'Ферзь', val: 9, symbol: '♕', desc: 'Самая мощная фигура: объединяет силу ладьи и слона' },
  { piece: 'Король', val: 0, symbol: '♔', desc: 'Бесценен (мат = конец игры). Ходит на 1 клетку в любую сторону' },
];

export function PieceMovesDrill() {
  const {
    level,
    lives,
    score,
    currentSetup,
    legalSquares,
    selectedSquares,
    feedback,
    gameOver,
    toggleSquare,
    clearSelection,
    checkAnswer,
    restartDrill,
  } = usePieceMovesDrill();

  // Custom highlights on board
  const customSquareStyles: Record<string, React.CSSProperties> = {};

  // Highlight piece square
  customSquareStyles[currentSetup.pieceSquare] = {
    backgroundColor: 'rgba(251, 191, 36, 0.4)',
  };

  // Highlight selected squares
  selectedSquares.forEach((sq) => {
    customSquareStyles[sq] = {
      backgroundColor: 'rgba(54, 146, 231, 0.5)',
      boxShadow: 'inset 0 0 0 3px #3692e7',
    };
  });

  // Highlight correct / wrong feedback
  if (feedback === 'correct') {
    legalSquares.forEach((sq) => {
      customSquareStyles[sq] = {
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
      };
    });
  } else if (feedback === 'wrong') {
    selectedSquares.forEach((sq) => {
      if (!legalSquares.includes(sq)) {
        customSquareStyles[sq] = {
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
        };
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Game status header */}
      <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Lives (Hearts) */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-500 font-semibold mr-1">Жизни:</span>
          {[1, 2, 3].map((heart) => (
            <Heart
              key={heart}
              className={`w-5 h-5 ${
                heart <= lives
                  ? 'text-rose-500 fill-rose-500 animate-pulse'
                  : 'text-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Level & Score */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1 text-zinc-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Уровень {level}</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-300">
            <Award className="w-4 h-4 text-[#81b64c]" />
            <span>Счёт: {score}</span>
          </div>
          <button
            type="button"
            onClick={restartDrill}
            className="p-1.5 rounded-lg border border-[#302e2b] hover:bg-[#211f1c] text-zinc-400 hover:text-white cursor-pointer"
            title="Начать заново"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Objective Prompt Banner */}
      <div className="rounded-2xl border border-[#302e2b] bg-[#211f1c] p-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Задание
          </div>
          <p className="text-sm font-bold text-white">
            Нажмите на все клетки, куда может пойти{' '}
            <span className="text-[#81b64c]">
              {currentSetup.pieceName} на {currentSetup.pieceSquare}
            </span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clearSelection}
            disabled={feedback !== 'idle' || gameOver}
            className="px-3 py-2 rounded-xl border border-[#302e2b] text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer disabled:opacity-40"
          >
            Очистить
          </button>
          <button
            type="button"
            onClick={checkAnswer}
            disabled={feedback !== 'idle' || gameOver || selectedSquares.length === 0}
            className="px-5 py-2 rounded-xl bg-[#81b64c] hover:bg-[#74a643] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
      </div>

      {/* Interactive Board */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden border border-[#302e2b] bg-[#211f1c] shadow-lg relative">
          <Chessboard
            options={{
              position: currentSetup.fen,
              onSquareClick: ({ square }) => toggleSquare(square),
              boardOrientation: currentSetup.pieceColor === 'b' ? 'black' : 'white',
              squareStyles: customSquareStyles,
              boardStyle: { borderRadius: '0.75rem' },
              darkSquareStyle: { backgroundColor: '#779952' },
              lightSquareStyle: { backgroundColor: '#edeed1' },
            }}
          />

          {feedback === 'correct' && (
            <div className="absolute inset-0 bg-emerald-500/15 pointer-events-none flex items-center justify-center animate-in fade-in">
              <span className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-sm px-4 py-2 rounded-2xl font-bold flex items-center gap-2 shadow-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Верно! Все ходы найдены!
              </span>
            </div>
          )}

          {feedback === 'wrong' && (
            <div className="absolute inset-0 bg-red-500/15 pointer-events-none flex items-center justify-center animate-in fade-in">
              <span className="bg-red-950/90 border border-red-500/50 text-red-300 text-sm px-4 py-2 rounded-2xl font-bold flex items-center gap-2 shadow-xl">
                <XCircle className="w-5 h-5 text-red-400" />
                Не все ходы указаны верно! -1 жизнь
              </span>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <XCircle className="w-12 h-12 text-rose-500 mb-2" />
              <h3 className="text-xl font-black text-white">Игра окончена</h3>
              <p className="text-xs text-zinc-400 mt-1 mb-4">
                Вы дошли до {level} уровня со счётом {score} очков!
              </p>
              <button
                type="button"
                onClick={restartDrill}
                className="px-6 py-2.5 rounded-xl bg-[#81b64c] hover:bg-[#74a643] text-white font-bold text-xs"
              >
                Попробовать снова
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Piece Values Reference Table */}
      <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col gap-3 mt-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Справочник: Ценность и правила фигур
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PIECE_VALUES.map((pv) => (
            <div
              key={pv.piece}
              className="p-3 rounded-xl bg-[#211f1c] border border-[#302e2b] flex items-start gap-3"
            >
              <span className="text-2xl">{pv.symbol}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{pv.piece}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#161512] text-amber-300 font-mono">
                    {pv.val > 0 ? `${pv.val} очк.` : 'Бесценен'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  {pv.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
