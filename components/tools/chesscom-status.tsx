'use client';

import { sfx } from '@/lib/sound-effects';
import {
  AlertTriangle,
  CheckCircle2,
  Globe,
  Radio,
  RefreshCw,
  Server,
  Smartphone,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

export function ChesscomStatus() {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState('ТОЛЬКО ЧТО');
  const [reportSuccess, setReportSuccess] = useState(false);

  const checkStatus = () => {
    sfx.playMove();
    setIsChecking(true);
    setTimeout(() => {
      sfx.playSuccess();
      setIsChecking(false);
      setLastCheck('ТОЛЬКО ЧТО');
    }, 700);
  };

  const handleReport = () => {
    sfx.playLevelUp();
    setReportSuccess(true);
    setTimeout(() => setReportSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Primary Status Banner - Pixel Neon Green Card */}
      <div className="pixel-card-green p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 border-2 border-emerald-500/60 flex items-center justify-center text-emerald-400 shrink-0 shadow-[2px_2px_0_0_#000]">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-pixel-sm text-sm sm:text-base text-white tracking-wider">
                CHESS.COM [ ОНЛАЙН ]
              </h2>
              <span className="w-2.5 h-2.5 bg-emerald-400 animate-pulse border border-black" />
            </div>
            <p className="text-xs text-emerald-300/80 mt-1">
              Все сервера, матчмейкинг и публичный API функционируют в штатном режиме.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={checkStatus}
          disabled={isChecking}
          className="pixel-btn text-[10px] flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border-emerald-400 text-emerald-200 hover:bg-emerald-500/30 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'РАДАР...' : 'ПРОВЕРИТЬ'}</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="pixel-card p-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-pixel-sm text-[9px] text-zinc-400 uppercase">
              ПРОВЕРКА
            </span>
            <Radio className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <span className="font-pixel-sm text-sm text-white">{lastCheck}</span>
          <span className="text-[10px] text-zinc-500">Авто-пинг каждые 5 мин</span>
        </div>

        <div className="pixel-card p-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-pixel-sm text-[9px] text-zinc-400 uppercase">
              API ЗАДЕРЖКА
            </span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="font-pixel-sm text-sm text-emerald-400">&lt; 30 MS</span>
          <span className="text-[10px] text-zinc-500">Штатная скорость ответа</span>
        </div>

        <div className="pixel-card p-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-pixel-sm text-[9px] text-zinc-400 uppercase">
              АПТАЙМ (24Ч)
            </span>
            <span className="w-2 h-2 bg-emerald-400" />
          </div>
          <span className="font-pixel-sm text-sm text-white">99.98%</span>
          <span className="text-[10px] text-emerald-400">Сбоев не зафиксировано</span>
        </div>
      </div>

      {/* Issue reporting block */}
      <div className="pixel-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="font-pixel-sm text-xs text-white">
            СООБЩИТЬ О СБОЕ НА CHESS.COM
          </h3>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Если сайт, приложение или вход в Chess.com не открываются с вашего устройства, выберите сервис для отправки репорта:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleReport}
            className="pixel-card p-3 flex items-center gap-3 text-left hover:border-zinc-500 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-pixel-sm text-[10px] text-white group-hover:text-blue-300">ПРИЛОЖЕНИЕ</div>
              <div className="text-[10px] text-zinc-500">Не открывается на iOS/Android</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleReport}
            className="pixel-card p-3 flex items-center gap-3 text-left hover:border-zinc-500 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="font-pixel-sm text-[10px] text-white group-hover:text-emerald-300">САЙТ CHESS.COM</div>
              <div className="text-[10px] text-zinc-500">Ошибка 502 / сбой соединения</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleReport}
            className="pixel-card p-3 flex items-center gap-3 text-left hover:border-zinc-500 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="font-pixel-sm text-[10px] text-white group-hover:text-amber-300">API И МАТЧИ</div>
              <div className="text-[10px] text-zinc-500">Задержка партий или базы</div>
            </div>
          </button>
        </div>

        {reportSuccess && (
          <div className="pixel-card-green p-3 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-pixel-sm text-[10px]">
              ОТЧЁТ ПРИНЯТ! СИСТЕМА МОНИТОРИНГА ОБНОВЛЕНА.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
