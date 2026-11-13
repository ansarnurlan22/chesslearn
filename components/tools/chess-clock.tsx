'use client';

import { sfx } from '@/lib/sound-effects';
import {
  Flag,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type DelayMode = 'fischer' | 'delay' | 'bronstein';

interface TimeControl {
  label: string;
  white: number;
  black: number;
  inc: number;
  delayMode?: DelayMode;
}

const PRESETS: TimeControl[] = [
  { label: '1+0 Пуля', white: 60, black: 60, inc: 0 },
  { label: '2+1 Пуля', white: 120, black: 120, inc: 1 },
  { label: '3+0 Блиц', white: 180, black: 180, inc: 0 },
  { label: '3+2 Блиц', white: 180, black: 180, inc: 2 },
  { label: '5+0 Блиц', white: 300, black: 300, inc: 0 },
  { label: '5+3 Блиц', white: 300, black: 300, inc: 3 },
  { label: '10+0 Рапид', white: 600, black: 600, inc: 0 },
  { label: '15+10 Рапид', white: 900, black: 900, inc: 10 },
  { label: '30+0 Классика', white: 1800, black: 1800, inc: 0 },
  { label: '90+30 Фиде', white: 5400, black: 5400, inc: 30 },
];

function formatTime(secs: number): string {
  if (secs <= 0) return '0:00';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ChessClock() {
  const [preset, setPreset] = useState<TimeControl>(PRESETS[3]); // 3+2
  const [whiteTime, setWhiteTime] = useState(preset.white);
  const [blackTime, setBlackTime] = useState(preset.black);
  const [whiteMoves, setWhiteMoves] = useState(0);
  const [blackMoves, setBlackMoves] = useState(0);
  const [active, setActive] = useState<'white' | 'black' | null>(null);
  const [gameOver, setGameOver] = useState<'white' | 'black' | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Play sound effect
  const playClickSound = useCallback(() => {
    if (!soundEnabled) return;
    sfx.playMove();
  }, [soundEnabled]);

  const reset = useCallback(
    (p: TimeControl = preset) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setWhiteTime(p.white);
      setBlackTime(p.black);
      setWhiteMoves(0);
      setBlackMoves(0);
      setActive(null);
      setGameOver(null);
    },
    [preset],
  );

  useEffect(() => {
    reset(preset);
  }, [preset, reset]);

  // Clock countdown loop
  useEffect(() => {
    if (active === null || gameOver) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (active === 'white') {
        setWhiteTime((t) => {
          if (t <= 1) {
            setGameOver('white');
            setActive(null);
            return 0;
          }
          return t - 1;
        });
      } else {
        setBlackTime((t) => {
          if (t <= 1) {
            setGameOver('black');
            setActive(null);
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, gameOver]);

  const switchClock = (player: 'white' | 'black') => {
    if (gameOver) return;
    playClickSound();

    if (active === null) {
      // First move
      if (player === 'white') {
        setWhiteMoves((m) => m + 1);
        setWhiteTime((t) => t + preset.inc);
        setActive('black');
      }
    } else if (active === player) {
      const next = player === 'white' ? 'black' : 'white';
      if (player === 'white') {
        setWhiteMoves((m) => m + 1);
        setWhiteTime((t) => t + preset.inc);
      } else {
        setBlackMoves((m) => m + 1);
        setBlackTime((t) => t + preset.inc);
      }
      setActive(next);
    }
  };

  const togglePause = () => {
    if (gameOver) return;
    if (active === null) {
      setActive('white');
    } else {
      setActive(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full select-none">
      {/* Presets Bar */}
      <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Контроль времени
          </label>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#81b64c]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span>{soundEnabled ? 'Звук вкл' : 'Без звука'}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setPreset(p);
                reset(p);
                sfx.playMove();
              }}
              className={`pixel-btn px-3 py-1.5 text-xs font-pixel-sm cursor-pointer ${
                preset.label === p.label
                  ? 'bg-amber-500 text-black font-bold border-amber-600'
                  : 'bg-[#211f1c] text-zinc-400 hover:text-white border-[#302e2b]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Split Face-to-Face Clock Display */}
      <div className="flex flex-col gap-4">
        {/* Top Clock (Black - Inverted for opponent sitting across the table) */}
        <button
          type="button"
          onClick={() => active === 'black' && switchClock('black')}
          className={`w-full py-10 px-6 border-4 flex flex-col items-center justify-center transition-all cursor-pointer rotate-180 ${
            gameOver === 'black'
              ? 'border-red-500 bg-red-950/40 shadow-[6px_6px_0px_0px_#7f1d1d]'
              : active === 'black'
              ? 'border-[#81b64c] bg-[#1e2d14] shadow-[6px_6px_0px_0px_#274013]'
              : 'border-[#302e2b] bg-[#161512] shadow-[4px_4px_0px_0px_#0c0b09] opacity-80'
          }`}
        >
          <div className="flex items-center justify-between w-full max-w-sm px-4 mb-2">
            <span className="text-xs font-pixel text-zinc-400">
              ЧЁРНЫЕ
            </span>
            <span className="text-xs font-mono text-zinc-500">
              ХОДОВ: {blackMoves}
            </span>
          </div>

          <div
            className={`text-5xl sm:text-6xl font-pixel tabular-nums ${
              blackTime <= 10 && active === 'black'
                ? 'text-red-400 animate-pulse'
                : 'text-white'
            }`}
          >
            {formatTime(blackTime)}
          </div>
        </button>

        {/* Center Control Strip */}
        <div className="pixel-card bg-[#181612] flex items-center justify-between px-4 py-2 text-xs font-pixel-sm">
          <span className="text-zinc-400">
            {preset.label} (+{preset.inc}с)
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePause}
              disabled={!!gameOver}
              className="pixel-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#81b64c] text-black font-bold cursor-pointer disabled:opacity-40"
            >
              {active !== null ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{active !== null ? 'ПАУЗА' : 'СТАРТ'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                sfx.playMove();
              }}
              className="pixel-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#211f1c] text-zinc-400 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>СБРОС</span>
            </button>
          </div>
        </div>

        {/* Bottom Clock (White) */}
        <button
          type="button"
          onClick={() =>
            active === 'white'
              ? switchClock('white')
              : active === null && switchClock('white')
          }
          className={`w-full py-10 px-6 border-4 flex flex-col items-center justify-center transition-all cursor-pointer ${
            gameOver === 'white'
              ? 'border-red-500 bg-red-950/40 shadow-[6px_6px_0px_0px_#7f1d1d]'
              : active === 'white'
              ? 'border-amber-400 bg-[#2d2414] shadow-[6px_6px_0px_0px_#78350f]'
              : 'border-[#302e2b] bg-[#161512] shadow-[4px_4px_0px_0px_#0c0b09] opacity-80'
          }`}
        >
          <div className="flex items-center justify-between w-full max-w-sm px-4 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Белые
            </span>
            <span className="text-xs font-mono text-zinc-500">
              Ходов: {whiteMoves}
            </span>
          </div>

          <div
            className={`text-6xl sm:text-7xl font-mono font-black tabular-nums ${
              whiteTime <= 10 && active === 'white'
                ? 'text-red-400 animate-pulse'
                : 'text-white'
            }`}
          >
            {formatTime(whiteTime)}
          </div>
          {active === 'white' && (
            <div className="mt-3 w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {gameOver && (
        <div className="text-center py-4 rounded-2xl border border-red-500/40 bg-red-500/10 text-red-400 font-bold flex items-center justify-center gap-2">
          <Flag className="w-5 h-5" />
          <span>
            Время вышло у {gameOver === 'white' ? 'белых' : 'чёрных'}! Победа{' '}
            {gameOver === 'white' ? 'чёрных' : 'белых'}.
          </span>
        </div>
      )}
    </div>
  );
}
