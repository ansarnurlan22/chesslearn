/**
 * Главный модуль анализа партии.
 *
 * Принимает PGN и массив оценок Stockfish → возвращает GameAnalysis.
 * Не обращается к движку напрямую; оценки передаются извне (из stockfish.ts или Cloud Eval).
 *
 * chess.js разрешено использовать здесь напрямую (это lib-файл, не компонент).
 */

import { Chess } from 'chess.js';
import type { GameAnalysis, MoveEval, StockfishEval } from '@/types/analysis';
import { cpToWinChance, mateToWinChance, winChanceDrop, computeAccuracy } from './win-chance';
import { classifyDrop } from './thresholds';
import { getOpening } from './opening-db';

/** Sentinel-значения для мата (в cp-экв) */
const MATE_CP_WHITE_WINS = 10000;
const MATE_CP_BLACK_WINS = -10000;

/** Переводит StockfishEval в cp-эквивалент с точки зрения белых */
function evalToCp(e: StockfishEval | undefined, defaultCp = 20): number {
  if (!e) return defaultCp;
  if (e.mate !== undefined) {
    return e.mate > 0 ? MATE_CP_WHITE_WINS - e.mate * 10 : MATE_CP_BLACK_WINS - e.mate * 10;
  }
  return e.cp ?? defaultCp;
}

/** Переводит cp с точки зрения белых в winChance (0–100) */
function cpToWin(cp: number): number {
  if (cp >= MATE_CP_WHITE_WINS - 500) return 100;
  if (cp <= MATE_CP_BLACK_WINS + 500) return 0;
  return cpToWinChance(cp);
}

/** Конвертирует mateToWinChance по знаку mate */
function mateEvalToWin(mate: number): number {
  return mateToWinChance(mate);
}

/**
 * Анализирует партию по PGN и массиву оценок Stockfish.
 *
 * @param pgn    PGN строка партии (используется для SAN-ходов и истории)
 * @param evals  Оценки Stockfish для каждой позиции (ply 1-based, совпадает с номером хода)
 *               Элемент с ply=N описывает позицию ПОСЛЕ N-го полухода.
 *               Элемент с ply=0 (или отсутствующий) — начальная позиция.
 */
export async function analyzeGame(
  pgn: string,
  evals: StockfishEval[],
): Promise<GameAnalysis> {
  // 1. Парсим историю ходов из PGN
  const chess = new Chess();
  try {
    chess.loadPgn(pgn.trim());
  } catch {
    // Если PGN не распознан — возвращаем пустой результат
    return {
      accuracy: { white: 0, black: 0 },
      moves: [],
    };
  }

  const history = chess.history({ verbose: true });
  if (history.length === 0) {
    return { accuracy: { white: 100, black: 100 }, moves: [] };
  }

  // 2. Строим карту ply → eval
  const evalMap = new Map<number, StockfishEval>();
  for (const e of evals) {
    evalMap.set(e.ply, e);
  }

  const moves: MoveEval[] = [];
  const whiteDrops: number[] = [];
  const blackDrops: number[] = [];
  const sanHistory: string[] = history.map((m) => m.san);

  for (let i = 0; i < history.length; i++) {
    const mv = history[i];
    const ply = i + 1; // 1-based
    const color: 'white' | 'black' = i % 2 === 0 ? 'white' : 'black';

    // Оценки: до хода = eval после предыдущего полухода; после = eval после этого хода
    const evalBefore = evalMap.get(i);   // ply=0 — начальная позиция
    const evalAfterEntry = evalMap.get(ply);

    const cpBefore = evalToCp(evalBefore, 20);
    const cpAfter = evalToCp(evalAfterEntry, cpBefore);

    // Win chances (от 0 до 100, всегда с точки зрения белых)
    const winBefore =
      evalBefore?.mate !== undefined ? mateEvalToWin(evalBefore.mate) : cpToWin(cpBefore);
    const winAfter =
      evalAfterEntry?.mate !== undefined ? mateEvalToWin(evalAfterEntry.mate) : cpToWin(cpAfter);

    const drop = winChanceDrop(winBefore, winAfter, color);

    // Определяем: совпадает ли ход с лучшим по движку
    const isEngineBest =
      evalBefore?.bestMove !== undefined && evalBefore.bestMove === mv.lan;

    const label = classifyDrop(drop, false, isEngineBest);

    const moveEval: MoveEval = {
      ply,
      san: mv.san,
      evalBefore: cpBefore,
      evalAfter: cpAfter,
      winChanceDrop: Math.max(0, drop), // всегда ≥ 0 в выходных данных
      label,
      bestMove: evalBefore?.bestMove,
    };

    moves.push(moveEval);

    if (color === 'white') {
      whiteDrops.push(drop);
    } else {
      blackDrops.push(drop);
    }
  }

  // 3. Точность
  const accuracy = {
    white: computeAccuracy(whiteDrops),
    black: computeAccuracy(blackDrops),
  };

  // 4. Дебют (lazy, по первым 20 ходам)
  const opening = await getOpening(sanHistory.slice(0, 20)).catch(() => undefined);

  return { accuracy, moves, opening };
}
