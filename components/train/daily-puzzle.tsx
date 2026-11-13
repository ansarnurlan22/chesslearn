'use client';

import { usePuzzleSolver } from '@/hooks/use-puzzle-solver';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  RotateCw,
  Trophy,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Chessboard = dynamic(
  () => import('react-chessboard').then((mod) => mod.Chessboard),
  { ssr: false },
);

export function DailyPuzzle() {
  const {
    currentPuzzle,
    selectedDay,
    todayDay,
    selectDay,
    solvedDays,
    currentStreak,
    bestStreak,
    dailyPuzzles,
    currentFen,
    boardOrientation,
    flipBoard,
    onPieceDrop,
    isSolved,
    feedback,
    hintLevel,
    requestNextHint,
    resetPuzzle,
    hints,
  } = usePuzzleSolver();

  const now = new Date();
  const currentMonthName = now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).toUpperCase();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header Banner */}
      <div className="pixel-card-amber p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shrink-0 shadow-[2px_2px_0_0_#000]">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-pixel-sm text-sm sm:text-base text-white tracking-wider">
                ЗАДАЧА ДНЯ & КАЛЕНДАРЬ
              </h2>
              <span className="font-pixel-sm text-[9px] px-2 py-0.5 bg-amber-400 text-black">
                {selectedDay} {currentMonthName}
              </span>
              {selectedDay === todayDay && (
                <span className="font-pixel-sm text-[8px] px-1.5 py-0.5 bg-emerald-500 text-black">
                  [ СЕГОДНЯ ]
                </span>
              )}
            </div>
            <p className="text-xs text-amber-200/90 mt-1">
              Каждый день новая задача. Решайте ежедневно для прокачки серии побед и синхронизации с Supabase!
            </p>
          </div>
        </div>

        {/* Streak HUD */}
        <div className="flex items-center gap-2">
          <div className="pixel-card p-2.5 flex items-center gap-2 text-white">
            <Flame className="w-5 h-5 text-orange-400" />
            <div className="flex flex-col">
              <span className="font-pixel-sm text-[8px] text-zinc-400">ТЕКУЩИЙ СТРИК</span>
              <span className="font-pixel-sm text-sm text-orange-400">
                {currentStreak > 0 ? `${currentStreak} ДНЕЙ` : `${solvedDays.length} ДНЕЙ`}
              </span>
            </div>
          </div>

          <div className="pixel-card p-2.5 flex items-center gap-2 text-white">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <div className="flex flex-col">
              <span className="font-pixel-sm text-[8px] text-zinc-400">РЕКОРД</span>
              <span className="font-pixel-sm text-sm text-yellow-400">
                {bestStreak > 0 ? `${bestStreak}` : `${solvedDays.length}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Board + Controls + Calendar */}
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
                darkSquareStyle: { backgroundColor: '#b58863' },
                lightSquareStyle: { backgroundColor: '#f0d9b5' },
              }}
            />

            {/* Solved Banner */}
            {isSolved && (
              <div className="absolute inset-x-4 bottom-4 bg-[#81b64c]/95 border-2 border-black p-3 text-black text-center shadow-[4px_4px_0_0_#000] animate-in fade-in">
                <div className="font-pixel-sm text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  ЗАДАЧА РЕШЕНА!
                </div>
                <div className="text-[11px] font-mono mt-0.5">
                  Рейтинг +12 • Отличная работа!
                </div>
              </div>
            )}
          </div>

          {/* Quick Toolbar */}
          <div className="w-full max-w-[500px] flex items-center justify-between text-xs text-zinc-400 mt-3 px-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={flipBoard}
                className="pixel-btn text-[10px] flex items-center gap-1 px-2.5 py-1.5 text-zinc-300 hover:text-white cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>Перевернуть</span>
              </button>
              <button
                type="button"
                onClick={resetPuzzle}
                className="pixel-btn text-[10px] flex items-center gap-1 px-2.5 py-1.5 text-zinc-300 hover:text-white cursor-pointer"
              >
                <span>Сброс</span>
              </button>
            </div>

            <span className="font-pixel-sm text-[9px] text-amber-400">
              Ход {boardOrientation === 'white' ? 'БЕЛЫХ' : 'ЧЁРНЫХ'}
            </span>
          </div>
        </div>

        {/* Right: Puzzle Info, Hints & Calendar Widget */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Puzzle Info Box */}
          <div className="pixel-card p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2">
              <span className="font-pixel-sm text-[10px] text-zinc-400">
                ТЕМА: {currentPuzzle.theme}
              </span>
              <span className="font-pixel-sm text-[10px] text-[#81b64c]">
                ~{currentPuzzle.rating} ELO
              </span>
            </div>

            <h3 className="font-pixel-sm text-sm text-white">
              {currentPuzzle.title}
            </h3>

            {/* Coach Speech Bubble */}
            <div className="p-3 bg-[#161512] border-2 border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-300">
              <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="italic text-zinc-300 font-sans leading-relaxed">
                {currentPuzzle.quote}
              </p>
            </div>

            {/* 3-Level Progressive Hint System */}
            <div className="pt-2 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-pixel-sm text-[9px] text-zinc-400">
                  СИСТЕМА ПОДСКАЗОК ({hintLevel}/3)
                </span>
                {hintLevel < 3 && !isSolved && (
                  <button
                    type="button"
                    onClick={requestNextHint}
                    className="pixel-btn text-[9px] flex items-center gap-1 px-2 py-1 text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    <span>ПОДСКАЗКА #{hintLevel + 1}</span>
                  </button>
                )}
              </div>

              {hintLevel >= 1 && (
                <div className="p-2 bg-[#211f1c] border border-amber-500/30 text-xs text-amber-300 font-mono">
                  [1] Фигура: {hints.piece}
                </div>
              )}
              {hintLevel >= 2 && (
                <div className="p-2 bg-[#211f1c] border border-amber-500/30 text-xs text-amber-300 font-mono">
                  [2] Поле: {hints.targetSquare}
                </div>
              )}
              {hintLevel >= 3 && (
                <div className="p-2 bg-[#211f1c] border border-amber-500/30 text-xs text-amber-300 font-mono">
                  [3] Ход: {hints.fullMove}
                </div>
              )}
            </div>
          </div>

          {/* Monthly Calendar Widget */}
          <div className="pixel-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2">
              <div className="flex items-center gap-1.5 font-pixel-sm text-[10px] text-white">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentMonthName}</span>
              </div>
              <span className="font-pixel-sm text-[9px] text-zinc-400">
                {solvedDays.length}/{daysInMonth} РЕШЕНО
              </span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
                <span key={d} className="font-pixel-sm text-[8px] text-zinc-500 pb-1">
                  {d}
                </span>
              ))}

              {daysArray.map((day) => {
                const isSelected = selectedDay === day;
                const isDaySolved = solvedDays.includes(day);
                const hasPuzzle = dailyPuzzles.some((p) => p.day === day);

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={!hasPuzzle}
                    onClick={() => selectDay(day)}
                    className={`h-9 flex flex-col items-center justify-center font-pixel-sm text-[9px] border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                        : isDaySolved
                        ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400'
                        : hasPuzzle
                        ? 'border-zinc-800 bg-[#161512] text-zinc-300 hover:border-zinc-600'
                        : 'border-transparent text-zinc-700'
                    }`}
                  >
                    <span>{day}</span>
                    {isDaySolved && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
