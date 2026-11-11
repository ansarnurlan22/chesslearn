import { TrainerDashboard } from '@/components/trainer-dashboard';
import { getProfile, getTrainerGroups } from '@/lib/api/supabase-queries';
import { createClient } from '@/lib/supabase/server';
import type { GroupWithMemberCount, Profile } from '@/types/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TrainerDashboardPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured =
    supabaseUrl &&
    supabaseUrl.trim() !== '' &&
    !supabaseUrl.includes('placeholder.supabase.co');

  let initialGroups: GroupWithMemberCount[] = [];
  let userProfile: Profile | null = null;

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        redirect('/auth');
      }

      userProfile = await getProfile(user.id);
      initialGroups = await getTrainerGroups(user.id);
    } catch {
      // In case of network/config error
    }
  } else {
    // Demo groups for local preview before Supabase is connected
    initialGroups = [
      {
        id: 'demo-group-1',
        trainer_id: 'demo-trainer',
        name: 'ЦШК Астана — Юношеский разряд (10-12 лет)',
        description: 'Партии с воскресных турниров и домашние разборы по вторникам.',
        invite_code: 'ASTANA01',
        created_at: new Date().toISOString(),
        member_count: 5,
      },
      {
        id: 'demo-group-2',
        trainer_id: 'demo-trainer',
        name: 'Академия Садвакасова — Продвинутые',
        description: 'Подготовка к чемпионату Казахстана по рапиду.',
        invite_code: 'DARMEN24',
        created_at: new Date().toISOString(),
        member_count: 3,
      },
    ];

    userProfile = {
      id: 'demo-trainer',
      email: 'trainer@astana-chess.kz',
      full_name: 'Шахматный тренер (Астана)',
      role: 'trainer',
      chess_username: 'AstanaCoach',
      chess_platform: 'chesscom',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return (
    <TrainerDashboard
      initialGroups={initialGroups}
      profile={userProfile}
    />
  );
}
