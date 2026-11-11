-- ============================================================
-- ChessCheese – Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor).
-- Project: https://supabase.com/dashboard/project/gpqtzrxxyaskanjhevzg/sql
-- ============================================================

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'trainer')) DEFAULT 'student',
  chess_username TEXT,
  chess_platform TEXT CHECK (chess_platform IN ('lichess', 'chesscom')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Groups table (trainer creates groups of students)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Group members (can be linked to a registered profile, or added by chess username)
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  chess_username TEXT NOT NULL,
  chess_platform TEXT NOT NULL CHECK (chess_platform IN ('lichess', 'chesscom')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, chess_username, chess_platform)
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Trainers can view student profiles" ON public.profiles;

DROP POLICY IF EXISTS "Trainers manage own groups" ON public.groups;
DROP POLICY IF EXISTS "Students view joined groups" ON public.groups;

DROP POLICY IF EXISTS "Trainers manage group members" ON public.group_members;
DROP POLICY IF EXISTS "Students view own membership" ON public.group_members;

-- Profiles: users can read/update own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trainers can view their students' profiles
CREATE POLICY "Trainers can view student profiles" ON public.profiles FOR SELECT USING (
  id IN (
    SELECT student_id FROM public.group_members
    WHERE group_id IN (SELECT id FROM public.groups WHERE trainer_id = auth.uid())
  )
);

-- Groups: trainers manage own groups, students can view their groups
CREATE POLICY "Trainers manage own groups" ON public.groups FOR ALL USING (trainer_id = auth.uid());
CREATE POLICY "Students view joined groups" ON public.groups FOR SELECT USING (
  id IN (SELECT group_id FROM public.group_members WHERE student_id = auth.uid())
);

-- Group members: trainers manage members of own groups
CREATE POLICY "Trainers manage group members" ON public.group_members FOR ALL USING (
  group_id IN (SELECT id FROM public.groups WHERE trainer_id = auth.uid())
);
CREATE POLICY "Students view own membership" ON public.group_members FOR SELECT USING (student_id = auth.uid());

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
