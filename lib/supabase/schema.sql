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
