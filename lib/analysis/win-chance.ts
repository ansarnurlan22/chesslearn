/**
 * Перевод оценки Stockfish в шанс на победу.
 * Формула Lichess: winChance(cp) = 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1)
 *
 * Мат учитывается отдельно: M1 → 100% (или 0%), M∞ → ~100%.
 * Возвращает значение в диапазоне 0–100 (проценты).
 */

/** Максимальный cp для clamp (убирает infinity при очень больших оценках) */
const CP_CLAMP = 1000;

/**
 * Переводит оценку в сантипешках в шанс на победу (0–100) с точки зрения белых.
 */
export function cpToWinChance(cp: number): number {
  const clamped = Math.max(-CP_CLAMP, Math.min(CP_CLAMP, cp));
  const w = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * clamped)) - 1);
  return Math.max(0, Math.min(100, w));
}

/**
 * Переводит мат в шанс на победу (с точки зрения белых).
 * mateIn > 0 → белые дают мат → 100%
 * mateIn < 0 → чёрные дают мат → 0%
 */
export function mateToWinChance(mateIn: number): number {
  return mateIn > 0 ? 100 : 0;
}

/**
 * Вычисляет падение шанса победы с точки зрения игрока (не белых!).
 *
 * @param winBefore  Шанс победы белых до хода (0–100)
 * @param winAfter   Шанс победы белых после хода (0–100)
 * @param color      Цвет игрока, сделавшего ход
 * @returns Падение (≥ 0: потеря; < 0: позиция улучшилась)
 */
export function winChanceDrop(
  winBefore: number,
  winAfter: number,
  color: 'white' | 'black',
): number {
  if (color === 'white') {
    return winBefore - winAfter;
  }
  // Для чёрных: шанс их победы = 100 - winWhite, поэтому:
  // drop = (100 - winBefore) - (100 - winAfter) = winAfter - winBefore
  return winAfter - winBefore;
}

/**
 * Точность по алгоритму Lichess из массива падений шанса победы.
 * MoveAccuracy = 103.1668 * exp(-0.04354 * drop) - 3.1669
 * Финальная точность = среднее по ходам.
 */
export function computeAccuracy(drops: number[]): number {
  if (drops.length === 0) return 90.0;
  const sum = drops.reduce((acc, drop) => {
    const moveAcc = Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * Math.max(0, drop)) - 3.1669));
    return acc + moveAcc;
  }, 0);
  return Math.round((sum / drops.length) * 10) / 10;
}
