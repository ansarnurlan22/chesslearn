import type { MoveAnalysis, MoveTypeSummary, CriticalMove } from '@/types/review';
import type { OpeningInfo } from '@/types/analysis';

export type AnalysisPlatform = 'lichess' | 'chesscom' | 'pgn' | 'manual';
export type PlayerColor = 'white' | 'black';
export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'master';
export type TrainingProgressStatus = 'not_started' | 'in_progress' | 'solved' | 'failed';

export interface AnalysisRecord {
  id: string;
  user_id: string;
  game_id?: string | null;
  platform: AnalysisPlatform;
  pgn: string;
  player_color?: PlayerColor | null;
  white_username?: string | null;
  black_username?: string | null;
  white_accuracy?: number | null;
  black_accuracy?: number | null;
  summary?: string | null;
  key_takeaway?: string | null;
  stats?: MoveTypeSummary | Record<string, unknown> | null;
  moves?: MoveAnalysis[] | unknown[] | null;
  critical_moves?: CriticalMove[] | unknown[] | null;
  opening?: OpeningInfo | Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingTaskRecord {
  id: string;
  user_id: string;
  analysis_id?: string | null;
  title: string;
  description?: string | null;
  category: string;
  difficulty: TaskDifficulty;
  fen: string;
  solution_moves: string[];
  side_to_move: PlayerColor;
  explanation?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TrainingProgressRecord {
  id: string;
  user_id: string;
  task_id: string;
  status: TrainingProgressStatus;
  attempts_count: number;
  time_spent_seconds: number;
  solved_at?: string | null;
  last_attempt_at: string;
  user_moves?: string[] | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeaknessStatRecord {
  id: string;
  user_id: string;
  category: string;
  sub_category: string;
  mistakes_count: number;
  blunders_count: number;
  inaccuracies_count: number;
  total_occurrences: number;
  severity_score: number;
  last_seen_at: string;
  details?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
