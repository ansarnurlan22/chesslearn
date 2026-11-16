/**
 * Пороговые константы для классификации ходов.
 * Значения основаны на падении шанса на победу (winChanceDrop, 0–100).
 *
 * Ориентиры (Lichess/Chess.com style):
 *   drop ≤ 0  → brilliant (жертва при выгодном eval)
 *   drop ≤ 2  → best
 *   drop ≤ 5  → good
 *   drop ≤ 10 → inaccuracy
 *   drop ≤ 20 → mistake
 *   drop > 20 → blunder
 */

import type { MoveLabel } from '@/types/analysis';

export const LABEL_THRESHOLDS = {
  /** Нижняя граница brilliant: отрицательное падение (позиция улучшилась) */
  brilliant: 0,
  /** best: падение шанса победы не более 2% */
  best: 2,
  /** good: падение до 5% */
  good: 5,
  /** inaccuracy: падение до 10% */
  inaccuracy: 10,
  /** mistake: падение до 20% */
  mistake: 20,
  // blunder: всё что выше 20%
} as const;

/**
 * Классифицирует ход по падению шанса победы.
 *
 * @param drop  Падение шанса на победу с точки зрения игрока (может быть отрицательным
 *              если позиция улучшилась). В процентных пунктах (0–100 scale).
 * @param isSacrifice  Признак жертвы материала (для brilliant).
 * @param isEngineBest  true если ход совпадает с первой линией движка.
 */
export function classifyDrop(
  drop: number,
  isSacrifice = false,
  isEngineBest = false,
): MoveLabel {
  if (isSacrifice && drop <= LABEL_THRESHOLDS.brilliant) return 'brilliant';
  if (isEngineBest || drop <= LABEL_THRESHOLDS.best) return 'best';
  if (drop <= LABEL_THRESHOLDS.good) return 'good';
  if (drop <= LABEL_THRESHOLDS.inaccuracy) return 'inaccuracy';
  if (drop <= LABEL_THRESHOLDS.mistake) return 'mistake';
  return 'blunder';
}
