import { Chess } from 'chess.js';
import type {
  CriticalMove,
  GameReviewData,
  MoveAnalysis,
  MoveClassificationType,
  MoveTypeSummary,
} from '@/types/review';
import { GLYPH_MAP } from '@/lib/chess-classifier';
import { evaluatePosition, EngineEvaluation } from './stockfish';

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export interface EngineClassificationResult {
  moves: MoveAnalysis[];
  criticalMoves: CriticalMove[];
  accuracy: {
    white: number;
    black: number;
  };
  stats: {
    white: MoveTypeSummary;
    black: MoveTypeSummary;
  };
}

function createEmptySummary(): MoveTypeSummary {
  return {
    book: 0,
    brilliant: 0,
    great: 0,
    best: 0,
    good: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
  };
}

/**
 * Convert centipawn / mate score to human-readable string from White's perspective
 */
export function formatScore(
  evalInfo: EngineEvaluation['score'],
  turn: 'w' | 'b',
): string {
  // evalInfo.value is from perspective of side to move.
  // Convert to White's perspective.
  const isWhite = turn === 'w';
  const val = isWhite ? evalInfo.value : -evalInfo.value;

  if (evalInfo.type === 'mate') {
    return val > 0 ? `+M${Math.abs(val)}` : `-M${Math.abs(val)}`;
  }

  const pawns = val / 100;
  const prefix = pawns > 0 ? '+' : '';
  return `${prefix}${pawns.toFixed(1)}`;
}

/**
 * Detects whether a move constitutes a sacrifice of piece or exchange
 */
