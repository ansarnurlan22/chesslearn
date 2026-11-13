'use client';

import { useState, useMemo } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { OPENING_DATABASE } from '@/lib/engine/opening-book';

export function OpeningExplorer() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return OPENING_DATABASE.slice(0, 20);
    return OPENING_DATABASE.filter(
      o =>
        o.name.toLowerCase().includes(q) ||
        o.eco.toLowerCase().includes(q) ||
        o.moves.join(' ').toLowerCase().includes(q),
    ).slice(0, 30);
  }, [query]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Поиск по названию, ECO-коду или ходам..."
          className="w-full bg-[#161512] border border-[#302e2b] rounded-lg pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#a855f7]/60 focus:ring-1 focus:ring-[#a855f7]/30 transition-all placeholder:text-zinc-600"
        />
      </div>

      <div className="text-xs text-zinc-600">{results.length} дебютов найдено</div>

      {/* Results */}
      <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
        {results.map((opening, i) => (
          <div
            key={`${opening.eco}-${i}`}
            className="border border-[#302e2b] rounded-xl bg-[#161512] p-4 hover:border-[#a855f7]/30 hover:bg-[#1a1816] transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-14 h-10 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center">
                <span className="text-[11px] font-bold text-[#a855f7] font-mono">{opening.eco}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-white leading-tight mb-1">{opening.name}</div>
                <div className="flex flex-wrap gap-1">
                  {opening.moves.map((move, mi) => (
                    <span
                      key={mi}
                      className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#211f1c] border border-[#302e2b] text-zinc-400"
                    >
                      {mi % 2 === 0 && (
                        <span className="text-zinc-600 mr-0.5">{Math.floor(mi / 2) + 1}.</span>
                      )}
                      {move}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-600 gap-3">
          <BookOpen className="w-10 h-10 opacity-30" />
          <p className="text-sm">Ничего не найдено по запросу «{query}»</p>
        </div>
      )}
    </div>
  );
}
