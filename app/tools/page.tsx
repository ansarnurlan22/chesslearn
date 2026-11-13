'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { EloCalculator } from '@/components/tools/elo-calculator';
import { ChessClock } from '@/components/tools/chess-clock';
import { OpeningExplorer } from '@/components/tools/opening-explorer';
import { FenAnalyzer } from '@/components/tools/fen-analyzer';
import { PgnAnalyzer } from '@/components/tools/pgn-analyzer';
import { Calculator, Clock, BookOpen, Scan, FileText, Wrench, ArrowLeft, GraduationCap } from 'lucide-react';

type ToolId = 'elo' | 'clock' | 'openings' | 'fen' | 'pgn';

interface Tool {
  id: ToolId;
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
}

const TOOLS: Tool[] = [
  {
    id: 'elo',
    icon: Calculator,
    title: 'ELO-калькулятор',
    description: 'Рассчитайте новый рейтинг после партии по формуле FIDE',
    badge: 'Быстро',
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  {
    id: 'clock',
    icon: Clock,
    title: 'Шахматные часы',
    description: 'Цифровые часы с пресетами — пуля, блиц, рапид',
    badge: 'Онлайн',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    id: 'openings',
    icon: BookOpen,
    title: 'Дебютный справочник',
    description: 'Поиск дебютов по ECO-коду, названию или ходам',
    badge: `${200}+`,
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  {
    id: 'fen',
    icon: Scan,
    title: 'FEN-анализатор',
    description: 'Вставьте FEN-строку и получите оценку позиции от Stockfish',
    badge: 'Stockfish',
    badgeColor: 'bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/30',
  },
  {
    id: 'pgn',
    icon: FileText,
    title: 'PGN-анализатор',
    description: 'Загрузите любую партию в PGN и получите полный разбор',
    badge: 'AI + Stockfish',
    badgeColor: 'bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/30',
  },
];

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolId>('elo');

  const active = TOOLS.find(t => t.id === activeTool);

  return (
    <div className="min-h-screen bg-[#161512] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#161512]/95 border-b border-[#302e2b]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/for-trainers"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#fbbf24]/30 bg-[#fbbf24]/10 hover:bg-[#fbbf24]/20 text-[#fbbf24] font-medium transition-all"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Для тренеров</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#302e2b] bg-[#211f1c] hover:bg-[#262421] text-zinc-400 hover:text-white font-medium transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              На главную
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Page heading */}
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/30 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[#a855f7]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Инструменты</h1>
              <p className="text-sm text-zinc-500">Шахматные утилиты для игроков и тренеров</p>
            </div>
          </div>
        </div>

        {/* Tool grid + panel */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tool cards list */}
          <div className="flex flex-col gap-3 lg:w-72 flex-shrink-0">
            {TOOLS.map(tool => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setActiveTool(tool.id)}
                  className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#a855f7]/50 bg-[#a855f7]/10 shadow-lg shadow-[#a855f7]/5'
                      : 'border-[#302e2b] bg-[#211f1c] hover:border-[#a855f7]/30 hover:bg-[#1e1c1a]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-[#a855f7]/20 border border-[#a855f7]/40' : 'bg-[#161512] border border-[#302e2b]'
                  }`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#a855f7]' : 'text-zinc-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-zinc-200'}`}>
                        {tool.title}
                      </span>
                      {tool.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${tool.badgeColor}`}>
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{tool.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active tool panel */}
          <div className="flex-1 min-w-0">
            {active ? (
              <div className="border border-[#302e2b] rounded-2xl bg-[#211f1c] p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#302e2b]">
                  <div className="w-9 h-9 rounded-lg bg-[#a855f7]/15 border border-[#a855f7]/30 flex items-center justify-center">
                    <active.icon className="w-4.5 h-4.5 text-[#a855f7]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{active.title}</h2>
                    <p className="text-xs text-zinc-500">{active.description}</p>
                  </div>
                </div>

                {activeTool === 'elo' && <EloCalculator />}
                {activeTool === 'clock' && <ChessClock />}
                {activeTool === 'openings' && <OpeningExplorer />}
                {activeTool === 'fen' && <FenAnalyzer />}
                {activeTool === 'pgn' && <PgnAnalyzer />}
              </div>
            ) : (
              <div className="border border-dashed border-[#302e2b] rounded-2xl flex flex-col items-center justify-center py-20 px-8 text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#211f1c] border border-[#302e2b] flex items-center justify-center">
                  <Wrench className="w-7 h-7 text-zinc-600" />
                </div>
                <div>
                  <p className="text-zinc-400 font-semibold">Выберите инструмент</p>
                  <p className="text-xs text-zinc-600 mt-1">Нажмите на один из инструментов слева, чтобы начать</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-[#302e2b] py-6 mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-zinc-500">•</span>
            <span>Анализ шахматных партий &amp; AI-наставник</span>
          </div>
          <span>© {new Date().getFullYear()} ChessCheese — все права защищены</span>
        </div>
      </footer>
    </div>
  );
}
