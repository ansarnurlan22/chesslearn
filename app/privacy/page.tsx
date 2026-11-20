import { Logo } from '@/components/logo';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — ChessCheese',
  description:
    'Политика обработки персональных данных сервиса ChessCheese: вход через Google, хранение в Supabase и публичные API шахматных платформ.',
};

export default function PrivacyPage() {
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
            Черновик документа о конфиденциальности. Версия 1.0 (редакция от 2026 года).
          </span>
        </div>

        <div className="pixel-card bg-[#1c1a17] border-2 border-[#343029] p-6 sm:p-10 rounded-3xl shadow-[6px_6px_0px_0px_#0c0b09] space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-pixel text-[10px] text-emerald-400 tracking-wider">
                ЗАЩИТА ДАННЫХ
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Политика конфиденциальности
            </h1>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
              Настоящая Политика описывает, как сервис ChessCheese (chesscheese.site) обрабатывает информацию при использовании вами сайта.
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-[#343029] pt-6">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="font-pixel text-xs text-amber-400">1.</span>
                Какие данные мы получаем и обрабатываем
              </h2>
              <p>
                <strong>Публичные шахматные данные:</strong> Когда вы вводите никнейм на Lichess или Chess.com, наш сервис обращается к их открытым официальным API для получения истории сыгранных партий в формате PGN, рейтингов и аватара профиля. Мы <em>никогда</em> не запрашиваем и не храним пароли от ваших аккаунтов.
              </p>
              <p>
                <strong>Авторизация через Google (OAuth 2.0):</strong> При желании сохранить прогресс тренировок вы можете войти через Google. Мы получаем только ваш публичный идентификатор, имя, email и URL аватара, предоставляемые Google с вашего согласия.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="font-pixel text-xs text-amber-400">2.</span>
                Где и как хранятся данные (Supabase)
              </h2>
              <p>
                Авторизационные данные, привязанный шахматный никнейм, история решённых тактических задач дня и серии побед хранятся в защищённой облачной базе данных <strong>Supabase</strong> (PostgreSQL). Доступ к персональным строкам строго разграничен правилами безопасности на уровне строк (Row Level Security, RLS).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="font-pixel text-xs text-amber-400">3.</span>
                Локальные вычисления в браузере
              </h2>
              <p>
                Анализ позиций выполняется преимущественно на стороне вашего браузера с использованием технологии WebAssembly. Сырые варианты ходов не передаются сторонним рекламным сетям.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="font-pixel text-xs text-amber-400">4.</span>
                Файлы Cookie и локальное хранилище
              </h2>
              <p>
                Мы используем LocalStorage и сессионные Cookie исключительно для поддержания сессии авторизации и сохранения локальных настроек доски (звуки ходов, ориентация доски).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="font-pixel text-xs text-amber-400">5.</span>
                Удаление данных и связь
              </h2>
              <p>
                Вы можете запросить полное удаление своего профиля и всех связанных с ним записей в любой момент, написав нам через страницу контактов.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
