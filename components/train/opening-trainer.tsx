'use client';

import { useOpeningRepertoire, type RepertoireMode } from '@/hooks/use-opening-repertoire';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Swords,
  Target,
  Trophy,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Chessboard = dynamic(
  () => import('react-chessboard').then((mod) => mod.Chessboard),
  { ssr: false },
);

const MODES: { id: RepertoireMode; label: string; desc: string; icon: React.ElementType }[] = [
  { id: 'learn', label: 'Обучение', desc: 'Пошаговый разбор идей', icon: BookOpen },
  { id: 'practice', label: 'Практика', desc: 'Ходы по памяти с откатом', icon: Target },
  { id: 'arena', label: 'Арена', desc: 'Игра против линии бота', icon: Swords },
  { id: 'streak', label: 'Стрик', desc: 'Серия ходов на выживание', icon: Flame },
];

export function OpeningTrainer() {
  const {
    courses,
    currentCourse,
    courseId,
    setCourseId,
    mode,
    setMode,
    currentPly,
    totalPlies,
    currentFen,
    boardOrientation,
    currentMoveMeta,
    stepForward,
    stepBackward,
    goToStart,
    goToEnd,
    onPieceDrop,
    practiceStatus,
    resetPractice,
    streakCount,
    maxStreak,
  } = useOpeningRepertoire('italian-game');

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner & Mode Switcher */}
      <div className="pixel-card-green p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0 shadow-[2px_2px_0_0_#000]">
            <BookOpen className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-pixel-sm text-sm sm:text-base text-white tracking-wider">
                OPENING TRAINER [ РЕПЕРТУАР ДЕБЮТОВ ]
              </h2>
              <span className="font-pixel-sm text-[9px] px-2 py-0.5 bg-[#81b64c] text-black">
                {currentCourse.nameRu} ({currentCourse.eco})
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-1">
              Освой дебютные планы, типичные пешечные структуры и закрепи варианты активным воспроизведением!
            </p>
          </div>
        </div>

        {/* Mode Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`pixel-btn text-[9px] flex items-center gap-1.5 px-3 py-2 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#81b64c] text-black font-bold border-[#81b64c]'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Courses Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="font-pixel-sm text-[9px] text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
          [ ДЕБЮТЫ ]:
        </span>
        {courses.map((course) => {
          const isSelected = courseId === course.id;
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => setCourseId(course.id)}
              className={`pixel-btn text-[9px] px-3 py-1.5 cursor-pointer shrink-0 transition-all ${
                isSelected
                  ? 'bg-amber-400 text-black border-amber-400 font-bold'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              {course.nameRu} [{course.side === 'white' ? 'БЕЛЫЕ' : 'ЧЁРНЫЕ'}]
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
                onPieceDrop: mode === 'learn' ? undefined : ({ sourceSquare, targetSquare }) => {
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

            {/* Practice Overlays */}
            {practiceStatus === 'completed' && (
              <div className="absolute inset-x-4 bottom-4 bg-[#81b64c]/95 border-2 border-black p-3 text-black text-center shadow-[4px_4px_0_0_#000] animate-in fade-in">
                <div className="font-pixel-sm text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  ЛИНИЯ УСПЕШНО ОСВОЕНА!
                </div>
                <div className="text-[11px] font-mono mt-0.5">
                  Вы сыграли все {totalPlies} ходов по памяти без ошибок!
                </div>
              </div>
            )}
            {practiceStatus === 'wrong' && (
              <div className="absolute top-4 right-4 bg-red-500/90 text-white font-pixel-sm text-xs px-3 py-1.5 shadow-[2px_2px_0_0_#000] animate-pulse">
                ✕ НЕВЕРНЫЙ ХОД! АВТО-ОТКАТ...
              </div>
            )}
          </div>

          {/* Stepper Toolbar (For Learn Mode) */}
          {mode === 'learn' ? (
            <div className="w-full max-w-[500px] flex items-center justify-between text-xs text-zinc-400 mt-3 px-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={goToStart}
                  disabled={currentPly === 0}
                  className="pixel-btn text-[10px] px-2.5 py-1.5 text-zinc-300 hover:text-white disabled:opacity-40 cursor-pointer"
                >
                  |◀
                </button>
                <button
                  type="button"
                  onClick={stepBackward}
                  disabled={currentPly === 0}
                  className="pixel-btn text-[10px] px-2.5 py-1.5 text-zinc-300 hover:text-white disabled:opacity-40 cursor-pointer"
                >
                  ◀ Назад
                </button>
                <button
                  type="button"
                  onClick={stepForward}
                  disabled={currentPly >= totalPlies}
                  className="pixel-btn text-[10px] px-2.5 py-1.5 text-zinc-300 hover:text-white disabled:opacity-40 cursor-pointer"
                >
                  Вперёд ▶
                </button>
                <button
                  type="button"
                  onClick={goToEnd}
                  disabled={currentPly >= totalPlies}
                  className="pixel-btn text-[10px] px-2.5 py-1.5 text-zinc-300 hover:text-white disabled:opacity-40 cursor-pointer"
                >
                  ▶|
                </button>
              </div>

              <span className="font-pixel-sm text-[9px] text-[#81b64c]">
                Полуход {currentPly} из {totalPlies}
              </span>
            </div>
          ) : (
            /* Practice Controls */
            <div className="w-full max-w-[500px] flex items-center justify-between text-xs text-zinc-400 mt-3 px-1">
              <button
                type="button"
                onClick={resetPractice}
                className="pixel-btn text-[10px] flex items-center gap-1.5 px-3 py-1.5 text-zinc-300 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Начать заново</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="font-pixel-sm text-[9px] text-orange-400">
                  СТРИК: {streakCount} (РЕКОРД: {maxStreak})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Explanations & Strategy Dossier */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Current Move Annotation */}
          <div className="pixel-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2">
              <span className="font-pixel-sm text-[10px] text-zinc-400">
                {mode === 'learn' ? 'РАЗБОР ХОДА' : 'РЕЖИМ ПАМЯТИ'}
              </span>
              <span className="font-pixel-sm text-[10px] text-amber-400">
                {currentCourse.nameRu}
              </span>
            </div>

            {mode === 'learn' && currentMoveMeta ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-lg text-white">
                    {Math.floor((currentMoveMeta.ply - 1) / 2) + 1}.
                    {currentMoveMeta.ply % 2 === 0 ? '..' : ' '}
                    {currentMoveMeta.san}
                  </span>
                  <span className="font-pixel-sm text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {currentMoveMeta.keyIdea}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans mt-1">
                  {currentMoveMeta.explanation}
                </p>
              </div>
            ) : mode === 'learn' ? (
              <p className="text-xs text-zinc-400 italic">
                Стартовая позиция. Нажимайте «Вперёд ▶» для пошагового освоения ходов и планов.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  Сделайте правильный ход за сторону{' '}
                  <span className="font-bold text-white">
                    {currentCourse.side === 'white' ? 'Белых' : 'Чёрных'}
                  </span>{' '}
                  согласно репертуару. Ошибочный ход автоматически отменится.
                </p>
              </div>
            )}
          </div>

          {/* Strategic Goals & Plans */}
          <div className="pixel-card p-5 flex flex-col gap-3">
            <div className="font-pixel-sm text-[10px] text-zinc-400 uppercase tracking-wider">
              СТРАТЕГИЧЕСКИЙ ПЛАН И ЦЕЛИ
            </div>

            <div className="flex flex-col gap-2">
              {currentCourse.strategicGoals.map((goal, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 font-sans">
                  <span className="font-pixel-sm text-[9px] text-[#81b64c] shrink-0 mt-0.5">
                    [{idx + 1}]
                  </span>
                  <span>{goal}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t-2 border-zinc-800">
              <span className="font-pixel-sm text-[9px] text-zinc-400">ПЕШЕЧНАЯ СТРУКТУРА:</span>
              <p className="text-xs text-amber-300 font-mono mt-0.5">
                {currentCourse.pawnStructure}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
