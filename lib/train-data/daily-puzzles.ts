export interface DailyPuzzle {
  day: number; // 1 to 31
  month: number; // 1 to 12
  year: number;
  id: string;
  title: string;
  fen: string;
  turn: 'w' | 'b';
  rating: number;
  theme: string;
  solution: string[]; // sequence of moves in SAN
  hints: {
    piece: string; // Hint 1: Which piece to move
    targetSquare: string; // Hint 2: Target square
    fullMove: string; // Hint 3: Full SAN
  };
  quote: string;
}

export const DAILY_PUZZLES: DailyPuzzle[] = [
  {
    day: 13,
    month: 11,
    year: 2026,
    id: 'daily-2026-11-13',
    title: 'Молниеносный удар на f7',
    fen: 'r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/2P2N2/PPP2PPP/R1BQK2R w KQkq - 0 7',
    turn: 'w',
    rating: 1350,
    theme: 'Двойной удар',
    solution: ['Qd5'],
    hints: {
      piece: 'Белый ферзь d1',
      targetSquare: 'Поле d5 в центре',
      fullMove: '1. Qd5 (угроза мата на f7 и взятия коня на e4)',
    },
    quote: '«Тактика — это знать, что делать, когда есть что делать.» — Гарри Каспаров',
  },
  {
    day: 12,
    month: 11,
    year: 2026,
    id: 'daily-2026-11-12',
    title: 'Ловушка слона на a4',
    fen: 'r1b1k2r/pppp1ppp/8/4q3/1bP5/2N1P3/PP3PPP/R2QKB1R w KQkq - 0 10',
    turn: 'w',
    rating: 1280,
    theme: 'Сквозной шах',
    solution: ['Qa4+', 'Nc6', 'Qxb4'],
    hints: {
      piece: 'Ферзь d1',
      targetSquare: 'Крайняя диагональ a4',
      fullMove: '1. Qa4+ с последующим 2. Qxb4',
    },
    quote: '«Каждая шахматная партия — это маленькая жизнь.»',
  },
  {
    day: 11,
    month: 11,
    year: 2026,
    id: 'daily-2026-11-11',
    title: 'Вскрытый кинжал в центре',
    fen: 'r1b1k2r/pppp1ppp/5q2/4n3/3QP3/2N5/PPP2PPP/R3KB1R b KQkq - 1 9',
    turn: 'b',
    rating: 1520,
    theme: 'Вскрытый шах',
    solution: ['Nf3+', 'gxf3', 'Qxd4'],
    hints: {
      piece: 'Конь e5',
      targetSquare: 'Поле f3 с шахом королю e1',
      fullMove: '1... Nf3+ 2. gxf3 Qxd4',
    },
    quote: '«Ферзь соперника кажется защищенным, пока не падет его прикрытие.»',
  },
  {
    day: 10,
    month: 11,
    year: 2026,
    id: 'daily-2026-11-10',
    title: 'Греческий дар короля',
    fen: 'r2q1rk1/pb1nbppp/1pn1p3/3pP3/3P4/PP1B1N2/1B1N1PPP/R2Q1RK1 w - - 1 13',
    turn: 'w',
    rating: 1720,
    theme: 'Жертва слона',
    solution: ['Bxh7+', 'Kxh7', 'Ng5+'],
    hints: {
      piece: 'Слон d3',
      targetSquare: 'Поле h7 рядом с королем',
      fullMove: '1. Bxh7+ Kxh7 2. Ng5+',
    },
    quote: '«Лучший способ избежать поражения — атаковать.»',
  },
  {
    day: 9,
    month: 11,
    year: 2026,
    id: 'daily-2026-11-09',
    title: 'Мат в 2 хода по 8-й горизонтали',
    fen: '6k1/5ppp/8/8/8/8/1R3PPP/6K1 w - - 0 1',
    turn: 'w',
    rating: 950,
    theme: 'Линейный мат',
    solution: ['Rb8#'],
    hints: {
      piece: 'Ладья b2',
      targetSquare: 'Поле b8',
      fullMove: '1. Rb8#',
    },
    quote: '«Следи за форточкой своего короля!»',
  },
];
