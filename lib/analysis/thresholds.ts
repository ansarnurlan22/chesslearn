import type { MoveClassificationType } from '@/types/review';
import type { MoveLabel } from '@/types/analysis';

/**
 * Пороги классификации ходов по потере ожидаемого результата (win probability delta) в шкале 0..1.
 *
 * Калиброваны по стандарту Chess.com:
 * - лучший:   потеря ≤ 0.5% (точное совпадение с ходом движка)
 * - отличный: потеря ≤ 2%  AND cpl ≤ 5  (очень редко, 1-3 за партию)
 * - хороший:  потеря ≤ 5%  AND cpl ≤ 50
 * - неточность: потеря ≤ 10%
 * - ошибка:   потеря ≤ 20%
 * - зевок:    потеря > 20%
 */
export const WIN_DELTA_THRESHOLDS = {
  /** Лучший ход: потеря ≤ 0.5% (0.005) */
  best: 0.005,
  /** Отличный ход: потеря ≤ 2% (0.02) — дополнительно требует cpl ≤ 5 */
  great: 0.02,
  /** Хороший ход: потеря ≤ 5% (0.05) */
  good: 0.05,
  /** Неточность: потеря ≤ 10% (0.10) */
  inaccuracy: 0.10,
  /** Ошибка: потеря ≤ 20% (0.20) */
  mistake: 0.20,
  // Зевок (blunder): потеря > 0.20
} as const;

/** Максимальные CPL для каждой категории (дополнительный фильтр) */
export const CPL_THRESHOLDS = {
  /** Лучший: практически нулевая потеря */
  best: 2,
  /** Отличный: почти идеальный ход — строгий фильтр, чтобы таких было мало */
  great: 5,
  /** Хороший: небольшая потеря, позиция остаётся под контролем */
  good: 50,
} as const;

/**
 * Классифицирует ход по шкале потери ожидаемого результата (0..1), CPL и правилам движка.
 *
 * Калибровка по Chess.com:
 * - лучший:   потеря ≤ 0.5% ИЛИ точное совпадение с ходом движка
 * - отличный: потеря ≤ 2% И cpl ≤ 5 — РЕДКО, 1-3 за партию
 * - хороший:  потеря ≤ 5% И cpl ≤ 50 — типичная игра
 * - неточность, ошибка, зевок — стандартные пороги
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

  // 2. Блестящий ход: реальная жертва материала без ухудшения позиции,
  //    вне уже полностью выигранной ситуации (< 400 cp)
  if (
    isSacrifice &&
    playerBefore < 400 &&
    playerAfter >= 100 &&
    winDelta <= WIN_DELTA_THRESHOLDS.great &&
    cpl <= CPL_THRESHOLDS.great
  ) {
    return 'brilliant';
  }

  // 3. Ход совпадает с сильнейшей рекомендацией движка → лучший
  if (isEngineBest) {
    return 'best';
  }

  // 4. Почти лучший ход (потеря ≤ 0.5% и cpl ≤ 2) → тоже лучший
  if (winDelta <= WIN_DELTA_THRESHOLDS.best && cpl <= CPL_THRESHOLDS.best) {
    return 'best';
  }

  // 5. Защита от залипания шкалы: большая потеря материала (cpl ≥ 250) → ошибка
  if (cpl >= 250) {
    return 'mistake';
  }

  // 6. Пороги потери вероятности победы (winDelta)
  if (winDelta > WIN_DELTA_THRESHOLDS.mistake) {
    // В уже проигранной позиции грубый сброс считается ошибкой, а не зевком
    return playerBefore < -300 ? 'mistake' : 'blunder';
  }

  if (winDelta > WIN_DELTA_THRESHOLDS.inaccuracy) {
    return 'mistake';
  }

  if (winDelta > WIN_DELTA_THRESHOLDS.good || (playerBefore > -400 && cpl >= 80)) {
    return 'inaccuracy';
  }

  // 7. Отличный ход: потеря ≤ 2% И cpl ≤ 5 (строгий двойной фильтр → редко)
  if (winDelta <= WIN_DELTA_THRESHOLDS.great && cpl <= CPL_THRESHOLDS.great) {
    return 'great';
  }

  // 8. Хороший ход: потеря ≤ 5% И cpl ≤ 50
  if (winDelta <= WIN_DELTA_THRESHOLDS.good && cpl <= CPL_THRESHOLDS.good) {
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
