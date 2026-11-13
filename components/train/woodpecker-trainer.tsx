'use client';

import { useWoodpecker, type WoodpeckerTier } from '@/hooks/use-woodpecker';
import {
  Award,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const Chessboard = dynamic(
  () => import('react-chessboard').then((mod) => mod.Chessboard),
  { ssr: false },
);

const TIERS: { id: WoodpeckerTier; label: string; rating: string }[] = [
  { id: 'all', label: 'Все уровни', rating: '1000-2000' },
  { id: 'beginner', label: 'Новичок', rating: '1000+' },
  { id: 'casual', label: 'Любитель', rating: '1200+' },
  { id: 'club', label: 'Клубный', rating: '1450+' },
  { id: 'tournament', label: 'Турнирный', rating: '1650+' },
  { id: 'master', label: 'Мастер', rating: '1850+' },
];

export function WoodpeckerTrainer() {
  const {
    cycle,
    totalCycles,
    currentPuzzle,
    puzzleIndex,
    totalPuzzles,
    selectedTier,
    changeTier,
    currentFen,
    boardOrientation,
    onPieceDrop,
    streak,
    solvedCount,
    errorCount,
    cycleTime,
    isCompletedCycle,
    startNextCycle,
    resetAllCycles,
    feedback,
  } = useWoodpecker('all');

  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header & Cycle HUD */}
      <div className="pixel-card-green p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-12 h-12 bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0 shadow-[2px_2px_0_0_#000]">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-pixel-sm text-sm sm:text-base text-white tracking-wider">
                WOODPECKER METHOD [ МЕТОД ДЯТЛА ]
              </h2>
              <span className="font-pixel-sm text-[9px] px-2 py-0.5 bg-[#81b64c] text-black">
                ЦИКЛ {cycle}/{totalCycles}
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-1">
              Интервальное повторение тактики: повтори сет с сокращением времени вдвое для автоматизма паттернов!
            </p>
          </div>
        </div>

        {/* HUD Counters */}
        <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
          <div className="pixel-card p-2 flex items-center gap-2 text-white">
            <Clock className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col">
              <span className="font-pixel-sm text-[8px] text-zinc-400">ВРЕМЯ</span>
              <span className="font-pixel-sm text-xs text-amber-400">{cycleTime}</span>
            </div>
          </div>

          <div className="pixel-card p-2 flex items-center gap-2 text-white">
            <Flame className="w-4 h-4 text-orange-400" />
            <div className="flex flex-col">
              <span className="font-pixel-sm text-[8px] text-zinc-400">СТРИК</span>
              <span className="font-pixel-sm text-xs text-orange-400">{streak}</span>
            </div>
          </div>

          <div className="pixel-card p-2 flex items-center gap-2 text-white">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="font-pixel-sm text-[8px] text-zinc-400">РЕШЕНО</span>
              <span className="font-pixel-sm text-xs text-emerald-400">
                {solvedCount}/{totalPuzzles}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="font-pixel-sm text-[9px] text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
          [ СЕТЫ ]:
        </span>
        {TIERS.map((tier) => {
          const isActive = selectedTier === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => changeTier(tier.id)}
              className={`pixel-btn text-[9px] px-3 py-1.5 cursor-pointer shrink-0 transition-all ${
                isActive
                  ? 'bg-[#81b64c] text-black border-[#81b64c] font-bold'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              {tier.label} ({tier.rating})
            </button>
          );
        })}
      </div>

      {/* Main Grid: Board + Information */}
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

            {/* Flash Feedback Overlay */}
            {feedback === 'correct' && (
              <div className="absolute top-4 right-4 bg-emerald-500/90 text-black font-pixel-sm text-xs px-3 py-1.5 shadow-[2px_2px_0_0_#000] animate-bounce">
                ✓ ВЕРНЫЙ ХОД!
              </div>
            )}
            {feedback === 'wrong' && (
              <div className="absolute top-4 right-4 bg-red-500/90 text-white font-pixel-sm text-xs px-3 py-1.5 shadow-[2px_2px_0_0_#000] animate-pulse">
                ✕ ОШИБКА! ПОПРОБУЙ СНОВА
              </div>
            )}
          </div>

          <div className="w-full max-w-[500px] flex items-center justify-between text-xs text-zinc-400 mt-2 px-1">
            <span className="font-pixel-sm text-[9px]">
              Ход {boardOrientation === 'white' ? 'БЕЛЫХ' : 'ЧЁРНЫХ'}
            </span>
            <span className="font-pixel-sm text-[9px] text-[#81b64c]">
              Задача {puzzleIndex + 1} из {totalPuzzles}
            </span>
          </div>
        </div>

        {/* Right: Tactics Dossier & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {isCompletedCycle ? (
            /* Completed Cycle Screen */
            <div className="pixel-card-green p-6 flex flex-col items-center text-center gap-4">
              <Award className="w-16 h-16 text-yellow-400 animate-bounce" />
              <div>
                <h3 className="font-pixel-sm text-base text-white">
                  ЦИКЛ {cycle} ЗАВЕРШЁН!
                </h3>
                <p className="text-xs text-emerald-200 mt-1">
                  Время: <span className="font-mono font-bold">{cycleTime}</span> • Ошибок: {errorCount}
                </p>
              </div>

              {cycle < totalCycles ? (
                <button
                  type="button"
                  onClick={startNextCycle}
                  className="pixel-btn text-xs px-6 py-3 bg-[#81b64c] text-black font-bold flex items-center gap-2 cursor-pointer hover:bg-[#74a643]"
                >
                  <Play className="w-4 h-4" />
                  <span>НАЧАТЬ ЦИКЛ {cycle + 1} (В 2 РАЗА БЫСТРЕЕ!) ▶</span>
                </button>
              ) : (
                <div className="text-xs text-emerald-300 font-pixel-sm">
                  🎉 ВЫ ОСВОИЛИ ВСЕ 5 ЦИКЛОВ МЕТОДА ДЯТЛА!
                </div>
              )}

              <button
                type="button"
                onClick={resetAllCycles}
                className="pixel-btn text-[10px] px-4 py-2 text-zinc-400 hover:text-white cursor-pointer"
              >
                Сбросить и начать заново
              </button>
            </div>
          ) : currentPuzzle ? (
            /* Active Puzzle Dossier */
            <div className="pixel-card p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3">
                <span className="font-pixel-sm text-[10px] text-zinc-400">
                  ТАКТИЧЕСКИЙ МОТИВ
                </span>
                <span className="font-pixel-sm text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {currentPuzzle.themeName}
                </span>
              </div>

              <div>
                <h3 className="font-pixel-sm text-sm text-white leading-snug">
                  Рейтинг задачи: ~{currentPuzzle.rating} ELO
                </h3>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed font-sans">
                  {currentPuzzle.description}
                </p>
              </div>

              {/* Toggle Explanation / Hint */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="pixel-btn text-[10px] flex items-center gap-1.5 px-3 py-1.5 text-zinc-300 hover:text-white cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>{showExplanation ? 'СКРЫТЬ ОБЪЯСНЕНИЕ' : 'ПОДСКАЗКА / РЕШЕНИЕ'}</span>
                </button>

                {showExplanation && (
                  <div className="mt-3 p-3 bg-[#161512] border-2 border-zinc-800 text-xs text-emerald-300 font-mono leading-relaxed">
                    💡 {currentPuzzle.explanation}
                  </div>
                )}
              </div>

              {/* Quick Cycle Actions */}
              <div className="flex items-center gap-2 pt-3 border-t-2 border-zinc-800">
                <button
                  type="button"
                  onClick={resetAllCycles}
                  className="pixel-btn text-[10px] flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Сбросить цикл</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* Info Card: The Axel Smith Woodpecker Method */}
          <div className="pixel-card p-4 flex flex-col gap-2 text-xs text-zinc-400 leading-relaxed font-sans">
            <div className="flex items-center gap-2 font-pixel-sm text-[10px] text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-[#81b64c]" />
              В ЧЁМ СУТЬ МЕТОДА ДЯТЛА?
            </div>
            <p>
              Гроссмейстеры Аксель Смит и Ханс Тикканен доказали: многократное быстрое решение одного и того же сета задач (5 циклов) перезаписывает подсознание, ускоряя распознавание шахматных паттернов до долей секунды.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
