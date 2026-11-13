'use client';

import { Chess } from 'chess.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '@/lib/sound-effects';
import { WOODPECKER_PUZZLES, type WoodpeckerPuzzle } from '@/lib/train-data/woodpecker-puzzles';

export type WoodpeckerTier = 'all' | 'beginner' | 'casual' | 'club' | 'tournament' | 'master';

export function useWoodpecker(initialTier: WoodpeckerTier = 'all') {
  const [selectedTier, setSelectedTier] = useState<WoodpeckerTier>(initialTier);
  const [cycle, setCycle] = useState<number>(1);
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const [currentFen, setCurrentFen] = useState<string>('');
  const [streak, setStreak] = useState<number>(0);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [cycleTimeSeconds, setCycleTimeSeconds] = useState<number>(0);
  const [isCycleRunning, setIsCycleRunning] = useState<boolean>(true);
  const [isCompletedCycle, setIsCompletedCycle] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const chessRef = useRef<Chess>(new Chess());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter puzzles
  const puzzles = selectedTier === 'all'
    ? WOODPECKER_PUZZLES
    : WOODPECKER_PUZZLES.filter(p => p.tier === selectedTier);

  const currentPuzzle: WoodpeckerPuzzle | undefined = puzzles[puzzleIndex];
  const [solutionStep, setSolutionStep] = useState<number>(0);

  // Initialize current puzzle
  const loadPuzzle = useCallback((puzzle: WoodpeckerPuzzle) => {
    try {
      const c = new Chess(puzzle.fen);
      chessRef.current = c;
      setCurrentFen(c.fen());
      setSolutionStep(0);
      setFeedback(null);
    } catch {
      // fallback
    }
  }, []);

  useEffect(() => {
    if (currentPuzzle) {
      loadPuzzle(currentPuzzle);
    }
  }, [currentPuzzle, loadPuzzle]);

  // Timer loop
  useEffect(() => {
    if (isCycleRunning && !isCompletedCycle) {
      timerRef.current = setInterval(() => {
        setCycleTimeSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCycleRunning, isCompletedCycle]);

  // Handle piece drop on board
  const onPieceDrop = useCallback((sourceSquare: string, targetSquare: string): boolean => {
    if (!currentPuzzle || isCompletedCycle) return false;

    const chess = chessRef.current;
    const expectedSan = currentPuzzle.solution[solutionStep];

    try {
      // Test move
      const moveRes = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (!moveRes) {
        sfx.playError();
        return false;
      }

      // Check if move matches solution SAN or target square
      const playedSan = moveRes.san;
      const isCorrect = playedSan === expectedSan || moveRes.to === expectedSan;

      if (!isCorrect) {
        // Undo move
        chess.undo();
        setCurrentFen(chess.fen());
        setFeedback('wrong');
        sfx.playError();
        setErrorCount(prev => prev + 1);
        setStreak(0);
        return false;
      }

      // Correct move!
      sfx.playMove();
      setCurrentFen(chess.fen());
      setFeedback('correct');
      const nextStep = solutionStep + 1;

      // If puzzle requires computer response move
      if (nextStep < currentPuzzle.solution.length) {
        setSolutionStep(nextStep);
        const opponentMoveSan = currentPuzzle.solution[nextStep];

        setTimeout(() => {
          try {
            chess.move(opponentMoveSan);
            setCurrentFen(chess.fen());
            sfx.playMove();
            setSolutionStep(nextStep + 1);
          } catch {
            // ignore
          }
        }, 350);
      } else {
        // Puzzle fully solved!
        sfx.playSuccess();
        setStreak(prev => prev + 1);
        setSolvedCount(prev => prev + 1);

        setTimeout(() => {
          if (puzzleIndex + 1 < puzzles.length) {
            setPuzzleIndex(prev => prev + 1);
          } else {
            // Cycle finished!
            sfx.playLevelUp();
            setIsCompletedCycle(true);
            setIsCycleRunning(false);
          }
        }, 700);
      }

      return true;
    } catch {
      sfx.playError();
      return false;
    }
  }, [currentPuzzle, solutionStep, puzzleIndex, puzzles.length, isCompletedCycle]);

  // Restart / Advance to next cycle
  const startNextCycle = useCallback(() => {
    sfx.playLevelUp();
    setCycle(prev => Math.min(prev + 1, 5));
    setPuzzleIndex(0);
    setCycleTimeSeconds(0);
    setIsCompletedCycle(false);
    setIsCycleRunning(true);
    setFeedback(null);
  }, []);

  const resetAllCycles = useCallback(() => {
    sfx.playMove();
    setCycle(1);
    setPuzzleIndex(0);
    setStreak(0);
    setSolvedCount(0);
    setErrorCount(0);
    setCycleTimeSeconds(0);
    setIsCompletedCycle(false);
    setIsCycleRunning(true);
    setFeedback(null);
  }, []);

  const changeTier = useCallback((tier: WoodpeckerTier) => {
    setSelectedTier(tier);
    setPuzzleIndex(0);
    setStreak(0);
    setSolvedCount(0);
    setErrorCount(0);
    setCycleTimeSeconds(0);
    setIsCompletedCycle(false);
    setIsCycleRunning(true);
  }, []);

  // Format time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return {
    cycle,
    totalCycles: 5,
    puzzles,
    currentPuzzle,
    puzzleIndex,
    totalPuzzles: puzzles.length,
    selectedTier,
    changeTier,
    currentFen: currentFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    boardOrientation: (currentPuzzle?.turn === 'b' ? 'black' : 'white') as 'white' | 'black',
    onPieceDrop,
    streak,
    solvedCount,
    errorCount,
    cycleTime: formatTime(cycleTimeSeconds),
    isCompletedCycle,
    startNextCycle,
    resetAllCycles,
    feedback,
  };
}
