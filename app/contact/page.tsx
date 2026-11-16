import { Logo } from '@/components/logo';
import { ArrowLeft, Mail, MessageSquare, Send } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Контакты и обратная связь — ChessCheese',
  description:
    'Связь с командой проекта ChessCheese: вопросы, предложения по развитию и сообщения об ошибках.',
};

export default function ContactPage() {
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
            Страница контактов проекта (черновая редакция).
          </span>
        </div>

        <div className="pixel-card bg-[#1c1a17] border-2 border-[#343029] p-6 sm:p-10 rounded-3xl shadow-[6px_6px_0px_0px_#0c0b09] space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="font-pixel text-[10px] text-amber-400 tracking-wider">
                ОБРАТНАЯ СВЯЗЬ
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Контакты и поддержка
            </h1>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
              Мы постоянно работаем над улучшением ChessCheese. Если вы нашли баг в анализе, хотите предложить новую функцию тренировок или задать вопрос — напишите нам!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#343029]">
            <div className="bg-[#141310] border border-[#343029] p-5 rounded-2xl flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Электронная почта</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Для общих вопросов, юридических запросов и сотрудничества:
              </p>
              <a
                href="mailto:support@chesscheese.site"
                className="text-amber-400 hover:underline text-xs font-mono font-medium mt-1"
              >
                support@chesscheese.site
              </a>
            </div>

            <div className="bg-[#141310] border border-[#343029] p-5 rounded-2xl flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                <Send className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Сообщество и баг-трекер</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Сообщения об ошибках в расчёте ходов и предложения по интерфейсу:
              </p>
              <span className="text-zinc-300 text-xs font-medium mt-1">
                Канал поддержки: @chesscheese_app
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
