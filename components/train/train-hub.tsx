'use client';

import {
  BookOpen,
  Brain,
  Calendar,
  Flame,
  GraduationCap,
  Play,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';

interface TrainHubProps {
  onSelectTrack: (track: string) => void;
}

export function TrainHub({ onSelectTrack }: TrainHubProps) {
  const TRACKS = [
    {
      id: 'trainWoodpecker',
      title: 'МЕТОД ДЯТЛА (WOODPECKER)',
      subtitle: 'Интервальное повторение тактики в 5 циклов',
      description: 'Решайте сеты тактических задач повторно с ускорением в 2 раза для закрепления паттернов на уровне рефлексов.',
      icon: Zap,
      badge: 'ТОП ТАКТИКА',
      badgeColor: 'bg-[#81b64c] text-black',
      stats: '14+ задач • 5 циклов',
    },
    {
      id: 'trainDaily',
      title: 'ЗАДАЧА ДНЯ & КАЛЕНДАРЬ',
      subtitle: 'Ежедневная тактическая разминка',
      description: 'Каждый день новая задача гроссмейстерского уровня с многоуровневыми подсказками и серией побед.',
      icon: Calendar,
      badge: 'КАЛЕНДАРЬ',
      badgeColor: 'bg-amber-400 text-black',
      stats: 'Ежедневно • Стрик дней',
    },
    {
      id: 'trainOpenings',
      title: 'ТРЕНЕР ДЕБЮТОВ (4 РЕЖИМА)',
      subtitle: 'Обучение, Практика, Арена и Стрик',
      description: 'Освойте дебютные ветки (Итальянская, Каро-Канн, Лондон, Сицилианская) с авто-откатом ошибок и планами сторон.',
      icon: BookOpen,
      badge: 'РЕПЕРТУАР',
      badgeColor: 'bg-blue-500 text-white',
      stats: '4 дебюта • 4 режима',
    },
    {
      id: 'trainBlunder',
      title: 'ЩИТ ОТ ЗЕВКОВ (BLUNDER SHIELD)',
      subtitle: '«Никогда не теряй фигуру дважды»',
      description: 'Тренажер обнаружения скрытых угроз соперника и предотвращения катастрофических тактических ошибок.',
      icon: Shield,
      badge: 'ОБОРОНА',
      badgeColor: 'bg-emerald-500 text-black',
      stats: 'Профилактика • Защита',
    },
    {
      id: 'trainConversion',
      title: 'РЕАЛИЗАЦИЯ ПЕРЕВЕСА (CONVERSION)',
      subtitle: 'Доведение выигранных позиций до мата',
      description: 'Тренировка хладнокровной реализации преимущества (+3..+5) против сопротивления спарринг-бота.',
      icon: Swords,
      badge: 'МИТТЕЛЬШПИЛЬ',
      badgeColor: 'bg-purple-400 text-black',
      stats: '4 сценария • Бот 1000-2100',
    },
    {
      id: 'trainBrain',
      title: 'BRAIN GYM [ ФИТНЕС МОЗГА ]',
      subtitle: 'Square Rush, 8 Ферзей и игра вслепую',
      description: 'Когнитивные упражнения на моментальное распознавание полей за 30с, расчет ходов в уме и шахматную логику.',
      icon: Brain,
      badge: 'КОГНИТИВНЫЙ',
      badgeColor: 'bg-orange-400 text-black',
      stats: '3 мини-игры • Рекорды',
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Hero Welcome Banner */}
      <div className="pixel-card-green p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0 shadow-[4px_4px_0_0_#000]">
            <GraduationCap className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-pixel text-base sm:text-xl text-white">
                CHESS TRAINING CENTER [ ЦЕНТР ТРЕНИРОВОК ]
              </h1>
              <span className="font-pixel-sm text-[9px] px-2 py-0.5 bg-[#81b64c] text-black">
                100% БЕСПЛАТНО
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-2xl font-sans">
              Комплексная система подготовки шахматиста: Метод Дятла, Репертуар дебютов, Щит от зевков, Реализация перевеса и когнитивный фитнес мозга.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTrack('trainWoodpecker')}
            className="pixel-btn text-xs px-5 py-3 bg-[#81b64c] text-black font-bold flex items-center gap-2 cursor-pointer hover:bg-[#74a643]"
          >
            <Play className="w-4 h-4" />
            <span>БЫСТРЫЙ СТАРТ: МЕТОД ДЯТЛА ▶</span>
          </button>
        </div>
      </div>

      {/* Grid of Training Tracks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TRACKS.map((track) => {
          const Icon = track.icon;
          return (
            <div
              key={track.id}
              className="pixel-card p-5 flex flex-col justify-between gap-4 hover:border-zinc-500 transition-all group"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-[#161512] border-2 border-zinc-700 flex items-center justify-center text-[#81b64c] group-hover:border-[#81b64c] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`font-pixel-sm text-[8px] px-2 py-0.5 ${track.badgeColor}`}>
                    {track.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-pixel-sm text-xs text-white group-hover:text-[#81b64c] transition-colors">
                    {track.title}
                  </h3>
                  <div className="text-[11px] text-zinc-400 font-medium mt-0.5 font-sans">
                    {track.subtitle}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  {track.description}
                </p>
              </div>

              <div className="pt-3 border-t-2 border-zinc-800 flex items-center justify-between">
                <span className="font-pixel-sm text-[8px] text-zinc-500">
                  {track.stats}
                </span>

                <button
                  type="button"
                  onClick={() => onSelectTrack(track.id)}
                  className="pixel-btn text-[9px] px-3 py-1.5 flex items-center gap-1.5 text-zinc-300 group-hover:text-black group-hover:bg-[#81b64c] group-hover:border-[#81b64c] cursor-pointer transition-all"
                >
                  <span>ОТКРЫТЬ ▶</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
