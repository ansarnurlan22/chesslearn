import { createClient } from "@/lib/supabase/server";
import type {
  Profile,
  ProfileUpdate,
  Group,
  GroupMember,
  GroupWithMemberCount,
  GroupMemberWithProfile,
  ChessPlatform,
} from "@/types/auth";

// ─── Profile ────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("getProfile error:", error.message);
    return null;
  }
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: ProfileUpdate,
): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("updateProfile error:", error.message);
    return null;
  }
  return data as Profile;
}

// ─── Groups ─────────────────────────────────────────────────────────────

export async function getTrainerGroups(
  trainerId: string,
): Promise<GroupWithMemberCount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("groups")
    .select("*, group_members(count)")
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getTrainerGroups error:", error.message);
    return [];
  }

  return (data ?? []).map((g) => ({
    ...(g as unknown as Group),
    member_count:
      (g.group_members as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));
}

export async function createGroup(
  trainerId: string,
  name: string,
  description: string | null,
): Promise<Group | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("groups")
    .insert({ trainer_id: trainerId, name, description })
    .select()
    .single();

  if (error) {
    console.error("createGroup error:", error.message);
    return null;
  }
  return data as Group;
}

export async function deleteGroup(groupId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("groups").delete().eq("id", groupId);

  if (error) {
    console.error("deleteGroup error:", error.message);
    return false;
  }
  return true;
}

// ─── Group Members ──────────────────────────────────────────────────────

export async function getGroupMembers(
  groupId: string,
): Promise<GroupMemberWithProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_members")
    .select("*, profiles(email, full_name, avatar_url)")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("getGroupMembers error:", error.message);
    return [];
  }
  return (data ?? []) as unknown as GroupMemberWithProfile[];
}

export async function addGroupMember(
  groupId: string,
  studentId: string | null,
  chessUsername: string,
  chessPlatform: ChessPlatform,
): Promise<GroupMember | null> {
  const supabase = await createClient();
  const insertPayload: {
    group_id: string;
    chess_username: string;
    chess_platform: ChessPlatform;
    student_id?: string;
  } = {
    group_id: groupId,
    chess_username: chessUsername,
    chess_platform: chessPlatform,
  };
  if (studentId) {
    insertPayload.student_id = studentId;
  }

  const { data, error } = await supabase
    .from("group_members")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error("addGroupMember error:", error.message);
    return null;
  }
  return data as GroupMember;
}

export async function removeGroupMember(memberId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("id", memberId);

  if (error) {
    console.error("removeGroupMember error:", error.message);
    return false;
  }
  return true;
}

export async function joinGroupByCode(
  inviteCode: string,
  studentId: string,
  chessUsername: string,
  chessPlatform: ChessPlatform,
): Promise<GroupMember | null> {
  const supabase = await createClient();

  // Look up the group by invite code
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id")
    .eq("invite_code", inviteCode)
    .single();

  if (groupError || !group) {
    console.error("joinGroupByCode – group not found:", groupError?.message);
    return null;
  }

  return addGroupMember(group.id, studentId, chessUsername, chessPlatform);
}

export async function getStudentGroups(studentId: string): Promise<Group[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_members")
    .select("group_id, groups(*)")
    .eq("student_id", studentId)
    .order("joined_at", { ascending: false });

  if (error) {
    console.error("getStudentGroups error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.groups as unknown as Group);
}
