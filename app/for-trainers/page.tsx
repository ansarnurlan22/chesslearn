import { Logo } from '@/components/logo';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Bot,
  ChevronRight,
  Clock,
  Globe,
  GraduationCap,
  Mail,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ChessCheese для тренеров — AI-помощник шахматного тренера',
  description:
    'Экономьте до 1 часа на каждом разборе партии. Ваши ученики получают персонального AI-гроссмейстера 24/7 — бесплатно. Stockfish + Google Gemini.',
};

/* ─── Data ─────────────────────────────────────────────────────────── */

const PAIN_POINTS = [
  {
    emoji: '⏰',
    title: 'Тратите часы на разбор партий каждого ученика',
    description:
      'Ручной анализ 20+ партий в неделю отнимает время, которое могло бы пойти на индивидуальную работу.',
  },
  {
    emoji: '😴',
    title: 'Ученики не анализируют партии самостоятельно',
    description:
      'Без удобного инструмента мотивация падает — разбор партий кажется скучным и непонятным.',
  },
  {
    emoji: '📊',
    title: 'Нет инструмента для отслеживания прогресса группы',
    description:
      'Сложно видеть общую картину: кто прогрессирует, а кто повторяет одни и те же ошибки.',
  },
] as const;

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-анализ партий',
    description: 'Stockfish + Google Gemini анализируют каждый ход и объясняют логику',
    color: 'text-[#fbbf24]',
    bgColor: 'bg-[#fbbf24]/10',
    borderColor: 'border-[#fbbf24]/20',
  },
  {
    icon: Target,
    title: 'Классификация ходов',
    description: 'Brilliant, Great, Mistake, Blunder — как на Chess.com, но с объяснениями',
    color: 'text-[#81b64c]',
    bgColor: 'bg-[#81b64c]/10',
    borderColor: 'border-[#81b64c]/20',
  },
  {
    icon: Bot,
    title: 'AI-тренер 24/7',
    description: 'ChessCheese Bot объясняет ошибки на русском языке — как живой тренер',
    color: 'text-[#3692e7]',
    bgColor: 'bg-[#3692e7]/10',
    borderColor: 'border-[#3692e7]/20',
  },
  {
    icon: RotateCcw,
    title: 'Переиграть ход',
    description: 'Ученик пробует лучший вариант прямо в браузере — учится на ходу',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/20',
  },
  {
    icon: Globe,
    title: 'Chess.com + Lichess',
    description: 'Работает с обеими платформами — импорт партий в один клик',
    color: 'text-violet-400',
    bgColor: 'bg-violet-400/10',
    borderColor: 'border-violet-400/20',
  },
  {
    icon: Users,
    title: 'Группы учеников',
    description: 'Добавляйте учеников и следите за их прогрессом в одном месте',
    color: 'text-rose-400',
    bgColor: 'bg-rose-400/10',
    borderColor: 'border-rose-400/20',
  },
] as const;

const STEPS = [
  {
    step: 1,
    title: 'Зарегистрируйтесь как тренер',
    description: 'Создайте бесплатный аккаунт за 30 секунд — без карты, без ограничений',
    icon: GraduationCap,
  },
  {
    step: 2,
    title: 'Создайте группу и добавьте учеников',
    description: 'Отправьте ученикам код приглашения — они присоединятся сами',
    icon: Users,
  },
  {
    step: 3,
    title: 'Задавайте домашку — разбор партий на ChessCheese',
    description: 'Ученики анализируют свои партии, а вы видите их прогресс',
    icon: Trophy,
  },
] as const;

