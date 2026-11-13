'use client';

import { generateRoundRobin, type Round } from '@/lib/engine/round-robin';
import { sfx } from '@/lib/sound-effects';
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
    sfx.playMove();
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
      sfx.playSuccess();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handlePrint = () => {
    sfx.playSuccess();
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Input & Options Box */}
      <div className="pixel-card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="font-pixel-sm text-[10px] text-zinc-300 uppercase tracking-wider">
            [ УЧАСТНИКИ ]
          </label>
          <span className="font-pixel-sm text-[10px] text-[#81b64c]">
            {playerNames.length} ИГРОКОВ
          </span>
        </div>

        <textarea
          rows={6}
          value={playersText}
          onChange={(e) => setPlayersText(e.target.value)}
          placeholder="Вставьте имена игроков..."
          className="w-full bg-[#161512] border-2 border-zinc-700/80 rounded-none p-3 text-white text-xs font-mono outline-none focus:border-[#81b64c] shadow-inner"
        />

        {/* Action Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t-2 border-zinc-800">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-pixel-sm text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDouble}
                onChange={(e) => {
                  sfx.playMove();
                  setIsDouble(e.target.checked);
                }}
                className="w-4 h-4 rounded-none border-2 border-zinc-600 bg-[#211f1c] text-[#81b64c] focus:ring-0 cursor-pointer"
              />
              <span>В 2 КРУГА (БЕЛЫМИ И ЧЁРНЫМИ)</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShuffle}
              className="pixel-btn text-[10px] flex items-center gap-1.5 px-3 py-2 cursor-pointer bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>ЖЕРЕБЬЁВКА</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sfx.playError();
                setPlayersText('');
              }}
              className="pixel-btn text-[10px] flex items-center gap-1.5 px-3 py-2 cursor-pointer text-zinc-400 hover:text-red-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ОЧИСТИТЬ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Badges & Print/Share */}
      {rounds.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="pixel-badge text-[9px] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#81b64c]" />
              <span>ИГРОКОВ: {playerNames.length}</span>
            </div>
            <div className="pixel-badge text-[9px] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>ТУРОВ: {rounds.length}</span>
            </div>
            <div className="pixel-badge text-[9px] flex items-center gap-1.5 text-zinc-300">
              <span>ПАРТИЙ: {totalGames}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="pixel-btn text-[10px] flex items-center gap-1.5 px-3 py-1.5 cursor-pointer text-zinc-300 hover:text-white"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#81b64c]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'СКОПИРОВАНО!' : 'ССЫЛКА'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="pixel-btn text-[10px] flex items-center gap-1.5 px-3 py-1.5 cursor-pointer text-zinc-300 hover:text-white"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>ПЕЧАТЬ ТАБЛИЦЫ</span>
            </button>
          </div>
        </div>
      )}

      {/* Rounds Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rounds.map((round) => (
          <div
            key={round.roundNumber}
            className="pixel-card p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between pb-2 border-b-2 border-zinc-800">
              <span className="font-pixel-sm text-[11px] text-white tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-[#81b64c]" />
                ТУР {round.roundNumber}
              </span>
              {round.byePlayer && (
                <span className="font-pixel-sm text-[8px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/40 text-amber-300">
                  ВЫХОДНОЙ: {round.byePlayer}
                </span>
              )}
            </div>

            <div className="flex flex-col divide-y divide-zinc-800/80 text-xs">
              {round.pairings.map((p) => (
                <div
                  key={p.board}
                  className="py-2.5 flex items-center justify-between gap-2"
                >
                  <span className="font-pixel-sm text-[9px] text-zinc-500 w-8">#{p.board}</span>
                  <div className="flex-1 font-semibold text-white flex items-center gap-2 truncate">
                    <span className="w-3 h-3 bg-white border border-zinc-400 shrink-0 shadow-[1px_1px_0_0_#000]" />
                    <span className="truncate">{p.white}</span>
                  </div>
                  <span className="font-pixel-sm text-[9px] text-amber-400/80 px-1">VS</span>
                  <div className="flex-1 font-semibold text-zinc-300 flex items-center gap-2 truncate justify-end">
                    <span className="truncate">{p.black}</span>
                    <span className="w-3 h-3 bg-zinc-900 border border-zinc-600 shrink-0 shadow-[1px_1px_0_0_#000]" />
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
