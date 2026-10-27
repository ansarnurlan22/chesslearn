export interface LichessPerf {
  games: number;
  rating: number;
  rd?: number;
  prog?: number;
  prov?: boolean;
}

export interface LichessCount {
  all: number;
  rated: number;
  ai: number;
  draw: number;
  drawH: number;
  loss: number;
  lossH: number;
  win: number;
  winH: number;
  bookmark: number;
  playing: number;
  import: number;
  me: number;
}

export interface LichessUserProfile {
  id: string;
  username: string;
  title?: string;
  online?: boolean;
  patron?: boolean;
  createdAt?: number;
  seenAt?: number;
  url?: string;
  count: LichessCount;
  perfs: {
    bullet?: LichessPerf;
    blitz?: LichessPerf;
    rapid?: LichessPerf;
    classical?: LichessPerf;
    correspondence?: LichessPerf;
    puzzle?: LichessPerf;
  };
}

export interface LichessGamePlayer {
  user?: {
    name: string;
    id: string;
    title?: string;
  };
  rating?: number;
  ratingDiff?: number;
  provisional?: boolean;
}

export interface LichessOpening {
  eco: string;
  name: string;
  ply: number;
}

export interface LichessGame {
  id: string;
  rated: boolean;
  variant: string;
  speed: string;
  perf: string;
  createdAt: number;
  lastMoveAt: number;
  status: string;
  players: {
    white: LichessGamePlayer;
    black: LichessGamePlayer;
  };
  winner?: 'white' | 'black';
  opening?: LichessOpening;
  moves?: string;
  pgn?: string;
}
