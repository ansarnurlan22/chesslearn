import { Logo } from '@/components/logo';
import { ArrowLeft, FileText, Scale } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Условия использования — ChessCheese',
  description:
    'Пользовательское соглашение и условия использования шахматного сервиса ChessCheese.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#141310] text-white flex flex-col font-sans arcade-grid">
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

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        {/* Draft Notice */}
        <div className="mb-6 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <span className="font-pixel text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 uppercase tracking-wider">
            ЧЕРНОВИК
          </span>
          <span>
            Черновик условий использования. Версия 1.0 (редакция от 2026 года).
          </span>
        </div>

        <div className="pixel-card bg-[#1c1a17] border-2 border-[#343029] p-6 sm:p-10 rounded-3xl shadow-[6px_6px_0px_0px_#0c0b09] space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span className="font-pixel text-[10px] text-amber-400 tracking-wider">
                ПРАВОВАЯ ИНФОРМАЦИЯ
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Условия использования (Terms of Service)
            </h1>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
              Используя сервис ChessCheese, вы соглашаетесь со следующими условиями и правилами добросовестного использования.
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-[#343029] pt-6">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="font-pixel text-xs text-amber-400">1.</span>
                Назначение сервиса
              </h2>
              <p>
                ChessCheese создан для обучения, анализа шахматных партий и совершенствования тактического мастерства. Сервис предоставляется бесплатно на условиях «как есть» (as is).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="font-pixel text-xs text-amber-400">2.</span>
                Взаимодействие со сторонними API
              </h2>
              <p>
                Загрузка партий осуществляется через публичные программные интерфейсы Lichess.org и Chess.com с соблюдением установленных ими лимитов частоты запросов (rate limits). Пользователь обязуется не использовать сервис для агрессивного скрейпинга или перегрузки серверов поставщиков данных.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="font-pixel text-xs text-amber-400">3.</span>
                Лицензии и интеллектуальная собственность
              </h2>
              <p>
                Шахматный движок Stockfish является свободным программным обеспечением под лицензией <strong>GNU General Public License v3 (GPLv3)</strong>. Товарные знаки и логотипы Lichess и Chess.com принадлежат их законным правообладателям. Дизайн, графические элементы и программный код интерфейса ChessCheese защищены нормами авторского права.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="font-pixel text-xs text-amber-400">4.</span>
                Ограничение ответственности
              </h2>
              <p>
                Администрация сервиса не несёт ответственности за временные перебои в работе сторонних API (Chess.com, Lichess), сбои в браузерных WebAssembly-модулях или точность отдельных оценок при анализе нестандартных позиций.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
