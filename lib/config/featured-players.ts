import type { ChessPlatform } from '@/lib/api/types';

export interface FeaturedPlayer {
  username: string;
  displayName: string;
  title?: string;
}

export const FEATURED_PLAYERS: Record<ChessPlatform, FeaturedPlayer[]> = {
  lichess: [
    { username: 'MagnusCarlsen', displayName: 'Magnus Carlsen', title: 'GM' },
    { username: 'nihalsarin2004', displayName: 'Nihal Sarin', title: 'GM' },
    { username: 'alireza2003', displayName: 'Alireza Firouzja', title: 'GM' },
    { username: 'Zhigalko_Sergei', displayName: 'Sergei Zhigalko', title: 'GM' },
    { username: 'dmitryandreikin', displayName: 'Dmitry Andreikin', title: 'GM' },
  ],
  chesscom: [
    { username: 'Hikaru', displayName: 'Hikaru Nakamura', title: 'GM' },
    { username: 'MagnusCarlsen', displayName: 'Magnus Carlsen', title: 'GM' },
    { username: 'GothamChess', displayName: 'Levy Rozman', title: 'IM' },
    { username: 'Firouzja2003', displayName: 'Alireza Firouzja', title: 'GM' },
    { username: 'FabianoCaruana', displayName: 'Fabiano Caruana', title: 'GM' },
  ],
};
