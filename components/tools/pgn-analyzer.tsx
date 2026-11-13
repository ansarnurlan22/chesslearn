'use client';

import { sfx } from '@/lib/sound-effects';
import type { GameReviewData } from '@/types/review';
import { AlertCircle, CheckCircle2, FileText, Loader2, TrendingUp } from 'lucide-react';
import { useState } from 'react';

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
    sfx.playMove();
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
      sfx.playSuccess();
      setResult(data);
    } catch (e) {
      sfx.playError();
      setError(e instanceof Error ? e.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const statsBoxes: StatsBox[] = result ? [
    { label: 'ТОЧНОСТЬ', white: result.accuracy.white, black: result.accuracy.black, color: 'text-blue-400' },
    { label: 'ЛУЧШИЕ ХОДЫ', white: result.stats?.white.best ?? 0, black: result.stats?.black.best ?? 0, color: 'text-green-400' },
    { label: 'ОШИБКИ', white: result.stats?.white.mistake ?? 0, black: result.stats?.black.mistake ?? 0, color: 'text-orange-400' },
    { label: 'ЗЕВКИ', white: result.stats?.white.blunder ?? 0, black: result.stats?.black.blunder ?? 0, color: 'text-red-400' },
  ] : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="font-pixel-sm text-[10px] text-zinc-300 uppercase tracking-wider">PGN ПАРТИИ</label>
        <textarea
          value={pgn}
          onChange={e => setPgn(e.target.value)}
          rows={7}
          className="w-full bg-[#161512] border-2 border-zinc-700/80 rounded-none px-3 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#81b64c] transition-all resize-y placeholder:text-zinc-600 shadow-inner"
          placeholder="Вставьте PGN партии..."
          spellCheck={false}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => {
            sfx.playMove();
            setPgn(EXAMPLE_PGN);
            setResult(null);
            setError(null);
          }}
          className="pixel-btn text-[9px] px-3 py-1.5 cursor-pointer text-zinc-300 hover:text-white"
        >
          ЗАГРУЗИТЬ ПРИМЕР
        </button>
        {pgn && (
          <button
            type="button"
            onClick={() => {
              sfx.playError();
              setPgn('');
              setResult(null);
              setError(null);
            }}
            className="pixel-btn text-[9px] px-3 py-1.5 cursor-pointer text-zinc-400 hover:text-red-400"
          >
            ОЧИСТИТЬ
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={analyze}
        disabled={loading || !pgn.trim()}
        className="pixel-btn text-xs py-3 flex items-center justify-center gap-2 cursor-pointer bg-[#81b64c]/20 border-[#81b64c] text-white hover:bg-[#81b64c]/30 disabled:opacity-40"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        <span>{loading ? 'АНАЛИЗИРУЮ ПАРТИЮ...' : 'ЗАПУСТИТЬ АНАЛИЗ [ STOCKFISH 19 ]'}</span>
      </button>

      {loading && (
        <div className="font-pixel-sm text-[9px] text-center text-amber-400 animate-pulse">
          STOCKFISH 19 LITE ПРОСЧИТЫВАЕТ КАЖДЫЙ ХОД...
        </div>
      )}

      {error && (
        <div className="pixel-card p-4 border-red-500/60 bg-red-950/30 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span className="text-red-400 text-xs font-mono">{error}</span>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          {/* Accuracy summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statsBoxes.map(s => (
              <div key={s.label} className="pixel-card p-3 flex flex-col gap-2">
                <div className="font-pixel-sm text-[8px] text-zinc-400 uppercase tracking-wider">{s.label}</div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500">Белые</span>
                    <span className={`font-pixel-sm text-sm ${s.color}`}>
                      {s.label === 'ТОЧНОСТЬ' ? `${s.white}%` : s.white}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-zinc-500">Чёрные</span>
                    <span className={`font-pixel-sm text-sm ${s.color}`}>
                      {s.label === 'ТОЧНОСТЬ' ? `${s.black}%` : s.black}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="pixel-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 font-pixel-sm text-[10px] text-zinc-400 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-[#81b64c]" />
              РЕЗЮМЕ
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">{result.summary}</p>
            {result.keyTakeaway && (
              <div className="pixel-card-green p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#81b64c] shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-300/90 leading-relaxed font-sans">{result.keyTakeaway}</p>
                </div>
              </div>
            )}
          </div>

          {/* Critical moves */}
          {result.criticalMoves.length > 0 && (
            <div className="pixel-card p-4 flex flex-col gap-3">
              <div className="font-pixel-sm text-[10px] text-zinc-400 uppercase tracking-wider">
                КЛЮЧЕВЫЕ ХОДЫ ({result.criticalMoves.length})
              </div>
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {result.criticalMoves.map((mv, i) => (
                  <div key={i} className="flex gap-3 p-2.5 bg-[#161512] border border-zinc-800">
                    <div className="shrink-0 font-pixel-sm text-[9px] text-zinc-500 w-10 pt-0.5">
                      {mv.moveNumber}.{mv.color === 'black' ? '..' : ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-pixel-sm text-xs text-white">{mv.san}</span>
                        <span className="font-pixel-sm text-[8px] px-1.5 py-0.5 bg-[#211f1c] border border-zinc-700 text-zinc-300">{mv.type}</span>
                        {mv.betterMove && mv.betterMove !== mv.san && (
                          <span className="font-pixel-sm text-[8px] text-amber-400">→ {mv.betterMove}</span>
                        )}
                      </div>
                      {mv.comment && (
                        <p className="text-xs text-zinc-400 leading-relaxed font-sans">{mv.comment}</p>
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
