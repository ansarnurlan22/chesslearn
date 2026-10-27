import { ChessDashboard } from '@/components/chess-dashboard';
import type { ChessPlatform, UnifiedPlayerProfile } from '@/lib/api/types';
import { getUnifiedPlayerProfile, PlatformApiError } from '@/lib/api/unified';
import { Suspense } from 'react';

interface PageProps {
  searchParams: Promise<{ u?: string; p?: string }>;
}

async function DashboardContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const username = params?.u?.trim();
  const rawPlatform = params?.p?.trim().toLowerCase();
  const platform: ChessPlatform = rawPlatform === 'chesscom' ? 'chesscom' : 'lichess';

  let profile: UnifiedPlayerProfile | null = null;
  let errorMessage: string | null = null;

  if (username) {
    try {
      profile = await getUnifiedPlayerProfile(username, platform);
    } catch (err: unknown) {
      if (err instanceof PlatformApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'Произошла непредвиденная ошибка при запросе данных.';
      }
    }
  }

  return (
    <ChessDashboard
      initialUsername={username ?? ''}
      initialPlatform={platform}
      profile={profile}
      error={errorMessage}
    />
  );
}

export default function Home({ searchParams }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#161512] flex flex-col items-center justify-center py-24 gap-3 text-zinc-400">
          <div className="w-8 h-8 rounded-full border-2 border-[#81b64c]/30 border-t-[#81b64c] animate-spin" />
          <span className="text-sm">Загрузка шахматных данных...</span>
        </div>
      }
    >
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}
