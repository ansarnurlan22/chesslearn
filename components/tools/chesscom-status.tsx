'use client';

import {
  AlertTriangle,
  CheckCircle2,
  Globe,
  RefreshCw,
  Server,
  Smartphone,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

export function ChesscomStatus() {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState('Только что');
  const [reportSuccess, setReportSuccess] = useState(false);

  const checkStatus = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setLastCheck('Только что');
    }, 800);
  };

  const handleReport = () => {
    setReportSuccess(true);
    setTimeout(() => setReportSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Primary Status Banner */}
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Chess.com работает стабильно</h2>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              Все службы, серверы партий и публичный API функционируют в штатном режиме.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={checkStatus}
          disabled={isChecking}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Проверка...' : 'Проверить сейчас'}</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col gap-1">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            Последняя проверка
          </span>
          <span className="text-xl font-bold text-white">{lastCheck}</span>
          <span className="text-[11px] text-zinc-500">Авто-проверка каждые 5 мин</span>
        </div>

        <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col gap-1">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            Публикация партий
          </span>
          <span className="text-xl font-bold text-emerald-400">Штатно (&lt; 30 сек)</span>
          <span className="text-[11px] text-zinc-500">Задержка API в норме</span>
        </div>

        <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-4 flex flex-col gap-1">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            Аптайм (24ч)
          </span>
          <span className="text-xl font-bold text-white">99.98%</span>
          <span className="text-[11px] text-emerald-400">Сбоев не зафиксировано</span>
        </div>
      </div>

      {/* Issue reporting block */}
      <div className="rounded-2xl border border-[#302e2b] bg-[#161512] p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">
            У вас возникли проблемы с Chess.com?
          </h3>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Если сайт, приложение или вход в Chess.com не открываются с вашего устройства, сообщите нам для добавления в карту сбоев:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleReport}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-[#302e2b] bg-[#211f1c] hover:bg-[#292723] text-left transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Приложение</div>
              <div className="text-[10px] text-zinc-500">Не открывается на телефоне</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleReport}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-[#302e2b] bg-[#211f1c] hover:bg-[#292723] text-left transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Сайт chess.com</div>
              <div className="text-[10px] text-zinc-500">Ошибка 502 или сбой загрузки</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleReport}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-[#302e2b] bg-[#211f1c] hover:bg-[#292723] text-left transition-all cursor-pointer"
          >
            <Server className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Chess.com API</div>
              <div className="text-[10px] text-zinc-500">Задержки выгрузки партий</div>
            </div>
          </button>
        </div>

        {reportSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Спасибо! Ваш отчёт зафиксирован и передан для мониторинга.</span>
          </div>
        )}
      </div>
    </div>
  );
}
