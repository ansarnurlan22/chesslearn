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
 * Классифицирует ход по шкале потери ожидаемого результата (0..1) и правилам движка.
 */
export function classifyMove({
  winDelta,
  cpl = 0,
  isEngineBest = false,
  isCheckmate = false,
  isSacrifice = false,
  isFavorableAdvantage = false,
}: {
  winDelta: number;
  cpl?: number;
  isEngineBest?: boolean;
  isCheckmate?: boolean;
  isSacrifice?: boolean;
  isFavorableAdvantage?: boolean;
}): MoveClassificationType {
  if (isCheckmate) {
    return 'best';
  }

  if (isSacrifice && isFavorableAdvantage && winDelta <= WIN_DELTA_THRESHOLDS.great && cpl <= 20) {
    return 'brilliant';
  }

  // Метка "лучший": только если сыгранный ход совпадает с лучшим ходом движка (или ставит мат)
  if (isCheckmate || isEngineBest) {
    return 'best';
  }

  if (winDelta <= WIN_DELTA_THRESHOLDS.great) {
    return 'great';
  }

  if (winDelta <= WIN_DELTA_THRESHOLDS.good) {
    return 'good';
  }

  if (winDelta <= WIN_DELTA_THRESHOLDS.inaccuracy) {
    return 'inaccuracy';
  }

  if (winDelta <= WIN_DELTA_THRESHOLDS.mistake) {
    return 'mistake';
  }

  return 'blunder';
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
