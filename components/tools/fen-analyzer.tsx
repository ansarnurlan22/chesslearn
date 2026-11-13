'use client';

import { useState } from 'react';
import { Loader2, Zap, AlertCircle } from 'lucide-react';

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

      setResult({
        eval: data.eval !== undefined ? String(data.eval) : '0.0',
        bestMove: (data.bestMove as string | undefined) || '—',
        line: (data.line as string | undefined) || '',
        depth: (data.depth as number | undefined) || 0,
      });
    } catch (e) {
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
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">FEN-строка позиции</label>
        <textarea
          value={fen}
          onChange={e => setFen(e.target.value)}
          rows={3}
          className="w-full bg-[#161512] border border-[#302e2b] rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[#a855f7]/60 focus:ring-1 focus:ring-[#a855f7]/30 transition-all resize-none placeholder:text-zinc-600"
          placeholder="Вставьте FEN..."
          spellCheck={false}
        />
      </div>

      {/* Example FENs */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Примеры</label>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_FENS.map(ex => (
            <button
              key={ex.label}
              type="button"
              onClick={() => { setFen(ex.fen); setResult(null); setError(null); }}
              className="px-3 py-1.5 rounded-lg border border-[#302e2b] bg-[#161512] hover:bg-[#211f1c] text-zinc-400 hover:text-white text-xs font-medium transition-all cursor-pointer"
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
        className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#a855f7]/40 bg-[#a855f7]/15 hover:bg-[#a855f7]/25 text-[#a855f7] font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
        {loading ? 'Анализирую...' : 'Анализировать позицию'}
      </button>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/40 bg-red-500/10">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {result && (
        <div className="border border-[#302e2b] rounded-xl bg-[#161512] p-5 flex flex-col gap-4">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Результат анализа</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500">Оценка Stockfish 19 Lite</span>
              <span className={`text-3xl font-bold font-mono ${evalColor}`}>
                {evalNum !== null && evalNum > 0 ? '+' : ''}{result.eval}
              </span>
              <span className="text-xs text-zinc-600">глубина {result.depth}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500">Лучший ход</span>
              <span className="text-2xl font-bold text-white font-mono">{result.bestMove}</span>
            </div>
          </div>
          {result.line && (
            <div className="pt-3 border-t border-[#302e2b]">
              <div className="text-xs text-zinc-500 mb-2">Вариант</div>
              <div className="text-xs font-mono text-zinc-300 leading-relaxed break-words">{result.line}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
