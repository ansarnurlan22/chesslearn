-- ============================================================
-- ChessCheese – Supabase Schema (Fix for RLS Recursion)
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gpqtzrxxyaskanjhevzg/sql/new
-- ============================================================

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  chess_username TEXT,
  chess_platform TEXT CHECK (chess_platform IN ('lichess', 'chesscom')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Group members
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  chess_username TEXT NOT NULL,
  chess_platform TEXT NOT NULL CHECK (chess_platform IN ('lichess', 'chesscom')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, chess_username, chess_platform)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Drop all old policies to prevent recursion conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Trainers can view student profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users view profiles" ON public.profiles;

DROP POLICY IF EXISTS "Trainers manage own groups" ON public.groups;
DROP POLICY IF EXISTS "Students view joined groups" ON public.groups;
DROP POLICY IF EXISTS "Anyone view groups" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users view groups" ON public.groups;

DROP POLICY IF EXISTS "Trainers manage group members" ON public.group_members;
DROP POLICY IF EXISTS "Students view own membership" ON public.group_members;
DROP POLICY IF EXISTS "Anyone view group members" ON public.group_members;
DROP POLICY IF EXISTS "Authenticated users view group members" ON public.group_members;
DROP POLICY IF EXISTS "Authenticated users insert group members" ON public.group_members;
DROP POLICY IF EXISTS "Trainers and students delete group members" ON public.group_members;

-- ─── Clean, Non-Recursive Policies ──────────────────────────

-- Profiles: Anyone authenticated can view profiles, users can update their own
CREATE POLICY "Authenticated users view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Groups: Anyone authenticated can view groups (by invite code or list)
CREATE POLICY "Authenticated users view groups" ON public.groups
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Trainers manage own groups" ON public.groups
  FOR ALL TO authenticated
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

-- Group Members: Anyone authenticated can view group members
CREATE POLICY "Authenticated users view group members" ON public.group_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users insert group members" ON public.group_members
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Trainers and students delete group members" ON public.group_members
  FOR DELETE TO authenticated
  USING (
    student_id = auth.uid() OR
    group_id IN (SELECT id FROM public.groups WHERE trainer_id = auth.uid())
  );

-- ─── Auto-profile trigger on signup ──────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. Analyses table
-- ==============================================================================
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

CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_user_platform ON public.analyses(user_id, platform);

-- ==============================================================================
-- 5. Training Tasks table
-- ==============================================================================
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

CREATE INDEX IF NOT EXISTS idx_training_tasks_user_id ON public.training_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_training_tasks_category ON public.training_tasks(user_id, category);
CREATE INDEX IF NOT EXISTS idx_training_tasks_analysis_id ON public.training_tasks(analysis_id);

-- ==============================================================================
-- 6. Training Progress table
-- ==============================================================================
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

CREATE INDEX IF NOT EXISTS idx_training_progress_user_id ON public.training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_task_id ON public.training_progress(task_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_status ON public.training_progress(user_id, status);

-- ==============================================================================
-- 7. Weakness Stats table
-- ==============================================================================
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

CREATE INDEX IF NOT EXISTS idx_weakness_stats_user_id ON public.weakness_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_weakness_stats_category ON public.weakness_stats(user_id, category);

-- ==============================================================================
-- RLS Activation for Core Tables
-- ==============================================================================
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weakness_stats ENABLE ROW LEVEL SECURITY;

-- ─── Analyses Policies ────────────────────────────────────────────────────────
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

-- ─── Training Tasks Policies ──────────────────────────────────────────────────
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

-- ─── Training Progress Policies ───────────────────────────────────────────────
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

-- ─── Weakness Stats Policies ──────────────────────────────────────────────────
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

-- ─── Updated_at Triggers ──────────────────────────────────────────────────────
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
