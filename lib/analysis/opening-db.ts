/**
 * Lazy-загружаемый адаптер к существующей ECO-базе из lib/engine/opening-book.ts.
 * Определяет дебют по последовательности SAN-ходов.
 *
 * Возвращает самое длинное совпадение (наиболее конкретный вариант).
 */

import type { OpeningInfo } from '@/types/analysis';

let dbLoaded = false;
let openingDb: Array<{ eco: string; name: string; moves: string[] }> = [];

/** Лениво загружает ECO-базу из существующего модуля */
async function loadDb(): Promise<void> {
  if (dbLoaded) return;
  const { OPENING_DATABASE } = await import('@/lib/engine/opening-book');
  openingDb = OPENING_DATABASE;
  dbLoaded = true;
}

/**
 * Определяет дебют по массиву SAN-ходов.
 *
 * @param sanMoves  Первые N ходов партии в SAN-нотации (например ['e4','e5','Nf3'])
 * @returns Дебют { eco, name } или undefined если не найден
 */
export async function getOpening(sanMoves: string[]): Promise<OpeningInfo | undefined> {
  await loadDb();

  let best: OpeningInfo | undefined;
  let bestLen = 0;

  for (const entry of openingDb) {
    const len = entry.moves.length;
    if (len > sanMoves.length) continue;
    if (len <= bestLen) continue;

    const matches = entry.moves.every((m, i) => m === sanMoves[i]);
    if (matches) {
      best = { eco: entry.eco, name: entry.name };
      bestLen = len;
    }
  }

  return best;
}
