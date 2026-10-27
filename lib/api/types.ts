export type ChessPlatform = 'lichess' | 'chesscom';

export interface UnifiedGame {
  id: string;
  pgn: string;
  moves?: string;
  timeControl: string;
  result: 'win' | 'loss' | 'draw';
  opponent: string;
  opponentRating?: number;
  white: boolean;
  date: string;
  opening?: string;
  url?: string;
}

export interface UnifiedPlayerProfile {
  platform: ChessPlatform;
  username: string;
  name?: string;
  title?: string;
  avatarUrl?: string;
  online?: boolean;
  profileUrl?: string;
  ratings: {
    blitz?: number;
    rapid?: number;
    bullet?: number;
    classical?: number;
  };
  record: {
    win: number;
    loss: number;
    draw: number;
  };
  recentGames: UnifiedGame[];
}
