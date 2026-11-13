'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';

type TimeControl = { label: string; white: number; black: number; inc: number };

const PRESETS: TimeControl[] = [
  { label: '1+0 Пуля', white: 60, black: 60, inc: 0 },
  { label: '2+1 Пуля', white: 120, black: 120, inc: 1 },
  { label: '3+2 Блиц', white: 180, black: 180, inc: 2 },
  { label: '5+0 Блиц', white: 300, black: 300, inc: 0 },
  { label: '10+0 Рапид', white: 600, black: 600, inc: 0 },
  { label: '15+10 Рапид', white: 900, black: 900, inc: 10 },
];

function formatTime(secs: number): string {
  if (secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ChessClock() {
  const [preset, setPreset] = useState(PRESETS[2]);
  const [whiteTime, setWhiteTime] = useState(preset.white);
  const [blackTime, setBlackTime] = useState(preset.black);
  const [active, setActive] = useState<'white' | 'black' | null>(null);
  const [gameOver, setGameOver] = useState<'white' | 'black' | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback((p: TimeControl = preset) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setWhiteTime(p.white);
    setBlackTime(p.black);
    setActive(null);
    setGameOver(null);
  }, [preset]);

  useEffect(() => {
    reset(preset);
  }, [preset]);

  useEffect(() => {
    if (active === null || gameOver) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (active === 'white') {
        setWhiteTime(t => {
          if (t <= 1) {
            setGameOver('white');
            setActive(null);
            return 0;
          }
          return t - 1;
        });
      } else {
        setBlackTime(t => {
          if (t <= 1) {
            setGameOver('black');
            setActive(null);
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active, gameOver]);

  const switchClock = (player: 'white' | 'black') => {
    if (gameOver) return;
    if (active === null && player !== 'white') return; // first move must be white
    if (active === player) {
      // switching to opposite
      const next = player === 'white' ? 'black' : 'white';
      if (player === 'white') setWhiteTime(t => t + preset.inc);
      else setBlackTime(t => t + preset.inc);
      setActive(next);
    } else if (active === null) {
      setActive('black'); // white pressed, black starts counting
    }
  };

  const togglePause = () => {
    if (gameOver) return;
    if (active === null) {
      setActive('black'); // start
    } else {
      setActive(null); // pause
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Presets */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Контроль времени</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => { setPreset(p); reset(p); }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                preset.label === p.label
                  ? 'bg-[#a855f7] border-[#a855f7] text-white'
                  : 'border-[#302e2b] bg-[#161512] text-zinc-400 hover:bg-[#211f1c]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clocks */}
      <div className="grid grid-cols-2 gap-3">
        {/* Black clock (top, flipped) */}
        <button
          type="button"
          onClick={() => active === 'black' && switchClock('black')}
          className={`col-span-2 sm:col-span-1 flex flex-col items-center justify-center rounded-2xl border p-8 transition-all cursor-pointer select-none ${
            gameOver === 'black'
              ? 'border-red-500/50 bg-red-500/10'
              : active === 'black'
                ? 'border-[#a855f7]/60 bg-[#a855f7]/10 shadow-lg shadow-[#a855f7]/10'
                : 'border-[#302e2b] bg-[#161512] opacity-70'
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Чёрные</div>
          <div className={`text-5xl font-mono font-black tabular-nums ${
            blackTime <= 10 && active === 'black' ? 'text-red-400 animate-pulse' : 'text-white'
          }`}>
            {formatTime(blackTime)}
          </div>
          {active === 'black' && <div className="mt-2 w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />}
        </button>

        {/* White clock */}
        <button
          type="button"
          onClick={() => active === 'white' ? switchClock('white') : active === null && setActive('black')}
          className={`col-span-2 sm:col-span-1 flex flex-col items-center justify-center rounded-2xl border p-8 transition-all cursor-pointer select-none ${
            gameOver === 'white'
              ? 'border-red-500/50 bg-red-500/10'
              : active === 'white'
                ? 'border-amber-400/60 bg-amber-400/10 shadow-lg shadow-amber-400/10'
                : 'border-[#302e2b] bg-[#211f1c] opacity-70'
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Белые</div>
          <div className={`text-5xl font-mono font-black tabular-nums ${
            whiteTime <= 10 && active === 'white' ? 'text-red-400 animate-pulse' : 'text-white'
          }`}>
            {formatTime(whiteTime)}
          </div>
          {active === 'white' && <div className="mt-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
        </button>
      </div>

      {gameOver && (
        <div className="text-center py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 font-semibold flex items-center justify-center gap-2">
          <Flag className="w-4 h-4" />
          Флаг упал у {gameOver === 'white' ? 'белых' : 'чёрных'}! Победа {gameOver === 'white' ? 'чёрных' : 'белых'}.
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <button
          type="button"
          onClick={togglePause}
          disabled={!!gameOver}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#a855f7]/40 bg-[#a855f7]/15 hover:bg-[#a855f7]/25 text-[#a855f7] font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {active !== null ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {active !== null ? 'Пауза' : 'Старт'}
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#302e2b] bg-[#161512] hover:bg-[#211f1c] text-zinc-400 font-semibold transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Сброс
        </button>
      </div>

      <p className="text-xs text-zinc-600 text-center">
        Нажмите на часы текущего игрока, чтобы передать ход. Инкремент: +{preset.inc}с после каждого хода.
      </p>
    </div>
  );
}
