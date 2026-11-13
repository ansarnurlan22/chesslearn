'use server';

import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/auth';

export interface StreakRecordResult {
  success: boolean;
  streak: number;
  bestStreak: number;
  solvedDays: number[];
  error?: string;
}

function getYesterdayKey(d: Date): string {
  const yesterday = new Date(d);
  yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.getFullYear();
  const m = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getTodayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Records a solved daily puzzle for the authenticated user and updates their streak in Supabase.
 */
export async function recordDailyPuzzleSolve(day: number): Promise<StreakRecordResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      streak: 1,
      bestStreak: 1,
      solvedDays: [day],
      error: 'Пользователь не авторизован',
    };
  }

  // Fetch current user profile
  const { data: profileData, error: fetchError } = await supabase
    .from('profiles')
    .select('puzzle_streak, puzzle_best_streak, puzzle_last_solved_date, puzzle_solved_days')
    .eq('id', user.id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching profile streak:', fetchError.message);
  }

  const profile = (profileData || {}) as Partial<Profile>;
  const now = new Date();
  const todayKey = getTodayKey(now);
  const yesterdayKey = getYesterdayKey(now);

  const lastSolvedDate = profile.puzzle_last_solved_date || null;
  const currentStreak = profile.puzzle_streak || 0;
  const currentBest = profile.puzzle_best_streak || 0;
  const existingDays: number[] = Array.isArray(profile.puzzle_solved_days)
    ? profile.puzzle_solved_days
    : [];

  let newStreak = currentStreak;

  if (lastSolvedDate === todayKey) {
    // Already solved today, keep current streak
    newStreak = Math.max(currentStreak, 1);
  } else if (lastSolvedDate === yesterdayKey) {
    // Solved yesterday: consecutive streak increment!
    newStreak = currentStreak + 1;
  } else {
    // First puzzle or streak broken
    newStreak = 1;
  }

  const newBestStreak = Math.max(currentBest, newStreak);
  const newSolvedDays = existingDays.includes(day) ? existingDays : [...existingDays, day];

  // Update Supabase profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      puzzle_streak: newStreak,
      puzzle_best_streak: newBestStreak,
      puzzle_last_solved_date: todayKey,
      puzzle_solved_days: newSolvedDays,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('Error updating puzzle streak in Supabase:', updateError.message);
    return {
      success: false,
      streak: newStreak,
      bestStreak: newBestStreak,
      solvedDays: newSolvedDays,
      error: updateError.message,
    };
  }

  return {
    success: true,
    streak: newStreak,
    bestStreak: newBestStreak,
    solvedDays: newSolvedDays,
  };
}

/**
 * Retrieves the current streak and solved days for the authenticated user from Supabase.
 */
export async function getDailyPuzzleStreak(): Promise<{
  streak: number;
  bestStreak: number;
  solvedDays: number[];
  lastSolvedDate: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      streak: 0,
      bestStreak: 0,
      solvedDays: [],
      lastSolvedDate: null,
    };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('puzzle_streak, puzzle_best_streak, puzzle_last_solved_date, puzzle_solved_days')
    .eq('id', user.id)
    .single();

  if (error || !data) {
    return {
      streak: 0,
      bestStreak: 0,
      solvedDays: [],
      lastSolvedDate: null,
    };
  }

  return {
    streak: data.puzzle_streak || 0,
    bestStreak: data.puzzle_best_streak || 0,
    solvedDays: Array.isArray(data.puzzle_solved_days) ? data.puzzle_solved_days : [],
    lastSolvedDate: data.puzzle_last_solved_date || null,
  };
}
