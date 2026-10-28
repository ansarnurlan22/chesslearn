export type MoveClassificationType =
  | 'book'
  | 'brilliant'
  | 'great'
  | 'best'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder';

export type CriticalMoveType = 'brilliant' | 'best' | 'inaccuracy' | 'mistake' | 'blunder';

export interface MoveAnalysis {
  ply: number;
  moveNumber: number;
  san: string;
  color: 'white' | 'black';
  type: MoveClassificationType;
  glyph: string;
  comment: string;
  betterMove?: string;
  score?: string;
  pvLine?: string;
  cpl?: number;
}

export interface MoveTypeSummary {
  book: number;
  brilliant: number;
  great: number;
  best: number;
  good: number;
  inaccuracy: number;
  mistake: number;
  blunder: number;
}

export interface CriticalMove {
  moveNumber: number;
  ply: number;
  san: string;
  color: 'white' | 'black';
  type: CriticalMoveType;
  comment: string;
  betterMove: string;
  score?: string;
  pvLine?: string;
}

export interface GameReviewData {
  accuracy: {
    white: number;
    black: number;
  };
  summary: string;
  keyTakeaway: string;
  criticalMoves: CriticalMove[];
  allMoves?: MoveAnalysis[];
  stats?: {
    white: MoveTypeSummary;
    black: MoveTypeSummary;
  };
}
