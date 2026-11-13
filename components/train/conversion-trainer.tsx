'use client';

import { useConversionGame } from '@/hooks/use-conversion-game';
import {
  Award,
  Bot,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Chessboard = dynamic(
  () => import('react-chessboard').then((mod) => mod.Chessboard),
  { ssr: false },
);

export function ConversionTrainer() {
  const {
    scenarios,
    currentScenario,
    scenarioId,
    setScenarioId,
    currentFen,
    boardOrientation,
    onPieceDrop,
    moveCount,
    maxMoves,
    gameStatus,
    isBotThinking,
    botLevel,
    setBotLevel,
    resetGame,
  } = useConversionGame('conv-extra-piece');

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner */}
      <div className="pixel-card-green p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0 shadow-[2px_2px_0_0_#000]">
            <Swords className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-pixel-sm text-sm sm:text-base text-white tracking-wider">
                CONVERSION TRAINER [ РЕАЛИЗАЦИЯ ПЕРЕВЕСА ]
              </h2>
              <span className="font-pixel-sm text-[9px] px-2 py-0.5 bg-[#81b64c] text-black">
                {currentScenario.evalAdvantage} ПЕРЕВЕС
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-1">
              Учись безжалостно доводить выигранные позиции (+3..+5) до победы против сопротивления спарринг-бота!
            </p>
          </div>
        </div>

        {/* Moves & Bot Status */}
        <div className="flex items-center gap-2">
          <div className="pixel-card p-2 flex items-center gap-2 text-white">
            <Bot className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="font-pixel-sm text-[8px] text-zinc-400">СПАРРИНГ-БОТ</span>
              <span className="font-pixel-sm text-xs text-emerald-400">
                {isBotThinking ? 'ДУМАЕТ...' : `${botLevel} ELO`}
              </span>
            </div>
          </div>

          <div className="pixel-card p-2 flex items-center gap-2 text-white">
            <div className="flex flex-col text-right">
              <span className="font-pixel-sm text-[8px] text-zinc-400">ХОДОВ</span>
              <span className="font-pixel-sm text-xs text-white">
                {moveCount}/{maxMoves}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="font-pixel-sm text-[9px] text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
          [ СИТУАЦИИ ]:
        </span>
        {scenarios.map((sc) => {
          const isSelected = scenarioId === sc.id;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => setScenarioId(sc.id)}
              className={`pixel-btn text-[9px] px-3 py-1.5 cursor-pointer shrink-0 transition-all ${
                isSelected
                  ? 'bg-[#81b64c] text-black font-bold border-[#81b64c]'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              {sc.title} ({sc.evalAdvantage})
            </button>
          );
        })}
      </div>

      {/* Main Grid: Board + Strategic Tips */}
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

            {/* Game Over Screen Overlays */}
            {gameStatus === 'won' && (
              <div className="absolute inset-x-4 bottom-4 bg-[#81b64c]/95 border-2 border-black p-4 text-black text-center shadow-[4px_4px_0_0_#000] animate-in fade-in">
                <div className="font-pixel-sm text-xs font-bold flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  ПЕРЕВЕС УСПЕШНО РЕАЛИЗОВАН! МАТ!
                </div>
                <div className="text-xs font-mono mt-1">
                  Партия выиграна за {moveCount} ходов!
                </div>
              </div>
            )}
            {gameStatus === 'draw' && (
              <div className="absolute inset-x-4 bottom-4 bg-amber-500/95 border-2 border-black p-4 text-black text-center shadow-[4px_4px_0_0_#000] animate-in fade-in">
                <div className="font-pixel-sm text-xs font-bold">
                  НИЧЬЯ / ПАТ ИЛИ ЛИМИТ ХОДОВ!
                </div>
                <div className="text-xs font-mono mt-1">
                  Не допускайте пата и активности соперника!
                </div>
              </div>
            )}
            {gameStatus === 'lost' && (
              <div className="absolute inset-x-4 bottom-4 bg-red-600/95 border-2 border-black p-4 text-white text-center shadow-[4px_4px_0_0_#000] animate-in fade-in">
                <div className="font-pixel-sm text-xs font-bold">
                  СОПЕРНИК ПЕРЕХВАТИЛ ИНИЦИАТИВУ!
                </div>
              </div>
            )}
          </div>

          <div className="w-full max-w-[500px] flex items-center justify-between text-xs text-zinc-400 mt-3 px-1">
            <button
              type="button"
              onClick={resetGame}
              className="pixel-btn text-[10px] flex items-center gap-1.5 px-3 py-1.5 text-zinc-300 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Начать заново</span>
            </button>

            <span className="font-pixel-sm text-[9px] text-[#81b64c]">
              {isBotThinking ? 'Бот делает ответный ход...' : 'Ваш ход'}
            </span>
          </div>
        </div>

        {/* Right: Objective & Strategy */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="pixel-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2">
              <span className="font-pixel-sm text-[10px] text-zinc-400">
                ЦЕЛЬ СЦЕНАРИЯ
              </span>
              <span className="font-pixel-sm text-[10px] text-[#81b64c]">
                {currentScenario.category}
              </span>
            </div>

            <h3 className="font-pixel-sm text-sm text-white">
              {currentScenario.title}
            </h3>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {currentScenario.objective}
            </p>

            {/* Strategic Tips */}
            <div className="pt-2 border-t-2 border-zinc-800 flex flex-col gap-2">
              <span className="font-pixel-sm text-[10px] text-amber-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                СОВЕТЫ ПО РЕАЛИЗАЦИИ:
              </span>
              {currentScenario.strategicTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 font-sans">
                  <span className="font-pixel-sm text-[9px] text-[#81b64c] shrink-0 mt-0.5">
                    •
                  </span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bot Level Selector */}
          <div className="pixel-card p-4 flex flex-col gap-2">
            <span className="font-pixel-sm text-[9px] text-zinc-400 uppercase tracking-wider">
              УРОВЕНЬ СПАРРИНГ-БОТА
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[1000, 1400, 1800, 2100].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setBotLevel(lvl)}
                  className={`pixel-btn text-[9px] py-1.5 cursor-pointer ${
                    botLevel === lvl
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {lvl} ELO
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
