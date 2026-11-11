/**
 * Auth & database types matching the Supabase schema in lib/supabase/schema.sql.
 */

export type UserRole = "student" | "trainer";

export type ChessPlatform = "lichess" | "chesscom";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  chess_username: string | null;
  chess_platform: ChessPlatform | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  trainer_id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  student_id: string | null;
  chess_username: string;
  chess_platform: ChessPlatform;
  joined_at: string;
}

/** Group with an aggregated member count (used in trainer dashboard). */
export interface GroupWithMemberCount extends Group {
  member_count: number;
}

/** Group member with the student's profile info joined in. */
export interface GroupMemberWithProfile extends GroupMember {
  profiles: Pick<Profile, "email" | "full_name" | "avatar_url"> | null;
}

/** Partial update payload for a profile. */
export type ProfileUpdate = Partial<
  Pick<
    Profile,
    "full_name" | "chess_username" | "chess_platform" | "avatar_url" | "role"
  >
>;
