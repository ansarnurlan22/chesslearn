import { NextResponse } from 'next/server';

interface FenAnalyzeBody {
  fen?: string;
  depth?: number;
}

interface LichessCloudEval {
  pvs?: Array<{ moves: string; cp?: number; mate?: number }>;
  depth?: number;
}

function cpToEval(cp: number): string {
  return (cp / 100).toFixed(2);
}

export async function POST(request: Request) {
  let body: FenAnalyzeBody = {};
  try {
    body = await request.json() as FenAnalyzeBody;
  } catch {
    // ignore parse error
  }

  const { fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', depth = 18 } = body;

  // Try Lichess Cloud Eval first (fast, free)
  try {
    const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=1`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json() as LichessCloudEval;
      const pv = data.pvs?.[0];
      if (pv) {
        const moves = pv.moves?.split(' ') ?? [];
        const bestMove = moves[0] ?? '—';
        const evalStr =
          pv.mate !== undefined && pv.mate !== null
            ? `M${pv.mate}`
            : cpToEval(pv.cp ?? 0);
        return NextResponse.json({
          eval: evalStr,
          bestMove,
          line: moves.slice(0, 10).join(' '),
          depth: data.depth ?? depth,
          source: 'lichess-cloud',
        });
      }
    }
  } catch {
    // fall through to Stockfish server-side
  }

  // Fallback: return a minimal response indicating we tried
  return NextResponse.json(
    { error: 'Не удалось получить оценку позиции. Lichess Cloud Eval недоступен.' },
    { status: 503 },
  );
}
