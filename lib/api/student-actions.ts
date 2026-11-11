'use server';

import { createClient } from '@/lib/supabase/server';
import { getUnifiedPlayerProfile } from '@/lib/api/unified';
import type { ChessPlatform, Profile } from '@/types/auth';
import type { UnifiedPlayerProfile } from '@/lib/api/types';
import { revalidatePath } from 'next/cache';

export interface StudentGroupInfo {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  trainerName: string;
  joinedAt: string;
}

export interface StudentProfileData {
  profile: Profile;
  groups: StudentGroupInfo[];
  chessStats: UnifiedPlayerProfile | null;
}

/**
 * Fetch full profile data for the authenticated student:
 * - Profile details (name, email, role, chess accounts)
 * - Enrolled groups with trainer info
 * - Live chess statistics and ratings from Lichess / Chess.com
 */
export async function getStudentProfileDataAction(): Promise<{
  success: boolean;
  data?: StudentProfileData;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Необходима авторизация' };
    }

    // 1. Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      return { success: false, error: 'Профиль пользователя не найден' };
    }

    const profile = profileData as Profile;

    // 2. Fetch joined groups
    const { data: memberRows, error: groupsError } = await supabase
      .from('group_members')
      .select(`
        id,
        joined_at,
        group_id,
        groups:group_id (
          id,
          name,
          description,
          invite_code,
          trainer_id,
          trainer:trainer_id (
            full_name,
            email
          )
        )
      `)
      .eq('student_id', user.id)
      .order('joined_at', { ascending: false });

    const groups: StudentGroupInfo[] = [];

    if (!groupsError && memberRows) {
      for (const row of memberRows) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawGroup = row.groups as any;
        if (rawGroup) {
          const trainerName =
            rawGroup.trainer?.full_name || rawGroup.trainer?.email || 'Тренер';
          groups.push({
            id: rawGroup.id,
            name: rawGroup.name,
            description: rawGroup.description || null,
            inviteCode: rawGroup.invite_code,
            trainerName,
            joinedAt: row.joined_at,
          });
        }
      }
    }

    // 3. Optionally fetch live chess stats if chess_username is configured
    let chessStats: UnifiedPlayerProfile | null = null;
    if (profile.chess_username && profile.chess_username.trim()) {
      try {
        const platform = profile.chess_platform || 'chesscom';
        chessStats = await getUnifiedPlayerProfile(
          profile.chess_username.trim(),
          platform,
        );
      } catch {
        // If external API has network hiccup, don't crash profile load
        chessStats = null;
      }
    }

    return {
      success: true,
      data: {
        profile,
        groups,
        chessStats,
      },
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Ошибка при загрузке профиля';
    return { success: false, error: message };
  }
}

/**
 * Update student profile info (full name, chess username, platform)
 */
export async function updateStudentProfileAction(payload: {
  fullName: string;
  chessUsername: string;
  chessPlatform: ChessPlatform;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Необходима авторизация' };
    }

    const trimmedName = payload.fullName.trim();
    if (!trimmedName) {
      return { success: false, error: 'Укажите имя' };
    }

    const trimmedChessUsername = payload.chessUsername.trim();

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: trimmedName,
        chess_username: trimmedChessUsername || null,
        chess_platform: trimmedChessUsername ? payload.chessPlatform : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Also sync chess_username into existing group memberships for this student
    if (trimmedChessUsername) {
      await supabase
        .from('group_members')
        .update({
          chess_username: trimmedChessUsername,
          chess_platform: payload.chessPlatform,
        })
        .eq('student_id', user.id);
    }

    revalidatePath('/');
    revalidatePath('/dashboard/trainer');
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Ошибка при обновлении профиля';
    return { success: false, error: message };
  }
}

/**
 * Join a trainer's group using an invite code
 */
export async function joinGroupByInviteCodeAction(
  rawInviteCode: string,
): Promise<{ success: boolean; groupName?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Необходима авторизация' };
    }

    const code = rawInviteCode.trim();
    if (!code) {
      return { success: false, error: 'Введите инвайт-код группы' };
    }

    // Find the group
    const { data: group, error: groupErr } = await supabase
      .from('groups')
      .select('id, name')
      .ilike('invite_code', code)
      .single();

    if (groupErr || !group) {
      return {
        success: false,
        error: 'Группа с таким инвайт-кодом не найдена. Проверьте правильность кода.',
      };
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('student_id', user.id)
      .maybeSingle();

    if (existingMember) {
      return {
        success: false,
        error: `Вы уже состоите в группе «${group.name}»`,
      };
    }

    // Fetch user profile for chess platform and username
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('chess_username, chess_platform')
      .eq('id', user.id)
      .single();

    const chessUsername =
      userProfile?.chess_username || user.email?.split('@')[0] || 'student';
    const chessPlatform = userProfile?.chess_platform || 'lichess';

    const { error: insertErr } = await supabase.from('group_members').insert({
      group_id: group.id,
      student_id: user.id,
      chess_username: chessUsername,
      chess_platform: chessPlatform,
    });

    if (insertErr) {
      return { success: false, error: insertErr.message };
    }

    revalidatePath('/');
    revalidatePath('/dashboard/trainer');
    return { success: true, groupName: group.name };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Ошибка при вступлении в группу';
    return { success: false, error: message };
  }
}

/**
 * Leave a group
 */
export async function leaveGroupAction(
  groupId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Необходима авторизация' };
    }

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('student_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Ошибка при выходе из группы';
    return { success: false, error: message };
  }
}
