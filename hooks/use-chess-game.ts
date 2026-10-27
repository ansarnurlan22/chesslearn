'use client';

import { Chess } from 'chess.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface UseChessGameOptions {
  pgn?: string;
  moves?: string;
  orientation?: 'white' | 'black';
}

export interface ChessGameState {
  fen: string;
  currentStep: number;
  totalSteps: number;
  isStart: boolean;
  isEnd: boolean;
  turn: 'w' | 'b';
  lastMove: { from: string; to: string } | null;
  moveNotation: string;
  goToStart: () => void;
  goBack: () => void;
  goForward: () => void;
  goToEnd: () => void;
  goToStep: (step: number) => void;
}

export function useChessGame({
  pgn,
  moves,
}: UseChessGameOptions): ChessGameState {
  // Compute positions list (FENs) and moves from PGN or moves string
  const { positions, moveHistory } = useMemo(() => {
    const chess = new Chess();
    const fenList: string[] = [chess.fen()];
    const historyList: Array<{ san: string; from: string; to: string }> = [];

    if (pgn && pgn.trim()) {
      try {
        chess.loadPgn(pgn);
        const verboseHistory = chess.history({ verbose: true });
        // Replay to capture each intermediate FEN
        const replayChess = new Chess();
        for (const mv of verboseHistory) {
          replayChess.move(mv);
          fenList.push(replayChess.fen());
          historyList.push({ san: mv.san, from: mv.from, to: mv.to });
        }
      } catch {
        // If loadPgn fails, try fallback move parsing
        if (moves) {
          const replayChess = new Chess();
          const tokens = moves.trim().split(/\s+/).filter((t) => !/^\d+\./.test(t));
          for (const token of tokens) {
            try {
              const res = replayChess.move(token);
              if (res) {
                fenList.push(replayChess.fen());
                historyList.push({ san: res.san, from: res.from, to: res.to });
              }
            } catch {
              break;
            }
          }
        }
      }
    } else if (moves && moves.trim()) {
      const replayChess = new Chess();
      const tokens = moves.trim().split(/\s+/).filter((t) => !/^\d+\./.test(t) && t !== '*');
      for (const token of tokens) {
        try {
          const res = replayChess.move(token);
          if (res) {
            fenList.push(replayChess.fen());
            historyList.push({ san: res.san, from: res.from, to: res.to });
          }
        } catch {
          break;
        }
      }
    }

    return {
      positions: fenList,
      moveHistory: historyList,
    };
  }, [pgn, moves]);

  const [currentStep, setCurrentStep] = useState<number>(0);

  // When game changes, go to start (or end if preferred, start is clean)
  useEffect(() => {
    setCurrentStep(0);
  }, [positions]);

  const totalSteps = positions.length - 1;
  const isStart = currentStep === 0;
  const isEnd = currentStep >= totalSteps;

  const goToStart = useCallback(() => setCurrentStep(0), []);
  const goBack = useCallback(() => setCurrentStep((s) => Math.max(0, s - 1)), []);
  const goForward = useCallback(
    () => setCurrentStep((s) => Math.min(totalSteps, s + 1)),
    [totalSteps],
  );
  const goToEnd = useCallback(() => setCurrentStep(totalSteps), [totalSteps]);
  const goToStep = useCallback(
    (step: number) => setCurrentStep(Math.max(0, Math.min(totalSteps, step))),
    [totalSteps],
  );

  const currentFen = positions[currentStep] ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const turn = currentFen.split(' ')[1] === 'w' ? 'w' : 'b';

  const lastMove = currentStep > 0 && moveHistory[currentStep - 1]
    ? { from: moveHistory[currentStep - 1].from, to: moveHistory[currentStep - 1].to }
    : null;

  const moveNotation =
    currentStep === 0
      ? 'Начальная позиция'
      : `${Math.ceil(currentStep / 2)}. ${currentStep % 2 === 1 ? 'Белые' : 'Чёрные'} (${moveHistory[currentStep - 1]?.san ?? ''})`;

  return {
    fen: currentFen,
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
  };
}