function isMaterialSacrifice(
  beforeFen: string,
  move: { from: string; to: string; piece: string; captured?: string },
  afterFen: string,
): boolean {
  try {
    const movedValue = PIECE_VALUES[move.piece.toLowerCase()] || 0;
    const capturedValue = move.captured
      ? PIECE_VALUES[move.captured.toLowerCase()] || 0
      : 0;

    // 1. Direct exchange sacrifice: Rook sacrificed for Minor Piece (Rook=5, Minor=3 -> loss of 2)
    if (move.piece.toLowerCase() === 'r' && capturedValue === 3) {
      return true;
    }

    // 2. Queen sacrifice: Queen for Rook or Minor piece (Queen=9, Rook=5 or Minor=3)
    if (move.piece.toLowerCase() === 'q' && capturedValue <= 5 && capturedValue > 0) {
      return true;
    }

    // 3. Piece sacrifice for pawn or into empty square (Minor/Rook/Queen moved onto attacked square)
    if (movedValue >= 3 && capturedValue < movedValue) {
      const tempChess = new Chess(afterFen);
      // Opponent's turn: check if opponent has immediate captures on the arrival square
      const legalReplies = tempChess.moves({ verbose: true });
      for (const reply of legalReplies) {
        if (reply.to === move.to) {
          const capturingPieceValue = PIECE_VALUES[reply.piece.toLowerCase()] || 0;
          // Captured by lesser or equal piece
          if (capturingPieceValue <= movedValue) {
            return true;
          }
        }
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Mathematical classification of every move in a game strictly using Stockfish CPL
 */
export async function classifyGameWithEngine(
  pgn: string,
  options?: { depth?: number },
): Promise<EngineClassificationResult> {
  const depth = options?.depth || 10;
  const chess = new Chess();

  try {
    if (pgn && pgn.trim()) {
      chess.loadPgn(pgn);
    }
  } catch {
    // Graceful fallback
  }

  const history = chess.history({ verbose: true });
  const totalPlies = history.length;

  if (totalPlies === 0) {
    return {
      moves: [],
      criticalMoves: [],
      accuracy: { white: 100, black: 100 },
      stats: { white: createEmptySummary(), black: createEmptySummary() },
    };
  }

  // Replay positions to extract FEN for each ply
  const replayChess = new Chess();
  const fens: string[] = [replayChess.fen()];

  for (let i = 0; i < totalPlies; i++) {
    const mv = history[i];
    replayChess.move({ from: mv.from, to: mv.to, promotion: mv.promotion });
    fens.push(replayChess.fen());
  }

  // Evaluate positions (fen_0 to fen_total)
  // Cache by FEN to avoid duplicate evaluations
  const evalCache = new Map<string, EngineEvaluation>();

  for (let i = 0; i < fens.length; i++) {
    const fen = fens[i];
    if (!evalCache.has(fen)) {
      try {
        const res = await evaluatePosition(fen, depth);
        evalCache.set(fen, res);
      } catch {
        // Fallback evaluation on error
        evalCache.set(fen, {
          score: { type: 'cp', value: 0 },
          bestmove: '',
          bestmoveSan: '',
          pv: [],
          pvSan: [],
          depth,
          source: 'stockfish',
        });
      }
    }
  }

  const moves: MoveAnalysis[] = [];
  const criticalCandidates: Array<{
    move: MoveAnalysis;
    cpl: number;
    interestScore: number;
  }> = [];

  const stats = {
    white: createEmptySummary(),
    black: createEmptySummary(),
  };

  const whiteCpls: number[] = [];
  const blackCpls: number[] = [];

  for (let i = 0; i < totalPlies; i++) {
    const mv = history[i];
    const ply = i + 1;
    const moveNumber = Math.ceil(ply / 2);
    const color: 'white' | 'black' = i % 2 === 0 ? 'white' : 'black';
    const turnChar: 'w' | 'b' = color === 'white' ? 'w' : 'b';

    const fenBefore = fens[i];
    const fenAfter = fens[i + 1];

    const evalBefore = evalCache.get(fenBefore)!;
    const evalAfter = evalCache.get(fenAfter)!;

    // Check if player's move matches engine best move
    const isPlayerBestMove =
      evalBefore.bestmoveSan === mv.san ||
      (evalBefore.bestmove &&
        evalBefore.bestmove.startsWith(`${mv.from}${mv.to}`));

    // Centipawn loss calculation
    let cpl = 0;
    let playedEvalFromPlayerPerspective = 0;

    if (evalBefore.score.type === 'cp' && evalAfter.score.type === 'cp') {
      // evalBefore is from player's perspective
      // evalAfter is from opponent's perspective -> player's eval is -evalAfter.value
      playedEvalFromPlayerPerspective = -evalAfter.score.value;
      if (isPlayerBestMove) {
        cpl = 0;
      } else {
        cpl = Math.max(0, evalBefore.score.value - playedEvalFromPlayerPerspective);
      }
    } else if (evalBefore.score.type === 'mate' && evalAfter.score.type === 'mate') {
      // Mate situations
      if (evalBefore.score.value > 0) {
        // Player had forced mate
        if (evalAfter.score.value > 0) {
          // Opponent now has forced mate! Huge blunder
          cpl = 600;
        } else {
          // Opponent is in mate (-evalAfter.value > 0)
          cpl = isPlayerBestMove ? 0 : 20;
        }
      } else {
        // Player was in mate
        cpl = isPlayerBestMove ? 0 : 50;
      }
    } else if (evalBefore.score.type === 'mate' && evalBefore.score.value > 0) {
      // Player had forced mate but after move it's not mate -> missed mate
      cpl = 450;
    } else if (evalAfter.score.type === 'mate' && evalAfter.score.value > 0) {
      // Opponent now has mate -> Blunder
      cpl = 550;
    } else {
      playedEvalFromPlayerPerspective = -evalAfter.score.value;
      cpl = isPlayerBestMove ? 0 : Math.max(0, evalBefore.score.value - playedEvalFromPlayerPerspective);
    }

    if (color === 'white') {
      whiteCpls.push(cpl);
    } else {
      blackCpls.push(cpl);
    }

    // Check for Brilliant (!!)
    const isSacrifice = isMaterialSacrifice(fenBefore, mv, fenAfter);
    const isFavorableEval =
      evalAfter.score.type === 'mate'
        ? evalAfter.score.value < 0 // opponent is in mate
        : playedEvalFromPlayerPerspective >= 100; // >= +1.00 cp for the player

    let type: MoveClassificationType = 'good';
    let betterMove: string | undefined = undefined;

    if (isSacrifice && isFavorableEval && cpl <= 15) {
      type = 'brilliant';
    } else if (isPlayerBestMove || cpl < 10) {
      type = 'best';
    } else if (cpl <= 30) {
      type = 'great'; // Excellent
    } else if (cpl <= 60) {
      type = 'good';
    } else if (cpl <= 120) {
      type = 'inaccuracy';
      betterMove = evalBefore.bestmoveSan || undefined;
    } else if (cpl <= 250) {
      type = 'mistake';
      betterMove = evalBefore.bestmoveSan || undefined;
    } else {
      type = 'blunder';
      betterMove = evalBefore.bestmoveSan || undefined;
    }

    const glyph = GLYPH_MAP[type] || '';
    const scoreStr = formatScore(evalAfter.score, turnChar === 'w' ? 'b' : 'w');
    const pvStr = evalBefore.pvSan && evalBefore.pvSan.length > 0
      ? evalBefore.pvSan.join(' ')
      : evalBefore.bestmoveSan || '';

    // Generate accurate, natural explanation based strictly on engine facts
    let comment = '';
    switch (type) {
      case 'brilliant':
        comment = `Блестящая жертва материала! Оценка позиции остаётся строго в вашу пользу (${scoreStr}), создавая решающее преимущество.`;
        break;
      case 'best':
        comment = `Сильнейший ход по первой линии Stockfish. Максимально точное позиционное решение.`;
        break;
      case 'great':
        comment = `Отличный ход! Потеря составила всего ${cpl} cp. Фигуры сохраняют высокую активность и гармонию.`;
        break;
      case 'good':
        comment = `Надёжный ход (потеря ${cpl} cp). Позиция остаётся в пределах стабильного равенства.`;
        break;
      case 'inaccuracy':
        comment = `Неточность (потеря ${cpl} cp). Сильнее было сыграть ${betterMove || 'иначе'}. Линия Stockfish: ${pvStr}.`;
        break;
      case 'mistake':
        comment = `Ощутимая ошибка (потеря ${cpl} cp). Точнее было ${betterMove || 'иначе'}. Соперник получает возможность навязать контригру.`;
        break;
      case 'blunder':
        comment = `Серьёзный зевок (потеря ${cpl} cp)! Сильнейшим продолжением было ${betterMove || 'иначе'}, тогда как ход в партии ухудшает позицию.`;
        break;
    }

    const moveAnalysis: MoveAnalysis = {
      ply,
      moveNumber,
      san: mv.san,
      color,
      type,
      glyph,
      comment,
      betterMove,
      score: scoreStr,
      pvLine: pvStr,
      cpl,
    };

    moves.push(moveAnalysis);

    if (color === 'white') {
      stats.white[type] = (stats.white[type] || 0) + 1;
    } else {
      stats.black[type] = (stats.black[type] || 0) + 1;
    }

    // Rank candidates for critical moves (blunders, mistakes, brilliant, decisive best)
    let interestScore = 0;
    if (type === 'blunder') interestScore = 500 + cpl;
    else if (type === 'mistake') interestScore = 300 + cpl;
    else if (type === 'brilliant') interestScore = 400;
    else if (type === 'inaccuracy') interestScore = 150 + cpl;
    else if (type === 'best' && i > 12) interestScore = 50;

    if (interestScore > 0) {
      criticalCandidates.push({ move: moveAnalysis, cpl, interestScore });
    }
  }

  // Calculate mathematical Accuracy % based on CPL formula
  // Accuracy = avg(100 * exp(-0.004 * CPL))
  const computeAccuracy = (cpls: number[]): number => {
    if (cpls.length === 0) return 85.0;
    const sum = cpls.reduce((acc, loss) => {
      const moveAcc = Math.max(0, Math.min(100, 100 * Math.exp(-0.004 * loss)));
      return acc + moveAcc;
    }, 0);
    return Math.round((sum / cpls.length) * 10) / 10;
  };

  const whiteAccuracy = computeAccuracy(whiteCpls);
  const blackAccuracy = computeAccuracy(blackCpls);

  // Select top 4-6 critical moves sorted by interestScore
  criticalCandidates.sort((a, b) => b.interestScore - a.interestScore);
  const selectedCandidates = criticalCandidates.slice(0, 6);
  // Sort back by ply order
  selectedCandidates.sort((a, b) => a.move.ply - b.move.ply);

  const criticalMoves: CriticalMove[] = selectedCandidates.map((c) => ({
    moveNumber: c.move.moveNumber,
    ply: c.move.ply,
    san: c.move.san,
    color: c.move.color,
    type: (c.move.type === 'good' || c.move.type === 'great' || c.move.type === 'book'
      ? 'best'
      : c.move.type) as CriticalMove['type'],
    comment: c.move.comment,
    betterMove: c.move.betterMove || c.move.san,
    score: c.move.score,
    pvLine: c.move.pvLine,
  }));

  return {
    moves,
    criticalMoves,
    accuracy: {
      white: whiteAccuracy,
      black: blackAccuracy,
    },
    stats,
  };
}
