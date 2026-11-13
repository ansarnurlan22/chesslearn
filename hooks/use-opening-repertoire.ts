'use client';

import { Chess } from 'chess.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '@/lib/sound-effects';
import { REPERTOIRE_COURSES, type RepertoireCourse, type RepertoireMove } from '@/lib/train-data/repertoire-lines';

export type RepertoireMode = 'learn' | 'practice' | 'arena' | 'streak';

export function useOpeningRepertoire(initialCourseId = 'italian-game') {
  const [courseId, setCourseId] = useState<string>(initialCourseId);
  const [mode, setMode] = useState<RepertoireMode>('learn');
  const [currentPly, setCurrentPly] = useState<number>(0);
  const [currentFen, setCurrentFen] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [streakCount, setStreakCount] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [practiceStatus, setPracticeStatus] = useState<'playing' | 'wrong' | 'completed'>('playing');

  const chessRef = useRef<Chess>(new Chess());

  const currentCourse: RepertoireCourse =
    REPERTOIRE_COURSES.find(c => c.id === courseId) || REPERTOIRE_COURSES[0];

  // Build steps list
  const stepsFens = useMemo(() => {
    const list: string[] = ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'];
    try {
      const c = new Chess();
      for (const san of currentCourse.line) {
        c.move(san);
        list.push(c.fen());
      }
    } catch {
      // fallback
    }
    return list;
  }, [currentCourse]);

  // Sync FEN with currentPly
  useEffect(() => {
    if (stepsFens[currentPly]) {
      setCurrentFen(stepsFens[currentPly]);
      try {
        chessRef.current = new Chess(stepsFens[currentPly]);
      } catch {
        // ignore
      }
    }
  }, [currentPly, stepsFens]);

  // When course or mode changes, reset
  useEffect(() => {
    setCurrentPly(0);
    setPracticeStatus('playing');
  }, [courseId, mode]);

  // Learn mode controls
  const stepForward = useCallback(() => {
    if (currentPly + 1 < stepsFens.length) {
      sfx.playMove();
      setCurrentPly(prev => prev + 1);
    }
  }, [currentPly, stepsFens.length]);

  const stepBackward = useCallback(() => {
    if (currentPly > 0) {
      sfx.playMove();
      setCurrentPly(prev => prev - 1);
    }
  }, [currentPly]);

  const goToStart = useCallback(() => {
    sfx.playMove();
    setCurrentPly(0);
  }, []);

  const goToEnd = useCallback(() => {
    sfx.playMove();
    setCurrentPly(stepsFens.length - 1);
  }, [stepsFens.length]);

  // Practice / Streak drop handler
  const onPieceDrop = useCallback((sourceSquare: string, targetSquare: string): boolean => {
    if (mode === 'learn') return false;

    const expectedSan = currentCourse.line[currentPly];
    if (!expectedSan) return false;

    const chess = new Chess(currentFen);
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
        sfx.playError();
        setPracticeStatus('wrong');
        setStreakCount(0);
        setTimeout(() => {
          setPracticeStatus('playing');
        }, 800);
        return false;
      }

      // Correct move
      sfx.playMove();
      const nextPly = currentPly + 1;
      setCurrentPly(nextPly);
      setStreakCount(prev => {
        const nextVal = prev + 1;
        if (nextVal > maxStreak) setMaxStreak(nextVal);
        return nextVal;
      });

      // If line is finished
      if (nextPly >= currentCourse.line.length) {
        sfx.playSuccess();
        setPracticeStatus('completed');
        return true;
      }

      // If there is an opponent response move in repertoire
      if (nextPly < currentCourse.line.length) {
        const opponentSan = currentCourse.line[nextPly];
        setTimeout(() => {
          sfx.playMove();
          setCurrentPly(nextPly + 1);
        }, 400);
      }

      return true;
    } catch {
      sfx.playError();
      return false;
    }
  }, [currentCourse.line, currentPly, currentFen, mode, maxStreak]);

  const currentMoveMeta: RepertoireMove | undefined =
    currentCourse.movesMeta.find(m => m.ply === currentPly);

  const resetPractice = useCallback(() => {
    sfx.playMove();
    setCurrentPly(0);
    setPracticeStatus('playing');
  }, []);

  return {
    courses: REPERTOIRE_COURSES,
    currentCourse,
    courseId,
    setCourseId: (id: string) => {
      sfx.playMove();
      setCourseId(id);
    },
    mode,
    setMode: (m: RepertoireMode) => {
      sfx.playMove();
      setMode(m);
    },
    currentPly,
    totalPlies: currentCourse.line.length,
    currentFen,
    boardOrientation: currentCourse.side,
    currentMoveMeta,
    stepForward,
    stepBackward,
    goToStart,
    goToEnd,
    onPieceDrop,
    practiceStatus,
    resetPractice,
    streakCount,
    maxStreak,
  };
}
