'use client';

import { Chess, type Square } from 'chess.js';
import { useCallback, useEffect, useState } from 'react';

export interface DrillTarget {
  fen: string;
  pieceSquare: Square;
  pieceName: string;
  pieceColor: 'w' | 'b';
  legalSquares: string[];
}

const DRILL_POSITIONS: Array<{
  fen: string;
  pieceSquare: Square;
  pieceName: string;
  pieceColor: 'w' | 'b';
}> = [
  {
    fen: '8/8/8/3R4/8/8/8/8 w - - 0 1',
    pieceSquare: 'd5',
    pieceName: 'Ладья',
    pieceColor: 'w',
  },
  {
    fen: '8/8/8/4N3/8/8/8/8 w - - 0 1',
    pieceSquare: 'e5',
    pieceName: 'Конь',
    pieceColor: 'w',
  },
  {
    fen: '8/8/8/3B4/8/8/8/8 w - - 0 1',
    pieceSquare: 'd5',
    pieceName: 'Слон',
    pieceColor: 'w',
  },
  {
    fen: '8/8/8/4Q3/8/8/8/8 w - - 0 1',
    pieceSquare: 'e5',
    pieceName: 'Ферзь',
    pieceColor: 'w',
  },
  {
    fen: '8/8/8/4K3/8/8/8/8 w - - 0 1',
    pieceSquare: 'e5',
    pieceName: 'Король',
    pieceColor: 'w',
  },
  {
    fen: '8/8/8/8/4P3/8/8/8 w - - 0 1',
    pieceSquare: 'e4',
    pieceName: 'Пешка',
    pieceColor: 'w',
  },
  {
    fen: '8/8/2p1p3/3n4/2p1p3/8/8/8 b - - 0 1',
    pieceSquare: 'd5',
    pieceName: 'Конь',
    pieceColor: 'b',
  },
  {
    fen: '8/8/8/2r5/8/8/8/8 b - - 0 1',
    pieceSquare: 'c5',
    pieceName: 'Ладья',
    pieceColor: 'b',
  },
  {
    fen: '8/8/8/3b4/8/8/8/8 b - - 0 1',
    pieceSquare: 'd5',
    pieceName: 'Слон',
    pieceColor: 'b',
  },
  {
    fen: '8/2p5/8/3P4/8/8/8/8 w - - 0 1',
    pieceSquare: 'd5',
    pieceName: 'Пешка',
    pieceColor: 'w',
  },
];

export function usePieceMovesDrill() {
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [selectedSquares, setSelectedSquares] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [gameOver, setGameOver] = useState(false);

  // Compute current drill setup
  const currentSetup = DRILL_POSITIONS[(level - 1) % DRILL_POSITIONS.length];

  const legalSquares: string[] = (() => {
    try {
      const chess = new Chess();
      chess.load(currentSetup.fen);
      const moves = chess.moves({ square: currentSetup.pieceSquare, verbose: true });
      return moves.map((m) => m.to as string);
    } catch {
      return [];
    }
  })();

  const toggleSquare = useCallback((square: string) => {
    if (feedback !== 'idle' || gameOver) return;
    setSelectedSquares((prev) =>
      prev.includes(square) ? prev.filter((s) => s !== square) : [...prev, square],
    );
  }, [feedback, gameOver]);

  const clearSelection = useCallback(() => {
    if (feedback !== 'idle' || gameOver) return;
    setSelectedSquares([]);
  }, [feedback, gameOver]);

  const checkAnswer = useCallback(() => {
    if (gameOver || feedback !== 'idle') return;

    // Check if selectedSquares match legalSquares exactly
    const isExactMatch =
      selectedSquares.length === legalSquares.length &&
      selectedSquares.every((s) => legalSquares.includes(s));

    if (isExactMatch) {
      setFeedback('correct');
      setScore((s) => s + 100);
      setTimeout(() => {
        setLevel((l) => l + 1);
        setSelectedSquares([]);
        setFeedback('idle');
      }, 1200);
    } else {
      setFeedback('wrong');
      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) {
        setGameOver(true);
      } else {
        setTimeout(() => {
          setFeedback('idle');
        }, 1200);
      }
    }
  }, [gameOver, feedback, selectedSquares, legalSquares, lives]);

  const restartDrill = useCallback(() => {
    setLevel(1);
    setLives(3);
    setScore(0);
    setSelectedSquares([]);
    setFeedback('idle');
    setGameOver(false);
  }, []);

  return {
    level,
    lives,
    score,
    currentSetup,
    legalSquares,
    selectedSquares,
    feedback,
    gameOver,
    toggleSquare,
    clearSelection,
    checkAnswer,
    restartDrill,
  };
}
