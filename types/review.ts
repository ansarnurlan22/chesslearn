export type CriticalMoveType = 'brilliant' | 'best' | 'inaccuracy' | 'mistake' | 'blunder';

export interface CriticalMove {
  moveNumber: number;
  ply: number;
  san: string;
  color: 'white' | 'black';
  type: CriticalMoveType;
  comment: string;
  betterMove: string;
}

export interface GameReviewData {
  accuracy: {
    white: number;
    black: number;
  };
  summary: string;
  keyTakeaway: string;
  criticalMoves: CriticalMove[];
}
