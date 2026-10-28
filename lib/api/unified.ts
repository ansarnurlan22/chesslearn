import { fetchUserGames, fetchUserProfile, LichessApiError } from '@/lib/api/lichess';
import type { ChessPlatform, UnifiedGame, UnifiedPlayerProfile } from '@/lib/api/types';

const CHESSCOM_BASE = 'https://api.chess.com/pub';
const USER_AGENT = 'ChessCheese-App/1.0 (contact: user@chesscheese.dev)';

export class PlatformApiError extends Error {
  constructor(
    public readonly platform: ChessPlatform,
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'PlatformApiError';
  }
}

interface ChessComRawPlayer {
  avatar?: string;
  name?: string;
  username: string;
  title?: string;
  status?: string;
  url?: string;
  last_online?: number;
}

interface ChessComRawStats {
  chess_blitz?: {
    last?: { rating: number };
    record?: { win: number; loss: number; draw: number };
  };
  chess_rapid?: {
    last?: { rating: number };
    record?: { win: number; loss: number; draw: number };
  };
  chess_bullet?: {
    last?: { rating: number };
    record?: { win: number; loss: number; draw: number };
  };
  chess_daily?: {
    last?: { rating: number };
    record?: { win: number; loss: number; draw: number };
  };
}

interface ChessComRawGamePlayer {
  rating: number;
  result: string;
  username: string;
}

interface ChessComRawGame {
  url: string;
  pgn?: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  time_class: string;
  white: ChessComRawGamePlayer;
  black: ChessComRawGamePlayer;
}

