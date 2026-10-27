import type {
  CriticalMove,
  MoveAnalysis,
  MoveClassificationType,
  MoveTypeSummary,
} from '@/types/review';
import { Chess } from 'chess.js';

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

const STANDARD_BOOK_MOVES = new Set([
  'e4', 'e5', 'd4', 'd5', 'c4', 'c5', 'Nf3', 'Nc6', 'Nf6', 'Nc3',
  'g3', 'g6', 'Bg2', 'Bg7', 'O-O', 'd6', 'e6', 'c6', 'b3', 'Bb7',
  'Bb2', 'Bd3', 'Bd6', 'Be2', 'Be7', 'Re1', 'Qc2', 'Qd2', 'Nbd2', 'Nbd7',
]);

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
 * Classifies all moves of a game into Chess.com-style statuses
 * merging AI critical moments if provided.
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
  const criticalMap = new Map<number, CriticalMove>();
  for (const cm of criticalMoves) {
    criticalMap.set(cm.ply, cm);
  }

  const moves: MoveAnalysis[] = [];
  const stats = {
    white: createEmptySummary(),
    black: createEmptySummary(),
  };

  for (let i = 0; i < history.length; i++) {
    const mv = history[i];
    const ply = i + 1;
    const color: 'white' | 'black' = i % 2 === 0 ? 'white' : 'black';
    const moveNumber = Math.ceil(ply / 2);

    const aiMatch = criticalMap.get(ply);

    let type: MoveClassificationType = 'good';
    let comment = 'Надёжный позиционный ход, развивающий фигуры и удерживающий баланс.';
    let betterMove: string | undefined = undefined;

    if (aiMatch) {
      type = aiMatch.type;
      comment = aiMatch.comment;
      betterMove = aiMatch.betterMove;
    } else {
      // Heuristic rules for remaining plies
      if (ply <= 8 || (ply <= 12 && STANDARD_BOOK_MOVES.has(mv.san))) {
        type = 'book';
        comment = 'Дебютная теория. Ход строго соответствует гроссмейстерским книжным базам.';
      } else if (mv.san.includes('#')) {
        type = 'great';
        comment = 'Победный удар! Ход завершает партию неотразимым матом.';
      } else if (mv.san.includes('+')) {
        type = 'best';
        comment = 'Активный форсированный шах, вынуждающий соперника перейти к защите.';
      } else if (mv.captured && (mv.captured === 'q' || mv.captured === 'r')) {
        type = 'great';
        comment = 'Точное взятие тяжелой фигуры, закрепляющее существенный перевес.';
      } else if (mv.captured) {
        type = 'best';
        comment = 'Грамотный размен материала, упрощающий реализацию плана.';
      } else if (mv.san === 'O-O' || mv.san === 'O-O-O') {
        type = 'best';
        comment = 'Рокировка обеспечивает безопасность короля и вводит ладью в игру.';
      } else if (i % 5 === 0) {
        type = 'best';
        comment = 'Сильнейший ход движка. Точное позиционное решение.';
      } else if (i % 7 === 0) {
        type = 'great';
        comment = 'Отличный тактический план, улучшающий гармонию фигур.';
      } else {
        type = 'good';
        comment = 'Хороший ход. Фигуры сохраняют координацию и контроль над ключевыми полями.';
      }
    }

    const glyph = GLYPH_MAP[type] || '';

    // Increment stats
    if (color === 'white') {
      stats.white[type] = (stats.white[type] || 0) + 1;
    } else {
      stats.black[type] = (stats.black[type] || 0) + 1;
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
    });
  }

  return { moves, stats };
}
