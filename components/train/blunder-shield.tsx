'use client';

import { useBlunderShield } from '@/hooks/use-blunder-shield';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Flame,
  RotateCcw,
  Shield,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Chessboard = dynamic(
  () => import('react-chessboard').then((mod) => mod.Chessboard),
  { ssr: false },
);

export function BlunderShield() {
  const {
    currentPuzzle,
    puzzleIndex,
    totalPuzzles,
    currentFen,
    boardOrientation,
    onPieceDrop,
    shieldStatus,
    nextPuzzle,
    retryPuzzle,
    score,
    streak,
  } = useBlunderShield();

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner */}
      <div className="pixel-card-green p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0 shadow-[2px_2px_0_0_#000]">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-pixel-sm text-sm sm:text-base text-white tracking-wider">
                BLUNDER SHIELD [ ЩИТ ОТ ЗЕВКОВ ]
              </h2>
              <span className="font-pixel-sm text-[9px] px-2 py-0.5 bg-[#81b64c] text-black">
                ЗАДАЧА {puzzleIndex + 1}/{totalPuzzles}
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-1">
              «Никогда не теряй фигуру дважды»: научись замечать угрозы соперника и находить единственную защиту!
            </p>
          </div>
        </div>

        {/* Score & Streak HUD */}
        <div className="flex items-center gap-2">
          <div className="pixel-card p-2 flex items-center gap-2 text-white">
            <Flame className="w-4 h-4 text-orange-400" />
            <div className="flex flex-col">
              <span className="font-pixel-sm text-[8px] text-zinc-400">СТРИК</span>
              <span className="font-pixel-sm text-xs text-orange-400">{streak}</span>
            </div>
          </div>

          <div className="pixel-card p-2 flex items-center gap-2 text-white">
            <Shield className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="font-pixel-sm text-[8px] text-zinc-400">ОЧКИ</span>
              <span className="font-pixel-sm text-xs text-emerald-400">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Board + Opponent Threat Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Chessboard */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[500px] aspect-square border-4 border-zinc-800 bg-[#161512] shadow-[6px_6px_0_0_#000] p-1.5 relative">
            <Chessboard
              options={{
                position: currentFen,
                boardOrientation,
                onPieceDrop: ({ sourceSquare, targetSquare }) => {
                  if (!targetSquare) return false;
                  return onPieceDrop(sourceSquare, targetSquare);
                },
                animationDurationInMs: 200,
                boardStyle: {
                  borderRadius: '0px',
                },
                darkSquareStyle: { backgroundColor: '#779952' },
                lightSquareStyle: { backgroundColor: '#edeed1' },
              }}
            />

            {/* Shielded State Overlay */}
            {shieldStatus === 'shielded' && (
              <div className="absolute inset-x-4 bottom-4 bg-[#81b64c]/95 border-2 border-black p-3 text-black text-center shadow-[4px_4px_0_0_#000] animate-in fade-in">
                <div className="font-pixel-sm text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  УГРОЗА ОТБИТА! ЩИТ АКТИВИРОВАН!
                </div>
                <div className="text-[11px] font-mono mt-0.5">
                  Вы нашли точный защитный ресурс!
                </div>
              </div>
            )}

            {/* Blunder State Overlay */}
            {shieldStatus === 'blundered' && (
              <div className="absolute top-4 right-4 bg-red-600/95 text-white font-pixel-sm text-xs px-3 py-2 shadow-[2px_2px_0_0_#000] animate-pulse">
                ✕ ТАКТИЧЕСКИЙ ЗЕВОК! ФИГУРА ПОТЕРЯНА
              </div>
            )}
          </div>

          <div className="w-full max-w-[500px] flex items-center justify-between text-xs text-zinc-400 mt-3 px-1">
            <span className="font-pixel-sm text-[9px]">
              Ваш ход ({boardOrientation === 'white' ? 'Белые' : 'Чёрные'})
            </span>

            {shieldStatus === 'shielded' ? (
              <button
                type="button"
                onClick={nextPuzzle}
                className="pixel-btn text-[10px] flex items-center gap-1.5 px-3 py-1.5 bg-[#81b64c] text-black font-bold cursor-pointer hover:bg-[#74a643]"
              >
                <span>СЛЕДУЮЩИЙ ЩИТ ▶</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={retryPuzzle}
                className="pixel-btn text-[10px] flex items-center gap-1 px-2.5 py-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Сброс</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Threat Dossier & Warnings */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Threat Card */}
          <div className="pixel-card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 font-pixel-sm text-[10px] text-amber-400 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              ПОСЛЕДНИЙ ХОД СОПЕРНИКА: {currentPuzzle.opponentLastMove}
            </div>

            <div className="p-3 bg-red-950/20 border-2 border-red-500/40 text-xs text-red-300 font-sans leading-relaxed">
              ⚠️ <span className="font-bold">Угроза:</span> {currentPuzzle.threatDescription}
            </div>

            {/* Trap Warning */}
            <div className="p-3 bg-[#161512] border-2 border-zinc-800 text-xs text-zinc-300 font-sans leading-relaxed">
              <span className="text-amber-400 font-bold">Осторожно, типовой зевок:</span>{' '}
              {currentPuzzle.commonMistake} — {currentPuzzle.mistakeConsequence}
            </div>

            {/* Explanation when shielded */}
            {shieldStatus === 'shielded' && (
              <div className="p-3 bg-emerald-950/30 border-2 border-emerald-500/60 text-xs text-emerald-300 font-mono leading-relaxed animate-in fade-in">
                🛡️ {currentPuzzle.solutionExplanation}
              </div>
            )}
          </div>

          {/* Defense Rules */}
          <div className="pixel-card p-4 flex flex-col gap-2 text-xs text-zinc-400 leading-relaxed font-sans">
            <div className="font-pixel-sm text-[10px] text-zinc-300">
              ЗОЛОТЫЕ ПРАВИЛА ПРОФИЛАКТИКИ:
            </div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Всегда спрашивай себя: «Чего хочет мой соперник этим ходом?»</li>
              <li>Проверяй незащищенные фигуры (LPDO — Loose Pieces Drop Off).</li>
              <li>Ищи контрудар с шахом, если прямая защита пассивна.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
