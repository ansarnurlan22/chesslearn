import type {
  CriticalMove,
  MoveAnalysis,
  MoveClassificationType,
  MoveTypeSummary,
} from '@/types/review';
import { Chess } from 'chess.js';
import { isOpeningBookMove } from '@/lib/engine/opening-book';
import { parsePgnEvaluations } from '@/lib/eval-parser';

export const GLYPH_MAP: Record<MoveClassificationType, string> = {
  brilliant: '!!',
  great: '!',
  best: '★',
  good: '✓',
  book: '📖',
  inaccuracy: '?!',
  mistake: '?',
  blunder: '??',
};

export const CLASSIFICATION_META: Record<
  MoveClassificationType,
  { label: string; glyph: string; colorClass: string; bgClass: string; borderClass: string }
> = {
  book: {
    label: 'Дебютная теория',
    glyph: '📖',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-950/40',
    borderClass: 'border-amber-700/50',
  },
  brilliant: {
    label: 'Бриллиантовый',
    glyph: '!!',
    colorClass: 'text-cyan-300',
    bgClass: 'bg-cyan-950/50',
    borderClass: 'border-cyan-500/50',
  },
  great: {
    label: 'Отличный',
    glyph: '!',
    colorClass: 'text-blue-300',
    bgClass: 'bg-blue-950/50',
    borderClass: 'border-blue-500/50',
  },
  best: {
    label: 'Лучший',
    glyph: '★',
    colorClass: 'text-emerald-300',
    bgClass: 'bg-emerald-950/50',
    borderClass: 'border-emerald-500/50',
  },
  good: {
    label: 'Хороший',
    glyph: '✓',
    colorClass: 'text-zinc-300',
    bgClass: 'bg-zinc-800/70',
    borderClass: 'border-zinc-700/60',
  },
  inaccuracy: {
    label: 'Неточность',
    glyph: '?!',
    colorClass: 'text-yellow-300',
    bgClass: 'bg-yellow-950/50',
    borderClass: 'border-yellow-600/50',
  },
  mistake: {
    label: 'Ошибка',
    glyph: '?',
    colorClass: 'text-orange-300',
    bgClass: 'bg-orange-950/50',
    borderClass: 'border-orange-600/50',
  },
  blunder: {
    label: 'Зевок',
    glyph: '??',
    colorClass: 'text-rose-300',
    bgClass: 'bg-rose-950/50',
    borderClass: 'border-rose-600/50',
  },
};

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

function centipawnsToWinPercent(cp: number): number {
  const clampedCp = Math.max(-2000, Math.min(2000, cp));
  const winRate = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * clampedCp)) - 1);
  return Math.max(0, Math.min(100, winRate));
}

/**
 * Classifies all moves of a game into Chess.com-style statuses.
 * Incorporates:
 * 1. Embedded PGN evaluations (from Lichess/Chess.com) for real centipawn accuracy.
 * 2. Opening book tree to guarantee 'book' status with 0 CPL for theoretical moves.
 * 3. AI / Stockfish critical moments when provided.
 */
