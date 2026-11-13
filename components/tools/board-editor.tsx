'use client';

import {
  useBoardEditor,
  type BoardPiece,
  type PieceColor,
  type PieceType,
} from '@/hooks/use-board-editor';
import {
  Check,
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
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fen);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Piece Palette */}
      <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Палитра фигур
          </span>
          {selectedPiece && (
            <span className="text-xs text-[#81b64c] font-semibold">
              Выбрано:{' '}
              {selectedPiece.color === 'w' ? 'Белая' : 'Чёрная'}{' '}
              {selectedPiece.type.toUpperCase()}
            </span>
          )}
        </div>

        {/* White pieces bank */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 font-semibold w-16">Белые:</span>
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
                className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#81b64c] bg-[#81b64c]/20 text-white shadow-md'
                    : 'border-[#302e2b] bg-[#211f1c] text-white hover:border-[#81b64c]/50'
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
          <span className="text-xs text-zinc-500 font-semibold w-16">Чёрные:</span>
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
                className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#81b64c] bg-[#81b64c]/20 text-zinc-200 shadow-md'
                    : 'border-[#302e2b] bg-[#211f1c] text-zinc-300 hover:border-[#81b64c]/50'
                }`}
                title={`Чёрный ${p.label}`}
              >
                {p.symbol}
              </button>
            );
          })}
        </div>

        {/* Tool buttons: Eraser, Clear, Reset */}
        <div className="flex gap-2 pt-2 border-t border-[#302e2b] flex-wrap">
          <button
            type="button"
            onClick={() => {
              setIsEraser(true);
              setSelectedPiece(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
              isEraser
                ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                : 'border-[#302e2b] bg-[#211f1c] text-zinc-400 hover:text-white'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Ластик</span>
          </button>
          <button
            type="button"
            onClick={clearBoard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#302e2b] bg-[#211f1c] text-zinc-400 hover:text-red-400 text-xs font-semibold cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Очистить доску</span>
          </button>
          <button
            type="button"
            onClick={resetToStart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#302e2b] bg-[#211f1c] text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Начальная позиция</span>
          </button>
        </div>
      </div>

      {/* Board & Position Settings */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Interactive Board */}
        <div className="w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden border border-[#302e2b] bg-[#211f1c] shadow-lg shrink-0">
          <Chessboard
            options={{
              position: fen,
              onSquareClick: ({ square }) => handleSquareClick(square),
              onPieceDrop: ({ sourceSquare, targetSquare }) =>
                targetSquare ? handlePieceDrop(sourceSquare, targetSquare) : false,
              boardStyle: { borderRadius: '0.75rem' },
              darkSquareStyle: { backgroundColor: '#779952' },
              lightSquareStyle: { backgroundColor: '#edeed1' },
            }}
          />
        </div>

        {/* Position Rules & Castling */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          {/* Turn selector */}
          <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col gap-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Очерёдность хода
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => turn === 'b' && toggleTurn()}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  turn === 'w'
                    ? 'border-[#81b64c] bg-[#81b64c] text-white shadow-sm'
                    : 'border-[#302e2b] bg-[#211f1c] text-zinc-400 hover:text-white'
                }`}
              >
                Белые ходят
              </button>
              <button
                type="button"
                onClick={() => turn === 'w' && toggleTurn()}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  turn === 'b'
                    ? 'border-[#81b64c] bg-[#81b64c] text-white shadow-sm'
                    : 'border-[#302e2b] bg-[#211f1c] text-zinc-400 hover:text-white'
                }`}
              >
                Чёрные ходят
              </button>
            </div>
          </div>

          {/* Castling rights */}
          <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Права на рокировку
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
          <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                FEN Позиции
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-[#81b64c] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
              </button>
            </div>
            <input
              type="text"
              value={fen}
              onChange={(e) => loadFen(e.target.value)}
              className={`w-full bg-[#211f1c] border rounded-xl px-3 py-2 text-xs font-mono text-white outline-none ${
                isValid ? 'border-[#302e2b] focus:border-[#81b64c]' : 'border-red-500'
              }`}
            />
          </div>

          {/* CTA: Analyze this position */}
          {onAnalyzePosition && (
            <button
              type="button"
              onClick={() => onAnalyzePosition(fen)}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#81b64c] hover:bg-[#74a643] text-white font-bold text-sm shadow-lg shadow-[#81b64c]/20 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Анализировать позицию в Stockfish 19 Lite</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
