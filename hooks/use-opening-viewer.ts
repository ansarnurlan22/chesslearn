'use client';

import { Chess } from 'chess.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { OpeningInfo } from '@/lib/engine/opening-book';
import { sfx } from '@/lib/sound-effects';

export interface OpeningStep {
  ply: number;
  moveNumber: number;
  color: 'w' | 'b';
  san: string;
  from?: string;
  to?: string;
  fen: string;
}

export interface OpeningPlan {
  category: string;
  whitePlans: string[];
  blackPlans: string[];
  whiteWinRate: number;
  drawRate: number;
  blackWinRate: number;
  difficulty: 'Новичок' | 'Клубный' | 'Мастер';
  keySquares: string[];
}

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function useOpeningViewer(opening: OpeningInfo | null) {
  // Generate all steps through chess.js
  const steps: OpeningStep[] = useMemo(() => {
    const list: OpeningStep[] = [
      {
        ply: 0,
        moveNumber: 0,
        color: 'w',
        san: 'Старт',
        fen: STARTING_FEN,
      },
    ];

    if (!opening || !opening.moves || opening.moves.length === 0) {
      return list;
    }

    try {
      const chess = new Chess();
      for (let i = 0; i < opening.moves.length; i++) {
        const san = opening.moves[i];
        const res = chess.move(san);
        if (!res) break;
        list.push({
          ply: i + 1,
          moveNumber: Math.floor(i / 2) + 1,
          color: i % 2 === 0 ? 'w' : 'b',
          san: res.san,
          from: res.from,
          to: res.to,
          fen: chess.fen(),
        });
      }
    } catch {
      // fallback
    }

    return list;
  }, [opening]);

  const [currentPly, setCurrentPly] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // When opening changes, start at final book position so user immediately sees the opening tabia
  useEffect(() => {
    setCurrentPly(steps.length > 1 ? steps.length - 1 : 0);
    setIsPlaying(false);
  }, [steps]);

  // Autoplay loop
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setTimeout(() => {
        setCurrentPly((curr) => {
          if (curr >= steps.length - 1) {
            setIsPlaying(false);
            sfx.playSuccess();
            return curr;
          }
          sfx.playMove();
          return curr + 1;
        });
      }, 1000);
    } else if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }

    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentPly, steps.length]);

  const currentStep = steps[currentPly] || steps[0];
  const isStart = currentPly === 0;
  const isEnd = currentPly === steps.length - 1;

  const goToPly = useCallback(
    (ply: number) => {
      setIsPlaying(false);
      const target = Math.max(0, Math.min(steps.length - 1, ply));
      setCurrentPly(target);
      sfx.playMove();
    },
    [steps.length],
  );

  const first = useCallback(() => goToPly(0), [goToPly]);
  const prev = useCallback(() => goToPly(currentPly - 1), [goToPly, currentPly]);
  const next = useCallback(() => goToPly(currentPly + 1), [goToPly, currentPly]);
  const last = useCallback(() => goToPly(steps.length - 1), [goToPly, steps.length]);

  const toggleAutoplay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentPly >= steps.length - 1) {
        setCurrentPly(0);
      }
      setIsPlaying(true);
      sfx.playMove();
    }
  }, [isPlaying, currentPly, steps.length]);

  // Strategic plans and stats mapped by ECO
  const plans: OpeningPlan = useMemo(() => {
    if (!opening) {
      return {
        category: 'Открытый дебют',
        whitePlans: ['Контроль центра e4/d4', 'Быстрое развитие легких фигур', 'Безопасность короля'],
        blackPlans: ['Уравнение в центре', 'Развитие коней и слонов', 'Своевременная рокировка'],
        whiteWinRate: 38,
        drawRate: 34,
        blackWinRate: 28,
        difficulty: 'Новичок',
        keySquares: ['e4', 'd4', 'e5', 'd5'],
      };
    }

    const eco = opening.eco;
    const name = opening.name.toLowerCase();

    if (eco.startsWith('B') && (name.includes('сицилиан') || name.includes('найдорф') || name.includes('дракон'))) {
      return {
        category: 'Полуоткрытый дебют',
        whitePlans: [
          'Быстрое вскрытие вертикали d4 и атака королевского фланга пешками g4-h4',
          'Давление на слабый пункт d6 и контроль поля d5',
          'Длинная рокировка 0-0-0 с острыми встречными атаками',
        ],
        blackPlans: [
          'Контригра по полуоткрытой вертикали «c» и атака на белого короля',
          'Экспансия на ферзевом фланге (b7-b5-b4)',
          'Прорыв в центре d6-d5 для полного перехвата инициативы',
        ],
        whiteWinRate: 37,
        drawRate: 33,
        blackWinRate: 30,
        difficulty: 'Мастер',
        keySquares: ['c5', 'd4', 'c2', 'd5'],
      };
    }

    if (eco.startsWith('C') && name.includes('итальян')) {
      return {
        category: 'Открытый дебют',
        whitePlans: [
          'Фигурное давление на пункт f7 через слона c4',
          'Подготовка мощного пешечного центра ходами c3 и d4',
          'Связка чёрного коня ходом Bg5 или отход слона на b3',
        ],
        blackPlans: [
          'Надёжная защита пункта f7 и контратака конями (Bc5, Nf6)',
          'Своевременный контрудар по центру d7-d5',
          'Борьба за диагональ a7-g1 и рокировка в безопасность',
        ],
        whiteWinRate: 40,
        drawRate: 34,
        blackWinRate: 26,
        difficulty: 'Новичок',
        keySquares: ['c4', 'f7', 'd4', 'e5'],
      };
    }

    if (eco.startsWith('C') && name.includes('испан')) {
      return {
        category: 'Открытый дебют (Рюи Лопес)',
        whitePlans: [
          'Ослабление пешечной структуры соперника давлением на коня c6',
          'Постепенное наращивание давления в центре ходами c3, d4 и Re1',
          'Перевод коня b1-d2-f1-g3 для атаки королевского фланга',
        ],
        blackPlans: [
          'Разгрузка давления ходами a6, b5 и Bb7',
          'Борьба за пункт e5 и манёвр коня c6-a5 или c6-b8-d7',
          'Острая контратака в стиле Маршалла (d7-d5) или надежный Берлин',
        ],
        whiteWinRate: 39,
        drawRate: 37,
        blackWinRate: 24,
        difficulty: 'Мастер',
        keySquares: ['b5', 'c6', 'e4', 'd4'],
      };
    }

    if (eco.startsWith('C') && name.includes('француз')) {
      return {
        category: 'Полуоткрытый дебют',
        whitePlans: [
          'Удержание пешечного клина e5 и пространственного перевеса',
          'Прямой штурм королевского фланга слонами и ферзем',
          'Ограничение активности плохого белопольного слона c8',
        ],
        blackPlans: [
          'Систематический подрыв белого центра ходами c7-c5 и f7-f6',
          'Давление на опорную пешку d4 ходами Nc6 и Qb6',
          'Активизация слона через b6, a6 или размен легких фигур',
        ],
        whiteWinRate: 38,
        drawRate: 34,
        blackWinRate: 28,
        difficulty: 'Клубный',
        keySquares: ['e5', 'd4', 'c5', 'f6'],
      };
    }

    if (eco.startsWith('B') && name.includes('каро-канн')) {
      return {
        category: 'Полуоткрытый дебют',
        whitePlans: [
          'Захват центра и пространства ходом e4-e5 (Вариант Advance)',
          'Острая атака Панова-Ботвинника с изолятором d4 и ходом c4',
          'Нажим на диагональ c1-h6 и фиксация слабых полей',
        ],
        blackPlans: [
          'Беспрепятственный вывод белопольного слона на f5 или g4',
          'Создание гранитной пешечной структуры e6-c6 без слабостей',
          'Подрыв белого центра ходами c6-c5 и перевод коня на d7-b6',
        ],
        whiteWinRate: 36,
        drawRate: 40,
        blackWinRate: 24,
        difficulty: 'Клубный',
        keySquares: ['c6', 'd5', 'f5', 'e4'],
      };
    }

    if (eco.startsWith('D') && (name.includes('ферзев') || name.includes('лондон') || name.includes('славян'))) {
      return {
        category: 'Закрытый дебют (1.d4)',
        whitePlans: [
          'Контроль ключевого центрального поля e4 ходами Nc3, e3 или e4',
          'Атака пешечного меньшинства на ферзевом фланге (b4-b5)',
          'Давление по вертикали «c» ладьями Rc1',
        ],
        blackPlans: [
          'Прочная фиксация пункта d5 и сохранение пешечного равновесия',
          'Контрудар c7-c5 или e6-e5 для освобождения пространства',
          'Грамотный размен слонов и переход в равный эндшпиль',
        ],
        whiteWinRate: 38,
        drawRate: 39,
        blackWinRate: 23,
        difficulty: 'Клубный',
        keySquares: ['d4', 'd5', 'c4', 'e4'],
      };
    }

    if (eco.startsWith('E') && (name.includes('староиндий') || name.includes('грюнфельд') || name.includes('нимцович'))) {
      return {
        category: 'Индийские защиты (Гипермодернизм)',
        whitePlans: [
          'Построение широкого пешечного центра c4-d4-e4',
          'Прорыв на ферзевом фланге ходами c4-c5 и b4',
          'Сдерживание встречной атаки чёрных на королевском фланге',
        ],
        blackPlans: [
          'Фигурный нажим на белый центр из засады (слон g7 / слон b4)',
          'Гроссмейстерский штурм короля f7-f5-f4 с матовыми угрозами',
          'Подрыв белых пешек ходами c7-c5 или d7-d5',
        ],
        whiteWinRate: 37,
        drawRate: 33,
        blackWinRate: 30,
        difficulty: 'Мастер',
        keySquares: ['g7', 'e5', 'f5', 'c4'],
      };
    }

    // Default based on ECO
    return {
      category: eco.startsWith('A') ? 'Фланговые дебюты' : 'Классическая теория',
      whitePlans: [
        'Активный захват центра и гармоничное развитие фигур',
        'Быстрая рокировка и подготовка атаки по центру',
        'Прощупывание слабых полей в лагере соперника',
      ],
      blackPlans: [
        'Своевременный контрудар по центру',
        'Развитие легких фигур и надёжная защита короля',
        'Борьба за инициативу и переход в активную фазу игры',
      ],
      whiteWinRate: 38,
      drawRate: 36,
      blackWinRate: 26,
      difficulty: 'Клубный',
      keySquares: ['e4', 'd4', 'e5', 'd5'],
    };
  }, [opening]);

  return {
    steps,
    currentPly,
    currentStep,
    currentFen: currentStep.fen,
    isStart,
    isEnd,
    isPlaying,
    plans,
    goToPly,
    first,
    prev,
    next,
    last,
    toggleAutoplay,
  };
}
