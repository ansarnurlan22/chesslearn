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
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* Game status header */}
      <div className="pixel-card bg-[#181612] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Lives (Hearts) */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-pixel-sm text-zinc-400 uppercase mr-1">ЖИЗНИ:</span>
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
        <div className="flex items-center gap-4 text-xs font-pixel-sm">
          <div className="flex items-center gap-1 text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>LEVEL {level}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <Award className="w-4 h-4" />
            <span className="font-pixel">СЧЁТ: {score}</span>
          </div>
          <button
            type="button"
            onClick={restartDrill}
            className="pixel-btn p-1.5 bg-[#211e19] text-zinc-400 hover:text-white cursor-pointer"
            title="Начать заново"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Objective Prompt Banner */}
      <div className="pixel-card bg-[#181612] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-pixel-sm text-zinc-400 uppercase tracking-wider mb-1">
            ЗАДАНИЕ
          </div>
          <p className="text-xs sm:text-sm font-semibold text-white">
            Нажмите на все клетки, куда может пойти{' '}
            <span className="text-[#81b64c] font-pixel text-xs">
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
            className="pixel-btn px-3 py-2 bg-[#211e19] text-zinc-400 hover:text-white text-xs font-pixel-sm cursor-pointer disabled:opacity-40"
          >
            ОЧИСТИТЬ
          </button>
          <button
            type="button"
            onClick={checkAnswer}
            disabled={feedback !== 'idle' || gameOver || selectedSquares.length === 0}
            className="pixel-btn px-5 py-2 bg-[#81b64c] hover:bg-[#74a643] text-black text-xs font-pixel cursor-pointer disabled:opacity-40"
          >
            ПРОВЕРИТЬ ▶
          </button>
        </div>
      </div>

      {/* Interactive Board */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-[420px] aspect-square border-4 border-[#2b2721] bg-[#211f1c] shadow-[6px_6px_0px_0px_#0c0b09] overflow-hidden relative">
          <Chessboard
            options={{
              position: currentSetup.fen,
              onSquareClick: ({ square }) => toggleSquare(square),
              boardOrientation: currentSetup.pieceColor === 'b' ? 'black' : 'white',
              squareStyles: customSquareStyles,
              boardStyle: { borderRadius: '0px' },
              darkSquareStyle: { backgroundColor: '#779952' },
              lightSquareStyle: { backgroundColor: '#edeed1' },
            }}
          />

          {feedback === 'correct' && (
            <div className="absolute inset-0 bg-emerald-500/20 pointer-events-none flex items-center justify-center animate-in fade-in">
              <span className="bg-emerald-950/95 border-2 border-emerald-500 text-emerald-300 text-xs px-4 py-2 font-pixel shadow-[3px_3px_0px_0px_#000] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ВЕРНО! +100 ОЧКОВ
              </span>
            </div>
          )}

          {feedback === 'wrong' && (
            <div className="absolute inset-0 bg-red-500/20 pointer-events-none flex items-center justify-center animate-in fade-in">
              <span className="bg-red-950/95 border-2 border-red-500 text-red-300 text-xs px-4 py-2 font-pixel shadow-[3px_3px_0px_0px_#000] flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                ОШИБКА! -1 ЖИЗНЬ
              </span>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <XCircle className="w-12 h-12 text-rose-500 mb-2 animate-bounce" />
              <h3 className="text-base font-pixel text-white">ИГРА ОКОНЧЕНА</h3>
              <p className="text-xs text-zinc-400 font-mono mt-2 mb-4">
                Уровень: {level} • Счёт: {score} очков
              </p>
              <button
                type="button"
                onClick={restartDrill}
                className="pixel-btn px-6 py-2.5 bg-[#81b64c] hover:bg-[#74a643] text-black font-pixel text-xs cursor-pointer"
              >
                ПОПРОБОВАТЬ СНОВА ▶
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Piece Values Reference Table */}
      <div className="pixel-card bg-[#181612] p-4 flex flex-col gap-3 mt-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-pixel-sm text-zinc-300 uppercase tracking-wider">
            СПРАВОЧНИК: ЦЕННОСТЬ И ПРАВИЛА ФИГУР
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PIECE_VALUES.map((pv) => (
            <div
              key={pv.piece}
              className="p-3 bg-[#1e1c18] border border-[#343029] flex items-start gap-3"
            >
              <span className="text-2xl leading-none">{pv.symbol}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{pv.piece}</span>
                  <span className="text-[9px] font-pixel-sm px-1.5 py-0.5 bg-[#14120e] text-amber-400 border border-[#2b2721]">
                    {pv.val > 0 ? `${pv.val} PTS` : 'БЕСЦЕНЕН'}
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
