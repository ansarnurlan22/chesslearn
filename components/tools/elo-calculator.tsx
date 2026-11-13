'use client';

import { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Result = 'win' | 'draw' | 'loss';

function calcElo(ra: number, ro: number, result: Result, k: number): {
  expected: number;
  actual: number;
  newRating: number;
  delta: number;
} {
  const expected = 1 / (1 + Math.pow(10, (ro - ra) / 400));
  const actual = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
  const newRating = Math.round(ra + k * (actual - expected));
  return { expected, actual, newRating, delta: newRating - ra };
}

export function EloCalculator() {
  const [myRating, setMyRating] = useState(1500);
  const [oppRating, setOppRating] = useState(1500);
  const [result, setResult] = useState<Result>('win');
  const [kFactor, setKFactor] = useState(20);

  const calc = calcElo(myRating, oppRating, result, kFactor);

  const resultBtns: { value: Result; label: string; color: string }[] = [
    { value: 'win', label: '✓ Победа', color: 'border-green-500/40 bg-green-500/15 text-green-400 data-[active=true]:bg-green-500 data-[active=true]:text-white' },
    { value: 'draw', label: '= Ничья', color: 'border-yellow-500/40 bg-yellow-500/15 text-yellow-400 data-[active=true]:bg-yellow-500 data-[active=true]:text-white' },
    { value: 'loss', label: '✗ Поражение', color: 'border-red-500/40 bg-red-500/15 text-red-400 data-[active=true]:bg-red-500 data-[active=true]:text-white' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Мой рейтинг</label>
          <input
            type="number"
            value={myRating}
            onChange={e => setMyRating(Number(e.target.value))}
            className="bg-[#161512] border border-[#302e2b] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#a855f7]/60 focus:ring-1 focus:ring-[#a855f7]/30 transition-all"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Рейтинг соперника</label>
          <input
            type="number"
            value={oppRating}
            onChange={e => setOppRating(Number(e.target.value))}
            className="bg-[#161512] border border-[#302e2b] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#a855f7]/60 focus:ring-1 focus:ring-[#a855f7]/30 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Результат</label>
        <div className="flex gap-2 flex-wrap">
          {resultBtns.map(btn => (
            <button
              key={btn.value}
              type="button"
              data-active={result === btn.value}
              onClick={() => setResult(btn.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${btn.color}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">K-фактор</label>
        <div className="flex gap-2">
          {[10, 20, 40].map(k => (
            <button
              key={k}
              type="button"
              onClick={() => setKFactor(k)}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                kFactor === k
                  ? 'bg-[#a855f7] border-[#a855f7] text-white'
                  : 'border-[#302e2b] bg-[#161512] text-zinc-400 hover:bg-[#211f1c]'
              }`}
            >
              {k} {k === 10 ? '(Мастер)' : k === 20 ? '(Стандарт)' : '(Новичок)'}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-[#302e2b] rounded-xl bg-[#161512] p-5 flex flex-col gap-4">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Результат</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">Ожидаемый балл</span>
            <span className="text-2xl font-bold text-white">{(calc.expected * 100).toFixed(1)}%</span>
            <span className="text-xs text-zinc-600">вероятность победы</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">Новый рейтинг</span>
            <span className="text-2xl font-bold text-white">{calc.newRating}</span>
            <span className={`text-xs flex items-center gap-1 ${calc.delta > 0 ? 'text-green-400' : calc.delta < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
              {calc.delta > 0 ? <TrendingUp className="w-3 h-3" /> : calc.delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {calc.delta > 0 ? '+' : ''}{calc.delta} очков
            </span>
          </div>
        </div>
        <div className="pt-3 border-t border-[#302e2b] text-xs text-zinc-600">
          Формула: Ra + K × (S − E) = {myRating} + {kFactor} × ({calc.actual} − {calc.expected.toFixed(3)}) = <span className="text-white font-semibold">{calc.newRating}</span>
        </div>
      </div>
    </div>
  );
}
