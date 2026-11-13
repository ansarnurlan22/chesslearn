'use client';

import {
  useBoardEditor,
  type BoardPiece,
  type PieceColor,
  type PieceType,
} from '@/hooks/use-board-editor';
import { sfx } from '@/lib/sound-effects';
import {
  Check,
  Compass,
  Copy,
  Eraser,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Chessboard } from 'react-chessboard';

interface BoardEditorProps {
  initialFen?: string;
  onAnalyzePosition?: (fen: string) => void;
}

const WHITE_PIECES: Array<{ type: PieceType; label: string; symbol: string }> = [
  { type: 'k', label: 'Король', symbol: '♔' },
  { type: 'q', label: 'Ферзь', symbol: '♕' },
  { type: 'r', label: 'Ладья', symbol: '♖' },
  { type: 'b', label: 'Слон', symbol: '♗' },
  { type: 'n', label: 'Конь', symbol: '♘' },
  { type: 'p', label: 'Пешка', symbol: '♙' },
];

const BLACK_PIECES: Array<{ type: PieceType; label: string; symbol: string }> = [
  { type: 'k', label: 'Король', symbol: '♚' },
  { type: 'q', label: 'Ферзь', symbol: '♛' },
  { type: 'r', label: 'Ладья', symbol: '♜' },
  { type: 'b', label: 'Слон', symbol: '♝' },
  { type: 'n', label: 'Конь', symbol: '♞' },
  { type: 'p', label: 'Пешка', symbol: '♟' },
];

