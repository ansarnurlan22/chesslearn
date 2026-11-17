-- ==============================================================================
-- Миграция: Создание таблиц analyses, training_tasks, training_progress, weakness_stats
-- chesscheese.site
-- ==============================================================================

-- 1. Таблица анализов партий (analyses)
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT,
  platform TEXT CHECK (platform IN ('lichess', 'chesscom', 'pgn', 'manual')) DEFAULT 'pgn',
  pgn TEXT NOT NULL,
  player_color TEXT CHECK (player_color IN ('white', 'black')),
  white_username TEXT,
  black_username TEXT,
  white_accuracy NUMERIC(4, 1),
  black_accuracy NUMERIC(4, 1),
  summary TEXT,
  key_takeaway TEXT,
  stats JSONB DEFAULT '{}'::jsonb,
  moves JSONB DEFAULT '[]'::jsonb,
  critical_moves JSONB DEFAULT '[]'::jsonb,
  opening JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для analyses
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_user_platform ON public.analyses(user_id, platform);

-- 2. Таблица тренировочных заданий (training_tasks)
CREATE TABLE IF NOT EXISTS public.training_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'master')) DEFAULT 'medium',
  fen TEXT NOT NULL,
  solution_moves TEXT[] NOT NULL,
  side_to_move TEXT NOT NULL CHECK (side_to_move IN ('white', 'black')),
  explanation TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для training_tasks
CREATE INDEX IF NOT EXISTS idx_training_tasks_user_id ON public.training_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_training_tasks_category ON public.training_tasks(user_id, category);
CREATE INDEX IF NOT EXISTS idx_training_tasks_analysis_id ON public.training_tasks(analysis_id);

-- 3. Таблица прогресса по тренировкам (training_progress)
CREATE TABLE IF NOT EXISTS public.training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.training_tasks(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'solved', 'failed')) DEFAULT 'in_progress',
  attempts_count INTEGER NOT NULL DEFAULT 1,
  time_spent_seconds INTEGER DEFAULT 0,
  solved_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  user_moves TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- Индексы для training_progress
CREATE INDEX IF NOT EXISTS idx_training_progress_user_id ON public.training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_task_id ON public.training_progress(task_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_status ON public.training_progress(user_id, status);

-- 4. Таблица статистики слабых мест (weakness_stats)
CREATE TABLE IF NOT EXISTS public.weakness_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  sub_category TEXT NOT NULL DEFAULT 'general',
  mistakes_count INTEGER NOT NULL DEFAULT 0,
  blunders_count INTEGER NOT NULL DEFAULT 0,
  inaccuracies_count INTEGER NOT NULL DEFAULT 0,
  total_occurrences INTEGER NOT NULL DEFAULT 0,
  severity_score NUMERIC(5, 2) DEFAULT 0.0,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, sub_category)
);

-- Индексы для weakness_stats
CREATE INDEX IF NOT EXISTS idx_weakness_stats_user_id ON public.weakness_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_weakness_stats_category ON public.weakness_stats(user_id, category);

-- ==============================================================================
-- Включение Row Level Security (RLS)
-- ==============================================================================

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weakness_stats ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- Политики RLS (SELECT, INSERT, UPDATE, DELETE только при auth.uid() = user_id)
-- ==============================================================================

-- Политики для analyses
DROP POLICY IF EXISTS "Users can select own analyses" ON public.analyses;
CREATE POLICY "Users can select own analyses"
  ON public.analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analyses" ON public.analyses;
CREATE POLICY "Users can insert own analyses"
  ON public.analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own analyses" ON public.analyses;
CREATE POLICY "Users can update own analyses"
  ON public.analyses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own analyses" ON public.analyses;
CREATE POLICY "Users can delete own analyses"
  ON public.analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Политики для training_tasks
DROP POLICY IF EXISTS "Users can select own training tasks" ON public.training_tasks;
CREATE POLICY "Users can select own training tasks"
  ON public.training_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own training tasks" ON public.training_tasks;
CREATE POLICY "Users can insert own training tasks"
  ON public.training_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own training tasks" ON public.training_tasks;
CREATE POLICY "Users can update own training tasks"
  ON public.training_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own training tasks" ON public.training_tasks;
CREATE POLICY "Users can delete own training tasks"
  ON public.training_tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Политики для training_progress
DROP POLICY IF EXISTS "Users can select own training progress" ON public.training_progress;
CREATE POLICY "Users can select own training progress"
  ON public.training_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own training progress" ON public.training_progress;
CREATE POLICY "Users can insert own training progress"
  ON public.training_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own training progress" ON public.training_progress;
CREATE POLICY "Users can update own training progress"
  ON public.training_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own training progress" ON public.training_progress;
CREATE POLICY "Users can delete own training progress"
  ON public.training_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Политики для weakness_stats
DROP POLICY IF EXISTS "Users can select own weakness stats" ON public.weakness_stats;
CREATE POLICY "Users can select own weakness stats"
  ON public.weakness_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own weakness stats" ON public.weakness_stats;
CREATE POLICY "Users can insert own weakness stats"
  ON public.weakness_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own weakness stats" ON public.weakness_stats;
CREATE POLICY "Users can update own weakness stats"
  ON public.weakness_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own weakness stats" ON public.weakness_stats;
CREATE POLICY "Users can delete own weakness stats"
  ON public.weakness_stats FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==============================================================================
-- Триггеры автоматического обновления updated_at
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_analyses_updated ON public.analyses;
CREATE TRIGGER on_analyses_updated
  BEFORE UPDATE ON public.analyses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_training_tasks_updated ON public.training_tasks;
CREATE TRIGGER on_training_tasks_updated
  BEFORE UPDATE ON public.training_tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_training_progress_updated ON public.training_progress;
CREATE TRIGGER on_training_progress_updated
  BEFORE UPDATE ON public.training_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_weakness_stats_updated ON public.weakness_stats;
CREATE TRIGGER on_weakness_stats_updated
  BEFORE UPDATE ON public.weakness_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
