import type { LichessGame, LichessUserProfile } from '@/types/lichess';

const LICHESS_BASE = 'https://lichess.org/api';

export class LichessApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'LichessApiError';
  }
}

export async function fetchUserProfile(username: string): Promise<LichessUserProfile> {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    throw new LichessApiError(400, 'Имя пользователя не указано');
  }

  const response = await fetch(`${LICHESS_BASE}/user/${encodeURIComponent(cleanUsername)}`, {
    headers: {
      Accept: 'application/json',
    },
    next: { revalidate: 60 },
  });

  if (response.status === 404) {
    throw new LichessApiError(404, `Пользователь "${cleanUsername}" не найден на Lichess`);
  }

  if (!response.ok) {
    throw new LichessApiError(
      response.status,
      `Ошибка сервиса Lichess (${response.status}): ${response.statusText}`,
    );
  }

  const data: unknown = await response.json();
  return data as LichessUserProfile;
}

export async function fetchUserGames(
  username: string,
  count = 10,
): Promise<LichessGame[]> {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    return [];
  }

  const url = `${LICHESS_BASE}/games/user/${encodeURIComponent(cleanUsername)}?max=${count}&pgnInJson=true&opening=true`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/x-ndjson',
    },
    next: { revalidate: 60 },
  });

  if (response.status === 404) {
    throw new LichessApiError(404, `Пользователь "${cleanUsername}" не найден на Lichess`);
  }

  if (!response.ok) {
    throw new LichessApiError(
      response.status,
      `Ошибка при получении партий (${response.status}): ${response.statusText}`,
    );
  }

  const rawText = await response.text();
  const lines = rawText.trim().split('\n').filter((line) => line.trim().length > 0);

  const games: LichessGame[] = [];
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line) as LichessGame;
      games.push(parsed);
    } catch {
      // Ignore malformed NDJSON line
    }
  }

  return games;
}
