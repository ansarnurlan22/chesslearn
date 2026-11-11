'use server';

import { createClient } from '@/lib/supabase/server';
import {
  createGroup,
  deleteGroup,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  getAllProfiles,
  updateUserRole,
  deleteUserProfile,
} from '@/lib/api/supabase-queries';
import { getUnifiedPlayerProfile } from '@/lib/api/unified';
import type { ChessPlatform, Group, GroupMember, GroupMemberWithProfile, Profile, UserRole } from '@/types/auth';
import type { UnifiedPlayerProfile } from '@/lib/api/types';
import { revalidatePath } from 'next/cache';

export async function createGroupAction(
  name: string,
  description: string | null = null,
): Promise<{ success: boolean; group?: Group; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Необходима авторизация' };
    }

    if (!name.trim()) {
      return { success: false, error: 'Укажите название группы' };
    }

    const group = await createGroup(user.id, name.trim(), description?.trim() || null);
    if (!group) {
      return { success: false, error: 'Не удалось создать группу' };
    }

    revalidatePath('/dashboard/trainer');
    return { success: true, group };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ошибка при создании группы';
    return { success: false, error: message };
  }
}

export async function deleteGroupAction(
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

    const ok = await deleteGroup(groupId);
    if (!ok) {
      return { success: false, error: 'Не удалось удалить группу' };
    }

    revalidatePath('/dashboard/trainer');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ошибка при удалении группы';
    return { success: false, error: message };
  }
}

export async function addGroupMemberAction(
  groupId: string,
  chessUsername: string,
  chessPlatform: ChessPlatform,
): Promise<{ success: boolean; member?: GroupMember; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Необходима авторизация' };
    }

    const trimmedUsername = chessUsername.trim();
    if (!trimmedUsername) {
      return { success: false, error: 'Укажите никнейм шахматиста' };
    }

    // Check if the student already has an account on ChessCheese by searching profile
    const { data: matchedProfile } = await supabase
      .from('profiles')
      .select('id')
      .ilike('chess_username', trimmedUsername)
      .maybeSingle();

    const studentId = matchedProfile?.id ?? null;

    const member = await addGroupMember(
      groupId,
      studentId,
      trimmedUsername,
      chessPlatform,
    );

    if (!member) {
      return {
        success: false,
        error: 'Не удалось добавить ученика (возможно, он уже добавлен в эту группу)',
      };
    }

    revalidatePath('/dashboard/trainer');
    return { success: true, member };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ошибка при добавлении ученика';
    return { success: false, error: message };
  }
}

export async function removeGroupMemberAction(
  memberId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Необходима авторизация' };
    }

    const ok = await removeGroupMember(memberId);
    if (!ok) {
      return { success: false, error: 'Не удалось удалить ученика' };
    }

    revalidatePath('/dashboard/trainer');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ошибка при удалении ученика';
    return { success: false, error: message };
  }
}

export async function getGroupMembersAction(
  groupId: string,
): Promise<{ success: boolean; members: GroupMemberWithProfile[]; error?: string }> {
  try {
    const members = await getGroupMembers(groupId);
    return { success: true, members };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ошибка при загрузке учеников';
    return { success: false, members: [], error: message };
  }
}

export async function getStudentStatsAction(
  chessUsername: string,
  platform: ChessPlatform,
): Promise<{ success: boolean; profile?: UnifiedPlayerProfile; error?: string }> {
  try {
    const profile = await getUnifiedPlayerProfile(chessUsername.trim(), platform);
    return { success: true, profile };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Не удалось загрузить рейтинг игрока';
    return { success: false, error: message };
  }
}

export async function getAllProfilesAction(): Promise<{
  success: boolean;
  profiles: Profile[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, profiles: [], error: 'Необходима авторизация' };
    }

    const profiles = await getAllProfiles();
    return { success: true, profiles };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ошибка при загрузке пользователей';
    return { success: false, profiles: [], error: message };
  }
}

export async function updateUserRoleAction(
  targetUserId: string,
  newRole: UserRole,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Необходима авторизация' };
    }

    const ok = await updateUserRole(targetUserId, newRole);
    if (!ok) {
      return { success: false, error: 'Не удалось обновить роль пользователя' };
    }

    revalidatePath('/dashboard/trainer');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ошибка при обновлении роли';
    return { success: false, error: message };
  }
}

export async function deleteUserProfileAction(
  targetUserId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Необходима авторизация' };
    }

    const ok = await deleteUserProfile(targetUserId);
    if (!ok) {
      return { success: false, error: 'Не удалось удалить пользователя' };
    }

    revalidatePath('/dashboard/trainer');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ошибка при удалении';
    return { success: false, error: message };
  }
}
