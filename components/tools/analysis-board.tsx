'use client';

import { useAnalysisBoard } from '@/hooks/use-analysis-board';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit2,
  FileText,
  Loader2,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Chessboard } from 'react-chessboard';

interface AnalysisBoardProps {
  initialFen?: string;
  onEditBoard?: (currentFen: string) => void;
}

export function AnalysisBoard({ initialFen, onEditBoard }: AnalysisBoardProps) {
  const {
    fen,
    history,
    currentStep,
    orientation,
    depth,
    setDepth,
    isAnalyzing,
    bestMove,
    evalScore,
    pvLines,
    coachComment,
    makeMove,
    goToStep,
    resetGame,
    flipBoard,
    loadCustomFen,
    loadCustomPgn,
    reanalyze,
  } = useAnalysisBoard(initialFen);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'fen' | 'pgn'>('fen');
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);

  const numScore = parseFloat(evalScore);
  const isWhiteAdvantage = !isNaN(numScore) && numScore >= 0;
  const evalPercent = isNaN(numScore)
    ? 50
    : Math.min(100, Math.max(0, 50 + (numScore / 6) * 50));

  const handleCopyFen = async () => {
    try {
      await navigator.clipboard.writeText(fen);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleApplyModal = () => {
    if (modalType === 'fen') {
      loadCustomFen(inputText.trim());
    } else {
      loadCustomPgn(inputText.trim());
    }
    setIsModalOpen(false);
    setInputText('');
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Coach Commentary Header Banner */}
      <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f59e0b] to-[#fbbf24] flex items-center justify-center text-zinc-950 shrink-0 font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              AI-Наставник (Stockfish 19 Lite)
            </div>
            <p className="text-sm font-medium text-white">{coachComment}</p>
          </div>
        </div>

        {/* Engine status pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#211f1c] border border-[#302e2b] shrink-0">
          {isAnalyzing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#81b64c]" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
          <span className="text-xs font-bold text-white">Глубина {depth}</span>
        </div>
      </div>

      {/* Main Board + Analysis Panels */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: Eval Bar + Chessboard */}
        <div className="flex gap-3 w-full lg:w-[480px] shrink-0">
          {/* Vertical Evaluation Bar */}
          <div className="w-7 h-[420px] rounded-xl overflow-hidden border border-[#302e2b] bg-[#211f1c] relative flex flex-col justify-end shrink-0 select-none">
            <div
              className="w-full bg-white transition-all duration-300"
              style={{ height: `${evalPercent}%` }}
            />
            <div
              className={`absolute inset-x-0 text-[10px] font-mono font-bold text-center pointer-events-none ${
                isWhiteAdvantage
                  ? 'bottom-2 text-zinc-900'
                  : 'top-2 text-white'
              }`}
            >
              {evalScore}
            </div>
          </div>

          {/* Interactive Chessboard Container */}
          <div className="flex-1 max-w-[440px] aspect-square rounded-2xl overflow-hidden border border-[#302e2b] bg-[#211f1c] shadow-lg">
            <Chessboard
              options={{
                position: fen,
                onPieceDrop: ({ sourceSquare, targetSquare }) =>
                  targetSquare ? makeMove(sourceSquare, targetSquare) : false,
                boardOrientation: orientation,
                boardStyle: {
                  borderRadius: '0.75rem',
                },
                darkSquareStyle: { backgroundColor: '#779952' },
                lightSquareStyle: { backgroundColor: '#edeed1' },
              }}
            />
          </div>
        </div>

        {/* Right: Controls & Engine Evaluation Lines */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          {/* Best move card */}
          <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                Лучший ход Stockfish 19 Lite
              </span>
              <span className="text-2xl font-mono font-black text-white">
                {bestMove || '—'}
              </span>
            </div>
            <div className="flex flex-col text-right gap-1">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                Оценка
              </span>
              <span
                className={`text-2xl font-mono font-black ${
                  numScore > 0
                    ? 'text-green-400'
                    : numScore < 0
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }`}
              >
                {evalScore}
              </span>
            </div>
          </div>

          {/* Engine PV Lines */}
          <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Вариант движка (PV)
              </span>
              <button
                type="button"
                onClick={reanalyze}
                disabled={isAnalyzing}
                className="text-xs text-[#81b64c] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3" />
                <span>Пересчитать</span>
              </button>
            </div>

            {pvLines.length > 0 ? (
              <div className="flex flex-col gap-2">
                {pvLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#211f1c] border border-[#302e2b] text-xs font-mono text-zinc-300 leading-relaxed break-words"
                  >
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 py-2">
                Линия Stockfish 19 Lite рассчитывается...
              </div>
            )}
          </div>

          {/* Navigation & Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => goToStep(currentStep - 1)}
              disabled={currentStep === 0}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#302e2b] bg-[#161512] hover:bg-[#211f1c] text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>
            <button
              type="button"
              onClick={() => goToStep(currentStep + 1)}
              disabled={currentStep >= history.length}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#302e2b] bg-[#161512] hover:bg-[#211f1c] text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-40"
            >
              <span>Вперед</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={flipBoard}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#302e2b] bg-[#161512] hover:bg-[#211f1c] text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Повернуть</span>
            </button>
            <button
              type="button"
              onClick={resetGame}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#302e2b] bg-[#161512] hover:bg-[#211f1c] text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Сбросить</span>
            </button>
          </div>

          {/* Utility Buttons: Edit Board, FEN, PGN */}
          <div className="flex gap-2 flex-wrap">
            {onEditBoard && (
              <button
                type="button"
                onClick={() => onEditBoard(fen)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#302e2b] bg-[#211f1c] hover:bg-[#292723] text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Редактировать доску</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setModalType('fen');
                setInputText(fen);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#302e2b] bg-[#211f1c] hover:bg-[#292723] text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>FEN / PGN</span>
            </button>
            <button
              type="button"
              onClick={handleCopyFen}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#302e2b] bg-[#211f1c] hover:bg-[#292723] text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>{copied ? 'Скопировано!' : 'Копировать FEN'}</span>
            </button>
          </div>

          {/* Engine Depth Selector */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#302e2b]">
            <span className="text-xs text-zinc-500 font-semibold">Глубина:</span>
            {[16, 20, 25, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDepth(d)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  depth === d
                    ? 'border-[#81b64c] bg-[#81b64c] text-white'
                    : 'border-[#302e2b] bg-[#161512] text-zinc-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FEN / PGN Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#211f1c] border border-[#302e2b] rounded-3xl p-6 max-w-lg w-full flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalType('fen')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    modalType === 'fen'
                      ? 'bg-[#81b64c] text-white'
                      : 'bg-[#161512] text-zinc-400'
                  }`}
                >
                  FEN
                </button>
                <button
                  type="button"
                  onClick={() => setModalType('pgn')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    modalType === 'pgn'
                      ? 'bg-[#81b64c] text-white'
                      : 'bg-[#161512] text-zinc-400'
                  }`}
                >
                  PGN
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                modalType === 'fen'
                  ? 'Вставьте FEN-строку...'
                  : 'Вставьте PGN партии...'
              }
              className="w-full bg-[#161512] border border-[#302e2b] rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-[#81b64c]"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#302e2b] text-zinc-400 hover:text-white text-xs"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleApplyModal}
                className="px-4 py-2 rounded-xl bg-[#81b64c] hover:bg-[#74a643] text-white font-bold text-xs"
              >
                Загрузить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
