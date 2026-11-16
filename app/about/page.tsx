import { Logo } from '@/components/logo';
import { ArrowLeft, Cpu, Database, ExternalLink, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'О проекте — ChessCheese',
  description:
    'Информация о шахматном сервисе ChessCheese, используемом движке Stockfish и интеграции с Lichess и Chess.com.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#141310] text-white flex flex-col font-sans arcade-grid">
      {/* Header */}
      <header className="border-b border-[#302e2b] bg-[#1a1815]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo size="sm" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition-colors font-medium px-3 py-1.5 rounded-lg border border-[#343029] bg-[#211f1c]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>На главную</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        {/* Draft Notice */}
        <div className="mb-6 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <span className="font-pixel text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 uppercase tracking-wider">
            ЧЕРНОВИК
          </span>
          <span>
            Данный текст является предварительной редакцией описания проекта (v0.9).
          </span>
        </div>

        <div className="pixel-card bg-[#1c1a17] border-2 border-[#343029] p-6 sm:p-10 rounded-3xl shadow-[6px_6px_0px_0px_#0c0b09] space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-pixel text-[10px] text-amber-400 tracking-wider">
                CHESSCHEESE.SITE
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">О проекте ChessCheese</h1>
            <p className="text-zinc-400 text-sm sm:text-base mt-3 leading-relaxed">
              ChessCheese — это независимый веб-сервис для анализа шахматных партий, тактических тренировок и разбора ошибок без платных ограничений. Мы объединили удобство анализа партий с платформ Lichess и Chess.com в одном месте с эстетикой ретро 8-bit пиксель-арта.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#141310] border border-[#343029] p-5 rounded-2xl flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Шахматный движок Stockfish</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Для анализа позиций и поиска лучших ходов сервис использует шахматный движок <strong>Stockfish</strong>, скомпилированный в WebAssembly (stockfish.js). Движок распространяется под свободной лицензией <strong>GNU General Public License v3 (GPLv3)</strong>.
              </p>
              <div className="pt-2">
                <a
                  href="https://github.com/official-stockfish/Stockfish"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline text-xs inline-flex items-center gap-1 font-medium"
                >
                  <span>Исходный код Stockfish на GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="bg-[#141310] border border-[#343029] p-5 rounded-2xl flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-blue-400">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Источники шахматных данных</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Партии и статистика загружаются исключительно через открытые публичные API <strong>Lichess.org</strong> и <strong>Chess.com</strong>. ChessCheese не аффилирован с этими организациями и выражает признательность их разработчикам за поддержку открытых протоколов.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#343029]">
            <h2 className="text-xl font-bold text-white">Принципы сервиса</h2>
            <ul className="space-y-3 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span>
                  <strong>Без пейволлов и искусственных лимитов:</strong> базовый и глубокий разбор партий доступен любому шахматисту без необходимости покупать «Diamond» подписки.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span>
                  <strong>Приватность:</strong> мы никогда не запрашиваем пароли от ваших игровых профилей. Для анализа требуется только публичный никнейм.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span>
                  <strong>Синхронизация через Supabase:</strong> если вы решите войти через аккаунт Google, ваши решённые задачи и персональный прогресс сохраняются в защищённой базе данных Supabase (PostgreSQL).
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