const STATS = [
  {
    value: '0 → 500',
    label: 'учеников',
    sublabel: 'цель на 2027',
    icon: Users,
  },
  {
    value: '20+',
    label: 'клубов',
    sublabel: 'Астана и Казахстан',
    icon: Globe,
  },
  {
    value: '0 ₸',
    label: 'Бесплатно',
    sublabel: 'навсегда',
    icon: Zap,
  },
] as const;

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function ForTrainersPage() {
  return (
    <div className="min-h-screen bg-[#161512] text-white font-sans antialiased flex flex-col">
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#161512]/95 border-b border-[#302e2b]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size="md" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex text-sm text-[#c3c2c1] hover:text-white transition-colors"
            >
              Анализ партий
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#fbbf24] hover:bg-[#f59e0b] text-zinc-950 font-bold text-sm transition-all active:scale-[0.98]"
            >
              Начать бесплатно
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero Section ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#fbbf24]/[0.04] rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 sm:pb-28 flex flex-col items-center text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] text-xs font-semibold mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Бесплатный AI-инструмент для тренеров</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-[1.1]">
              ChessCheese —{' '}
              <span className="text-[#fbbf24] drop-shadow-[0_2px_12px_rgba(251,191,36,0.25)]">
                AI-помощник
              </span>
              <br className="hidden sm:block" />{' '}
              для шахматных тренеров
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-[#c3c2c1] max-w-2xl leading-relaxed mb-10">
              Экономьте до{' '}
              <span className="text-white font-semibold">1 часа</span> на каждом
              разборе партии. Ваши ученики получают персонального
              AI-гроссмейстера 24/7 —{' '}
              <span className="text-[#fbbf24] font-semibold">бесплатно</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#fbbf24] hover:bg-[#f59e0b] text-zinc-950 font-black text-base sm:text-lg transition-all active:scale-[0.97] shadow-lg shadow-[#fbbf24]/20"
              >
                Начать бесплатно
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#211f1c] hover:bg-[#2a2825] border border-[#302e2b] text-[#c3c2c1] hover:text-white font-semibold text-base transition-all"
              >
                Попробовать анализ
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Problem Section ──────────────────────────────────────── */}
        <section className="relative py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Знакомые проблемы?
              </h2>
              <p className="text-[#8b8987] text-base sm:text-lg max-w-xl mx-auto">
                Если вы тренер, вы точно сталкивались с этим
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PAIN_POINTS.map((point) => (
                <div
                  key={point.title}
                  className="group bg-[#211f1c] hover:bg-[#262421] border border-[#302e2b] rounded-2xl p-6 sm:p-8 transition-all"
                >
                  <div className="text-4xl mb-4">{point.emoji}</div>
                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                    {point.title}
                  </h3>
                  <p className="text-sm text-[#8b8987] leading-relaxed">
                    {point.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features Section ─────────────────────────────────────── */}
        <section className="relative py-20 sm:py-28">
          {/* Subtle divider */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#302e2b] to-transparent" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Всё, что нужно тренеру
              </h2>
              <p className="text-[#8b8987] text-base sm:text-lg max-w-xl mx-auto">
                Мощный AI-инструмент, который делает разбор партий быстрым и
                понятным
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group bg-[#211f1c] hover:bg-[#262421] border border-[#302e2b] hover:border-[#3a3835] rounded-2xl p-6 transition-all"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
                    >
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[#8b8987] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How It Works Section ─────────────────────────────────── */}
        <section className="relative py-20 sm:py-28">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#302e2b] to-transparent" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Как это работает?
              </h2>
              <p className="text-[#8b8987] text-base sm:text-lg max-w-xl mx-auto">
                Три простых шага — и ваши ученики учатся эффективнее
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {STEPS.map((s) => {
                const StepIcon = s.icon;
                return (
                  <div
                    key={s.step}
                    className="group flex items-start gap-5 bg-[#211f1c] hover:bg-[#262421] border border-[#302e2b] rounded-2xl p-6 sm:p-8 transition-all"
                  >
                    {/* Step number */}
                    <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center">
                      <span className="text-2xl font-black text-[#fbbf24]">
                        {s.step}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <StepIcon className="w-5 h-5 text-[#c3c2c1] shrink-0" />
                        <h3 className="text-lg font-bold text-white">
                          {s.title}
                        </h3>
                      </div>
                      <p className="text-sm text-[#8b8987] leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Stats / Social Proof Section ─────────────────────────── */}
        <section className="relative py-20 sm:py-28">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#302e2b] to-transparent" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Уже используют тренеры Астаны
              </h2>
              <p className="text-[#8b8987] text-base sm:text-lg max-w-xl mx-auto">
                Присоединяйтесь к сообществу тренеров, которые экономят время с
                ChessCheese
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {STATS.map((stat) => {
                const StatIcon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-[#211f1c] border border-[#302e2b] rounded-2xl p-8 text-center transition-all hover:bg-[#262421]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center mx-auto mb-5">
                      <StatIcon className="w-6 h-6 text-[#fbbf24]" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-base font-semibold text-[#c3c2c1]">
                      {stat.label}
                    </div>
                    <div className="text-xs text-[#8b8987] mt-1">
                      {stat.sublabel}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA Section ───────────────────────────────────── */}
        <section className="relative py-20 sm:py-28">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#302e2b] to-transparent" />

          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#fbbf24]/[0.03] rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="bg-[#211f1c] border border-[#302e2b] rounded-3xl p-8 sm:p-14">
              <div className="w-16 h-16 rounded-2xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-[#fbbf24]" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Готовы попробовать?
              </h2>
              <p className="text-[#c3c2c1] text-base sm:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
                Начните экономить время уже сегодня. Регистрация бесплатная, без
                ограничений, без привязки карты.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#fbbf24] hover:bg-[#f59e0b] text-zinc-950 font-black text-base sm:text-lg transition-all active:scale-[0.97] shadow-lg shadow-[#fbbf24]/20 w-full sm:w-auto justify-center"
                >
                  Зарегистрироваться бесплатно
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-[#8b8987]">
                <Mail className="w-4 h-4" />
                <span>Есть вопросы? Напишите нам —</span>
                <a
                  href="mailto:chesscheese.kz@gmail.com"
                  className="text-[#fbbf24] hover:text-[#f59e0b] font-semibold transition-colors"
                >
                  chesscheese.kz@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[#302e2b] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-xs text-[#8b8987]">
              © {new Date().getFullYear()} ChessCheese. Бесплатно навсегда.
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#8b8987]">
            <Link
              href="/"
              className="hover:text-white transition-colors"
            >
              Анализ
            </Link>
            <Link
              href="/auth"
              className="hover:text-white transition-colors"
            >
              Войти
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
