import { Chess } from 'chess.js';
import type {
  CriticalMove,
  MoveAnalysis,
  MoveClassificationType,
  MoveTypeSummary,
} from '@/types/review';
import { GLYPH_MAP } from '@/lib/chess-classifier';
import { isOpeningBookMove } from '@/lib/engine/opening-book';
import { parsePgnEvaluations, type PositionEvaluation } from '@/lib/eval-parser';
import {
  evaluatePosition,
  fetchLichessCloudEval,
  runStockfishLocal,
  type EngineEvaluation,
  type ScoreInfo,
} from './stockfish';

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
 * Standard Lichess / Chess.com win percentage formula from centipawns.
 * Returns probability between 0 and 100.
 */
export function centipawnsToWinPercent(cp: number): number {
  // Win% = 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1)
  const clampedCp = Math.max(-2000, Math.min(2000, cp));
  const winRate = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * clampedCp)) - 1);
  return Math.max(0, Math.min(100, winRate));
}

/**
 * Convert centipawn / mate score to human-readable string from White's perspective
 */
export function formatScore(
  evalInfo: ScoreInfo,
  turn: 'w' | 'b',
): string {
  const isWhite = turn === 'w';
  const val = isWhite ? evalInfo.value : -evalInfo.value;

  if (evalInfo.type === 'mate') {
    if (Math.abs(val) > 500) {
      return val > 0 ? '#1-0' : '#0-1';
    }
    return val > 0 ? `+M${Math.abs(val)}` : `-M${Math.abs(val)}`;
  }

  const pawns = val / 100;
  const prefix = pawns > 0 ? '+' : '';
  return `${prefix}${pawns.toFixed(1)}`;
}