const PRESET_POSITIONS = [
  { label: 'НАЧАЛЬНАЯ', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
  { label: 'ОЧИСТИТЬ', fen: '8/8/8/8/8/8/8/8 w - - 0 1' },
  { label: 'ЛАДЬЯ + КОРОЛЬ', fen: '8/8/8/4k3/8/8/8/R3K3 w - - 0 1' },
  { label: 'ФЕРЗЬ + КОРОЛЬ', fen: '8/8/8/4k3/8/8/8/Q3K3 w - - 0 1' },
  { label: 'ПЕШЕЧНЫЙ ЭНДШПИЛЬ', fen: '8/4k3/8/4p3/4P3/8/4K3/8 w - - 0 1' },
];

export function BoardEditor({ initialFen, onAnalyzePosition }: BoardEditorProps) {
  const {
    fen,
    turn,
    castling,
    selectedPiece,
    setSelectedPiece,
    isEraser,
    setIsEraser,
    isValid,
    loadFen,
    clearBoard,
    resetToStart,
    handleSquareClick,
    handlePieceDrop,
    toggleTurn,
    updateCastling,
  } = useBoardEditor(initialFen);

  const [copied, setCopied] = useState(false);

  const selectPiece = (type: PieceType, color: PieceColor) => {
    setIsEraser(false);
    setSelectedPiece({ type, color });
    sfx.playMove();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fen);
      setCopied(true);
      sfx.playSuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* Piece Palette */}
      <div className="pixel-card bg-[#181612] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-pixel-sm text-zinc-400 uppercase tracking-wider">
            ПАЛИТРА ФИГУР
          </span>
          {selectedPiece && (
            <span className="text-xs text-[#81b64c] font-pixel-sm font-bold">
              ВЫБРАНО: {selectedPiece.color === 'w' ? 'БЕЛАЯ' : 'ЧЁРНАЯ'} {selectedPiece.type.toUpperCase()}
            </span>
          )}
        </div>

        {/* White pieces bank */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 font-pixel-sm w-16">БЕЛЫЕ:</span>
          {WHITE_PIECES.map((p) => {
            const isSelected =
              !isEraser &&
              selectedPiece?.type === p.type &&
              selectedPiece?.color === 'w';
            return (
              <button
                key={`w-${p.type}`}
                type="button"
                onClick={() => selectPiece(p.type, 'w')}
                className={`pixel-btn w-10 h-10 flex items-center justify-center text-2xl cursor-pointer ${
                  isSelected
                    ? 'bg-[#81b64c] text-black border-[#81b64c]'
                    : 'bg-[#211f1c] text-white border-[#302e2b]'
                }`}
                title={`Белый ${p.label}`}
              >
                {p.symbol}
              </button>
            );
          })}
        </div>

        {/* Black pieces bank */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 font-pixel-sm w-16">ЧЁРНЫЕ:</span>
          {BLACK_PIECES.map((p) => {
            const isSelected =
              !isEraser &&
              selectedPiece?.type === p.type &&
              selectedPiece?.color === 'b';
            return (
              <button
                key={`b-${p.type}`}
                type="button"
                onClick={() => selectPiece(p.type, 'b')}
                className={`pixel-btn w-10 h-10 flex items-center justify-center text-2xl cursor-pointer ${
                  isSelected
                    ? 'bg-[#81b64c] text-black border-[#81b64c]'
                    : 'bg-[#211f1c] text-zinc-300 border-[#302e2b]'
                }`}
                title={`Чёрный ${p.label}`}
              >
                {p.symbol}
              </button>
            );
          })}
        </div>

        {/* Tool buttons: Eraser, Clear, Reset */}
        <div className="flex gap-2 pt-2 border-t border-[#302e2b] flex-wrap items-center">
          <button
            type="button"
            onClick={() => {
              setIsEraser(true);
              setSelectedPiece(null);
              sfx.playMove();
            }}
            className={`pixel-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-pixel-sm cursor-pointer ${
              isEraser
                ? 'bg-amber-500 text-black font-bold border-amber-600'
                : 'bg-[#211f1c] text-zinc-400 hover:text-white border-[#302e2b]'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>ЛАСТИК</span>
          </button>
          <button
            type="button"
            onClick={() => {
              clearBoard();
              sfx.playMove();
            }}
            className="pixel-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#211f1c] text-zinc-400 hover:text-red-400 text-xs font-pixel-sm cursor-pointer border-[#302e2b]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ОЧИСТИТЬ</span>
          </button>
          <button
            type="button"
            onClick={() => {
              resetToStart();
              sfx.playSuccess();
            }}
            className="pixel-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#211f1c] text-zinc-400 hover:text-white text-xs font-pixel-sm cursor-pointer border-[#302e2b]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>НАЧАЛЬНАЯ</span>
          </button>

          {/* Quick presets */}
          <div className="hidden sm:flex items-center gap-1.5 ml-auto">
            {PRESET_POSITIONS.slice(2).map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  loadFen(preset.fen);
                  sfx.playMove();
                }}
                className="pixel-btn px-2 py-1 text-[9px] font-pixel-sm bg-[#161512] text-zinc-400 hover:text-amber-400 border-[#302e2b]"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Board & Position Settings */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Interactive Board */}
        <div className="w-full max-w-[420px] aspect-square border-4 border-[#2b2721] bg-[#211f1c] shadow-[6px_6px_0px_0px_#0c0b09] overflow-hidden shrink-0">
          <Chessboard
            options={{
              position: fen,
              onSquareClick: ({ square }) => {
                handleSquareClick(square);
                sfx.playMove();
              },
              onPieceDrop: ({ sourceSquare, targetSquare }) => {
                if (!targetSquare) return false;
                const ok = handlePieceDrop(sourceSquare, targetSquare);
                if (ok) sfx.playMove();
                return ok;
              },
              boardStyle: { borderRadius: '0px' },
              darkSquareStyle: { backgroundColor: '#779952' },
              lightSquareStyle: { backgroundColor: '#edeed1' },
            }}
          />
        </div>

        {/* Position Rules & Castling */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          {/* Turn selector */}
          <div className="pixel-card bg-[#181612] p-4 flex flex-col gap-2">
            <span className="text-[10px] font-pixel-sm text-zinc-400 uppercase tracking-wider">
              ОЧЕРЁДНОСТЬ ХОДА
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (turn === 'b') toggleTurn();
                  sfx.playMove();
                }}
                className={`pixel-btn py-2 px-3 text-xs font-pixel-sm cursor-pointer ${
                  turn === 'w'
                    ? 'bg-[#81b64c] text-black font-bold border-[#81b64c]'
                    : 'bg-[#211f1c] text-zinc-400 hover:text-white border-[#302e2b]'
                }`}
              >
                БЕЛЫЕ ХОДЯТ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (turn === 'w') toggleTurn();
                  sfx.playMove();
                }}
                className={`pixel-btn py-2 px-3 text-xs font-pixel-sm cursor-pointer ${
                  turn === 'b'
                    ? 'bg-[#81b64c] text-black font-bold border-[#81b64c]'
                    : 'bg-[#211f1c] text-zinc-400 hover:text-white border-[#302e2b]'
                }`}
              >
                ЧЁРНЫЕ ХОДЯТ
              </button>
            </div>
          </div>

          {/* Castling rights */}
          <div className="pixel-card bg-[#181612] p-4 flex flex-col gap-2.5">
            <span className="text-[10px] font-pixel-sm text-zinc-400 uppercase tracking-wider">
              ПРАВА НА РОКИРОВКУ
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={castling.whiteKingSide}
                  onChange={(e) =>
                    updateCastling({ whiteKingSide: e.target.checked })
                  }
                  className="rounded border-[#302e2b] bg-[#211f1c] text-[#81b64c] focus:ring-0"
                />
                <span>Белые O-O (короткая)</span>
              </label>
              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={castling.whiteQueenSide}
                  onChange={(e) =>
                    updateCastling({ whiteQueenSide: e.target.checked })
                  }
                  className="rounded border-[#302e2b] bg-[#211f1c] text-[#81b64c] focus:ring-0"
                />
                <span>Белые O-O-O (длинная)</span>
              </label>
              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={castling.blackKingSide}
                  onChange={(e) =>
                    updateCastling({ blackKingSide: e.target.checked })
                  }
                  className="rounded border-[#302e2b] bg-[#211f1c] text-[#81b64c] focus:ring-0"
                />
                <span>Чёрные O-O (короткая)</span>
              </label>
              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={castling.blackQueenSide}
                  onChange={(e) =>
                    updateCastling({ blackQueenSide: e.target.checked })
                  }
                  className="rounded border-[#302e2b] bg-[#211f1c] text-[#81b64c] focus:ring-0"
                />
                <span>Чёрные O-O-O (длинная)</span>
              </label>
            </div>
          </div>

          {/* FEN Box */}
          <div className="pixel-card bg-[#181612] p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-pixel-sm text-zinc-400 uppercase tracking-wider">
                FEN ПОЗИЦИИ
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-[#81b64c] hover:underline flex items-center gap-1 cursor-pointer font-pixel-sm"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'СКОПИРОВАНО!' : 'КОПИРОВАТЬ'}</span>
              </button>
            </div>
            <input
              type="text"
              value={fen}
              onChange={(e) => loadFen(e.target.value)}
              className={`w-full bg-[#14120e] border px-3 py-2 text-xs font-mono text-white outline-none ${
                isValid ? 'border-[#302e2b] focus:border-[#81b64c]' : 'border-red-500'
              }`}
            />
          </div>

          {/* CTA: Analyze this position */}
          {onAnalyzePosition && (
            <button
              type="button"
              onClick={() => {
                sfx.playSuccess();
                onAnalyzePosition(fen);
              }}
              className="pixel-btn flex items-center justify-center gap-2 py-3 px-6 bg-[#81b64c] hover:bg-[#74a643] text-black font-pixel text-xs cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>АНАЛИЗИРОВАТЬ В STOCKFISH ▶</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