export function classifyGameMoves(
  pgn: string,
  criticalMoves: CriticalMove[] = [],
): {
  moves: MoveAnalysis[];
  stats: { white: MoveTypeSummary; black: MoveTypeSummary };
} {
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
  const criticalMap = new Map<number, CriticalMove>();
  for (const cm of criticalMoves) {
    criticalMap.set(cm.ply, cm);
  }

  const embeddedEvals = parsePgnEvaluations(pgn);
  const hasEmbedded = embeddedEvals.size >= Math.floor(history.length * 0.5);

  const moves: MoveAnalysis[] = [];
  const stats = {
    white: createEmptySummary(),
    black: createEmptySummary(),
  };

  for (let i = 0; i < history.length; i++) {
    const mv = history[i];
    const ply = i + 1;
    const color: 'white' | 'black' = i % 2 === 0 ? 'white' : 'black';
    const turnChar: 'w' | 'b' = color === 'white' ? 'w' : 'b';
    const moveNumber = Math.ceil(ply / 2);

    const aiMatch = criticalMap.get(ply);

    let type: MoveClassificationType = 'good';
    let comment = 'Надёжный ход в партии.';
    let betterMove: string | undefined = undefined;
    let scoreStr: string | undefined = undefined;
    let pvLine: string | undefined = undefined;
    let cpl = 0;

    // 1. Check AI / Engine match first
    if (aiMatch) {
      type = aiMatch.type;
      comment = aiMatch.comment;
      betterMove = aiMatch.betterMove;
      scoreStr = aiMatch.score;
      pvLine = aiMatch.pvLine;
    } else {
      // 2. Check Opening Book
      const bookCheck = isOpeningBookMove(historySan, i);
      if (bookCheck.isBook) {
        type = 'book';
        comment = bookCheck.openingName
          ? `Дебютная теория: ${bookCheck.openingName}. Ход строго соответствует гроссмейстерским базам.`
          : 'Дебютная теория. Точный теоретический ход развития фигур.';
        scoreStr = '+0.2';
        cpl = 0;
      } else if (hasEmbedded) {
        // 3. Mathematical classification using embedded evaluations in PGN
        const posBefore = i === 0 ? null : embeddedEvals.get(i);
        const posAfter = embeddedEvals.get(ply);

        let beforeCp = 20;
        let afterCp = 20;

        if (posBefore) {
          beforeCp = posBefore.mate !== undefined
            ? (posBefore.mate > 0 ? 10000 : -10000)
            : (typeof posBefore.cp === 'number' ? posBefore.cp : Math.round(posBefore.score * 100));
        }
        if (posAfter) {
          afterCp = posAfter.mate !== undefined
            ? (posAfter.mate > 0 ? 10000 : -10000)
            : (typeof posAfter.cp === 'number' ? posAfter.cp : Math.round(posAfter.score * 100));
        }

        const playerBefore = turnChar === 'w' ? beforeCp : -beforeCp;
        const playerAfter = turnChar === 'w' ? afterCp : -afterCp;

        cpl = Math.max(0, playerBefore - playerAfter);
        const winBefore = centipawnsToWinPercent(playerBefore);
        const winAfter = centipawnsToWinPercent(playerAfter);
        const winDelta = Math.max(0, winBefore - winAfter);

        if (winDelta <= 1.0 && cpl <= 10) {
          type = 'best';
          comment = 'Сильнейший ход движка. Точное позиционное решение.';
        } else if (winDelta <= 2.5 && cpl <= 30) {
          type = 'great';
          comment = `Отличный ход! Потеря составила всего ${cpl} cp.`;
        } else if (winDelta <= 5.0 && cpl <= 55) {
          type = 'good';
          comment = `Хороший, надёжный ход (потеря ${cpl} cp).`;
        } else if (winDelta <= 11.0 && cpl <= 110) {
          type = 'inaccuracy';
          comment = `Неточность (потеря ${cpl} cp). Были более активные продолжения.`;
        } else if (winDelta <= 22.0 && cpl <= 230) {
          type = 'mistake';
          comment = `Ощутимая ошибка (потеря ${cpl} cp). Позиция ухудшается.`;
        } else {
          type = 'blunder';
          comment = `Серьёзный зевок (потеря ${cpl} cp)! Ход приводит к потере преимущества.`;
        }

        const pawns = (afterCp / 100).toFixed(1);
        scoreStr = afterCp > 0 ? `+${pawns}` : `${pawns}`;
      } else {
        // 4. Default fallback when no engine analysis is loaded yet
        if (mv.san.includes('#')) {
          type = 'great';
          comment = 'Победный удар! Ход завершает партию неотразимым матом.';
        } else {
          type = 'good';
          comment = 'Ход в партии. Запустите глубокий разбор Stockfish для детальной оценки.';
        }
      }
    }

    const glyph = GLYPH_MAP[type] || '';

    if (color === 'white') {
      stats.white[type]++;
    } else {
      stats.black[type]++;
    }

    moves.push({
      ply,
      moveNumber,
      san: mv.san,
      color,
      type,
      glyph,
      comment,
      betterMove,
      score: scoreStr,
      pvLine,
      cpl,
    });
  }

  return { moves, stats };
}
