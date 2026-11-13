'use client';

import { Chess } from 'chess.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '@/lib/sound-effects';
import { DAILY_PUZZLES, type DailyPuzzle } from '@/lib/train-data/daily-puzzles';

export function usePuzzleSolver(initialDay = 13) {
  const [selectedDay, setSelectedDay] = useState<number>(initialDay);
  const [solvedDays, setSolvedDays] = useState<number[]>([9, 10, 11, 12]);
  const [hintLevel, setHintLevel] = useState<number>(0); // 0 = none, 1 = piece, 2 = target, 3 = full
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [currentFen, setCurrentFen] = useState<string>('');
  const [solutionStep, setSolutionStep] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const chessRef = useRef<Chess>(new Chess());

  const currentPuzzle: DailyPuzzle =
    DAILY_PUZZLES.find(p => p.day === selectedDay) || DAILY_PUZZLES[0];

  // Load selected puzzle
  const loadPuzzle = useCallback((puzzle: DailyPuzzle) => {
    try {
      const c = new Chess(puzzle.fen);
      chessRef.current = c;
      setCurrentFen(c.fen());
      setBoardOrientation(puzzle.turn === 'b' ? 'black' : 'white');
      setSolutionStep(0);
      setIsSolved(solvedDays.includes(puzzle.day));
      setHintLevel(0);
      setFeedback(null);
    } catch {
      // fallback
    }
  }, [solvedDays]);

  useEffect(() => {
    loadPuzzle(currentPuzzle);
  }, [currentPuzzle, loadPuzzle]);

  const onPieceDrop = useCallback((sourceSquare: string, targetSquare: string): boolean => {
    if (isSolved) return false;

    const chess = chessRef.current;
    const expectedSan = currentPuzzle.solution[solutionStep];

    try {
      const moveRes = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (!moveRes) {
        sfx.playError();
        return false;
      }

      const playedSan = moveRes.san;
      const isCorrect = playedSan === expectedSan || moveRes.to === expectedSan;

      if (!isCorrect) {
        chess.undo();
        setCurrentFen(chess.fen());
        setFeedback('wrong');
        sfx.playError();
        return false;
      }

      // Valid move!
      sfx.playMove();
      setCurrentFen(chess.fen());
      setFeedback('correct');
      const nextStep = solutionStep + 1;

      if (nextStep < currentPuzzle.solution.length) {
        setSolutionStep(nextStep);
        const opponentSan = currentPuzzle.solution[nextStep];

        setTimeout(() => {
          try {
            chess.move(opponentSan);
            setCurrentFen(chess.fen());
            sfx.playMove();
            setSolutionStep(nextStep + 1);
          } catch {
            // ignore
          }
        }, 350);
      } else {
        // Solved
        sfx.playSuccess();
        setIsSolved(true);
        if (!solvedDays.includes(currentPuzzle.day)) {
          setSolvedDays(prev => [...prev, currentPuzzle.day]);
        }
      }

      return true;
    } catch {
      sfx.playError();
      return false;
    }
  }, [currentPuzzle, solutionStep, isSolved, solvedDays]);

  const requestNextHint = useCallback(() => {
    sfx.playMove();
    setHintLevel(prev => Math.min(prev + 1, 3));
  }, []);

  const flipBoard = useCallback(() => {
    sfx.playMove();
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
  }, []);

  const resetPuzzle = useCallback(() => {
    sfx.playMove();
    loadPuzzle(currentPuzzle);
    setIsSolved(false);
  }, [loadPuzzle, currentPuzzle]);

  const selectDay = useCallback((day: number) => {
    sfx.playMove();
    setSelectedDay(day);
  }, []);

  return {
    currentPuzzle,
    selectedDay,
    selectDay,
    solvedDays,
    dailyPuzzles: DAILY_PUZZLES,
    currentFen: currentFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    boardOrientation,
    flipBoard,
    onPieceDrop,
    isSolved,
    feedback,
    hintLevel,
    requestNextHint,
    resetPuzzle,
    hints: currentPuzzle.hints,
  };
}
