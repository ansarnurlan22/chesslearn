import { Chess } from 'chess.js';

export interface ScoreInfo {
  type: 'cp' | 'mate';
  value: number; // Centipawns (from the perspective of the side to move), or moves until mate
}

export interface EngineEvaluation {
  score: ScoreInfo;
  bestmove: string; // UCI format e.g. "e2e4"
  bestmoveSan?: string; // SAN format e.g. "e4"
  pv: string[]; // UCI format e.g. ["e2e4", "c7c5", "g1f3"]
  pvSan: string[]; // SAN format e.g. ["e4", "c5", "Nf3"]
  depth: number;
  source: 'stockfish' | 'lichess-cloud';
}

// Global hook for stockfish.js output listener
type OutputListener = (line: string) => void;
let globalListeners: OutputListener[] = [];
let isStockfishInitialized = false;

function ensureStockfish() {
  if (isStockfishInitialized) return;
  if (typeof globalThis !== 'undefined') {
    (globalThis as unknown as { postMessage: (msg: string) => void }).postMessage = (
      msg: string,
    ) => {
      for (const listener of globalListeners) {
        try {
          listener(msg);
        } catch {
          // ignore individual listener errors
        }
      }
    };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('stockfish.js/stockfish.js');
    isStockfishInitialized = true;
  } catch (err) {
    console.error('Failed to load stockfish.js:', err);
  }
}

/**
 * Helper to convert a sequence of UCI moves into SAN given a starting FEN
 */
export function convertUciMovesToSan(
  fen: string,
  uciMoves: string[],
): { bestmoveSan: string; pvSan: string[] } {
  try {
    const tempChess = new Chess(fen);
    const pvSan: string[] = [];
    let bestmoveSan = uciMoves[0] || '';

    for (let i = 0; i < uciMoves.length; i++) {
      const uci = uciMoves[i];
      if (!uci || uci.length < 4) break;
      const from = uci.slice(0, 2);
      const to = uci.slice(2, 4);
      const promotion = uci[4] ? uci[4].toLowerCase() : undefined;

      try {
        const moveResult = tempChess.move({ from, to, promotion });
        if (moveResult) {
          pvSan.push(moveResult.san);
          if (i === 0) {
            bestmoveSan = moveResult.san;
          }
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    return { bestmoveSan, pvSan };
  } catch {
    return {
      bestmoveSan: uciMoves[0] || '',
      pvSan: uciMoves,
    };
  }
}

/**
 * Fast query to Lichess Cloud Eval API
 */
async function fetchLichessCloudEval(fen: string): Promise<EngineEvaluation | null> {
  try {
    const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=1`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(1200),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      depth?: number;
      pvs?: Array<{ moves?: string; cp?: number; mate?: number }>;
    };

    if (!data.pvs || data.pvs.length === 0) return null;
    const pvItem = data.pvs[0];
    const uciMoves = (pvItem.moves || '').trim().split(/\s+/).filter(Boolean);
    if (uciMoves.length === 0) return null;

    const isBlack = fen.split(' ')[1] === 'b';
    let type: 'cp' | 'mate' = 'cp';
    let value = 0;

    // Lichess Cloud Eval returns scores from White's perspective.
    // Convert to the perspective of the side to move (standard UCI engine convention).
    if (typeof pvItem.cp === 'number') {
      type = 'cp';
      value = isBlack ? -pvItem.cp : pvItem.cp;
    } else if (typeof pvItem.mate === 'number') {
      type = 'mate';
      value = isBlack ? -pvItem.mate : pvItem.mate;
    }

    const pvSlice = uciMoves.slice(0, 5);
    const { bestmoveSan, pvSan } = convertUciMovesToSan(fen, pvSlice);

    return {
      score: { type, value },
      bestmove: uciMoves[0],
      bestmoveSan,
      pv: pvSlice,
      pvSan,
      depth: data.depth || 30,
      source: 'lichess-cloud',
    };
  } catch {
    return null;
  }
}

// Queue for sequential Stockfish execution
let evaluationQueue: Promise<unknown> = Promise.resolve();

function runStockfishLocal(fen: string, depth = 12): Promise<EngineEvaluation> {
  ensureStockfish();

  return new Promise((resolve, reject) => {
    let lastInfoLine = '';
    const timeout = setTimeout(() => {
      globalListeners = globalListeners.filter((l) => l !== onLine);
      reject(new Error(`Stockfish timeout at depth ${depth}`));
    }, 6000);

    const onLine: OutputListener = (line: string) => {
      if (typeof line !== 'string') return;

      if (line.startsWith('info') && (line.includes('score cp') || line.includes('score mate'))) {
        lastInfoLine = line;
      }

      if (line.startsWith('bestmove')) {
        clearTimeout(timeout);
        globalListeners = globalListeners.filter((l) => l !== onLine);

        const parts = line.split(/\s+/);
        const bestmove = parts[1] || '';

        let score: ScoreInfo = { type: 'cp', value: 0 };
        let pv: string[] = bestmove ? [bestmove] : [];

        if (lastInfoLine) {
          const mateMatch = lastInfoLine.match(/score mate (-?\d+)/);
          const cpMatch = lastInfoLine.match(/score cp (-?\d+)/);

          if (mateMatch) {
            score = { type: 'mate', value: parseInt(mateMatch[1], 10) };
          } else if (cpMatch) {
            score = { type: 'cp', value: parseInt(cpMatch[1], 10) };
          }

          // Match principal variation moves after " pv "
          const pvMatch = lastInfoLine.match(/\s\bpv\s+([a-h1-8\s]+)/);
          if (pvMatch && pvMatch[1]) {
            pv = pvMatch[1].trim().split(/\s+/).slice(0, 5);
          }
        }

        const { bestmoveSan, pvSan } = convertUciMovesToSan(fen, pv);

        resolve({
          score,
          bestmove,
          bestmoveSan,
          pv,
          pvSan,
          depth,
          source: 'stockfish',
        });
      }
    };

    globalListeners.push(onLine);

    const targetGlobal = globalThis as unknown as {
      onmessage?: (event: { data: string }) => void;
    };

    if (targetGlobal.onmessage) {
      targetGlobal.onmessage({ data: 'ucinewgame' });
      targetGlobal.onmessage({ data: `position fen ${fen}` });
      targetGlobal.onmessage({ data: `go depth ${depth}` });
    } else {
      clearTimeout(timeout);
      globalListeners = globalListeners.filter((l) => l !== onLine);
      reject(new Error('Stockfish onmessage handler not found'));
    }
  });
}

/**
 * Main evaluation function:
 * 1. Checks Lichess Cloud Eval for instant high-depth evaluation.
 * 2. Fallbacks to local Stockfish engine with depth.
 */
export async function evaluatePosition(
  fen: string,
  depth = 12,
): Promise<EngineEvaluation> {
  // 1. Try fast Lichess Cloud Eval first
  const cloudResult = await fetchLichessCloudEval(fen);
  if (cloudResult) {
    return cloudResult;
  }

  // 2. Queue local Stockfish run
  const runTask = () => runStockfishLocal(fen, depth);
  const queuedPromise = evaluationQueue.then(runTask, runTask);
  evaluationQueue = queuedPromise.catch(() => {});
  return queuedPromise;
}
