'use client';

import { useState } from 'react';
import { Loader2, FileText, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import type { GameReviewData } from '@/types/review';

const EXAMPLE_PGN = `[Event "Casual Game"]
[White "PlayerA"]
[Black "PlayerB"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O dxc3
8. Qb3 Qf6 9. e5 Qg6 10. Nxc3 Nge7 11. Ba3 b5 12. Nxb5 Rb8 13. Nxa5 Nxa5
14. Qxa5 Rxb2 15. Rfb1 Qf5 16. Rxb2 1-0`;

interface StatsBox {
  label: string;
  white: number;
  black: number;
  color: string;
}

export function PgnAnalyzer() {
  const [pgn, setPgn] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GameReviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pgn, playerColor: 'white', username: 'Анализ' }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error((data.error as string | undefined) || `Ошибка ${res.status}`);
      }

      const data = await res.json() as GameReviewData;
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const statsBoxes: StatsBox[] = result ? [
    { label: 'Точность', white: result.accuracy.white, black: result.accuracy.black, color: 'text-blue-400' },
    { label: 'Лучших ходов', white: result.stats?.white.best ?? 0, black: result.stats?.black.best ?? 0, color: 'text-green-400' },
    { label: 'Ошибок', white: result.stats?.white.mistake ?? 0, black: result.stats?.black.mistake ?? 0, color: 'text-orange-400' },
    { label: 'Зевков', white: result.stats?.white.blunder ?? 0, black: result.stats?.black.blunder ?? 0, color: 'text-red-400' },
  ] : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">PGN партии</label>
        <textarea
          value={pgn}
          onChange={e => setPgn(e.target.value)}
          rows={8}
          className="w-full bg-[#161512] border border-[#302e2b] rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[#a855f7]/60 focus:ring-1 focus:ring-[#a855f7]/30 transition-all resize-y placeholder:text-zinc-600"
          placeholder="Вставьте PGN партии..."
          spellCheck={false}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => { setPgn(EXAMPLE_PGN); setResult(null); setError(null); }}
          className="px-3 py-1.5 rounded-lg border border-[#302e2b] bg-[#161512] hover:bg-[#211f1c] text-zinc-400 hover:text-white text-xs font-medium transition-all cursor-pointer"
        >
          Загрузить пример
        </button>
        {pgn && (
          <button
            type="button"
            onClick={() => { setPgn(''); setResult(null); setError(null); }}
            className="px-3 py-1.5 rounded-lg border border-[#302e2b] bg-[#161512] hover:bg-[#211f1c] text-zinc-400 hover:text-white text-xs font-medium transition-all cursor-pointer"
          >
            Очистить
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={analyze}
        disabled={loading || !pgn.trim()}
        className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#a855f7]/40 bg-[#a855f7]/15 hover:bg-[#a855f7]/25 text-[#a855f7] font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        {loading ? 'Анализирую партию...' : 'Запустить анализ'}
      </button>

      {loading && (
        <div className="text-center text-xs text-zinc-500 animate-pulse">
          Stockfish просчитывает каждый ход... это может занять 15-30 секунд
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/40 bg-red-500/10">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          {/* Accuracy summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statsBoxes.map(s => (
              <div key={s.label} className="border border-[#302e2b] rounded-xl bg-[#161512] p-3 flex flex-col gap-2">
                <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">{s.label}</div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-600">Белые</span>
                    <span className={`text-lg font-bold ${s.color}`}>
                      {s.label === 'Точность' ? `${s.white}%` : s.white}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-zinc-600">Чёрные</span>
                    <span className={`text-lg font-bold ${s.color}`}>
                      {s.label === 'Точность' ? `${s.black}%` : s.black}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border border-[#302e2b] rounded-xl bg-[#161512] p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              Резюме
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{result.summary}</p>
            {result.keyTakeaway && (
              <div className="mt-1 p-3 rounded-lg bg-[#211f1c] border border-[#302e2b]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#a855f7] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-400 leading-relaxed">{result.keyTakeaway}</p>
                </div>
              </div>
            )}
          </div>

          {/* Critical moves */}
          {result.criticalMoves.length > 0 && (
            <div className="border border-[#302e2b] rounded-xl bg-[#161512] p-4 flex flex-col gap-3">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Ключевые ходы ({result.criticalMoves.length})
              </div>
              <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
                {result.criticalMoves.map((mv, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg bg-[#211f1c] border border-[#302e2b]">
                    <div className="flex-shrink-0 text-xs font-mono text-zinc-500 w-8 pt-0.5">
                      {mv.moveNumber}.{mv.color === 'black' ? '..' : ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white font-mono">{mv.san}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#161512] border border-[#302e2b] text-zinc-400">{mv.type}</span>
                        {mv.betterMove && mv.betterMove !== mv.san && (
                          <span className="text-[10px] text-zinc-500">→ {mv.betterMove}</span>
                        )}
                      </div>
                      {mv.comment && (
                        <p className="text-xs text-zinc-400 leading-relaxed">{mv.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
