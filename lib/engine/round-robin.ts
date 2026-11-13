/**
 * FIDE Berger Table Round Robin Pairing Generator
 * Supports 3 to 20 players, single and double round robin.
 */

export interface Pairing {
  board: number;
  white: string;
  black: string;
}

export interface Round {
  roundNumber: number;
  pairings: Pairing[];
  byePlayer?: string;
}

export function generateRoundRobin(
  playerNames: string[],
  isDoubleRound = false,
): { rounds: Round[]; totalGames: number } {
  const cleanPlayers = playerNames.map((p) => p.trim()).filter(Boolean);
  if (cleanPlayers.length < 2) {
    return { rounds: [], totalGames: 0 };
  }

  // If odd, add a dummy 'BYE' player
  const hasBye = cleanPlayers.length % 2 !== 0;
  const players = [...cleanPlayers];
  if (hasBye) {
    players.push('BYE');
  }

  const n = players.length;
  const roundsCount = n - 1;
  const half = n / 2;

  const rounds: Round[] = [];

  // Berger circle algorithm
  const list = [...players];

  for (let r = 0; r < roundsCount; r++) {
    const pairings: Pairing[] = [];
    let byePlayer: string | undefined;

    for (let i = 0; i < half; i++) {
      const p1 = list[i];
      const p2 = list[n - 1 - i];

      // Alternate colors per round for board 1
      let white = i === 0 && r % 2 === 1 ? p2 : p1;
      let black = i === 0 && r % 2 === 1 ? p1 : p2;

      // Other boards alternate by index
      if (i > 0) {
        if (i % 2 === 1) {
          const temp = white;
          white = black;
          black = temp;
        }
      }

      if (white === 'BYE') {
        byePlayer = black;
      } else if (black === 'BYE') {
        byePlayer = white;
      } else {
        pairings.push({
          board: pairings.length + 1,
          white,
          black,
        });
      }
    }

    rounds.push({
      roundNumber: r + 1,
      pairings,
      byePlayer,
    });

    // Rotate elements except index 0
    const fixed = list[0];
    const rest = list.slice(1);
    const last = rest.pop()!;
    rest.unshift(last);
    list.splice(0, list.length, fixed, ...rest);
  }

  // If double round robin, append second cycle with reversed colors
  if (isDoubleRound) {
    const secondCycle: Round[] = rounds.map((r, idx) => ({
      roundNumber: roundsCount + idx + 1,
      pairings: r.pairings.map((p) => ({
        board: p.board,
        white: p.black,
        black: p.white,
      })),
      byePlayer: r.byePlayer,
    }));
    rounds.push(...secondCycle);
  }

  const totalGames = rounds.reduce((sum, r) => sum + r.pairings.length, 0);

  return { rounds, totalGames };
}
