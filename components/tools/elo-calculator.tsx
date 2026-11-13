'use client';

import { sfx } from '@/lib/sound-effects';
import {
  Award,
  Calculator,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

type Result = 'win' | 'draw' | 'loss';

interface TournamentGame {
  id: string;
  opponentRating: number;
  result: Result;
}

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
  const [tab, setTab] = useState<'single' | 'fideTournament'>('single');

  // Single game state
  const [myRating, setMyRating] = useState(1500);
  const [oppRating, setOppRating] = useState(1500);
  const [result, setResult] = useState<Result>('win');
  const [kFactor, setKFactor] = useState(20);
  const [system, setSystem] = useState<'fide' | 'chesscom' | 'lichess'>('fide');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Multi-game FIDE tournament state
  const [fideGames, setFideGames] = useState<TournamentGame[]>([
    { id: '1', opponentRating: 1520, result: 'win' },
    { id: '2', opponentRating: 1480, result: 'draw' },
    { id: '3', opponentRating: 1610, result: 'loss' },
  ]);

  const calc = calcElo(myRating, oppRating, result, kFactor);
  const myProb = Math.round(calc.expected * 100);
  const oppProb = 100 - myProb;

  // Contextual matchup label
  const matchLabel =
    myProb > 65
      ? 'Явный фаворит'
      : myProb > 52
      ? 'Небольшой фаворит'
      : myProb < 35
      ? 'Значительный андердог'
      : myProb < 48
      ? 'Небольшой андердог'
      : 'Равные шансы';

  // Multi-game FIDE tournament calculations
  const totalActual = fideGames.reduce(
    (sum, g) => sum + (g.result === 'win' ? 1 : g.result === 'draw' ? 0.5 : 0),
    0,
  );
  const totalExpected = fideGames.reduce((sum, g) => {
    // 400-point difference cap rule in FIDE
    const diff = Math.max(-400, Math.min(400, g.opponentRating - myRating));
    const exp = 1 / (1 + Math.pow(10, diff / 400));
    return sum + exp;
  }, 0);

  const fideDelta = Math.round(kFactor * (totalActual - totalExpected));
  const fideNewRating = myRating + fideDelta;

  const addFideGame = () => {
    setFideGames((prev) => [
      ...prev,
      { id: String(Date.now()), opponentRating: myRating, result: 'win' },
    ]);
  };

  const removeFideGame = (id: string) => {
    setFideGames((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* Tab Switcher: Single game vs FIDE Tournament */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setTab('single');
            sfx.playMove();
          }}
          className={`pixel-btn px-4 py-2 text-xs font-pixel-sm cursor-pointer ${
            tab === 'single'
              ? 'bg-[#81b64c] text-black font-bold border-[#81b64c]'
              : 'bg-[#211f1c] text-zinc-400 hover:text-white border-[#302e2b]'
          }`}
        >
          ОДНА ПАРТИЯ
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('fideTournament');
            sfx.playMove();
          }}
          className={`pixel-btn px-4 py-2 text-xs font-pixel-sm cursor-pointer ${
            tab === 'fideTournament'
              ? 'bg-[#81b64c] text-black font-bold border-[#81b64c]'
              : 'bg-[#211f1c] text-zinc-400 hover:text-white border-[#302e2b]'
          }`}
        >
          FIDE ТУРНИР (МНОГО ПАРТИЙ)
        </button>
      </div>

      {tab === 'single' ? (
        <>
          {/* Win Probability Header */}
          <div className="pixel-card bg-[#181612] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-pixel-sm">
              <span className="text-zinc-400">ВЕРОЯТНОСТЬ ПОБЕДЫ</span>
              <span className="text-amber-400 uppercase tracking-wider">{matchLabel}</span>
            </div>

            <div className="flex items-center justify-between text-xl font-pixel">
              <span className="text-emerald-400">{myProb}% ВЫ</span>
              <span className="text-zinc-400">{oppProb}% СОПЕРНИК</span>
            </div>

            {/* Split probability bar */}
            <div className="w-full h-4 border-2 border-[#2b2721] overflow-hidden flex bg-zinc-800">
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${myProb}%` }}
              />
              <div
                className="bg-zinc-600 transition-all duration-300"
                style={{ width: `${oppProb}%` }}
              />
            </div>
          </div>

          {/* Rating Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* My rating */}
            <div className="pixel-card bg-[#181612] p-4 flex flex-col gap-3">
              <label className="text-[10px] font-pixel-sm text-zinc-400 uppercase tracking-wider">
                ВАШ ТЕКУЩИЙ РЕЙТИНГ
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMyRating((r) => Math.max(100, r - 50));
                    sfx.playMove();
                  }}
                  className="pixel-btn w-10 h-10 bg-[#211f1c] text-white font-mono font-bold text-xs flex items-center justify-center cursor-pointer border-[#302e2b]"
                >
                  −50
                </button>
                <input
                  type="number"
                  value={myRating}
                  onChange={(e) => setMyRating(Number(e.target.value))}
                  className="flex-1 bg-[#14120e] border-2 border-[#302e2b] px-3 py-2 text-center text-white font-pixel text-base outline-none focus:border-[#81b64c]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMyRating((r) => Math.min(3200, r + 50));
                    sfx.playMove();
                  }}
                  className="pixel-btn w-10 h-10 bg-[#211f1c] text-white font-mono font-bold text-xs flex items-center justify-center cursor-pointer border-[#302e2b]"
                >
                  +50
                </button>
              </div>
              <input
                type="range"
                min={400}
                max={2800}
                step={10}
                value={myRating}
                onChange={(e) => setMyRating(Number(e.target.value))}
                className="w-full accent-[#81b64c] cursor-pointer"
              />
            </div>

            {/* Opponent rating */}
            <div className="pixel-card bg-[#181612] p-4 flex flex-col gap-3">
              <label className="text-[10px] font-pixel-sm text-zinc-400 uppercase tracking-wider">
                РЕЙТИНГ СОПЕРНИКА
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOppRating((r) => Math.max(100, r - 50));
                    sfx.playMove();
                  }}
                  className="pixel-btn w-10 h-10 bg-[#211f1c] text-white font-mono font-bold text-xs flex items-center justify-center cursor-pointer border-[#302e2b]"
                >
                  −50
                </button>
                <input
                  type="number"
                  value={oppRating}
                  onChange={(e) => setOppRating(Number(e.target.value))}
                  className="flex-1 bg-[#14120e] border-2 border-[#302e2b] px-3 py-2 text-center text-white font-pixel text-base outline-none focus:border-[#81b64c]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setOppRating((r) => Math.min(3200, r + 50));
                    sfx.playMove();
                  }}
                  className="pixel-btn w-10 h-10 bg-[#211f1c] text-white font-mono font-bold text-xs flex items-center justify-center cursor-pointer border-[#302e2b]"
                >
                  +50
                </button>
              </div>
              <input
                type="range"
                min={400}
                max={2800}
                step={10}
                value={oppRating}
                onChange={(e) => setOppRating(Number(e.target.value))}
                className="w-full accent-[#81b64c] cursor-pointer"
              />
            </div>
          </div>

          {/* Result Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-pixel-sm text-zinc-400 uppercase tracking-wider">
              ИСХОД ПАРТИИ
            </span>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { val: 'win', label: 'ПОБЕДА', diff: calcElo(myRating, oppRating, 'win', kFactor).delta },
                  { val: 'draw', label: 'НИЧЬЯ', diff: calcElo(myRating, oppRating, 'draw', kFactor).delta },
                  { val: 'loss', label: 'ПОРАЖЕНИЕ', diff: calcElo(myRating, oppRating, 'loss', kFactor).delta },
                ] as const
              ).map((btn) => (
                <button
                  key={btn.val}
                  type="button"
                  onClick={() => {
                    setResult(btn.val);
                    if (btn.val === 'win') sfx.playSuccess();
                    else if (btn.val === 'loss') sfx.playError();
                    else sfx.playMove();
                  }}
                  className={`pixel-btn p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    result === btn.val
                      ? 'bg-[#81b64c] text-black font-bold border-[#81b64c]'
                      : 'bg-[#181612] hover:bg-[#211f1c] border-[#302e2b]'
                  }`}
                >
                  <span className="text-xs font-pixel">
                    {btn.label}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold ${
                      result === btn.val
                        ? 'text-black font-black'
                        : btn.diff > 0
                        ? 'text-emerald-400'
                        : btn.diff < 0
                        ? 'text-rose-400'
                        : 'text-zinc-500'
                    }`}
                  >
                    {btn.diff > 0 ? `+${btn.diff}` : btn.diff} PTS
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* New Rating Result Card */}
          <div className="pixel-card bg-[#181612] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-pixel-sm text-zinc-500 uppercase tracking-wider">
                НОВЫЙ РАСЧЁТНЫЙ РЕЙТИНГ
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-pixel text-white">{calc.newRating}</span>
                <span className="text-xs font-mono text-zinc-500">
                  ({myRating} → {calc.newRating})
                </span>
              </div>
            </div>

            <div
              className={`pixel-badge flex items-center gap-2 px-4 py-2 font-pixel text-xs ${
                calc.delta > 0
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                  : calc.delta < 0
                  ? 'border-rose-500 bg-rose-500/20 text-rose-400'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-300'
              }`}
            >
              {calc.delta > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : calc.delta < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              <span>{calc.delta > 0 ? `+${calc.delta}` : calc.delta} PTS</span>
            </div>
          </div>

          {/* Advanced Accordion */}
          <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
            >
              <span>Расширенные настройки (система и K-фактор)</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="pt-3 border-t border-[#302e2b] flex flex-col gap-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Рейтинговая система</label>
                    <select
                      value={system}
                      onChange={(e) => setSystem(e.target.value as 'fide' | 'chesscom' | 'lichess')}
                      className="bg-[#211f1c] border border-[#302e2b] rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="fide">FIDE (Классика, Рапид, Блиц)</option>
                      <option value="chesscom">Chess.com Glicko</option>
                      <option value="lichess">Lichess Glicko-2</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400 font-semibold">K-Фактор: {kFactor}</span>
                      <span className="text-zinc-500">
                        {kFactor === 10 ? 'Топ-гроссмейстер' : kFactor === 20 ? 'Стандартный FIDE' : 'Юниоры / Новички'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={40}
                      step={10}
                      value={kFactor}
                      onChange={(e) => setKFactor(Number(e.target.value))}
                      className="w-full accent-[#81b64c] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#211f1c] text-xs font-mono text-zinc-400 leading-relaxed">
                  Формула FIDE: R_new = {myRating} + {kFactor} × ({calc.actual} − {calc.expected.toFixed(3)}) = {calc.newRating}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* FIDE Multi-Game Tournament Calculator */
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                Итог турнира ({fideGames.length} партий)
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl font-mono font-black text-white">{fideNewRating}</span>
                <span
                  className={`text-sm font-mono font-bold ${
                    fideDelta > 0
                      ? 'text-emerald-400'
                      : fideDelta < 0
                      ? 'text-rose-400'
                      : 'text-zinc-400'
                  }`}
                >
                  {fideDelta > 0 ? `+${fideDelta}` : fideDelta} очков
                </span>
              </div>
            </div>

            <div className="text-xs text-zinc-400 flex flex-col gap-0.5 text-right font-mono">
              <span>
                Очки: {totalActual} из {fideGames.length}
              </span>
              <span>Ожидалось (Exp): {totalExpected.toFixed(2)}</span>
              <span>K-фактор: {kFactor}</span>
            </div>
          </div>

          {/* Games table */}
          <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Сыгранные партии
              </span>
              <button
                type="button"
                onClick={addFideGame}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#81b64c] hover:bg-[#74a643] text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить партию</span>
              </button>
            </div>

            <div className="flex flex-col divide-y divide-[#302e2b] text-xs">
              {fideGames.map((g, idx) => (
                <div
                  key={g.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 font-mono w-6">#{idx + 1}</span>
                    <span className="text-zinc-400">Рейтинг соперника:</span>
                    <input
                      type="number"
                      value={g.opponentRating}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFideGames((prev) =>
                          prev.map((game) =>
                            game.id === g.id ? { ...game, opponentRating: val } : game,
                          ),
                        );
                      }}
                      className="w-24 bg-[#211f1c] border border-[#302e2b] rounded-lg px-2.5 py-1 text-white font-mono text-xs outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex p-0.5 rounded-lg bg-[#211f1c] border border-[#302e2b]">
                      {(['win', 'draw', 'loss'] as Result[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setFideGames((prev) =>
                              prev.map((game) =>
                                game.id === g.id ? { ...game, result: r } : game,
                              ),
                            );
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                            g.result === r
                              ? r === 'win'
                                ? 'bg-emerald-500 text-white font-bold'
                                : r === 'draw'
                                ? 'bg-amber-500 text-white font-bold'
                                : 'bg-rose-500 text-white font-bold'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {r === 'win' ? '1.0' : r === 'draw' ? '0.5' : '0.0'}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFideGame(g.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 cursor-pointer"
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
