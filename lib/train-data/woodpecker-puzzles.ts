export interface WoodpeckerPuzzle {
  id: string;
  fen: string;
  turn: 'w' | 'b';
  rating: number;
  tier: 'beginner' | 'casual' | 'club' | 'tournament' | 'master';
  theme: 'fork' | 'pin' | 'skewer' | 'discovered' | 'deflection' | 'hanging' | 'mate' | 'sacrifice';
  themeName: string;
  description: string;
  solution: string[]; // SAN moves, e.g. ['Nf7+', 'Kg8', 'Nxd8']
  explanation: string;
}

export const WOODPECKER_PUZZLES: WoodpeckerPuzzle[] = [
  // BEGINNER (1000 - 1200)
  {
    id: 'wp-1',
    fen: 'r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/2P2N2/PPP2PPP/R1BQK2R w KQkq - 0 7',
    turn: 'w',
    rating: 1050,
    tier: 'beginner',
    theme: 'hanging',
    themeName: 'Зевок фигуры',
    description: 'Черный конь на e4 остался без защиты. Найдите быстрый выигрыш.',
    solution: ['Qd5'],
    explanation: 'Двойной удар ферзем: угроза мата на f7 и нападение на коня e4!',
  },
  {
    id: 'wp-2',
    fen: 'r1b1k2r/pppp1ppp/8/4q3/1bP5/2N1P3/PP3PPP/R2QKB1R w KQkq - 0 10',
    turn: 'w',
    rating: 1100,
    tier: 'beginner',
    theme: 'pin',
    themeName: 'Связка',
    description: 'Слон b4 связывает коня c3. Но есть сильный ход!',
    solution: ['Qa4+', 'Nc6', 'Qxb4'],
    explanation: 'Шах ферзем с a4 с последующим взятием незащищенного слона b4.',
  },
  {
    id: 'wp-3',
    fen: 'r2qkb1r/pp2pppp/2n2n2/3p4/3P2b1/2NB1N2/PPP2PPP/R1BQK2R w KQkq - 4 7',
    turn: 'w',
    rating: 1150,
    tier: 'beginner',
    theme: 'fork',
    themeName: 'Вилка',
    description: 'Используйте тактическую слабость черных.',
    solution: ['Ne5', 'Bxd1', 'Nxc6'],
    explanation: 'Активный прыжок коня с созданием тактических угроз.',
  },
  {
    id: 'wp-4',
    fen: '6k1/5ppp/8/8/8/8/1R3PPP/6K1 w - - 0 1',
    turn: 'w',
    rating: 1000,
    tier: 'beginner',
    theme: 'mate',
    themeName: 'Линейный мат',
    description: 'Мат по 1-й горизонтали.',
    solution: ['Rb8#'],
    explanation: 'Слабость последней горизонтали черных.',
  },

  // CASUAL (1200 - 1400)
  {
    id: 'wp-5',
    fen: 'r1b2rk1/pp3ppp/2n1pn2/q1b5/2B5/P1N1PN2/1PQ2PPP/R1B2RK1 w - - 0 11',
    turn: 'w',
    rating: 1250,
    tier: 'casual',
    theme: 'fork',
    themeName: 'Пешечная вилка',
    description: 'Черные фигуры скучковались на ферзевом фланге.',
    solution: ['b4', 'Nxb4', 'axb4', 'Qxa1', 'Bb2'],
    explanation: 'Ход b4 создает вилку между ферзем и слоном c5.',
  },
  {
    id: 'wp-6',
    fen: 'r4rk1/1pp2ppp/p1np1q2/4p3/B3P1b1/2NP1N2/PPP2PPP/R2Q1RK1 b - - 1 10',
    turn: 'b',
    rating: 1300,
    tier: 'casual',
    theme: 'pin',
    themeName: 'Использование связки',
    description: 'Конь f3 связан по диагонали.',
    solution: ['Nd4', 'Nd5', 'Qd8'],
    explanation: 'Удар в центр Nd4 усиливает давление на связанного коня f3.',
  },
  {
    id: 'wp-7',
    fen: '2r2rk1/1p1q1ppp/p3p3/3pP3/3P4/PPN1Q3/2b2PPP/2R2RK1 b - - 2 19',
    turn: 'b',
    rating: 1350,
    tier: 'casual',
    theme: 'hanging',
    themeName: 'Взятие фигуры',
    description: 'У белых пешка b3 без защиты.',
    solution: ['Bxb3'],
    explanation: 'Точный выигрыш материала слоном.',
  },

  // CLUB (1400 - 1600)
  {
    id: 'wp-8',
    fen: 'r1b1k2r/pppp1ppp/5q2/4n3/3QP3/2N5/PPP2PPP/R3KB1R b KQkq - 1 9',
    turn: 'b',
    rating: 1450,
    tier: 'club',
    theme: 'discovered',
    themeName: 'Вскрытое нападение',
    description: 'Белый ферзь стоит на d4 на одной вертикали с конем e5.',
    solution: ['Nf3+', 'gxf3', 'Qxd4'],
    explanation: 'Вскрытый шах конём с выигрышем ферзя d4!',
  },
  {
    id: 'wp-9',
    fen: 'r1bq1rk1/ppp2ppp/2n5/3np3/8/2BPPN2/PPP3PP/R2QKB1R b KQ - 0 9',
    turn: 'b',
    rating: 1500,
    tier: 'club',
    theme: 'fork',
    themeName: 'Двойной удар',
    description: 'Конь e3 под боем.',
    solution: ['Nxe3', 'Qe2', 'Nd5'],
    explanation: 'Взятие ключевой пешки e3 разрушает центр белых.',
  },
  {
    id: 'wp-10',
    fen: 'r2q1rk1/1bp2ppp/p1np1n2/1p2p3/4P3/1B1PPN2/PPP3PP/RN1Q1RK1 w - - 0 11',
    turn: 'w',
    rating: 1550,
    tier: 'club',
    theme: 'skewer',
    themeName: 'Линейный удар (Сквозной удар)',
    description: 'Слон b3 нацелен на f7.',
    solution: ['Ng5', 'd5', 'exd5'],
    explanation: 'Концентрация сил на слабом поле f7.',
  },

  // TOURNAMENT (1600 - 1800)
  {
    id: 'wp-11',
    fen: 'r2q1rk1/pb1nbppp/1pn1p3/3pP3/3P4/PP1B1N2/1B1N1PPP/R2Q1RK1 w - - 1 13',
    turn: 'w',
    rating: 1680,
    tier: 'tournament',
    theme: 'sacrifice',
    themeName: 'Классическая жертва слона на h7',
    description: 'Королевский фланг черных готов к греческому дару.',
    solution: ['Bxh7+', 'Kxh7', 'Ng5+'],
    explanation: 'Греческий дар (Bxh7+!) взламывает защиту черного короля.',
  },
  {
    id: 'wp-12',
    fen: 'r4rk1/pp1b1ppp/1q2p3/3pP3/8/1P1B4/P4PPP/R2QR1K1 w - - 1 17',
    turn: 'w',
    rating: 1750,
    tier: 'tournament',
    theme: 'deflection',
    themeName: 'Отвлечение',
    description: 'Отвлеките защиту с поля f7.',
    solution: ['Bxh7+', 'Kxh7', 'Qh5+', 'Kg8', 'Re3'],
    explanation: 'Жертва слона и подъем ладьи Re3-h3 форсируют мат.',
  },

  // MASTER (1800+)
  {
    id: 'wp-13',
    fen: '2r2rk1/1pqb1ppp/p3p3/3pP3/5P2/2N1Q3/PPP3PP/2R2RK1 w - - 3 17',
    turn: 'w',
    rating: 1850,
    tier: 'master',
    theme: 'discovered',
    themeName: 'Тактический прорыв',
    description: 'Прорыв f4-f5 вскрывает вертикаль f.',
    solution: ['f5', 'exf5', 'Nxd5'],
    explanation: 'Жертва пешки открывает коня d5 с вилкой на e7 и c7.',
  },
  {
    id: 'wp-14',
    fen: 'r4rk1/2q1bppp/p1npbn2/1p2p3/4P3/1NN1BP2/PPPQB1PP/2KR3R w - - 2 13',
    turn: 'w',
    rating: 1920,
    tier: 'master',
    theme: 'sacrifice',
    themeName: 'Позиционная жертва качества',
    description: 'Острый сицилианский миттельшпиль.',
    solution: ['Nd5', 'Bxd5', 'exd5'],
    explanation: 'Захват поля d5 перерезает коммуникации черных.',
  },
];
