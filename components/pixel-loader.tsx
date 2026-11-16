import React from 'react';

export function PixelCheeseIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* 8-bit pixel art cheese slice */}
      <rect x="10" y="2" width="4" height="2" fill="#fbbf24" />
      <rect x="8" y="4" width="8" height="2" fill="#fbbf24" />
      <rect x="6" y="6" width="12" height="2" fill="#f59e0b" />
      <rect x="4" y="8" width="16" height="2" fill="#f59e0b" />
      <rect x="4" y="10" width="16" height="2" fill="#f59e0b" />
      <rect x="2" y="12" width="20" height="2" fill="#d97706" />
      <rect x="2" y="14" width="20" height="2" fill="#d97706" />
      <rect x="2" y="16" width="20" height="4" fill="#b45309" />

      {/* Cheese holes in pixel style */}
      <rect x="6" y="10" width="2" height="2" fill="#78350f" />
      <rect x="14" y="8" width="3" height="2" fill="#78350f" />
      <rect x="10" y="14" width="4" height="2" fill="#78350f" />
      <rect x="16" y="14" width="2" height="2" fill="#78350f" />

      {/* Highlights */}
      <rect x="8" y="4" width="2" height="1" fill="#fef08a" />
      <rect x="6" y="6" width="2" height="1" fill="#fef08a" />
    </svg>
  );
}

export function PixelLoader({
  text = 'ЗАГРУЗКА ШАХМАТНЫХ ДАННЫХ...',
}: {
  text?: string;
}) {
  return (
    <div className="min-h-screen bg-[#141310] flex flex-col items-center justify-center py-24 px-4 arcade-grid">
      <div className="pixel-card bg-[#1c1a17] p-8 max-w-sm w-full flex flex-col items-center text-center gap-5 border-2 border-amber-500/40 shadow-[6px_6px_0px_0px_#0c0b09]">
        {/* Animated jumping pixel cheese */}
        <div className="relative animate-bounce">
          <PixelCheeseIcon className="w-16 h-16 drop-shadow-[0_4px_10px_rgba(245,158,11,0.35)]" />
        </div>

        {/* 8-bit text label */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-pixel text-[11px] sm:text-xs text-amber-400 tracking-wider">
            {text}
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            ПОДКЛЮЧЕНИЕ К ШАХМАТНОМУ СЕРВЕРУ
          </span>
        </div>

        {/* 8-bit segmented loading bar */}
        <div className="w-full bg-[#12110e] border-2 border-[#3d372e] p-1 flex gap-1">
          <div className="h-3 flex-1 bg-amber-400 animate-pulse" />
          <div className="h-3 flex-1 bg-amber-400 animate-pulse [animation-delay:150ms]" />
          <div className="h-3 flex-1 bg-amber-400 animate-pulse [animation-delay:300ms]" />
          <div className="h-3 flex-1 bg-amber-500 animate-pulse [animation-delay:450ms]" />
          <div className="h-3 flex-1 bg-zinc-700 animate-pulse [animation-delay:600ms]" />
        </div>
      </div>
    </div>
  );
}