function extractOpeningFromPgn(pgn?: string): string | undefined {
  if (!pgn) return undefined;

  // Try ECOUrl tag: [ECOUrl "https://www.chess.com/openings/Sicilian-Defense-..."]
  const ecoUrlMatch = pgn.match(/\[ECOUrl\s+"https?:\/\/[^/]+\/openings\/([^"]+)"\]/i);
  if (ecoUrlMatch?.[1]) {
    const raw = ecoUrlMatch[1].replace(/[-_]+/g, ' ').trim();
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  // Try Opening tag: [Opening "Sicilian Defense, Najdorf"]
  const openingMatch = pgn.match(/\[Opening\s+"([^"]+)"\]/i);
  if (openingMatch?.[1]) {
    return openingMatch[1];
  }

  return undefined;
}

function parseChessComResult(userResult: string, opponentResult: string): 'win' | 'loss' | 'draw' {
  if (userResult === 'win') return 'win';
  if (opponentResult === 'win') return 'loss';

  const lossReasons = ['checkmated', 'resigned', 'timeout', 'abandoned', 'lose'];
  if (lossReasons.includes(userResult)) return 'loss';

  return 'draw';
}

function formatGameDate(timestampMs: number): string {
  try {
    return new Date(timestampMs).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Fetch and adapt player data from Lichess
 */
async function fetchLichessUnified(username: string): Promise<UnifiedPlayerProfile> {
  try {
    const [profile, games] = await Promise.all([
      fetchUserProfile(username),
      fetchUserGames(username, 10),
    ]);

    const recentGames: UnifiedGame[] = games.map((game) => {
      const isWhite =
        game.players.white.user?.id.toLowerCase() === profile.id.toLowerCase();
      const opponent = isWhite ? game.players.black : game.players.white;
      const userColor = isWhite ? 'white' : 'black';

      let result: 'win' | 'loss' | 'draw' = 'draw';
      if (game.winner === userColor) {
        result = 'win';
      } else if (game.winner) {
        result = 'loss';
      }

      return {
        id: game.id,
        pgn: game.pgn ?? '',
        moves: game.moves,
        timeControl: game.speed,
        result,
        opponent: opponent.user?.name ?? 'Аноним',
        opponentRating: opponent.rating,
        white: isWhite,
        date: formatGameDate(game.createdAt),
        opening: game.opening?.name,
        url: `https://lichess.org/${game.id}`,
      };
    });

    return {
      platform: 'lichess',
      username: profile.username,
      title: profile.title,
      online: profile.online,
      profileUrl: `https://lichess.org/@/${profile.username}`,
      ratings: {
        blitz: profile.perfs.blitz?.rating,
        rapid: profile.perfs.rapid?.rating,
        bullet: profile.perfs.bullet?.rating,
        classical: profile.perfs.classical?.rating,
      },
      record: {
        win: profile.count.win,
        loss: profile.count.loss,
        draw: profile.count.draw,
      },
      recentGames,
    };
  } catch (err: unknown) {
    if (err instanceof LichessApiError) {
      throw new PlatformApiError('lichess', err.status, err.message);
    }
    const message = err instanceof Error ? err.message : 'Ошибка Lichess API';
    throw new PlatformApiError('lichess', 500, message);
  }
}

/**
 * Fetch and adapt player data from Chess.com
 */
async function fetchChessComUnified(username: string): Promise<UnifiedPlayerProfile> {
  const cleanUsername = username.trim().toLowerCase();
  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'application/json',
  };

  // 1. Fetch Profile and Stats concurrently
  const [profileRes, statsRes] = await Promise.all([
    fetch(`${CHESSCOM_BASE}/player/${encodeURIComponent(cleanUsername)}`, {
      headers,
      next: { revalidate: 60 },
    }),
    fetch(`${CHESSCOM_BASE}/player/${encodeURIComponent(cleanUsername)}/stats`, {
      headers,
      next: { revalidate: 60 },
    }),
  ]);

  if (profileRes.status === 404) {
    throw new PlatformApiError(
      'chesscom',
      404,
      `Пользователь "${username}" не найден на Chess.com`,
    );
  }

  if (!profileRes.ok) {
    throw new PlatformApiError(
      'chesscom',
      profileRes.status,
      `Ошибка Chess.com API: ${profileRes.statusText}`,
    );
  }

  const playerData: ChessComRawPlayer = await profileRes.json();
  const statsData: ChessComRawStats = statsRes.ok ? await statsRes.json() : {};

  // Aggregate win/loss/draw
  let win = 0;
  let loss = 0;
  let draw = 0;
  const statCategories = [
    statsData.chess_blitz,
    statsData.chess_rapid,
    statsData.chess_bullet,
    statsData.chess_daily,
  ];

  for (const cat of statCategories) {
    if (cat?.record) {
      win += cat.record.win ?? 0;
      loss += cat.record.loss ?? 0;
      draw += cat.record.draw ?? 0;
    }
  }

  // 2. Fetch Archives to get recent games
  let rawGames: ChessComRawGame[] = [];
  try {
    const archivesRes = await fetch(
      `${CHESSCOM_BASE}/player/${encodeURIComponent(cleanUsername)}/games/archives`,
      { headers, next: { revalidate: 60 } },
    );

    if (archivesRes.ok) {
      const archivesData = await archivesRes.json();
      const archives: string[] = Array.isArray(archivesData.archives)
        ? archivesData.archives
        : [];

      // Iterate backwards to find latest month with actual games
      for (let i = archives.length - 1; i >= 0; i--) {
        const archiveUrl = archives[i];
        try {
          const monthRes = await fetch(archiveUrl, {
            headers,
            next: { revalidate: 60 },
          });
          if (monthRes.ok) {
            const monthData = await monthRes.json();
            if (Array.isArray(monthData.games) && monthData.games.length > 0) {
              rawGames = monthData.games;
              break;
            }
          }
        } catch {
          // Continue to previous archive
        }
      }
    }
  } catch {
    // If archive fails, we still return profile without games
  }

  // Take the 10 most recent games (reverse so newest is first)
  const recentRawGames = rawGames.slice(-10).reverse();

  const recentGames: UnifiedGame[] = recentRawGames.map((game) => {
    const isWhite = game.white.username.toLowerCase() === cleanUsername;
    const userResult = isWhite ? game.white.result : game.black.result;
    const opponentResult = isWhite ? game.black.result : game.white.result;
    const opponent = isWhite ? game.black : game.white;

    // Game ID from URL (e.g. https://www.chess.com/game/live/184627853334 -> 184627853334)
    const urlParts = game.url.split('/');
    const id = urlParts[urlParts.length - 1] || String(game.end_time);

    return {
      id,
      pgn: game.pgn ?? '',
      timeControl: game.time_class || game.time_control,
      result: parseChessComResult(userResult, opponentResult),
      opponent: opponent.username,
      opponentRating: opponent.rating,
      white: isWhite,
      date: formatGameDate(game.end_time * 1000),
      opening: extractOpeningFromPgn(game.pgn),
      url: game.url,
    };
  });

  return {
    platform: 'chesscom',
    username: playerData.username,
    name: playerData.name,
    title: playerData.title,
    avatarUrl: playerData.avatar,
    profileUrl: playerData.url ?? `https://www.chess.com/member/${playerData.username}`,
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
    recentGames,
  };
}

/**
 * Universal Unified Adapter for Lichess and Chess.com
 */
export async function getUnifiedPlayerProfile(
  username: string,
  platform: ChessPlatform = 'lichess',
): Promise<UnifiedPlayerProfile> {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    throw new PlatformApiError(platform, 400, 'Имя пользователя не указано');
  }

  if (platform === 'chesscom') {
    return fetchChessComUnified(cleanUsername);
  }

  return fetchLichessUnified(cleanUsername);
}
