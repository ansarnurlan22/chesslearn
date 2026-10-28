'use client';

import { EvalBar } from '@/components/eval-bar';
import { useChessGame } from '@/hooks/use-chess-game';
import type { ChessPlatform } from '@/lib/api/types';
import {
  CLASSIFICATION_META,
  classifyGameMoves,
} from '@/lib/chess-classifier';
import { parsePgnEvaluations } from '@/lib/eval-parser';
import type {
  CriticalMove,
  MoveAnalysis,
  MoveClassificationType,
} from '@/types/review';
import {
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  HelpCircle,
  ListOrdered,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Star,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';

export interface BoardArrow {
  startSquare: string;
  endSquare: string;
  color: string;
}

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
  onGameStateChange?: (state: {
    fen: string;
    turn: 'w' | 'b';
    currentStep: number;
    moveNumber: number;
    pgn?: string;
  }) => void;
  retryMove?: RetryMoveInfo | null;
  onClearRetry?: () => void;
  criticalMoves?: CriticalMove[];
  isLarge?: boolean;
  onToggleSize?: () => void;
  platform?: ChessPlatform;
}

function getVerdictIcon(type: MoveClassificationType) {
  switch (type) {
    case 'book':
      return <BookOpen className="w-3.5 h-3.5" />;
    case 'brilliant':
      return <Sparkles className="w-3.5 h-3.5" />;
    case 'great':
      return <Star className="w-3.5 h-3.5" />;
    case 'best':
      return <CheckCircle2 className="w-3.5 h-3.5" />;
    case 'good':
      return <Check className="w-3.5 h-3.5" />;
    case 'inaccuracy':
      return <HelpCircle className="w-3.5 h-3.5" />;
    case 'mistake':
      return <AlertTriangle className="w-3.5 h-3.5" />;
    case 'blunder':
      return <XCircle className="w-3.5 h-3.5" />;
  }
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
  onGameStateChange,
  retryMove,
  onClearRetry,
  criticalMoves = [],
  isLarge: externalIsLarge,
  onToggleSize,
  platform = 'lichess',
}: ChessViewerProps) {
  const isChessCom = platform === 'chesscom';
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>(initialOrientation);
  const [internalIsLarge, setInternalIsLarge] = useState<boolean>(false);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState<number>(360);

  // User-drawn right-click arrows and square highlights
  const [customArrows, setCustomArrows] = useState<BoardArrow[]>([]);
  const [customSquareStyles, setCustomSquareStyles] = useState<Record<string, React.CSSProperties>>({});

  const isLarge = externalIsLarge ?? internalIsLarge;
  const handleToggleSize = () => {
    if (onToggleSize) {
      onToggleSize();
    } else {
      setInternalIsLarge((prev) => !prev);
    }
  };

  // Dynamically compute width via ResizeObserver to guarantee responsive fit
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
    turn,
    lastMove,
    moveNotation,
    goToStart,
    goBack,
    goForward,
    goToEnd,
    goToStep,
  } = useChessGame({ pgn, moves });

  // Extract embedded evaluations from PGN comments if present
  const pgnEvals = useMemo(() => parsePgnEvaluations(pgn || ''), [pgn]);
  const currentEngineEval = currentStep > 0 ? pgnEvals.get(currentStep) ?? null : null;

  // Classify all moves of the game
  const { moves: classifiedMoves } = useMemo(
    () => classifyGameMoves(pgn || '', criticalMoves),
    [pgn, criticalMoves],
  );

  // Group moves into pairs (White & Black) for notation display
  const movePairs = useMemo(() => {
    const pairs: Array<{
      moveNumber: number;
      white?: MoveAnalysis;
      black?: MoveAnalysis;
    }> = [];

    for (let i = 0; i < classifiedMoves.length; i += 2) {
      const white = classifiedMoves[i];
      const black = classifiedMoves[i + 1];
      pairs.push({
        moveNumber: white ? white.moveNumber : Math.ceil((i + 1) / 2),
        white,
        black,
      });
    }

    return pairs;
  }, [classifiedMoves]);

  // Current move analysis for verdict card
  const currentMoveAnalysis =
    currentStep > 0 && currentStep <= classifiedMoves.length
      ? classifiedMoves[currentStep - 1]
      : null;

  // Sync targetStep from parent
  useEffect(() => {
    if (typeof targetStep === 'number' && targetStep >= 0 && targetStep <= totalSteps) {
      goToStep(targetStep);
    }
  }, [targetStep, totalSteps, goToStep]);

  // Notify parent on step change
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  // Notify parent on full game state change (for AI chat mentor)
  useEffect(() => {
    onGameStateChange?.({
      fen,
      turn,
      currentStep,
      moveNumber: currentStep > 0 ? Math.ceil(currentStep / 2) : 1,
      pgn,
    });
  }, [fen, turn, currentStep, pgn, onGameStateChange]);

  // Keyboard navigation: Left/Right arrows scrub through moves, Up/Down go to start/end
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goForward();
      } else if (e.key === 'ArrowUp' || e.key === 'Home') {
        e.preventDefault();
        goToStart();
      } else if (e.key === 'ArrowDown' || e.key === 'End') {
        e.preventDefault();
        goToEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, goForward, goToStart, goToEnd]);

  // Automatically clear user arrows and square highlights on move changes
  useEffect(() => {
    setCustomArrows([]);
    setCustomSquareStyles({});
  }, [currentStep, fen]);

  const handleClearDrawings = () => {
    setCustomArrows([]);
    setCustomSquareStyles({});
  };

  const handleSquareRightClick = ({ square }: { square: string }) => {
    setCustomSquareStyles((prev) => {
      const next = { ...prev };
      if (next[square]) {
        delete next[square];
      } else {
        next[square] = {
          backgroundColor: 'rgba(235, 97, 80, 0.7)',
        };
      }
      return next;
    });
  };

  // Merge user highlights with Chess.com style last move highlight
  const mergedSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = { ...customSquareStyles };

    // Highlight from & to squares for the current active move
    if (lastMove?.from && lastMove?.to) {
      const highlightColor = 'rgba(255, 255, 51, 0.4)';
      styles[lastMove.from] = {
        ...styles[lastMove.from],
        backgroundColor: highlightColor,
      };
      styles[lastMove.to] = {
        ...styles[lastMove.to],
        backgroundColor: highlightColor,
      };
    }

    return styles;
  }, [customSquareStyles, lastMove]);

  // Dense and crisp arrows (12–14px thick with large arrowhead)
  const squareWidth = boardWidth > 0 ? boardWidth / 8 : 45;
  const arrowWidthDenominator = Math.max(1, squareWidth / 13);

  const customBoardStyle = useMemo(
    () => ({
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
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
    <div
      className={`flex flex-col items-center w-full ${
        isLarge
          ? 'max-w-[760px] xl:max-w-[820px]'
          : 'max-w-[620px] xl:max-w-[680px]'
      } mx-auto ${
        isChessCom
          ? 'bg-[#211f1c] border-[#302e2b]'
          : 'bg-[#24221f] border-[#33312c]'
      } border rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-lg transition-all duration-300`}
    >
      {/* Top Player Row & Controls */}
      <div className="w-full flex items-center justify-between mb-3 px-1 gap-2 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-3 h-3 rounded-full bg-zinc-500 border border-zinc-400 shrink-0" />
          <span className={`font-semibold text-sm ${isChessCom ? 'text-[#c3c2c1]' : 'text-[#bababa]'} truncate`}>
            {topPlayer.name}
          </span>
          {topPlayer.rating && (
            <span className={`text-xs px-2 py-0.5 rounded-md ${isChessCom ? 'bg-[#191815] text-[#c3c2c1] border-[#302e2b]' : 'bg-[#1c1a17] text-[#bababa] border-[#33312c]'} font-mono border`}>
              {topPlayer.rating}
            </span>
          )}
        </div>

        {/* Action Controls: Size toggle & Flip board */}
        <div className="flex items-center gap-2">
          {/* Board Size Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSize}
            title={isLarge ? 'Стандартный размер доски' : 'Увеличить размер доски'}
            className={`text-xs ${
              isChessCom
                ? 'text-[#c3c2c1] bg-[#191815] hover:bg-[#262421] border-[#302e2b]'
                : 'text-[#bababa] bg-[#1c1a17] hover:bg-[#292723] border-[#33312c]'
            } hover:text-white transition-all flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer touch-manipulation`}
          >
            {isLarge ? (
              <>
                <Minimize2 className={`w-3.5 h-3.5 ${isChessCom ? 'text-[#81b64c]' : 'text-[#3692e7]'}`} />
                <span className="hidden sm:inline font-medium">Нормальная</span>
              </>
            ) : (
              <>
                <Maximize2 className={`w-3.5 h-3.5 ${isChessCom ? 'text-[#81b64c]' : 'text-[#3692e7]'}`} />
                <span className="hidden sm:inline font-medium">Большая</span>
              </>
            )}
          </button>

          {/* Flip Board Button */}
          <button
            type="button"
            onClick={toggleOrientation}
            title="Перевернуть доску"
            className={`text-xs ${
              isChessCom
                ? 'text-[#c3c2c1] bg-[#191815] hover:bg-[#262421] border-[#302e2b]'
                : 'text-[#bababa] bg-[#1c1a17] hover:bg-[#292723] border-[#33312c]'
            } hover:text-white transition-all flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer touch-manipulation`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Перевернуть</span>
          </button>
        </div>
      </div>

      {/* Retry Banner if user clicked "Попробовать переиграть" */}
      {retryMove && (
        <div className={`w-full mb-3 p-3 rounded-2xl ${
          isChessCom ? 'bg-[#191815] border-[#81b64c]/40 text-[#c3c2c1]' : 'bg-[#1c1a17] border-[#3692e7]/40 text-[#bababa]'
        } border flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-300`}>
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${isChessCom ? 'text-[#81b64c]' : 'text-[#3692e7]'} shrink-0`} />
            <span>
              Позиция перед ошибкой (ход {retryMove.moveNumber}). Рекомендованный ход:{' '}
              <strong className={`text-white font-mono ${isChessCom ? 'bg-[#211f1c] border-[#81b64c]/50' : 'bg-[#24221f] border-[#3692e7]/50'} px-2 py-0.5 rounded-md border text-sm ml-1`}>
                {retryMove.betterMove}
              </strong>
            </span>
          </div>
          {onClearRetry && (
            <button
              type="button"
              onClick={onClearRetry}
              title="Закрыть режим переигрывания"
              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-black/20 transition-colors touch-manipulation"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Main Board Area with Vertical Eval Bar on the left */}
      <div className="flex items-center justify-center gap-2 sm:gap-3.5 w-full my-1">
        {/* Vertical Eval Bar */}
        <EvalBar
          fen={fen}
          orientation={boardOrientation}
          engineEval={currentEngineEval}
        />

        {/* Chessboard Container with context menu disabled */}
        <div
          ref={boardContainerRef}
          onContextMenu={(e) => e.preventDefault()}
          onClick={handleClearDrawings}
          className={`w-full ${
            isLarge
              ? 'max-w-[720px] xl:max-w-[760px]'
              : 'max-w-[580px] xl:max-w-[640px]'
          } aspect-square mx-auto relative select-none min-w-0 overflow-hidden flex items-center justify-center transition-all duration-300`}
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
                allowDrawingArrows: true,
                arrows: customArrows,
                onArrowsChange: ({ arrows }) => setCustomArrows(arrows),
                clearArrowsOnClick: true,
                clearArrowsOnPositionChange: true,
                squareStyles: mergedSquareStyles,
                onSquareRightClick: handleSquareRightClick,
                onSquareClick: handleClearDrawings,
                boardStyle: customBoardStyle,
                darkSquareStyle: { backgroundColor: '#334155' },
                lightSquareStyle: { backgroundColor: '#cbd5e1' },
                animationDurationInMs: 180,
                arrowOptions: {
                  colors: {
                    default: 'rgba(255, 170, 0, 0.85)',
                    shift: 'rgba(129, 182, 76, 0.85)',
                    ctrl: 'rgba(239, 68, 68, 0.85)',
                    alt: 'rgba(59, 130, 246, 0.85)',
                    meta: 'rgba(168, 85, 247, 0.85)',
                  },
                  color: 'rgba(255, 170, 0, 0.85)',
                  secondaryColor: 'rgba(129, 182, 76, 0.85)',
                  tertiaryColor: 'rgba(239, 68, 68, 0.85)',
                  arrowLengthReducerDenominator: 5,
                  sameTargetArrowLengthReducerDenominator: 5,
                  arrowWidthDenominator,
                  activeArrowWidthMultiplier: 1.0,
                  opacity: 0.85,
                  activeOpacity: 0.85,
                  arrowStartOffset: 0.2,
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Player Row */}
      <div className="w-full flex items-center justify-between mt-3 mb-2 px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-3 h-3 rounded-full bg-white border border-zinc-300 shrink-0 shadow-sm" />
          <span className={`font-semibold text-sm ${isChessCom ? 'text-[#c3c2c1]' : 'text-[#bababa]'} truncate`}>
            {bottomPlayer.name}
          </span>
          {bottomPlayer.rating && (
            <span className={`text-xs px-2 py-0.5 rounded-md ${isChessCom ? 'bg-[#191815] text-[#c3c2c1] border-[#302e2b]' : 'bg-[#1c1a17] text-[#bababa] border-[#33312c]'} font-mono border`}>
              {bottomPlayer.rating}
            </span>
          )}
        </div>
        {openingName && (
          <span
            className={`text-xs ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} truncate max-w-[160px] sm:max-w-[220px]`}
            title={openingName}
          >
            {openingName}
          </span>
        )}
      </div>

      {/* Interactive Move Verdict Card (Chess.com Style) */}
      <div className="w-full my-2">
        {currentMoveAnalysis ? (
          (() => {
            const meta = CLASSIFICATION_META[currentMoveAnalysis.type];
            return (
              <div
                className={`w-full ${meta.bgClass} border ${meta.borderClass} rounded-2xl p-3.5 sm:p-4 flex flex-col gap-2 shadow-sm transition-all`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${meta.borderClass} ${meta.colorClass} bg-black/40`}
                    >
                      {getVerdictIcon(currentMoveAnalysis.type)}
                      <span>{meta.label}</span>
                      <span className="font-mono text-xs opacity-90">{meta.glyph}</span>
                    </span>

                    <span className="text-xs font-mono text-zinc-300">
                      Ход {currentMoveAnalysis.moveNumber} (
                      {currentMoveAnalysis.color === 'white' ? 'Белые' : 'Чёрные'}):{' '}
                      <strong className="text-white text-sm ml-1 font-bold">
                        {currentMoveAnalysis.san}
                      </strong>
                    </span>
                  </div>

                  {currentMoveAnalysis.betterMove && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'}>Лучший ход:</span>
                      <strong className={`font-mono ${isChessCom ? 'bg-[#81b64c]/20 text-[#81b64c] border-[#81b64c]/40' : 'bg-[#3692e7]/20 text-[#3692e7] border-[#3692e7]/40'} border px-2 py-0.5 rounded font-bold`}>
                        {currentMoveAnalysis.betterMove}
                      </strong>
                    </div>
                  )}
                </div>

                <p className={`text-xs sm:text-sm ${isChessCom ? 'text-[#c3c2c1]' : 'text-[#bababa]'} leading-relaxed font-normal`}>
                  {currentMoveAnalysis.comment}
                </p>
              </div>
            );
          })()
        ) : (
          <div className={`w-full ${isChessCom ? 'bg-[#191815] border-[#302e2b]' : 'bg-[#1c1a17] border-[#33312c]'} border rounded-2xl p-3 flex items-center justify-between text-xs`}>
            <span className="text-zinc-300 font-medium">Начальная позиция партии</span>
            <span className={isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'}>ПКМ: рисование стрелок и подсветка полей</span>
          </div>
        )}
      </div>

      {/* Navigation Controls: В начало, Назад, Вперед, В конец (h-11 touch-manipulation >= 44px) */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full mb-3">
        <button
          type="button"
          onClick={goToStart}
          disabled={isStart}
          aria-label="В начало"
          className={`h-11 touch-manipulation flex items-center justify-center gap-1.5 px-2 rounded-xl text-xs sm:text-sm font-semibold ${
            isChessCom
              ? 'bg-[#191815] text-[#c3c2c1] hover:bg-[#262421] hover:text-white border-[#302e2b]'
              : 'bg-[#1c1a17] text-[#bababa] hover:bg-[#292723] hover:text-white border-[#33312c]'
          } disabled:opacity-35 disabled:cursor-not-allowed transition-all border cursor-pointer active:scale-95`}
        >
          <ChevronsLeft className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="hidden sm:inline">В начало</span>
        </button>

        <button
          type="button"
          onClick={goBack}
          disabled={isStart}
          aria-label="Назад"
          className={`h-11 touch-manipulation flex items-center justify-center gap-1.5 px-2 rounded-xl text-xs sm:text-sm font-semibold ${
            isChessCom
              ? 'bg-[#191815] text-[#c3c2c1] hover:bg-[#262421] hover:text-white border-[#302e2b]'
              : 'bg-[#1c1a17] text-[#bababa] hover:bg-[#292723] hover:text-white border-[#33312c]'
          } disabled:opacity-35 disabled:cursor-not-allowed transition-all border cursor-pointer active:scale-95`}
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Назад</span>
        </button>

        <button
          type="button"
          onClick={goForward}
          disabled={isEnd}
          aria-label="Вперед"
          className={`h-11 touch-manipulation flex items-center justify-center gap-1.5 px-2 rounded-xl text-xs sm:text-sm font-semibold ${
            isChessCom
              ? 'bg-[#191815] text-[#c3c2c1] hover:bg-[#262421] hover:text-white border-[#302e2b]'
              : 'bg-[#1c1a17] text-[#bababa] hover:bg-[#292723] hover:text-white border-[#33312c]'
          } disabled:opacity-35 disabled:cursor-not-allowed transition-all border cursor-pointer active:scale-95`}
        >
          <span>Вперед</span>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        </button>

        <button
          type="button"
          onClick={goToEnd}
          disabled={isEnd}
          aria-label="В конец"
          className={`h-11 touch-manipulation flex items-center justify-center gap-1.5 px-2 rounded-xl text-xs sm:text-sm font-semibold ${
            isChessCom
              ? 'bg-[#191815] text-[#c3c2c1] hover:bg-[#262421] hover:text-white border-[#302e2b]'
              : 'bg-[#1c1a17] text-[#bababa] hover:bg-[#292723] hover:text-white border-[#33312c]'
          } disabled:opacity-35 disabled:cursor-not-allowed transition-all border cursor-pointer active:scale-95`}
        >
          <span className="hidden sm:inline">В конец</span>
          <ChevronsRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        </button>
      </div>

      {/* Interactive Move Notation List with Chess.com Badges */}
      <div className={`w-full ${isChessCom ? 'bg-[#191815] border-[#302e2b]' : 'bg-[#1c1a17] border-[#33312c]'} border rounded-2xl p-3 flex flex-col gap-2`}>
        <div className="flex items-center justify-between text-xs font-medium px-1">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <ListOrdered className={`w-3.5 h-3.5 ${isChessCom ? 'text-[#81b64c]' : 'text-[#3692e7]'}`} />
            <span>Нотация партии</span>
          </span>
          <span className={`font-mono text-[11px] ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'}`}>
            Ход: {currentStep} / {totalSteps}
          </span>
        </div>

        <div className="max-h-48 overflow-y-auto pr-1 flex flex-col gap-1 text-xs">
          {movePairs.map((pair) => (
            <div
              key={pair.moveNumber}
              className={`grid grid-cols-12 gap-1.5 items-center py-1 px-1.5 rounded-lg ${isChessCom ? 'hover:bg-[#262421]' : 'hover:bg-[#292723]'} transition-colors`}
            >
              {/* Move Number */}
              <span className={`col-span-2 ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} font-mono text-right pr-2`}>
                {pair.moveNumber}.
              </span>

              {/* White Move */}
              <div className="col-span-5">
                {pair.white && (
                  <button
                    type="button"
                    onClick={() => goToStep(pair.white!.ply)}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-md transition-all font-mono text-left cursor-pointer ${
                      currentStep === pair.white.ply
                        ? isChessCom
                          ? 'bg-[#81b64c]/20 text-[#81b64c] font-bold border border-[#81b64c]/50'
                          : 'bg-[#3692e7]/20 text-[#3692e7] font-bold border border-[#3692e7]/50'
                        : isChessCom
                          ? 'hover:bg-[#262421] text-[#c3c2c1]'
                          : 'hover:bg-[#292723] text-[#bababa]'
                    }`}
                  >
                    <span>{pair.white.san}</span>
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                        CLASSIFICATION_META[pair.white.type].colorClass
                      }`}
                      title={CLASSIFICATION_META[pair.white.type].label}
                    >
                      {CLASSIFICATION_META[pair.white.type].glyph}
                    </span>
                  </button>
                )}
              </div>

              {/* Black Move */}
              <div className="col-span-5">
                {pair.black && (
                  <button
                    type="button"
                    onClick={() => goToStep(pair.black!.ply)}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-md transition-all font-mono text-left cursor-pointer ${
                      currentStep === pair.black.ply
                        ? isChessCom
                          ? 'bg-[#81b64c]/20 text-[#81b64c] font-bold border border-[#81b64c]/50'
                          : 'bg-[#3692e7]/20 text-[#3692e7] font-bold border border-[#3692e7]/50'
                        : isChessCom
                          ? 'hover:bg-[#262421] text-[#c3c2c1]'
                          : 'hover:bg-[#292723] text-[#bababa]'
                    }`}
                  >
                    <span>{pair.black.san}</span>
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                        CLASSIFICATION_META[pair.black.type].colorClass
                      }`}
                      title={CLASSIFICATION_META[pair.black.type].label}
                    >
                      {CLASSIFICATION_META[pair.black.type].glyph}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
