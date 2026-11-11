import { Chess } from 'chess.js';
import { evaluatePositionHeuristic } from '@/lib/eval-parser';

export interface ScoreInfo {
  type: 'cp' | 'mate';
  value: number; // Centipawns (from perspective of side to move), or plies to mate (+ for winning, - for losing)
}

export interface EngineEvaluation {
  score: ScoreInfo;
  bestmove: string; // UCI format e.g. "e2e4"
  bestmoveSan?: string; // SAN format e.g. "e4"
  pv: string[]; // UCI format e.g. ["e2e4", "c7c5", "g1f3"]
  pvSan: string[]; // SAN format e.g. ["e4", "c5", "Nf3"]
  depth: number;
  source: 'stockfish' | 'lichess-cloud' | 'heuristic';
}

// Global hook for stockfish.js output listener
type OutputListener = (line: string) => void;
let globalListeners: OutputListener[] = [];
let isStockfishInitialized = false;

function ensureStockfish() {
  if (isStockfishInitialized) return;

  if (typeof globalThis !== 'undefined') {
    // Avoid Emscripten worker/importScripts detection in Node
    (globalThis as unknown as { importScripts?: unknown }).importScripts = undefined;

    (globalThis as unknown as { postMessage: (msg: string) => void }).postMessage = (
      msg: string,
    ) => {
      for (const listener of globalListeners) {
        try {
          listener(msg);
        } catch {
          // Ignore individual listener errors
        }
      }
    };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sfPath = require.resolve('stockfish.js/stockfish.js');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require(sfPath);
    isStockfishInitialized = true;

    const targetGlobal = globalThis as unknown as {
      onmessage?: (event: { data: string }) => void;
    };
    if (targetGlobal.onmessage) {
      targetGlobal.onmessage({ data: 'uci' });
      targetGlobal.onmessage({ data: 'ucinewgame' });
    }
  } catch (err) {
    console.error('Failed to load local stockfish.js:', err);
  }
}

/**
 * Normalizes UCI castling notations into standard algebraic squares
 * (e.g. e1h1 -> e1g1, e8h8 -> e8g8, e1a1 -> e1c1, e8a8 -> e8c8).
 */
function normalizeCastlingUci(
  chess: Chess,
  from: string,
  to: string,
): { from: string; to: string } {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const piece = chess.get(from as any);
    if (piece && piece.type === 'k') {
      if (from === 'e1' && to === 'h1') return { from: 'e1', to: 'g1' };
      if (from === 'e1' && to === 'a1') return { from: 'e1', to: 'c1' };
      if (from === 'e8' && to === 'h8') return { from: 'e8', to: 'g8' };
      if (from === 'e8' && to === 'a8') return { from: 'e8', to: 'c8' };
    }
  } catch {
    // ignore
  }
  return { from, to };
}

/**
 * Helper to convert a sequence of UCI moves into SAN given a starting FEN.
 * Handles castling normalization and prevents premature truncation of PV lines.
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

      const rawFrom = uci.slice(0, 2);
      const rawTo = uci.slice(2, 4);
      const promotion = uci[4] ? uci[4].toLowerCase() : undefined;

      const { from, to } = normalizeCastlingUci(tempChess, rawFrom, rawTo);

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
export async function fetchLichessCloudEval(fen: string): Promise<EngineEvaluation | null> {
  try {
    const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=1`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(600),
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
    // Convert to perspective of side to move.
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

export function runStockfishLocal(fen: string, depth = 8): Promise<EngineEvaluation> {
  ensureStockfish();

  return new Promise((resolve, reject) => {
    let lastInfoLine = '';
    const timeout = setTimeout(() => {
      globalListeners = globalListeners.filter((l) => l !== onLine);
      reject(new Error(`Stockfish timeout at depth ${depth}`));
    }, 3000);

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
 * Evaluates a single FEN position:
 * 1. Checks fast Lichess Cloud Eval first (depth 30-50).
 * 2. Runs local Stockfish engine (depth 10).
 * 3. Fallbacks to positional heuristic if local engine fails/times out.
 */
export async function evaluatePosition(
  fen: string,
  depth = 10,
): Promise<EngineEvaluation> {
  // 1. Try fast Lichess Cloud Eval first
  const cloudResult = await fetchLichessCloudEval(fen);
  if (cloudResult) {
    return cloudResult;
  }

  // 2. Queue local Stockfish run
  try {
    const runTask = () => runStockfishLocal(fen, depth);
    const queuedPromise = evaluationQueue.then(runTask, runTask);
    evaluationQueue = queuedPromise.catch(() => {});
    return await queuedPromise;
  } catch {
    // 3. Robust fallback: Positional/Material Heuristic (never return flat 0.00!)
    const heuristic = evaluatePositionHeuristic(fen);
    const isBlack = fen.split(' ')[1] === 'b';
    const valCp = Math.round(heuristic.score * 100);
    return {
      score: {
        type: heuristic.isCheckmate ? 'mate' : 'cp',
        value: isBlack ? -valCp : valCp,
      },
      bestmove: '',
      bestmoveSan: '',
      pv: [],
      pvSan: [],
      depth: 1,
      source: 'heuristic',
    };
  }
}
