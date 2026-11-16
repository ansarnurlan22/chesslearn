/**
 * Контракт данных для модуля анализа партии (Задача 1).
 * Этот файл — единственный источник правды для формата { accuracy, moves, opening }.
 * Не менять без крайней необходимости: UI строится на этом контракте.
 */

/** Метки качества хода (без 'book' и 'great' — упрощённый набор для нового модуля) */
export type MoveLabel =
  | 'brilliant'
  | 'best'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder';

/** Оценка Stockfish для одной позиции */
export interface StockfishEval {
  /** Номер полухода (1-based: 1 = первый ход белых) */
  ply: number;
  /** Оценка в сантипешках с точки зрения белых. undefined если мат */
  cp?: number;
  /** Мат в N ходов с точки зрения белых. Отрицательный — мат белым */
  mate?: number;
  /** Лучший ход в UCI-нотации (e2e4) */
  bestMove?: string;
}

/** Анализ одного хода */
export interface MoveEval {
  /** Номер полухода (1-based) */
  ply: number;
  /** Ход в SAN-нотации */
  san: string;
  /** Оценка позиции ДО хода в сантипешках (с точки зрения белых) */
  evalBefore: number;
  /** Оценка позиции ПОСЛЕ хода в сантипешках (с точки зрения белых) */
  evalAfter: number;
  /** Падение шанса на победу с точки зрения игрока (0–100, всегда ≥ 0) */
  winChanceDrop: number;
  /** Классификация хода */
  label: MoveLabel;
  /** Лучший ход движка в UCI-нотации (если отличается от сыгранного) */
  bestMove?: string;
}

/** Дебют по ECO */
export interface OpeningInfo {
  eco: string;
  name: string;
}

/** Результат анализа всей партии */
export interface GameAnalysis {
  accuracy: {
    /** Точность белых (0–100) по алгоритму Lichess */
    white: number;
    /** Точность чёрных (0–100) по алгоритму Lichess */
    black: number;
  };
  /** Анализ каждого хода в порядке партии */
  moves: MoveEval[];
  /** Дебют (если определён) */
  opening?: OpeningInfo;
}
