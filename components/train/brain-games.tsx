'use client';

import { useBrainGames, type BrainGameType } from '@/hooks/use-brain-games';
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Clock,
  Crown,
  Eye,
  EyeOff,
  Flame,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { useMemo } from 'react';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export function BrainGames() {
  const {
    activeGame,
    setActiveGame,
    // Square rush
    targetSquare,
    rushScore,
    rushStreak,
    rushTimeLeft,
    isRushActive,
    startSquareRush,
    onSquareClick,
    // 8 Queens
    queens,
    queensHasConflict,
    queensSolved,
    toggleQueen,
    resetQueens,
    // Blind moves
    currentBlind,
    blindIndex,
    totalBlindQuestions,
    blindSelectedOption,
    blindIsCorrect,
    answerBlind,
    nextBlind,
  } = useBrainGames();

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner */}
      <div className="pixel-card-amber p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shrink-0 shadow-[2px_2px_0_0_#000]">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-pixel-sm text-sm sm:text-base text-white tracking-wider">
              BRAIN GYM [ ШАХМАТНЫЙ ФИТНЕС МОЗГА ]
            </h2>
            <p className="text-xs text-amber-200/90 mt-1">
              Когнитивные тренажеры: слепая визуализация ходов, мгновенное распознавание полей и расчет в уме!
            </p>
          </div>
        </div>

        {/* Game Switcher Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <button
            type="button"
            onClick={() => setActiveGame('squareRush')}
            className={`pixel-btn text-[9px] flex items-center gap-1.5 px-3 py-2 cursor-pointer ${
              activeGame === 'squareRush'
                ? 'bg-amber-400 text-black font-bold border-amber-400'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>SQUARE RUSH (БЛИЦ-ПОЛЯ)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveGame('eightQueens')}
            className={`pixel-btn text-[9px] flex items-center gap-1.5 px-3 py-2 cursor-pointer ${
              activeGame === 'eightQueens'
                ? 'bg-amber-400 text-black font-bold border-amber-400'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>8 ФЕРЗЕЙ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveGame('blindMoves')}
            className={`pixel-btn text-[9px] flex items-center gap-1.5 px-3 py-2 cursor-pointer ${
              activeGame === 'blindMoves'
                ? 'bg-amber-400 text-black font-bold border-amber-400'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>СЛЕПОЙ РАСЧЁТ</span>
          </button>
        </div>
      </div>

      {/* --- GAME 1: SQUARE RUSH --- */}
      {activeGame === 'squareRush' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* 8x8 Coordinate Board */}
            <div className="w-full max-w-[500px] aspect-square border-4 border-zinc-800 bg-[#161512] shadow-[6px_6px_0_0_#000] p-1 grid grid-cols-8 grid-rows-8">
              {RANKS.map((r, rIdx) =>
                FILES.map((f, fIdx) => {
                  const square = `${f}${r}`;
                  const isDark = (rIdx + fIdx) % 2 === 1;
                  return (
                    <button
                      key={square}
                      type="button"
                      disabled={!isRushActive}
                      onClick={() => onSquareClick(square)}
                      className={`relative flex items-center justify-center font-pixel-sm text-[8px] transition-colors cursor-pointer disabled:cursor-not-allowed ${
                        isDark ? 'bg-[#779952] text-[#33461e]' : 'bg-[#edeed1] text-[#939474]'
                      } hover:brightness-110 active:brightness-90`}
                    >
                      {/* Show corner coordinates on outer edges */}
                      {fIdx === 0 && (
                        <span className="absolute top-0.5 left-1 text-[7px] font-bold opacity-60">
                          {r}
                        </span>
                      )}
                      {rIdx === 7 && (
                        <span className="absolute bottom-0.5 right-1 text-[7px] font-bold opacity-60">
                          {f}
                        </span>
                      )}
                    </button>
                  );
                }),
              )}
            </div>

            <div className="w-full max-w-[500px] flex items-center justify-between text-xs text-zinc-400 mt-3 px-1">
              <span className="font-pixel-sm text-[9px]">
                {isRushActive ? 'Кликайте на целевое поле!' : 'Нажмите старт для начала спринта'}
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Target Display Box */}
            <div className="pixel-card-amber p-6 flex flex-col items-center text-center gap-3">
              <span className="font-pixel-sm text-[10px] text-amber-900 uppercase font-bold">
                НАЙДИТЕ ПОЛЕ:
              </span>
              <div className="font-pixel text-5xl text-black py-2 tracking-wider animate-pulse">
                {isRushActive ? targetSquare.toUpperCase() : '??'}
              </div>

              {isRushActive ? (
                <div className="flex items-center gap-3 text-xs text-amber-950 font-bold">
                  <span>⏱ Время: {rushTimeLeft}с</span>
                  <span>🔥 Стрик: {rushStreak}</span>
                  <span>⭐ Очки: {rushScore}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startSquareRush}
                  className="pixel-btn text-xs px-6 py-3 bg-black text-amber-400 font-pixel flex items-center gap-2 cursor-pointer hover:bg-zinc-900"
                >
                  <Zap className="w-4 h-4" />
                  <span>СТАРТ (30 СЕКУНД) ▶</span>
                </button>
              )}
            </div>

            <div className="pixel-card p-4 flex flex-col gap-2 text-xs text-zinc-400 font-sans">
              <div className="font-pixel-sm text-[10px] text-zinc-300">
                КАК РАБОТАЕТ ТРЕНАЖЕР:
              </div>
              <p>
                Мгновенное распознавание клеток доски жизненно необходимо для быстрого расчета вариантов и анализа нотации без секундного замешательства.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- GAME 2: 8 QUEENS --- */}
      {activeGame === 'eightQueens' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* 8x8 Board for Queens */}
            <div className="w-full max-w-[500px] aspect-square border-4 border-zinc-800 bg-[#161512] shadow-[6px_6px_0_0_#000] p-1 grid grid-cols-8 grid-rows-8">
              {RANKS.map((r, rIdx) =>
                FILES.map((f, fIdx) => {
                  const square = `${f}${r}`;
                  const isDark = (rIdx + fIdx) % 2 === 1;
                  const hasQueen = queens.includes(square);
                  return (
                    <button
                      key={square}
                      type="button"
                      onClick={() => toggleQueen(square)}
                      className={`relative flex items-center justify-center font-pixel-sm text-sm transition-all cursor-pointer ${
                        hasQueen
                          ? 'bg-amber-400 text-black border-2 border-black font-bold shadow-[2px_2px_0_0_#000]'
                          : isDark
                          ? 'bg-[#779952] hover:bg-[#688746]'
                          : 'bg-[#edeed1] hover:bg-[#d8d9b8]'
                      }`}
                    >
                      {hasQueen ? '♛' : null}
                    </button>
                  );
                }),
              )}
            </div>

            <div className="w-full max-w-[500px] flex items-center justify-between text-xs text-zinc-400 mt-3 px-1">
              <span className="font-pixel-sm text-[9px] text-amber-400">
                Поставлено ферзей: {queens.length} из 8
              </span>
              <button
                type="button"
                onClick={resetQueens}
                className="pixel-btn text-[10px] flex items-center gap-1 px-2.5 py-1 text-zinc-300 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Очистить доску</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="pixel-card p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2">
                <span className="font-pixel-sm text-[10px] text-zinc-400">
                  ГОЛОВОЛОМКА 8 ФЕРЗЕЙ
                </span>
                <span className="font-pixel-sm text-[10px] text-amber-400">
                  {queens.length}/8
                </span>
              </div>

              {queensSolved ? (
                <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500 text-emerald-300 text-center font-pixel-sm text-xs">
                  🎉 ПОБЕДА! ВЫ РАССТАВИЛИ 8 ФЕРЗЕЙ БЕЗ ВЗАИМНОГО БОЯ!
                </div>
              ) : queensHasConflict ? (
                <div className="p-3 bg-red-950/30 border-2 border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Внимание: два или более ферзей атакуют друг друга!</span>
                </div>
              ) : (
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  Расставьте 8 ферзей на доске так, чтобы ни один ферзь не бил другого по вертикали, горизонтали или диагонали.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- GAME 3: BLIND MOVES --- */}
      {activeGame === 'blindMoves' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="pixel-card p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2">
                <span className="font-pixel-sm text-[10px] text-zinc-400">
                  СЛЕПОЙ РАСЧЁТ (ВОПРОС {blindIndex + 1} ИЗ {totalBlindQuestions})
                </span>
                <span className="font-pixel-sm text-[10px] text-amber-400">
                  БЕЗ ДОСКИ
                </span>
              </div>

              <div>
                <span className="font-pixel-sm text-[9px] text-zinc-500">
                  ПОТОК ХОДОВ В УМЕ:
                </span>
                <div className="mt-1 p-3 bg-[#161512] border-2 border-zinc-800 font-pixel text-sm text-amber-300 tracking-wider">
                  {currentBlind.moves}
                </div>
              </div>

              <div className="pt-2">
                <h3 className="font-pixel-sm text-xs text-white">
                  {currentBlind.question}
                </h3>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {currentBlind.options.map((opt, idx) => {
                  const isSelected = blindSelectedOption === idx;
                  const isCorrect = idx === currentBlind.correctIndex;

                  let btnStyle = 'text-zinc-300 hover:text-white border-zinc-700';
                  if (blindSelectedOption !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-red-500/20 border-red-500 text-red-300';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={blindSelectedOption !== null}
                      onClick={() => answerBlind(idx)}
                      className={`pixel-btn text-[10px] p-3 text-left cursor-pointer transition-all ${btnStyle}`}
                    >
                      <span className="font-pixel-sm text-[8px] text-zinc-500 mr-2">
                        [{String.fromCharCode(65 + idx)}]
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {blindSelectedOption !== null && (
                <div className="pt-3 border-t-2 border-zinc-800 flex flex-col gap-3 animate-in fade-in">
                  <div className="text-xs text-zinc-300 font-mono">
                    💡 {currentBlind.explanation}
                  </div>
                  <button
                    type="button"
                    onClick={nextBlind}
                    className="pixel-btn text-[10px] px-4 py-2 bg-[#81b64c] text-black font-bold self-start cursor-pointer hover:bg-[#74a643]"
                  >
                    СЛЕДУЮЩИЙ ВОПРОС ▶
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="pixel-card p-4 flex flex-col gap-2 text-xs text-zinc-400 font-sans">
              <div className="font-pixel-sm text-[10px] text-zinc-300">
                ЗАЧЕМ ТРЕНИРОВАТЬ ИГРУ ВСЛЕПУЮ?
              </div>
              <p>
                Шахматное мастерство базируется на внутренней ментальной доске. Способность удерживать положение фигур в голове освобождает когнитивный ресурс для глубокого тактического перебора ходов-кандидатов.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
