'use client';

import { sfx } from '@/lib/sound-effects';
import { AlertCircle, Loader2, Zap } from 'lucide-react';
import { useState } from 'react';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const EXAMPLE_FENS = [
  { label: 'Начальная позиция', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
  { label: 'Испанская (8 ходов)', fen: 'r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 5' },
  { label: 'Эндшпиль Лукошко', fen: '8/5k2/3p4/1p1Pp2p/pP2Pp1P/P4P2/8/1K6 w - - 0 1' },
  { label: 'Мат в 1 (Белые)', fen: '7k/5ppp/8/8/8/8/5PPP/R6K w - - 0 1' },
];

interface AnalysisResult {
  eval: string;
  bestMove: string;
  line: string;
  depth: number;
}

export function FenAnalyzer() {
  const [fen, setFen] = useState(STARTING_FEN);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    sfx.playMove();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/fen-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, depth: 18 }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error((data.error as string | undefined) || `Ошибка ${res.status}`);
      }

      const data = await res.json() as {
        eval?: number | string;
        bestMove?: string;
        line?: string;
        depth?: number;
      };

      sfx.playSuccess();
      setResult({
        eval: data.eval !== undefined ? String(data.eval) : '0.0',
        bestMove: (data.bestMove as string | undefined) || '—',
        line: (data.line as string | undefined) || '',
        depth: (data.depth as number | undefined) || 0,
      });
    } catch (e) {
      sfx.playError();
      setError(e instanceof Error ? e.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const evalNum = result ? parseFloat(result.eval) : null;
  const evalColor =
    evalNum === null ? 'text-zinc-400'
    : evalNum > 0.5 ? 'text-green-400'
    : evalNum < -0.5 ? 'text-red-400'
    : 'text-yellow-400';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="font-pixel-sm text-[10px] text-zinc-300 uppercase tracking-wider">FEN-СТРОКА ПОЗИЦИИ</label>
        <textarea
          value={fen}
          onChange={e => setFen(e.target.value)}
          rows={3}
          className="w-full bg-[#161512] border-2 border-zinc-700/80 rounded-none px-3 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#81b64c] transition-all resize-none shadow-inner"
          placeholder="Вставьте FEN..."
          spellCheck={false}
        />
      </div>

      {/* Example FENs */}
      <div className="flex flex-col gap-2">
        <label className="font-pixel-sm text-[9px] text-zinc-500 uppercase tracking-wider">ПРИМЕРЫ</label>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_FENS.map(ex => (
            <button
              key={ex.label}
              type="button"
              onClick={() => {
                sfx.playMove();
                setFen(ex.fen);
                setResult(null);
                setError(null);
              }}
              className="pixel-btn text-[9px] px-2.5 py-1.5 cursor-pointer text-zinc-300 hover:text-white"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={analyze}
        disabled={loading || !fen.trim()}
        className="pixel-btn text-xs py-3 flex items-center justify-center gap-2 cursor-pointer bg-[#81b64c]/20 border-[#81b64c] text-white hover:bg-[#81b64c]/30 disabled:opacity-40"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-400" />}
        <span>{loading ? 'АНАЛИЗИРУЮ...' : 'АНАЛИЗИРОВАТЬ [ STOCKFISH ]'}</span>
      </button>

      {error && (
        <div className="pixel-card p-4 border-red-500/60 bg-red-950/30 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span className="text-red-400 text-xs font-mono">{error}</span>
        </div>
      )}

      {result && (
        <div className="pixel-card p-5 flex flex-col gap-4">
          <div className="font-pixel-sm text-[10px] text-zinc-400 uppercase tracking-wider">РЕЗУЛЬТАТ АНАЛИЗА</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-pixel-sm text-[9px] text-zinc-500">STOCKFISH 19 LITE</span>
              <span className={`font-pixel-sm text-xl ${evalColor}`}>
                {evalNum !== null && evalNum > 0 ? '+' : ''}{result.eval}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">глубина {result.depth}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-pixel-sm text-[9px] text-zinc-500">ЛУЧШИЙ ХОД</span>
              <span className="font-pixel-sm text-xl text-white font-mono">{result.bestMove}</span>
            </div>
          </div>
          {result.line && (
            <div className="pt-3 border-t-2 border-zinc-800">
              <div className="font-pixel-sm text-[9px] text-zinc-500 mb-2">ВАРИАНТ</div>
              <div className="text-xs font-mono text-zinc-300 leading-relaxed break-words">{result.line}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
