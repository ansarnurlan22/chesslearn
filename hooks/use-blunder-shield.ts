'use client';

import { Chess } from 'chess.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '@/lib/sound-effects';
import { BLUNDER_SHIELD_PUZZLES, type BlunderPuzzle } from '@/lib/train-data/blunder-puzzles';

export function useBlunderShield() {
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const [currentFen, setCurrentFen] = useState<string>('');
  const [shieldStatus, setShieldStatus] = useState<'idle' | 'shielded' | 'blundered'>('idle');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  const chessRef = useRef<Chess>(new Chess());
  const currentPuzzle: BlunderPuzzle = BLUNDER_SHIELD_PUZZLES[puzzleIndex] || BLUNDER_SHIELD_PUZZLES[0];

  const loadPuzzle = useCallback((puzzle: BlunderPuzzle) => {
    try {
      const c = new Chess(puzzle.fen);
      chessRef.current = c;
      setCurrentFen(c.fen());
      setShieldStatus('idle');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadPuzzle(currentPuzzle);
  }, [currentPuzzle, loadPuzzle]);

  const onPieceDrop = useCallback((sourceSquare: string, targetSquare: string): boolean => {
    if (shieldStatus === 'shielded') return false;

    const chess = chessRef.current;
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
      const isShieldMove =
        playedSan === currentPuzzle.solutionMove ||
        moveRes.to === currentPuzzle.solutionMove;

      if (isShieldMove) {
        sfx.playSuccess();
        setShieldStatus('shielded');
        setScore(prev => prev + 100);
        setStreak(prev => prev + 1);
        setCurrentFen(chess.fen());
        return true;
      }

      // Check if it's the common blunder
      const isBlunder =
        playedSan === currentPuzzle.commonMistake ||
        currentPuzzle.commonMistake.startsWith(playedSan);

      chess.undo();
      setCurrentFen(chess.fen());
      sfx.playError();
      setShieldStatus('blundered');
      setStreak(0);
      return false;
    } catch {
      sfx.playError();
      return false;
    }
  }, [currentPuzzle, shieldStatus]);

  const nextPuzzle = useCallback(() => {
    sfx.playMove();
    if (puzzleIndex + 1 < BLUNDER_SHIELD_PUZZLES.length) {
      setPuzzleIndex(prev => prev + 1);
    } else {
      setPuzzleIndex(0);
    }
  }, [puzzleIndex]);

  const retryPuzzle = useCallback(() => {
    sfx.playMove();
    loadPuzzle(currentPuzzle);
  }, [loadPuzzle, currentPuzzle]);

  return {
    currentPuzzle,
    puzzleIndex,
    totalPuzzles: BLUNDER_SHIELD_PUZZLES.length,
    currentFen: currentFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    boardOrientation: (currentPuzzle.turn === 'b' ? 'black' : 'white') as 'white' | 'black',
    onPieceDrop,
    shieldStatus,
    nextPuzzle,
    retryPuzzle,
    score,
    streak,
  };
}