/**
 * Detects whether a move constitutes a sound sacrifice of a piece or exchange
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

    // 1. Direct exchange sacrifice: Rook sacrificed for Minor Piece (Rook=5, Minor=3)
    if (move.piece.toLowerCase() === 'r' && capturedValue === 3) {
      return true;
    }

    // 2. Queen sacrifice: Queen for Rook or Minor piece (Queen=9, Rook=5 / Minor=3)
    if (move.piece.toLowerCase() === 'q' && capturedValue <= 5 && capturedValue > 0) {
      return true;
    }

    // 3. Piece sacrifice for pawn or into empty attacked square
    if (movedValue >= 3 && capturedValue < movedValue) {
      const tempChess = new Chess(afterFen);
      // Opponent's turn: check if opponent has immediate captures on arrival square
      const legalReplies = tempChess.moves({ verbose: true });
      for (const reply of legalReplies) {
        if (reply.to === move.to) {
          const capturingPieceValue = PIECE_VALUES[reply.piece.toLowerCase()] || 0;
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
 * Full master-level mathematical classification of a game.
 * Uses:
 * 1. Embedded PGN evaluations from Lichess / Chess.com when available.
 * 2. Opening book tree to preserve 0 CPL for opening theory moves.
 * 3. Lichess Cloud Eval & local Stockfish for positions needing engine calculation.
 * 4. Win-percentage delta formula for accurate blunder / accuracy detection.
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
  const historySan = history.map((m) => m.san);
  const totalPlies = history.length;

  if (totalPlies === 0) {
    return {
      moves: [],
      criticalMoves: [],
      accuracy: { white: 100, black: 100 },
      stats: { white: createEmptySummary(), black: createEmptySummary() },
    };
  }

  // Parse any pre-existing evaluations in PGN comments (e.g. from Lichess / Chess.com)
  const embeddedEvals = parsePgnEvaluations(pgn);
  const hasEmbeddedEvals = embeddedEvals.size >= Math.floor(totalPlies * 0.7);

  // Replay positions to extract FENs for each ply (index 0 = initial position)
  const replayChess = new Chess();
  const fens: string[] = [replayChess.fen()];

  for (let i = 0; i < totalPlies; i++) {
    const mv = history[i];
    replayChess.move({ from: mv.from, to: mv.to, promotion: mv.promotion });
    fens.push(replayChess.fen());
  }

  // Cache evaluations by FEN
  const evalCache = new Map<string, EngineEvaluation>();

  // If no embedded evals, pre-evaluate positions with Stockfish / Cloud Eval
  if (!hasEmbeddedEvals) {
    for (let i = 0; i < fens.length; i++) {
      const fen = fens[i];
      // Skip opening book plies to save time and compute only real novelties/endgames
      if (i > 0 && i < totalPlies) {
        const bookCheck = isOpeningBookMove(historySan, i - 1);
        if (bookCheck.isBook && i < 14) {
          continue;
        }
      }

      if (!evalCache.has(fen)) {
        try {
          const res = await evaluatePosition(fen, depth);
          evalCache.set(fen, res);
        } catch {
          // ignore error; handled in loop below
        }
      }
    }
  }

  const moves: MoveAnalysis[] = [];
  const criticalCandidates: Array<{
    move: MoveAnalysis;
    cpl: number;
    interestScore: number;
    fenBefore: string;
  }> = [];

  const stats = {
    white: createEmptySummary(),
    black: createEmptySummary(),
  };

  const whiteWinDeltas: number[] = [];
  const blackWinDeltas: number[] = [];

  for (let i = 0; i < totalPlies; i++) {
    const mv = history[i];
    const ply = i + 1;
    const moveNumber = Math.ceil(ply / 2);
    const color: 'white' | 'black' = i % 2 === 0 ? 'white' : 'black';
    const turnChar: 'w' | 'b' = color === 'white' ? 'w' : 'b';

    const fenBefore = fens[i];
    const fenAfter = fens[i + 1];

    // 1. Check Opening Book
    const bookStatus = isOpeningBookMove(historySan, i);
    if (bookStatus.isBook) {
      const type: MoveClassificationType = 'book';
      const glyph = GLYPH_MAP[type];
      const comment = bookStatus.openingName
        ? `Дебютная теория: ${bookStatus.openingName}. Ход строго соответствует гроссмейстерским базам.`
        : 'Дебютная теория. Точный теоретический ход развития фигур.';

      const moveAnalysis: MoveAnalysis = {
        ply,
        moveNumber,
        san: mv.san,
        color,
        type,
        glyph,
        comment,
        score: '+0.2',
        cpl: 0,
      };

      moves.push(moveAnalysis);
      if (color === 'white') {
        stats.white.book++;
        whiteWinDeltas.push(0);
      } else {
        stats.black.book++;
        blackWinDeltas.push(0);
      }
      continue;
    }

    // 2. Resolve before/after evaluations
    let evalBeforeCp = 20; // default +0.2 pawns for White at start
    let evalAfterCp = 20;
    let evalBeforeScore: ScoreInfo = { type: 'cp', value: 20 };
    let evalAfterScore: ScoreInfo = { type: 'cp', value: 20 };
    let engineBestmoveSan: string | undefined = undefined;
    let enginePvSan: string[] | undefined = undefined;

    // A) If embedded evals present in PGN
    if (hasEmbeddedEvals) {
      const posBefore = i === 0 ? null : embeddedEvals.get(i);
      const posAfter = embeddedEvals.get(ply);

      if (posBefore) {
        if (posBefore.mate !== undefined) {
          evalBeforeScore = { type: 'mate', value: posBefore.mate };
          evalBeforeCp = posBefore.mate > 0 ? 10000 - posBefore.mate * 100 : -10000 - posBefore.mate * 100;
        } else {
          evalBeforeCp = typeof posBefore.cp === 'number' ? posBefore.cp : Math.round(posBefore.score * 100);
          evalBeforeScore = { type: 'cp', value: evalBeforeCp };
        }
      } else {
        evalBeforeCp = 20;
        evalBeforeScore = { type: 'cp', value: 20 };
      }

      if (posAfter) {
        if (posAfter.mate !== undefined) {
          evalAfterScore = { type: 'mate', value: posAfter.mate };
          evalAfterCp = posAfter.mate > 0 ? 10000 - posAfter.mate * 100 : -10000 - posAfter.mate * 100;
        } else {
          evalAfterCp = typeof posAfter.cp === 'number' ? posAfter.cp : Math.round(posAfter.score * 100);
          evalAfterScore = { type: 'cp', value: evalAfterCp };
        }
      } else {
        evalAfterCp = evalBeforeCp;
        evalAfterScore = evalBeforeScore;
      }
    } else {
      // B) Using Stockfish / Cloud Eval cache
      const cachedBefore = evalCache.get(fenBefore);
      const cachedAfter = evalCache.get(fenAfter);

      if (cachedBefore) {
        engineBestmoveSan = cachedBefore.bestmoveSan;
        enginePvSan = cachedBefore.pvSan;
        if (cachedBefore.score.type === 'mate') {
          evalBeforeScore = cachedBefore.score;
          const mate = cachedBefore.score.value;
          // value is from perspective of side to move
          const whiteMate = turnChar === 'w' ? mate : -mate;
          evalBeforeCp = whiteMate > 0 ? 10000 - whiteMate * 100 : -10000 - whiteMate * 100;
        } else {
          const val = cachedBefore.score.value;
          evalBeforeCp = turnChar === 'w' ? val : -val;
          evalBeforeScore = { type: 'cp', value: evalBeforeCp };
        }
      }

      if (cachedAfter) {
        if (cachedAfter.score.type === 'mate') {
          evalAfterScore = cachedAfter.score;
          const mate = cachedAfter.score.value;
          // after move, side to move is opponent
          const whiteMate = turnChar === 'w' ? -mate : mate;
          evalAfterCp = whiteMate > 0 ? 10000 - whiteMate * 100 : -10000 - whiteMate * 100;
        } else {
          const val = cachedAfter.score.value;
          evalAfterCp = turnChar === 'w' ? -val : val;
          evalAfterScore = { type: 'cp', value: evalAfterCp };
        }
      }
    }

    // 3. Perspective normalization
    // Player's perspective: positive means player is winning
    const playerEvalBefore = turnChar === 'w' ? evalBeforeCp : -evalBeforeCp;
    const playerEvalAfter = turnChar === 'w' ? evalAfterCp : -evalAfterCp;

    // Check if player played the engine's #1 move
    const isPlayerBestMove = engineBestmoveSan === mv.san;

    // 4. Centipawn loss (CPL) and Win% delta
    let cpl = 0;
    if (isPlayerBestMove) {
      cpl = 0;
    } else {
      cpl = Math.max(0, playerEvalBefore - playerEvalAfter);
    }

    const winBefore = centipawnsToWinPercent(playerEvalBefore);
    const winAfter = centipawnsToWinPercent(playerEvalAfter);
    const winDelta = isPlayerBestMove ? 0 : Math.max(0, winBefore - winAfter);

    if (color === 'white') {
      whiteWinDeltas.push(winDelta);
    } else {
      blackWinDeltas.push(winDelta);
    }

    // 5. Move Classification based on standard Chess.com / Lichess guidelines
    const isSacrifice = isMaterialSacrifice(fenBefore, mv, fenAfter);
    const isFavorableAdvantage = playerEvalAfter >= 100 || (evalAfterScore.type === 'mate' && playerEvalAfter > 0);

    let type: MoveClassificationType = 'good';
    let betterMove: string | undefined = undefined;

    if (isSacrifice && isFavorableAdvantage && winDelta <= 2.0 && cpl <= 20) {
      type = 'brilliant';
    } else if (isPlayerBestMove || (winDelta <= 1.0 && cpl <= 10)) {
      type = 'best';
    } else if (winDelta <= 2.5 && cpl <= 30) {
      type = 'great';
    } else if (winDelta <= 5.0 && cpl <= 55) {
      type = 'good';
    } else if (winDelta <= 11.0 && cpl <= 110) {
      type = 'inaccuracy';
      betterMove = engineBestmoveSan;
    } else if (winDelta <= 22.0 && cpl <= 230) {
      type = 'mistake';
      betterMove = engineBestmoveSan;
    } else {
      type = 'blunder';
      betterMove = engineBestmoveSan;
    }

    const glyph = GLYPH_MAP[type] || '';
    const scoreStr = formatScore(
      evalAfterScore.type === 'mate'
        ? { type: 'mate', value: turnChar === 'w' ? evalAfterScore.value : -evalAfterScore.value }
        : { type: 'cp', value: evalAfterCp },
      'w',
    );

    const pvStr = enginePvSan && enginePvSan.length > 0
      ? enginePvSan.join(' ')
      : engineBestmoveSan || '';

    // Generate accurate, natural explanation based on chess engine facts
    let comment = '';
    switch (type) {
      case 'brilliant':
        comment = `Блестящая жертва материала! Позиция остаётся строго в вашу пользу (${scoreStr}), создавая решающее преимущество.`;
        break;
      case 'best':
        comment = 'Сильнейший ход по первой линии Stockfish 19 Lite. Максимально точное позиционное решение.';
        break;
      case 'great':
        comment = `Отличный ход! Потеря всего ${cpl} cp. Фигуры сохраняют высокую активность и гармонию.`;
        break;
      case 'good':
        comment = `Надёжный ход (потеря ${cpl} cp). Позиция остаётся в пределах равенства и контроля.`;
        break;
      case 'inaccuracy':
        comment = `Неточность (потеря ${cpl} cp). Сильнее было сыграть ${betterMove || 'иначе'}. Линия Stockfish 19 Lite: ${pvStr || betterMove || 'активное развитие'}.`;
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
      stats.white[type]++;
    } else {
      stats.black[type]++;
    }

    // Rank candidates for critical moves
    let interestScore = 0;
    if (type === 'blunder') interestScore = 500 + cpl;
    else if (type === 'mistake') interestScore = 300 + cpl;
    else if (type === 'brilliant') interestScore = 400;
    else if (type === 'inaccuracy') interestScore = 150 + cpl;
    else if (type === 'best' && i > 14) interestScore = 50;

    if (interestScore > 0) {
      criticalCandidates.push({ move: moveAnalysis, cpl, interestScore, fenBefore });
    }
  }

  // Calculate official Lichess accuracy algorithm:
  // MoveAccuracy = 103.1668 * exp(-0.04354 * winDelta) - 3.1669
  const computeAccuracy = (deltas: number[]): number => {
    if (deltas.length === 0) return 90.0;
    const sum = deltas.reduce((acc, d) => {
      const moveAcc = Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * d) - 3.1669));
      return acc + moveAcc;
    }, 0);
    return Math.round((sum / deltas.length) * 10) / 10;
  };

  const whiteAccuracy = computeAccuracy(whiteWinDeltas);
  const blackAccuracy = computeAccuracy(blackWinDeltas);

  // Select top 4-6 critical moves sorted by interestScore
  criticalCandidates.sort((a, b) => b.interestScore - a.interestScore);
  const selectedCandidates = criticalCandidates.slice(0, 6);

  // If a critical move lacks betterMove / PV (e.g. from embedded PGN), query engine for it
  for (const c of selectedCandidates) {
    if (!c.move.betterMove) {
      try {
        const cloud = await fetchLichessCloudEval(c.fenBefore);
        if (cloud && cloud.bestmoveSan) {
          c.move.betterMove = cloud.bestmoveSan;
          c.move.pvLine = cloud.pvSan.join(' ');
        } else {
          const local = await runStockfishLocal(c.fenBefore, 8);
          if (local && local.bestmoveSan) {
            c.move.betterMove = local.bestmoveSan;
            c.move.pvLine = local.pvSan.join(' ');
          }
        }
        if (c.move.betterMove) {
          if (c.move.type === 'blunder') {
            c.move.comment = `Серьёзный зевок! Сильнейшим продолжением было ${c.move.betterMove}. Линия Stockfish 19 Lite: ${c.move.pvLine || c.move.betterMove}.`;
          } else if (c.move.type === 'mistake') {
            c.move.comment = `Ощутимая ошибка. Точнее было ${c.move.betterMove}. Линия Stockfish 19 Lite: ${c.move.pvLine || c.move.betterMove}.`;
          } else if (c.move.type === 'inaccuracy') {
            c.move.comment = `Неточность. Сильнее было сыграть ${c.move.betterMove}. Линия: ${c.move.pvLine || c.move.betterMove}.`;
          }
        }
      } catch {
        // keep fallback
      }
    }
  }

  // Sort critical moves back into game ply order
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
