'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '@/lib/sound-effects';

export type BrainGameType = 'squareRush' | 'knightTrail' | 'eightQueens' | 'blindMoves';

const ALL_SQUARES: string[] = [];
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];
for (const f of FILES) {
  for (const r of RANKS) {
    ALL_SQUARES.push(`${f}${r}`);
  }
}

export const BLIND_QUESTIONS = [
  {
    moves: '1. e4 e5  2. Nf3 Nc6  3. Bc4 Bc5',
    question: 'Какая фигура белых контролирует диагональ a2-g8 и атакует f7?',
    options: ['Слон c4', 'Конь f3', 'Ферзь d1', 'Пешка e4'],
    correctIndex: 0,
    explanation: 'Белопольный слон вышел на c4 на 3-м ходу и целится прямо в пункт f7.',
  },
  {
    moves: '1. d4 Nf6  2. c4 g6  3. Nc3 Bg7  4. e4 d6',
    question: 'Какая фигура черных фианкеттирована на королевском фланге?',
    options: ['Слон g7', 'Конь f6', 'Пешка d6', 'Слон c8'],
    correctIndex: 0,
    explanation: 'Ходом 3... Bg7 черные развили чернопольного слона на большую диагональ h8-a1.',
  },
  {
    moves: '1. e4 c5  2. Nf3 d6  3. d4 cxd4  4. Nxd4',
    question: 'Какая фигура белых занимает центральное поле d4 после размена пешек?',
    options: ['Белый конь d4', 'Белый ферзь d4', 'Белый слон d4', 'Белая ладья d4'],
    correctIndex: 0,
    explanation: 'Конь f3 взял пешку на d4 на 4-м ходу.',
  },
];

export function useBrainGames() {
  const [activeGame, setActiveGame] = useState<BrainGameType>('squareRush');

  // --- 1. SQUARE RUSH STATE ---
  const [targetSquare, setTargetSquare] = useState<string>('e4');
  const [rushScore, setRushScore] = useState<number>(0);
  const [rushStreak, setRushStreak] = useState<number>(0);
  const [rushTimeLeft, setRushTimeLeft] = useState<number>(30);
  const [isRushActive, setIsRushActive] = useState<boolean>(false);
  const rushTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomSquare = useCallback(() => {
    return ALL_SQUARES[Math.floor(Math.random() * ALL_SQUARES.length)];
  }, []);

  const startSquareRush = useCallback(() => {
    sfx.playLevelUp();
    setRushScore(0);
    setRushStreak(0);
    setRushTimeLeft(30);
    setIsRushActive(true);
    setTargetSquare(getRandomSquare());
  }, [getRandomSquare]);

  useEffect(() => {
    if (isRushActive && rushTimeLeft > 0) {
      rushTimerRef.current = setInterval(() => {
        setRushTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(rushTimerRef.current!);
            setIsRushActive(false);
            sfx.playSuccess();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (rushTimerRef.current) clearInterval(rushTimerRef.current);
    };
  }, [isRushActive, rushTimeLeft]);

  const onSquareClick = useCallback((square: string) => {
    if (!isRushActive) return;

    if (square === targetSquare) {
      sfx.playMove();
      setRushScore(prev => prev + 10);
      setRushStreak(prev => prev + 1);
      setTargetSquare(getRandomSquare());
    } else {
      sfx.playError();
      setRushStreak(0);
    }
  }, [isRushActive, targetSquare, getRandomSquare]);

  // --- 2. 8 QUEENS STATE ---
  const [queens, setQueens] = useState<string[]>([]);
  const [queensSolved, setQueensSolved] = useState<boolean>(false);

  const checkQueensConflict = (placedQueens: string[]): boolean => {
    for (let i = 0; i < placedQueens.length; i++) {
      const q1 = placedQueens[i];
      const f1 = q1.charCodeAt(0) - 97;
      const r1 = parseInt(q1[1], 10) - 1;

      for (let j = i + 1; j < placedQueens.length; j++) {
        const q2 = placedQueens[j];
        const f2 = q2.charCodeAt(0) - 97;
        const r2 = parseInt(q2[1], 10) - 1;

        if (f1 === f2 || r1 === r2 || Math.abs(f1 - f2) === Math.abs(r1 - r2)) {
          return true; // conflict!
        }
      }
    }
    return false;
  };

  const toggleQueen = useCallback((square: string) => {
    setQueens(prev => {
      let next: string[];
      if (prev.includes(square)) {
        sfx.playMove();
        next = prev.filter(s => s !== square);
      } else {
        if (prev.length >= 8) {
          sfx.playError();
          return prev;
        }
        sfx.playMove();
        next = [...prev, square];
      }

      if (next.length === 8 && !checkQueensConflict(next)) {
        sfx.playLevelUp();
        setQueensSolved(true);
      } else {
        setQueensSolved(false);
      }

      return next;
    });
  }, []);

  const resetQueens = useCallback(() => {
    sfx.playMove();
    setQueens([]);
    setQueensSolved(false);
  }, []);

  // --- 3. BLIND MOVES STATE ---
  const [blindIndex, setBlindIndex] = useState<number>(0);
  const [blindSelectedOption, setBlindSelectedOption] = useState<number | null>(null);
  const [blindIsCorrect, setBlindIsCorrect] = useState<boolean | null>(null);

  const currentBlind = BLIND_QUESTIONS[blindIndex] || BLIND_QUESTIONS[0];

  const answerBlind = useCallback((optionIndex: number) => {
    setBlindSelectedOption(optionIndex);
    if (optionIndex === currentBlind.correctIndex) {
      sfx.playSuccess();
      setBlindIsCorrect(true);
    } else {
      sfx.playError();
      setBlindIsCorrect(false);
    }
  }, [currentBlind.correctIndex]);

  const nextBlind = useCallback(() => {
    sfx.playMove();
    setBlindSelectedOption(null);
    setBlindIsCorrect(null);
    setBlindIndex(prev => (prev + 1) % BLIND_QUESTIONS.length);
  }, []);

  return {
    activeGame,
    setActiveGame: (g: BrainGameType) => {
      sfx.playMove();
      setActiveGame(g);
    },
    // Square rush
    targetSquare,
    rushScore,
    rushStreak,
    rushTimeLeft,
    isRushActive,
    startSquareRush,
    onSquareClick,
    // 8 Queens
    queens,
    queensHasConflict: checkQueensConflict(queens),
    queensSolved,
    toggleQueen,
    resetQueens,
    // Blind moves
    currentBlind,
    blindIndex,
    totalBlindQuestions: BLIND_QUESTIONS.length,
    blindSelectedOption,
    blindIsCorrect,
    answerBlind,
    nextBlind,
  };
}
