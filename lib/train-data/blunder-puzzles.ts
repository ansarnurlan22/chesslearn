export interface BlunderPuzzle {
  id: string;
  fen: string;
  turn: 'w' | 'b';
  opponentLastMove: string; // e.g. "1... Nd4!?"
  threatDescription: string; // Threat explanation
  commonMistake: string; // Bad candidate move
  mistakeConsequence: string; // Why commonMistake is a blunder
  solutionMove: string; // SAN of the best defensive / shield move
  solutionExplanation: string;
}

export const BLUNDER_SHIELD_PUZZLES: BlunderPuzzle[] = [
  {
    id: 'bs-1',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5',
    turn: 'w',
    opponentLastMove: '4... Nxe4!',
    threatDescription: 'Черные временно жертвуют коня, рассчитывая на вилку d7-d5.',
    commonMistake: 'Nxe4?',
    mistakeConsequence: 'После 5. Nxe4 d5! черные отыгрывают фигуру с отличным центром.',
    solutionMove: 'Bxf7+',
    solutionExplanation: '1. Bxf7+! Kxf7 2. Nxe4 d5 3. Qf3+ — белые лишают черных рокировки и сохраняют давление!',
  },
  {
    id: 'bs-2',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5',
    turn: 'w',
    opponentLastMove: '4... Bc5',
    threatDescription: 'Черные нацелились на пункт f2.',
    commonMistake: 'Nxe5?',
    mistakeConsequence: 'После 5. Nxe5 Nxe5 6. d4 Nxc4 белые теряют слона и координацию.',
    solutionMove: 'O-O',
    solutionExplanation: '1. O-O! Простая рокировка уводит короля из опасного центра и подключает ладью.',
  },
  {
    id: 'bs-3',
    fen: 'r2qkb1r/pp1npppp/2p2n2/3p4/3P4/2N1PN2/PPP2PPP/R1BQK2R w KQkq - 2 6',
    turn: 'w',
    opponentLastMove: '5... c6',
    threatDescription: 'Черные выстроили плотный барьер в центре.',
    commonMistake: 'e4?!',
    mistakeConsequence: 'Пешка e4 не имеет достаточной защиты и черные забирают её dxe4.',
    solutionMove: 'O-O',
    solutionExplanation: '1. O-O (или Bd3) завершает развитие фигур вместо преждевременных выпадов.',
  },
  {
    id: 'bs-4',
    fen: 'r1b1k2r/pppp1ppp/8/4q3/1bP5/2N1P3/PP3PPP/R2QKB1R w KQkq - 0 10',
    turn: 'w',
    opponentLastMove: '9... Bb4',
    threatDescription: 'Черный слон связывает коня c3, а ферзь e5 оказывает колоссальное давление.',
    commonMistake: 'Bd2?',
    mistakeConsequence: 'Пассивная защита 10. Bd2 позволяет черным сохранить инициативу.',
    solutionMove: 'Qa4+',
    solutionExplanation: '1. Qa4+! Контрудар: шах с двойным нападением на короля и слона b4!',
  },
  {
    id: 'bs-5',
    fen: 'r1bqk2r/ppp2ppp/2n5/3np3/1b6/2NP1N2/PPPBBPPP/R2QK2R w KQkq - 2 8',
    turn: 'w',
    opponentLastMove: '7... Bb4',
    threatDescription: 'Связка и нажим на коня c3.',
    commonMistake: 'Nxd5?',
    mistakeConsequence: 'После 8. Nxd5 Bxd2+ 9. Qxd2 Qxd5 черные перехватывают центр.',
    solutionMove: 'O-O',
    solutionExplanation: '1. O-O! Рокировка развязывает ладью и убирает короля от любых вскрытых шахов.',
  },
];
