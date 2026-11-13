'use client';

import { useOpeningViewer } from '@/hooks/use-opening-viewer';
import { OPENING_DATABASE, type OpeningInfo } from '@/lib/engine/opening-book';
import { sfx } from '@/lib/sound-effects';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Compass,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Swords,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';

interface OpeningExplorerProps {
  onAnalyzePosition?: (fen: string) => void;
}

const CATEGORY_CHIPS = [
  { id: 'all', label: 'ВСЕ' },
  { id: 'e4e5', label: '1.e4 e5' },
  { id: 'sicilian', label: 'СИЦИЛИАНСКАЯ' },
  { id: 'd4', label: '1.d4 ФЕРЗЕВЫЕ' },
  { id: 'indian', label: 'ИНДИЙСКИЕ' },
  { id: 'flank', label: 'ФЛАНГОВЫЕ' },
];

export function OpeningExplorer({ onAnalyzePosition }: OpeningExplorerProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedOpening, setSelectedOpening] = useState<OpeningInfo>(OPENING_DATABASE[0]);
  const [isMuted, setIsMuted] = useState(!sfx.enabled);

  const toggleSound = () => {
    sfx.enabled = !sfx.enabled;
    setIsMuted(!sfx.enabled);
  };

  // Filter openings
  const filteredOpenings = useMemo(() => {
    let list = OPENING_DATABASE;

    // Filter by Category
    if (activeCategory === 'e4e5') {
      list = list.filter((o) => o.moves[0] === 'e4' && o.moves[1] === 'e5');
    } else if (activeCategory === 'sicilian') {
      list = list.filter((o) => o.moves[0] === 'e4' && o.moves[1] === 'c5');
    } else if (activeCategory === 'd4') {
      list = list.filter((o) => o.moves[0] === 'd4' && o.moves[1] === 'd5');
    } else if (activeCategory === 'indian') {
      list = list.filter((o) => o.moves[0] === 'd4' && o.moves[1] === 'Nf6');
    } else if (activeCategory === 'flank') {
      list = list.filter((o) => o.moves[0] !== 'e4' && o.moves[0] !== 'd4');
    }

    const q = query.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.eco.toLowerCase().includes(q) ||
        o.moves.join(' ').toLowerCase().includes(q),
    );
  }, [query, activeCategory]);

  const {
    steps,
    currentPly,
    currentStep,
    currentFen,
    isStart,
    isEnd,
    isPlaying,
    plans,
    goToPly,
    first,
    prev,
    next,
    last,
    toggleAutoplay,
  } = useOpeningViewer(selectedOpening);

  const handleSelectOpening = (opening: OpeningInfo) => {
    setSelectedOpening(opening);
    sfx.playSuccess();
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* Retro Arcade Header */}
      <div className="pixel-card bg-[#181612] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 font-pixel text-xs shadow-[2px_2px_0px_0px_#000]">
            ECO
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-xs text-white uppercase tracking-wider">
                Дебютный справочник
              </span>
              <span className="pixel-badge text-[9px] font-pixel-sm px-1.5 py-0.5 bg-[#26221c] text-amber-400">
                8-BIT MODE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Нажмите на любой дебют для интерактивного разбора на доске
            </p>
          </div>
        </div>

        {/* Audio Mute / Unmute Button */}
        <button
          type="button"
          onClick={toggleSound}
          className="pixel-btn self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-[#211e19] text-xs font-pixel-sm text-zinc-300 hover:text-white cursor-pointer"
          title={isMuted ? 'Включить ретро-звуки' : 'Выключить звук'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{isMuted ? 'ЗВУК ВЫКЛ' : 'ЗВУК ВКЛ'}</span>
        </button>
      </div>

      {/* Main 2-Column Split: Catalog on left, Interactive Player on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Opening Catalog & Search */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск дебюта (Итальянская, C50, e4 e5...)"
              className="w-full bg-[#181612] border-2 border-[#38332b] px-10 py-2.5 text-white text-xs font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 shadow-[3px_3px_0px_0px_#0c0b09] transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white font-mono px-1.5 py-0.5 bg-[#211e19] border border-[#38332b]"
              >
                [X]
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_CHIPS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  sfx.playMove();
                }}
                className={`pixel-btn px-2.5 py-1 text-[10px] font-pixel-sm cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-black font-bold border-amber-600 shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-[#1e1b16] text-zinc-400 hover:text-white border-[#38332b]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Results Counter */}
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 px-1">
            <span>НАЙДЕНО: {filteredOpenings.length} ДЕБЮТОВ</span>
            <span className="text-amber-400 font-pixel-sm text-[9px]">ВЫБЕРИ ДЕБЮТ ▶</span>
          </div>

          {/* Openings List */}
          <div className="flex flex-col gap-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredOpenings.map((opening, idx) => {
              const isSelected = selectedOpening?.eco === opening.eco && selectedOpening?.name === opening.name;
              return (
                <button
                  key={`${opening.eco}-${idx}`}
                  type="button"
                  onClick={() => handleSelectOpening(opening)}
                  className={`w-full text-left p-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'pixel-card-green bg-[#1b2216]'
                      : 'pixel-card bg-[#181612] hover:bg-[#1e1c16]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* ECO Badge */}
                    <div
                      className={`w-12 h-8 shrink-0 flex items-center justify-center font-pixel text-[10px] border ${
                        isSelected
                          ? 'bg-[#81b64c] text-black border-[#81b64c]'
                          : 'bg-[#221f19] text-amber-400 border-[#38332b]'
                      }`}
                    >
                      {opening.eco}
                    </div>

                    {/* Opening Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                          {opening.name}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-pixel-sm text-emerald-400 shrink-0">
                            [АКТИВЕН]
                          </span>
                        )}
                      </div>

                      {/* Initial Moves Preview */}
                      <p className="text-[11px] font-mono text-zinc-500 truncate mt-1">
                        {opening.moves.slice(0, 6).join(' ')}
                        {opening.moves.length > 6 ? ' ...' : ''}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredOpenings.length === 0 && (
              <div className="pixel-card bg-[#181612] p-8 text-center flex flex-col items-center gap-2 text-zinc-500">
                <BookOpen className="w-8 h-8 opacity-30" />
                <p className="font-pixel-sm text-xs">Ничего не найдено</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setActiveCategory('all');
                  }}
                  className="pixel-btn text-[10px] font-pixel-sm px-3 py-1 bg-[#211e19] text-amber-400 mt-2"
                >
                  СБРОСИТЬ ФИЛЬТРЫ
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Chessboard Player & Strategic Dossier */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Opening Info Header Bar */}
          <div className="pixel-card bg-[#181612] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[11px] text-amber-400 font-bold px-2 py-0.5 bg-amber-500/10 border border-amber-500/30">
                  {selectedOpening.eco}
                </span>
                <span className="text-[11px] font-pixel-sm text-zinc-400 uppercase">
                  {plans.category}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-1">
                {selectedOpening.name}
              </h2>
            </div>

            {/* Analyze in Stockfish Button */}
            {onAnalyzePosition && (
              <button
                type="button"
                onClick={() => {
                  sfx.playSuccess();
                  onAnalyzePosition(currentFen);
                }}
                className="pixel-btn flex items-center justify-center gap-2 px-4 py-2 bg-[#81b64c] hover:bg-[#74a643] text-black font-pixel text-[10px] cursor-pointer"
                title="Открыть эту позицию в Доске анализа"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>АНАЛИЗ В STOCKFISH ▶</span>
              </button>
            )}
          </div>

          {/* Board Player Card */}
          <div className="pixel-card bg-[#181612] p-4 sm:p-5 flex flex-col items-center gap-4">
            {/* Interactive Chessboard Display */}
            <div className="w-full max-w-[420px] aspect-square rounded-none border-4 border-[#2b2721] shadow-[6px_6px_0px_0px_#0c0b09] overflow-hidden bg-[#211f1c]">
              <Chessboard
                options={{
                  position: currentFen,
                  allowDragging: false,
                  boardOrientation: 'white',
                  boardStyle: { borderRadius: '0px' },
                  darkSquareStyle: { backgroundColor: '#779952' },
                  lightSquareStyle: { backgroundColor: '#edeed1' },
                }}
              />
            </div>

            {/* Move Stepper Controls */}
            <div className="w-full max-w-[420px] flex items-center justify-between gap-1.5 p-2 bg-[#14120e] border-2 border-[#343029]">
              <button
                type="button"
                onClick={first}
                disabled={isStart}
                className="pixel-btn p-2 bg-[#211e19] text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="В начало (первый ход)"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={prev}
                disabled={isStart}
                className="pixel-btn p-2 bg-[#211e19] text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Ход назад"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Autoplay Toggle */}
              <button
                type="button"
                onClick={toggleAutoplay}
                className={`pixel-btn flex items-center gap-1.5 px-3 py-1.5 font-pixel-sm text-xs cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-[#26221c] text-amber-400 hover:text-white'
                }`}
                title={isPlaying ? 'Пауза' : 'Автопросмотр дебюта'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'СТОП' : 'АВТО'}</span>
              </button>

              <button
                type="button"
                onClick={next}
                disabled={isEnd}
                className="pixel-btn p-2 bg-[#211e19] text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Ход вперед"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={last}
                disabled={isEnd}
                className="pixel-btn p-2 bg-[#211e19] text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="К финальной позиции дебюта"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>

            {/* Move Notation Track */}
            <div className="w-full max-w-[420px] flex flex-wrap gap-1 p-2.5 bg-[#14120e] border border-[#2b2721] max-h-24 overflow-y-auto">
              {steps.map((st, i) => {
                const isActive = currentPly === i;
                if (i === 0) {
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goToPly(0)}
                      className={`px-2 py-0.5 text-[10px] font-mono border cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-black font-bold border-amber-600'
                          : 'bg-[#1b1915] text-zinc-400 border-[#2f2b24] hover:text-white'
                      }`}
                    >
                      Старт
                    </button>
                  );
                }
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToPly(i)}
                    className={`px-1.5 py-0.5 text-xs font-mono border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#81b64c] text-black font-black border-[#81b64c] shadow-[1px_1px_0px_0px_#000]'
                        : 'bg-[#1e1c18] text-zinc-300 border-[#2f2b24] hover:text-white'
                    }`}
                  >
                    {st.color === 'w' && <span className="text-zinc-600 mr-0.5">{st.moveNumber}.</span>}
                    {st.san}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strategic Dossier & Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* White Plans */}
            <div className="pixel-card bg-[#181612] p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-pixel-sm text-zinc-300 border-b border-[#2b2721] pb-2">
                <span className="w-2.5 h-2.5 bg-white border border-zinc-400 shadow-[1px_1px_0px_0px_#000]" />
                <span className="font-bold">ПЛАНЫ БЕЛЫХ</span>
              </div>
              <ul className="flex flex-col gap-1.5 mt-1 text-xs text-zinc-300">
                {plans.whitePlans.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-[#81b64c] font-pixel text-[8px] mt-1">▶</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Black Plans */}
            <div className="pixel-card bg-[#181612] p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-pixel-sm text-zinc-300 border-b border-[#2b2721] pb-2">
                <span className="w-2.5 h-2.5 bg-zinc-900 border border-zinc-600 shadow-[1px_1px_0px_0px_#000]" />
                <span className="font-bold">ПЛАНЫ ЧЁРНЫХ</span>
              </div>
              <ul className="flex flex-col gap-1.5 mt-1 text-xs text-zinc-300">
                {plans.blackPlans.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-400 font-pixel text-[8px] mt-1">▶</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Winrate Stats Bar */}
          <div className="pixel-card bg-[#181612] p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs font-pixel-sm text-zinc-400">
              <span>СТАТИСТИКА ПОБЕД (MASTER DB)</span>
              <span className="font-mono text-zinc-500">100,000+ ПАРТИЙ</span>
            </div>

            {/* Tri-color bar */}
            <div className="w-full h-5 flex overflow-hidden border-2 border-[#2b2721] font-mono text-[10px] font-bold">
              <div
                style={{ width: `${plans.whiteWinRate}%` }}
                className="bg-zinc-200 text-black flex items-center justify-center"
                title={`Белые: ${plans.whiteWinRate}%`}
              >
                ⚪ {plans.whiteWinRate}%
              </div>
              <div
                style={{ width: `${plans.drawRate}%` }}
                className="bg-zinc-600 text-zinc-200 flex items-center justify-center border-x border-black"
                title={`Ничья: ${plans.drawRate}%`}
              >
                🔘 {plans.drawRate}%
              </div>
              <div
                style={{ width: `${plans.blackWinRate}%` }}
                className="bg-zinc-900 text-zinc-200 flex items-center justify-center"
                title={`Чёрные: ${plans.blackWinRate}%`}
              >
                ⚫ {plans.blackWinRate}%
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-zinc-200 inline-block" />
                Белые: {plans.whiteWinRate}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-zinc-600 inline-block" />
                Ничья: {plans.drawRate}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-zinc-900 inline-block" />
                Чёрные: {plans.blackWinRate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
