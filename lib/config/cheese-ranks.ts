export interface CheeseRank {
  minRating: number;
  maxRating: number;
  title: string;
  cheeseType: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  description: string;
}

export const CHEESE_RANKS: CheeseRank[] = [
  {
    minRating: 0,
    maxRating: 1199,
    title: 'Сырный Новичок',
    cheeseType: 'Рикотта (Ricotta)',
    badgeBg: 'bg-amber-400/10',
    badgeBorder: 'border-amber-400/30',
    badgeText: 'text-amber-300',
    description: 'Мягкий старт! Изучай правила и береги фигуры от зевков.',
  },
  {
    minRating: 1200,
    maxRating: 1499,
    title: 'Плавленый Стратег',
    cheeseType: 'Гауда (Gouda)',
    badgeBg: 'bg-yellow-400/10',
    badgeBorder: 'border-yellow-400/30',
    badgeText: 'text-yellow-300',
    description: 'Твёрдая позиционная игра и уверенное развитие фигур.',
  },
  {
    minRating: 1500,
    maxRating: 1799,
    title: 'Пармезановый Тактик',
    cheeseType: 'Пармезан (Parmesan)',
    badgeBg: 'bg-orange-400/10',
    badgeBorder: 'border-orange-400/30',
    badgeText: 'text-orange-300',
    description: 'Острые комбинации, вилки и вскрытые шахи.',
  },
  {
    minRating: 1800,
    maxRating: 2099,
    title: 'Швейцарский Мастер',
    cheeseType: 'Маасдам (Maasdam)',
    badgeBg: 'bg-emerald-400/10',
    badgeBorder: 'border-emerald-400/30',
    badgeText: 'text-emerald-300',
    description: 'Видит слабости в позиции соперника как сырные дыры.',
  },
  {
    minRating: 2100,
    maxRating: 2399,
    title: 'Чеддерный Титан',
    cheeseType: 'Выдержанный Чеддер',
    badgeBg: 'bg-cyan-400/10',
    badgeBorder: 'border-cyan-400/30',
    badgeText: 'text-cyan-300',
    description: 'Гроссмейстерское чутьё и филигранный эндшпиль.',
  },
  {
    minRating: 2400,
    maxRating: 4000,
    title: 'Сырный Император',
    cheeseType: 'Рокфор Суприм (Roquefort)',
    badgeBg: 'bg-purple-400/10',
    badgeBorder: 'border-purple-400/30',
    badgeText: 'text-purple-300',
    description: 'Высшая лига! Безупречная точность и глубокий расчёт вариантов.',
  },
];

export function getCheeseRank(rating?: number): CheeseRank {
  const current = rating ?? 1200;
  return (
    CHEESE_RANKS.find((r) => current >= r.minRating && current <= r.maxRating) ??
    CHEESE_RANKS[0]
  );
}
