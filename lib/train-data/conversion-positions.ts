export interface ConversionScenario {
  id: string;
  title: string;
  category: 'Фигура' | 'Ладейный эндшпиль' | 'Ферзь' | 'Пешечный';
  evalAdvantage: string; // e.g. "+4.5"
  playerColor: 'w' | 'b';
  fen: string;
  maxMoves: number;
  objective: string;
  strategicTips: string[];
}

export const CONVERSION_SCENARIOS: ConversionScenario[] = [
  {
    id: 'conv-extra-piece',
    title: 'Лишний конь в миттельшпиле',
    category: 'Фигура',
    evalAdvantage: '+3.5',
    playerColor: 'w',
    fen: 'r2q1rk1/pp2bppp/2n1pn2/8/3P4/2N2N2/PP2BPPP/R2Q1RK1 w - - 0 12',
    maxMoves: 30,
    objective: 'Реализуйте материальный перевес (лишний конь c3) без допущения контригры соперника.',
    strategicTips: [
      'Разменивайте активные фигуры соперника (ладьи и ферзей)',
      'Не торопитесь надвигать пешки без поддержки фигур',
      'Ограничивайте контригру черных по открытым вертикалям',
    ],
  },
  {
    id: 'conv-rook-pawn',
    title: 'Проходная пешка в ладейном эндшпиле',
    category: 'Ладейный эндшпиль',
    evalAdvantage: '+2.8',
    playerColor: 'w',
    fen: '8/5pk1/4p1p1/P6p/8/1R5P/1P3rPK/8 w - - 0 35',
    maxMoves: 25,
    objective: 'Проведите пешку "a" в ферзи, используя ладью как таран.',
    strategicTips: [
      'Ставьте ладью позади проходной пешки (принцип Тарраша)',
      'Активизируйте короля для поддержки продвижения пешки',
      'Отрезайте короля соперника от поля превращения',
    ],
  },
  {
    id: 'conv-queen-vs-rook',
    title: 'Ферзь против ладьи',
    category: 'Ферзь',
    evalAdvantage: '+5.0',
    playerColor: 'w',
    fen: '8/8/8/4k3/8/8/1r6/4K2Q w - - 0 1',
    maxMoves: 20,
    objective: 'Поставьте мат или поймайте черную ладью двойным ударом ферзя.',
    strategicTips: [
      'Оттесняйте короля черных к краю доски согласованными действиями ферзя и короля',
      'Ищите геометрию двойного удара (шах королю с одновременным нападением на ладью)',
      'Остерегайтесь патовых ловушек!',
    ],
  },
  {
    id: 'conv-passed-pawn',
    title: 'Пешечный прорыв в эндшпиле',
    category: 'Пешечный',
    evalAdvantage: '+3.0',
    playerColor: 'w',
    fen: '8/5k2/8/3P4/8/8/6P1/4K3 w - - 0 1',
    maxMoves: 20,
    objective: 'Проведите пешку d5 или g2 в ферзи, используя правило квадрата и оппозицию.',
    strategicTips: [
      'Займите ключевые поля королем перед пешкой',
      'Используйте оппозицию для оттеснения вражеского короля',
      'Отвлекайте короля черных на одну пешку, пока продвигаете другую',
    ],
  },
];
