'use client';

import { Chess, type Square } from 'chess.js';
import { useCallback, useEffect, useState } from 'react';

export interface MoveStep {
  san: string;
  from: string;
  to: string;
  fen: string;
}

export function useAnalysisBoard(initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
  const [fen, setFen] = useState(initialFen);
  const [history, setHistory] = useState<MoveStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [depth, setDepth] = useState<number>(18);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [evalScore, setEvalScore] = useState<string>('0.0');
  const [pvLines, setPvLines] = useState<string[]>([]);
  const [coachComment, setCoachComment] = useState<string>('Сделайте ход на доске для запуска расчёта Stockfish 19 Lite.');

  // Fetch engine eval whenever FEN changes
  const evaluatePosition = useCallback(async (currentFen: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/fen-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen: currentFen, depth }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          eval?: string;
          bestMove?: string;
          line?: string;
        };

        const score = data.eval || '0.0';
        setEvalScore(score);
        setBestMove(data.bestMove || null);

        const lines = data.line ? [data.line] : [];
        setPvLines(lines);

        const numScore = parseFloat(score);
        if (!isNaN(numScore)) {
          if (numScore > 1.5) {
            setCoachComment(`У белых решающий перевес (+${score}). Ищите форсированную тактику.`);
          } else if (numScore < -1.5) {
            setCoachComment(`У чёрных значительное преимущество (${score}). Защищайтесь активно.`);
          } else if (Math.abs(numScore) < 0.4) {
            setCoachComment('Позиция равна. Развивайте фигуры и захватывайте ключевые форпосты.');
          } else {
            setCoachComment(`Небольшой перевес (${score}). Продолжайте давление.`);
          }
        }
      }
    } catch {
      // fallback
    } finally {
      setIsAnalyzing(false);
    }
  }, [depth]);

  useEffect(() => {
    evaluatePosition(fen);
  }, [fen, evaluatePosition]);

  const makeMove = useCallback(
    (sourceSquare: string, targetSquare: string): boolean => {
      try {
        const chess = new Chess();
        chess.load(fen);
        const move = chess.move({
          from: sourceSquare as Square,
          to: targetSquare as Square,
          promotion: 'q',
        });

        if (!move) return false;

        const nextFen = chess.fen();
        const nextStep: MoveStep = {
          san: move.san,
          from: move.from,
          to: move.to,
          fen: nextFen,
        };

        const newHistory = [...history.slice(0, currentStep), nextStep];
        setHistory(newHistory);
        setCurrentStep(newHistory.length);
        setFen(nextFen);
        return true;
      } catch {
        return false;
      }
    },
    [fen, history, currentStep],
  );

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex > history.length) return;
      setCurrentStep(stepIndex);
      if (stepIndex === 0) {
        setFen(initialFen);
      } else {
        setFen(history[stepIndex - 1].fen);
      }
    },
    [history, initialFen],
  );

  const resetGame = useCallback(() => {
    setFen(initialFen);
    setHistory([]);
    setCurrentStep(0);
  }, [initialFen]);

  const flipBoard = useCallback(() => {
    setOrientation((o) => (o === 'white' ? 'black' : 'white'));
  }, []);

  const loadCustomFen = useCallback((newFen: string): boolean => {
    try {
      const chess = new Chess();
      chess.load(newFen);
      setFen(chess.fen());
      setHistory([]);
      setCurrentStep(0);
      return true;
    } catch {
      return false;
    }
  }, []);

  const loadCustomPgn = useCallback((pgn: string): boolean => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);
      const moves = chess.history({ verbose: true });
      const replay = new Chess();
      const newHistory: MoveStep[] = [];

      for (const m of moves) {
        replay.move(m);
        newHistory.push({
          san: m.san,
          from: m.from,
          to: m.to,
          fen: replay.fen(),
        });
      }

      setHistory(newHistory);
      setCurrentStep(newHistory.length);
      setFen(replay.fen());
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
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
    reanalyze: () => evaluatePosition(fen),
  };
}
