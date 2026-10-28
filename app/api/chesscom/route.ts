import { NextRequest, NextResponse } from 'next/server';

const USER_AGENT = 'ChessCheese-App/1.0 (contact: user@chesscheese.dev)';
const CHESSCOM_BASE = 'https://api.chess.com/pub';

interface ChessComStatsRating {
  last?: { rating: number; date: number; rd: number };
  best?: { rating: number; date: number; game?: string };
  record?: { win: number; loss: number; draw: number };
}

interface ChessComStatsResponse {
  chess_blitz?: ChessComStatsRating;
  chess_rapid?: ChessComStatsRating;
  chess_bullet?: ChessComStatsRating;
  chess_daily?: ChessComStatsRating;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.trim();
  const type = searchParams.get('type')?.trim();

  if (!username) {
    return NextResponse.json(
      { error: 'Параметр username обязателен' },
      { status: 400 },
    );
  }

  const cleanUsername = username.toLowerCase();
  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'application/json',
  };

  try {
    if (type === 'profile') {
      // 1. Fetch player profile and stats concurrently
      const [playerRes, statsRes] = await Promise.all([
        fetch(`${CHESSCOM_BASE}/player/${encodeURIComponent(cleanUsername)}`, {
          headers,
          next: { revalidate: 60 },
        }),
        fetch(`${CHESSCOM_BASE}/player/${encodeURIComponent(cleanUsername)}/stats`, {
          headers,
          next: { revalidate: 60 },
        }),
      ]);

      if (playerRes.status === 404) {
        return NextResponse.json(
          { error: `Пользователь "${username}" не найден на Chess.com` },
          { status: 404 },
        );
      }

      if (!playerRes.ok) {
        return NextResponse.json(
          { error: `Ошибка Chess.com API: ${playerRes.statusText}` },
          { status: playerRes.status },
        );
      }

      const playerData = await playerRes.json();
      const statsData: ChessComStatsResponse = statsRes.ok ? await statsRes.json() : {};

      // Aggregate record
      let win = 0;
      let loss = 0;
      let draw = 0;

      const formats: Array<ChessComStatsRating | undefined> = [
        statsData.chess_blitz,
        statsData.chess_rapid,
        statsData.chess_bullet,
        statsData.chess_daily,
      ];

      for (const fmt of formats) {
        if (fmt?.record) {
          win += fmt.record.win ?? 0;
          loss += fmt.record.loss ?? 0;
          draw += fmt.record.draw ?? 0;
        }
      }

      return NextResponse.json({
        username: playerData.username ?? username,
        name: playerData.name,
        title: playerData.title,
        avatarUrl: playerData.avatar,
        status: playerData.status,
        url: playerData.url,
        ratings: {
          blitz: statsData.chess_blitz?.last?.rating,
          rapid: statsData.chess_rapid?.last?.rating,
          bullet: statsData.chess_bullet?.last?.rating,
        },
        record: {
          win,
          loss,
          draw,
        },
      });
    }

    if (type === 'games') {
      // 1. Fetch archives list
      const archivesRes = await fetch(
        `${CHESSCOM_BASE}/player/${encodeURIComponent(cleanUsername)}/games/archives`,
        { headers, next: { revalidate: 60 } },
      );

      if (archivesRes.status === 404) {
        return NextResponse.json(
          { error: `Пользователь "${username}" не найден на Chess.com` },
          { status: 404 },
        );
      }

      if (!archivesRes.ok) {
        return NextResponse.json(
          { error: `Ошибка при получении архивов Chess.com: ${archivesRes.statusText}` },
          { status: archivesRes.status },
        );
      }

      const archivesData = await archivesRes.json();
      const archivesList: string[] = Array.isArray(archivesData.archives)
        ? archivesData.archives
        : [];

      if (archivesList.length === 0) {
        return NextResponse.json({ games: [] });
      }

      // 2. Fetch from the latest available month with games
      let collectedGames: unknown[] = [];

      for (let i = archivesList.length - 1; i >= 0; i--) {
        const archiveUrl = archivesList[i];
        try {
          const monthRes = await fetch(archiveUrl, {
            headers,
            next: { revalidate: 60 },
          });

          if (monthRes.ok) {
            const monthData = await monthRes.json();
            if (Array.isArray(monthData.games) && monthData.games.length > 0) {
              collectedGames = monthData.games;
              break;
            }
          }
        } catch {
          // Continue to previous archive if one fails
        }
      }

      // Take the last 10 games (newest first)
      const last10 = collectedGames.slice(-10).reverse();

      return NextResponse.json({ games: last10 });
    }

    return NextResponse.json(
      { error: 'Параметр type должен быть "profile" или "games"' },
      { status: 400 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Внутренняя ошибка прокси';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
