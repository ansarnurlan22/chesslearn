'use client';

import { Chess } from 'chess.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getDailyPuzzleStreak, recordDailyPuzzleSolve } from '@/lib/api/streak-actions';
import { sfx } from '@/lib/sound-effects';
import { DAILY_PUZZLES, type DailyPuzzle, getTodayDailyPuzzle } from '@/lib/train-data/daily-puzzles';

const LOCAL_STORAGE_STREAK_KEY = 'chesscheese_puzzle_streak';
const LOCAL_STORAGE_DAYS_KEY = 'chesscheese_solved_days';

export function usePuzzleSolver(initialDay?: number) {
  // Automatically select today's calendar day if no day specified
  const todayDay = new Date().getDate();
  const [selectedDay, setSelectedDay] = useState<number>(initialDay || todayDay);
  const [solvedDays, setSolvedDays] = useState<number[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [hintLevel, setHintLevel] = useState<number>(0); // 0 = none, 1 = piece, 2 = target, 3 = full
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [currentFen, setCurrentFen] = useState<string>('');
  const [solutionStep, setSolutionStep] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const chessRef = useRef<Chess>(new Chess());

  const currentPuzzle: DailyPuzzle =
    DAILY_PUZZLES.find((p) => p.day === selectedDay) || getTodayDailyPuzzle();

  // Load streak & solved days from Supabase (or localStorage fallback) on mount
  useEffect(() => {
    let isMounted = true;

    async function loadStreak() {
      try {
        const res = await getDailyPuzzleStreak();
        if (isMounted && res && res.solvedDays) {
          if (res.streak > 0 || res.solvedDays.length > 0) {
            setCurrentStreak(res.streak);
            setBestStreak(res.bestStreak);
            setSolvedDays(res.solvedDays);
            return;
          }
        }
      } catch {
        // ignore and fallback
      }

      // Local storage fallback for guest users
      try {
        const cachedDays = localStorage.getItem(LOCAL_STORAGE_DAYS_KEY);
        const cachedStreak = localStorage.getItem(LOCAL_STORAGE_STREAK_KEY);
        if (isMounted) {
          if (cachedDays) setSolvedDays(JSON.parse(cachedDays));
          if (cachedStreak) setCurrentStreak(parseInt(cachedStreak, 10) || 0);
        }
      } catch {
        // ignore
      }
    }

    loadStreak();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load selected puzzle
  const loadPuzzle = useCallback(
    (puzzle: DailyPuzzle) => {
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
    },
    [solvedDays],
  );

  useEffect(() => {
    loadPuzzle(currentPuzzle);
  }, [currentPuzzle, loadPuzzle]);

  const onPieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string): boolean => {
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

        // Valid move
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
          // Solved!
          sfx.playSuccess();
          setIsSolved(true);

          const updatedDays = solvedDays.includes(currentPuzzle.day)
            ? solvedDays
            : [...solvedDays, currentPuzzle.day];
          setSolvedDays(updatedDays);

          // Save streak in Supabase & localStorage
          try {
            localStorage.setItem(LOCAL_STORAGE_DAYS_KEY, JSON.stringify(updatedDays));
            recordDailyPuzzleSolve(currentPuzzle.day).then((res) => {
              if (res.success) {
                setCurrentStreak(res.streak);
                setBestStreak(res.bestStreak);
                localStorage.setItem(LOCAL_STORAGE_STREAK_KEY, String(res.streak));
              }
            });
          } catch {
            // ignore
          }
        }

        return true;
      } catch {
        sfx.playError();
        return false;
      }
    },
    [currentPuzzle, solutionStep, isSolved, solvedDays],
  );

  const requestNextHint = useCallback(() => {
    sfx.playMove();
    setHintLevel((prev) => Math.min(prev + 1, 3));
  }, []);

  const flipBoard = useCallback(() => {
    sfx.playMove();
    setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
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
    todayDay,
    selectDay,
    solvedDays,
    currentStreak,
    bestStreak,
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
