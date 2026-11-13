export interface RepertoireMove {
  ply: number;
  san: string;
  arrow?: [string, string]; // e.g. ['e2', 'e4']
  explanation: string;
  candidateAlternatives?: string[];
  keyIdea: string;
}

export interface RepertoireCourse {
  id: string;
  name: string;
  nameRu: string;
  side: 'white' | 'black';
  eco: string;
  description: string;
  difficulty: 'Новичок' | 'Клубный' | 'Мастер';
  line: string[]; // SAN moves
  movesMeta: RepertoireMove[];
  pawnStructure: string;
  strategicGoals: string[];
}

export const REPERTOIRE_COURSES: RepertoireCourse[] = [
  {
    id: 'italian-game',
    name: 'Italian Game (Giuoco Piano)',
    nameRu: 'Итальянская партия',
    side: 'white',
    eco: 'C50',
    description: 'Гармоничное развитие фигур, давление на пункт f7 и контроль центра.',
    difficulty: 'Новичок',
    line: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3'],
    pawnStructure: 'Открытый центр d3/e4 против d6/e5',
    strategicGoals: [
      'Контроль центральных полей d4 и e5',
      'Ограничение активности черного слона c5',
      'Подготовка рокировки и пешечного надвига на королевском фланге',
    ],
    movesMeta: [
      {
        ply: 1,
        san: 'e4',
        arrow: ['e2', 'e4'],
        explanation: 'Захватываем центр и открываем дорогу ферзю и белопольному слону.',
        keyIdea: 'Борьба за поля d5 и f5',
      },
      {
        ply: 2,
        san: 'e5',
        arrow: ['e7', 'e5'],
        explanation: 'Черные симметрично отвечают, создавая прочный центр.',
        keyIdea: 'Удержание пункта d4',
      },
      {
        ply: 3,
        san: 'Nf3',
        arrow: ['g1', 'f3'],
        explanation: 'Развиваем коня с темпом, нападая на незащищенную пешку e5.',
        keyIdea: 'Темповое развитие',
      },
      {
        ply: 4,
        san: 'Nc6',
        arrow: ['b8', 'c6'],
        explanation: 'Черные защищают пешку e5 конем.',
        keyIdea: 'Защита центра',
      },
      {
        ply: 5,
        san: 'Bc4',
        arrow: ['f1', 'c4'],
        explanation: 'Ключевой ход итальянской партии: слон целится в самое уязвимое поле f7.',
        keyIdea: 'Давление на f7',
      },
      {
        ply: 6,
        san: 'Bc5',
        arrow: ['f8', 'c5'],
        explanation: 'Черные развивают своего слона, препятствуя свободному d2-d4.',
        keyIdea: 'Контроль диагонали a7-g1',
      },
      {
        ply: 7,
        san: 'c3',
        arrow: ['c2', 'c3'],
        explanation: 'Готовим мощный пешечный кулак в центре (d2-d4).',
        keyIdea: 'Подготовка d4',
      },
      {
        ply: 8,
        san: 'Nf6',
        arrow: ['g8', 'f6'],
        explanation: 'Черные атакуют пешку e4 и готовят рокировку.',
        keyIdea: 'Контратака пункта e4',
      },
      {
        ply: 9,
        san: 'd3',
        arrow: ['d2', 'd3'],
        explanation: 'Тихий итальянский ход (Giuoco Pianissimo) — надежно укрепляет e4.',
        keyIdea: 'Позиционная стабильность',
      },
    ],
  },
  {
    id: 'caro-kann',
    name: 'Caro-Kann Defense',
    nameRu: 'Защита Каро-Канн',
    side: 'black',
    eco: 'B12',
    description: 'Сверхнадежный ответ черных на 1.e4 с ранним выводом белопольного слона.',
    difficulty: 'Клубный',
    line: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'Nf3', 'e6'],
    pawnStructure: 'Французская цепь d5/c6/e6, но со свободным слоном f5',
    strategicGoals: [
      'Беспрепятственный вывод белопольного слона на f5 до хода e6',
      'Подрыв пешечного клина белых ходом c6-c5',
      'Безопасность короля на ферзевом фланге или в короткой рокировке',
    ],
    movesMeta: [
      {
        ply: 1,
        san: 'e4',
        arrow: ['e2', 'e4'],
        explanation: 'Белые начинают классическим захватом центра.',
        keyIdea: 'Центр e4',
      },
      {
        ply: 2,
        san: 'c6',
        arrow: ['c7', 'c6'],
        explanation: 'Подготовка хода d7-d5 с сохранением прочной пешечной поддержки.',
        keyIdea: 'Фундамент под d5',
      },
      {
        ply: 3,
        san: 'd4',
        arrow: ['d2', 'd4'],
        explanation: 'Белые захватывают идеальный пешечный дуэт e4+d4.',
        keyIdea: 'Центральное превосходство',
      },
      {
        ply: 4,
        san: 'd5',
        arrow: ['d7', 'd5'],
        explanation: 'Черные сразу наносят контрудар по пешке e4.',
        keyIdea: 'Атака центра',
      },
      {
        ply: 5,
        san: 'e5',
        arrow: ['e4', 'e5'],
        explanation: 'Закрытый вариант — белые фиксируют пространственный перевес.',
        keyIdea: 'Зажим пространства',
      },
      {
        ply: 6,
        san: 'Bf5',
        arrow: ['c8', 'f5'],
        explanation: 'Главное отличие от французской защиты! Слон выходит на активную позицию.',
        keyIdea: 'Развитие "плохого" слона',
      },
      {
        ply: 7,
        san: 'Nf3',
        arrow: ['g1', 'f3'],
        explanation: 'Белые развивают королевский фланг.',
        keyIdea: 'Развитие',
      },
      {
        ply: 8,
        san: 'e6',
        arrow: ['e7', 'e6'],
        explanation: 'Черные возводят гранитную пешечную стену и готовят c6-c5.',
        keyIdea: 'Железная цепь c6-d5-e6',
      },
    ],
  },
  {
    id: 'london-system',
    name: 'London System',
    nameRu: 'Лондонская система',
    side: 'white',
    eco: 'D02',
    description: 'Универсальное и надежное дебютное оружие против любых ответов черных.',
    difficulty: 'Новичок',
    line: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'c5', 'c3', 'Nc6', 'Nd2'],
    pawnStructure: 'Пешечная пирамида c3-d4-e3',
    strategicGoals: [
      'Непробиваемая пешечная пирамида c3-d4-e3',
      'Активный слон f4 вне пешечной цепи',
      'Прыжок коня на опорный пункт e5',
    ],
    movesMeta: [
      {
        ply: 1,
        san: 'd4',
        arrow: ['d2', 'd4'],
        explanation: 'Контроль ключевого центрального поля e5.',
        keyIdea: 'Центр d4',
      },
      {
        ply: 2,
        san: 'd5',
        arrow: ['d7', 'd5'],
        explanation: 'Симметричный ответ черных.',
        keyIdea: 'Барьер в центре',
      },
      {
        ply: 3,
        san: 'Bf4',
        arrow: ['c1', 'f4'],
        explanation: 'Визитная карточка Лондона — слон выводится до закрытия цепи ходом e3.',
        keyIdea: 'Слон вне цепи',
      },
      {
        ply: 4,
        san: 'Nf6',
        arrow: ['g8', 'f6'],
        explanation: 'Черные развивают коня.',
        keyIdea: 'Развитие',
      },
      {
        ply: 5,
        san: 'e3',
        arrow: ['e2', 'e3'],
        explanation: 'Укрепляем пешку d4 и открываем дорогу белопольному слону.',
        keyIdea: 'Пешечный замок',
      },
      {
        ply: 6,
        san: 'c5',
        arrow: ['c7', 'c5'],
        explanation: 'Черные пытаются подорвать пешку d4.',
        keyIdea: 'Фланговый подрыв',
      },
      {
        ply: 7,
        san: 'c3',
        arrow: ['c2', 'c3'],
        explanation: 'Завершение классической пешечной пирамиды c3-d4-e3.',
        keyIdea: 'Гранитная пирамида',
      },
      {
        ply: 8,
        san: 'Nc6',
        arrow: ['b8', 'c6'],
        explanation: 'Черные усиливают давление на d4.',
        keyIdea: 'Нажим на центр',
      },
      {
        ply: 9,
        san: 'Nd2',
        arrow: ['b1', 'd2'],
        explanation: 'Конь контролирует поле e4 и освобождает дорогу рокировке.',
        keyIdea: 'Гармония фигур',
      },
    ],
  },
  {
    id: 'sicilian-defense',
    name: 'Sicilian Defense (Open)',
    nameRu: 'Сицилианская защита',
    side: 'black',
    eco: 'B20',
    description: 'Самый боевой и острый ответ на 1.e4 с асимметричной борьбой за победу.',
    difficulty: 'Мастер',
    line: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    pawnStructure: 'Пешечный перевес черных в центре (2 пешки против 1)',
    strategicGoals: [
      'Размен фланговой пешки c5 на центральную пешку d4',
      'Контроль полуоткрытой вертикали c',
      'Проведение пешечного наступления b7-b5 на ферзевом фланге',
    ],
    movesMeta: [
      {
        ply: 1,
        san: 'e4',
        arrow: ['e2', 'e4'],
        explanation: 'Белые начинают захват центра.',
        keyIdea: 'Пешка e4',
      },
      {
        ply: 2,
        san: 'c5',
        arrow: ['c7', 'c5'],
        explanation: 'Асимметричный ответ, контролирующий поле d4.',
        keyIdea: 'Контроль d4 с фланга',
      },
      {
        ply: 3,
        san: 'Nf3',
        arrow: ['g1', 'f3'],
        explanation: 'Подготовка продвижения d2-d4.',
        keyIdea: 'Подготовка вскрытия центра',
      },
      {
        ply: 4,
        san: 'd6',
        arrow: ['d7', 'd6'],
        explanation: 'Удержание поля e5 и открытие чернопольного слона.',
        keyIdea: 'Ограничение белых',
      },
      {
        ply: 5,
        san: 'd4',
        arrow: ['d2', 'd4'],
        explanation: 'Белые вскрывают вертикаль d.',
        keyIdea: 'Открытие игры',
      },
      {
        ply: 6,
        san: 'cxd4',
        arrow: ['c5', 'd4'],
        explanation: 'Размен фланговой пешки на центральную пешку белых.',
        keyIdea: 'Выгода в центре',
      },
      {
        ply: 7,
        san: 'Nxd4',
        arrow: ['f3', 'd4'],
        explanation: 'Конь занимает активную позицию в центре.',
        keyIdea: 'Централизация',
      },
      {
        ply: 8,
        san: 'Nf6',
        arrow: ['g8', 'f6'],
        explanation: 'Нападение на незащищенную пешку e4.',
        keyIdea: 'Атака e4',
      },
      {
        ply: 9,
        san: 'Nc3',
        arrow: ['b1', 'c3'],
        explanation: 'Белые защищают e4 развивающим ходом.',
        keyIdea: 'Защита конем',
      },
      {
        ply: 10,
        san: 'a6',
        arrow: ['a7', 'a6'],
        explanation: 'Вариант Найдорфа! Черные отнимают поля b5 у коней и слона белых.',
        keyIdea: 'Запрет прыжков на b5',
      },
    ],
  },
];
