import type { MoveClassificationType } from '@/types/review';
import type { MoveLabel } from '@/types/analysis';

/**
 * Пороги классификации ходов по потере ожидаемого результата (win probability delta) в шкале 0..1.
 *
 * Официальные диапазоны:
 * - лучший: потеря ≤ 0.01 (или совпадение с лучшим ходом движка)
 * - отличный: потеря ≤ 0.02
 * - хороший: потеря ≤ 0.05
 * - неточность: потеря ≤ 0.10
 * - ошибка: потеря ≤ 0.20
 * - зевок: потеря > 0.20
 */
export const WIN_DELTA_THRESHOLDS = {
  /** Лучший ход: потеря ≤ 0.01 */
  best: 0.01,
  /** Отличный ход: потеря ≤ 0.02 */
  great: 0.02,
  /** Хороший ход: потеря ≤ 0.05 */
  good: 0.05,
  /** Неточность: потеря ≤ 0.10 */
  inaccuracy: 0.10,
  /** Ошибка: потеря ≤ 0.20 */
  mistake: 0.20,
  // Зевок (blunder): потеря > 0.20
} as const;

/**
 * Классифицирует ход по шкале потери ожидаемого результата (0..1), CPL и правилам движка.
 */
export function classifyMove({
  winDelta,
  cpl = 0,
  isEngineBest = false,
  isCheckmate = false,
  isSacrifice = false,
  playerBefore = 0,
  playerAfter = 0,
}: {
  winDelta: number;
  cpl?: number;
  isEngineBest?: boolean;
  isCheckmate?: boolean;
  isSacrifice?: boolean;
  isFavorableAdvantage?: boolean;
  playerBefore?: number;
  playerAfter?: number;
}): MoveClassificationType {
  // 1. Мат королю всегда лучший ход
  if (isCheckmate) {
    return 'best';
  }

  // 2. Блестящий ход: только реальная жертва материала, при которой оценка не ухудшилась
  // (cpl <= 20, winDelta <= 0.02) и позиция до хода ещё не была полностью выигранной (< 400 cp)
  if (
    isSacrifice &&
    playerBefore < 400 &&
    playerAfter >= 100 &&
    winDelta <= WIN_DELTA_THRESHOLDS.great &&
    cpl <= 20
  ) {
    return 'brilliant';
  }

  // 3. В абсолютно выигранном эндшпиле (+2000 cp) обычные победные ходы считаются отличными,
  // только финальный мат — лучший.
  if (playerBefore >= 2000 && playerAfter >= 2000) {
    return 'great';
  }

  // 4. Ход совпадает с сильнейшей рекомендацией движка
  if (isEngineBest) {
    return 'best';
  }

  // 5. Ход сохраняет решающее преимущество (> 400 cp)
  if (playerBefore >= 400 && playerAfter >= 400) {
    return 'great';
  }

  // 6. Защита от залипания шкалы: потеря фигуры / ладьи (cpl >= 250)
  // даже в безнадёжной позиции классифицируется как ошибка
  if (cpl >= 250) {
    return 'mistake';
  }

  // 7. Пороги потери вероятности победы (winDelta)
  if (winDelta > WIN_DELTA_THRESHOLDS.mistake) {
    // В уже проигранной позиции грубый сброс считается ошибкой, а не зевком (по Chess.com)
    return playerBefore < -300 ? 'mistake' : 'blunder';
  }

  if (winDelta > WIN_DELTA_THRESHOLDS.inaccuracy) {
    return 'mistake';
  }

  if (winDelta > WIN_DELTA_THRESHOLDS.good || (playerBefore > -400 && cpl >= 80)) {
    return 'inaccuracy';
  }

  if (winDelta <= WIN_DELTA_THRESHOLDS.great) {
    return 'great';
  }

  if (winDelta <= WIN_DELTA_THRESHOLDS.good) {
    return 'good';
  }

  return 'inaccuracy';
}

/**
 * Устаревший хелпер для обратной совместимости (шкала drop 0..100)
 */
export const LABEL_THRESHOLDS = {
  brilliant: 0,
  best: 1,
  good: 5,
  inaccuracy: 10,
  mistake: 20,
} as const;

export function classifyDrop(
  drop: number,
  isSacrifice = false,
  isEngineBest = false,
): MoveLabel {
  const m = classifyMove({
    winDelta: Math.max(0, drop) / 100,
    isSacrifice,
    isEngineBest,
  });
  if (m === 'book' || m === 'great') return 'best';
  return m as MoveLabel;
}
