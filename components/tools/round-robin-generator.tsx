'use client';

import { generateRoundRobin, type Round } from '@/lib/engine/round-robin';
import {
  Calendar,
  Check,
  Copy,
  Printer,
  Shuffle,
  Trash2,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const DEFAULT_PLAYERS = `Магнус Карлсен
Хикару Накамура
Алиреза Фируджа
Гукеш Доммараджу
Ян Непомнящий
Дин Лижэнь`;

export function RoundRobinGenerator() {
  const [playersText, setPlayersText] = useState(DEFAULT_PLAYERS);
  const [isDouble, setIsDouble] = useState(false);
  const [copied, setCopied] = useState(false);

  const playerNames = useMemo(() => {
    return playersText
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);
  }, [playersText]);

  const { rounds, totalGames } = useMemo(() => {
    return generateRoundRobin(playerNames, isDouble);
  }, [playerNames, isDouble]);

  const handleShuffle = () => {
    const list = [...playerNames];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    setPlayersText(list.join('\n'));
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Input & Options Box */}
      <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Список участников (по одному на строке, от 3 до 20)
          </label>
          <span className="text-xs text-[#81b64c] font-semibold">
            {playerNames.length} игроков
          </span>
        </div>

        <textarea
          rows={6}
          value={playersText}
          onChange={(e) => setPlayersText(e.target.value)}
          placeholder="Вставьте имена игроков..."
          className="w-full bg-[#211f1c] border border-[#302e2b] rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-[#81b64c]"
        />

        {/* Action Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-[#302e2b]">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isDouble}
                onChange={(e) => setIsDouble(e.target.checked)}
                className="rounded border-[#302e2b] bg-[#211f1c] text-[#81b64c] focus:ring-0"
              />
              <span>В 2 круга (белыми и чёрными)</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShuffle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#302e2b] bg-[#211f1c] hover:bg-[#262421] text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>Жеребьёвка (перемешать)</span>
            </button>
            <button
              type="button"
              onClick={() => setPlayersText('')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#302e2b] bg-[#211f1c] hover:bg-[#262421] text-zinc-400 hover:text-red-400 text-xs font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Очистить</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Badges & Print/Share */}
      {rounds.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#211f1c] border border-[#302e2b] text-xs font-semibold text-white">
              <Users className="w-3.5 h-3.5 text-[#81b64c]" />
              <span>Участников: {playerNames.length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#211f1c] border border-[#302e2b] text-xs font-semibold text-white">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Туров: {rounds.length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#211f1c] border border-[#302e2b] text-xs font-semibold text-white">
              <span>Партий всего: {totalGames}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#302e2b] bg-[#211f1c] hover:bg-[#262421] text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано!' : 'Поделиться'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#302e2b] bg-[#211f1c] hover:bg-[#262421] text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Печать таблицы</span>
            </button>
          </div>
        </div>
      )}

      {/* Rounds Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rounds.map((round) => (
          <div
            key={round.roundNumber}
            className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col gap-3 shadow-sm"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#302e2b]">
              <span className="text-xs font-black uppercase text-white tracking-wider">
                Тур {round.roundNumber}
              </span>
              {round.byePlayer && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
                  Выходной: {round.byePlayer}
                </span>
              )}
            </div>

            <div className="flex flex-col divide-y divide-[#302e2b]/50 text-xs">
              {round.pairings.map((p) => (
                <div
                  key={p.board}
                  className="py-2 flex items-center justify-between gap-2"
                >
                  <span className="text-zinc-600 font-mono w-6">#{p.board}</span>
                  <div className="flex-1 font-semibold text-white flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full bg-white border border-zinc-400 shrink-0" />
                    <span className="truncate">{p.white}</span>
                  </div>
                  <span className="text-zinc-500 font-mono text-[10px] px-1">vs</span>
                  <div className="flex-1 font-semibold text-zinc-300 flex items-center gap-1.5 truncate justify-end">
                    <span className="truncate">{p.black}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-600 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
