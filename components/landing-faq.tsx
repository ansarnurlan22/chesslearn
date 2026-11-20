import React from 'react';
import { Search, Swords, Cpu, ShieldCheck, Zap, HelpCircle } from 'lucide-react';

export function HowItWorksAndFaq() {
  const steps = [
    {
      num: '01',
      title: 'Введи никнейм игрока',
      desc: 'Укажи логин на Lichess или Chess.com. Мы не требуем паролей и регистраций: данные подгружаются через официальные публичные API.',
      icon: Search,
      badge: 'ШАГ 1',
    },
    {
      num: '02',
      title: 'Выбери партию',
      desc: 'Мгновенный доступ к списку последних партий в блиц, рапид или пулю. Можно сразу увидеть результат, дату и дебют соперника.',
      icon: Swords,
      badge: 'ШАГ 2',
    },
    {
      num: '03',
      title: 'Получи детальный разбор',
      desc: 'Система вычисляет процентную точность, подсвечивает блестящие ходы и зевки, строит график перевеса и предлагает лучшие продолжения.',
      icon: Cpu,
      badge: 'ШАГ 3',
    },
  ];

  const faqs = [
    {
      q: 'Действительно ли анализ бесплатный и без ограничений?',
      a: 'Да! На Chess.com полный отчёт о партии доступен бесплатно лишь 1 раз в день, требуя платную подписку ($15+/месяц). На ChessCheese вы можете разбирать любое количество партий без подписок, лимитов и скрытых оплат.',
    },
    {
      q: 'Чем ChessCheese удобнее встроенного анализа Lichess и Chess.com?',
      a: 'Мы объединили партии с обеих главных платформ в одном месте. Вы получаете наглядные 8-bit карточки ключевых моментов, классификацию ходов (brilliant, best, blunder), график перевеса и интерактивный чат с тренером прямо в браузере.',
    },
    {
      q: 'Нужно ли вводить пароль от шахматного аккаунта?',
      a: 'Нет, пароль категорически не требуется! Мы работаем только с официальными открытыми API Lichess и Chess.com. Достаточно ввести лишь публичный никнейм.',
    },
    {
      q: 'Где выполняется анализ позиций?',
      a: 'Расчёт производится локально прямо в вашем браузере с помощью WebAssembly. Ваши данные не уходят на сторонние серверы.',
    },
    {
      q: 'Сохраняются ли мои результаты и решённые задачи?',
      a: 'Да, при желании вы можете войти через Google-аккаунт в один клик. Это позволит синхронизировать персональную статистику, стрик ежедневных задач и прогресс в тренировках.',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-14 mt-12 pb-16 px-4">
      {/* 1. How It Works (3 Steps) */}
      <section className="flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-pixel text-[10px] text-amber-400 uppercase tracking-widest">
            БЫСТРЫЙ СТАРТ
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-8">
          Как это работает
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {steps.map((step) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.num}
                className="pixel-card bg-[#1c1a17] p-6 rounded-2xl flex flex-col gap-4 border-2 border-[#343029] hover:border-amber-500/50 transition-all duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-xs text-amber-400 px-2 py-1 bg-amber-400/10 border border-amber-400/20 rounded">
                    {step.badge}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#26231f] border border-[#3d372e] flex items-center justify-center text-amber-400">
                    <StepIcon className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="font-pixel text-sm text-zinc-500">{step.num}</span>
                    {step.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Mini FAQ */}
      <section className="flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span className="font-pixel text-[10px] text-amber-400 uppercase tracking-widest">
            ЧАСТЫЕ ВОПРОСЫ
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-8">
          Ответы на вопросы
        </h2>

        <div className="flex flex-col gap-3.5 w-full">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="pixel-card bg-[#1c1a17] p-5 rounded-2xl border-2 border-[#343029] flex flex-col gap-2 transition-all hover:border-[#4d463b]"
            >
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2.5">
                <span className="w-2 h-2 bg-amber-400 rounded-sm shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pl-4.5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
