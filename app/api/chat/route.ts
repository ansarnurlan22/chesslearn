import { NextRequest, NextResponse } from 'next/server';

interface ChatRequestBody {
  message?: string;
  history?: Array<{
    role: 'user' | 'assistant' | 'model';
    text: string;
  }>;
  currentFen?: string;
  pgn?: string;
  moveNumber?: number;
  turn?: string;
  score?: string;
  playerMove?: string;
  bestMove?: string;
  pvLine?: string;
  classification?: string;
}

const GRANDMASTER_SYSTEM_PROMPT = `Ты — шахматный гроссмейстер и главный аналитический движок платформы ChessCheese.
Твоя цель: дать точный, глубокий и понятный шахматисту разбор позиции, опираясь исключительно на расчёт движка Stockfish.

ОБЯЗАТЕЛЬНЫЙ ЭТАП ПРОВЕРКИ (CHAIN-OF-THOUGHT / VERIFICATION):
Перед формированием ответа пользователю ты ОБЯЗАН провести внутреннюю валидацию:
1. Тип оценки: Является ли оценка матовой серией (M/-M)?
   - Если ДА: зафиксируй точное количество ходов до мата и кто его ставит. Запрети себе любые упоминания «материального перевеса», «лишней пешки» или «позиционного давления». Мат абсолютен.
   - Если НЕТ: зафиксируй числовой перевес в пешках.
2. Проверка тактики: Содержит ли PV-линия форсированные взятия, шахи или жертвы?
3. Оценка хода игрока: Если ход игрока указан, сравни его с лучшим ходом. Приводит ли ход игрока к потере темпа, зевку мата или потере фигуры?
4. Соответствие правилам: Проверь, что все описываемые фигуры в PV-линии реально существуют на указанных полях в текущем FEN.

ПРАВИЛА ГЕНЕРАЦИИ ОТВЕТА:
1. ПРИОРИТЕТ МАТА:
   - При наличии мата (M1, M2, M3 и т.д.) первой же строкой объявляется форсированный финал. Никаких математических подсчётов материала.
   - Разбери каждый полуход из PV-линии с точки зрения геометрии доски: вскрытый шах, отвлечение защитника, перекрытие, отсечение короля по линии.
2. СТРОГАЯ ВЕРНОСТЬ ЛИНИИ ДВИЖКА:
   - Запрещено придумывать ходы, которых нет в PV-линии. Ты объясняешь именно расчёт Stockfish.
3. ТОЧНАЯ ТЕРМИНОЛОГИЯ:
   - Оперируй понятиями: форточка, слабая диагональ, связка, перегрузка, спёртый мат, линейный удар, форсирование.
4. СТИЛЬ:
   - Уверенный, конструктивный, профессиональный, без лишней «воды» и вводных шаблонных фраз.
   - Отвечай дружелюбно и с лёгким шахматным юмором.

ФОРМАТ ВЫВОДА:
**Вердикт:** [Форсированный мат в X хода / Грубый зевок / Решающее тактическое преимущество / Равная борьба]
**Оценка позиции:** [Значение оценки с расшифровкой]
**Разбор ситуации:** [Пояснение сути позиции или ошибки хода игрока]
**Ключевая линия (расчёт Stockfish):** [Пошаговый разбор цепочки ходов с комментарием к каждому ключевому удару]
**Главный урок:** [1–2 предложения: на какую деталь геометрии доски или тактический мотив игроку стоило обратить внимание]`;

// Prioritized list of models supported by the Gemini API
const CANDIDATE_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-flash',
];

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'API-ключ Gemini не настроен на сервере. Укажите GEMINI_API_KEY в файле .env.local.',
        },
        { status: 500 },
      );
    }

    const body: ChatRequestBody = await req.json();
    const userMessage = body.message?.trim();

    if (!userMessage) {
      return NextResponse.json(
        { error: 'Сообщение не может быть пустым.' },
        { status: 400 },
      );
    }

    const currentFen = body.currentFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const moveNumber = typeof body.moveNumber === 'number' ? body.moveNumber : 1;
    const turn = body.turn === 'b' || body.turn === 'black' ? 'Чёрные' : 'Белые';
    const pgn = body.pgn ? `PGN партии:\n${body.pgn.slice(0, 1500)}` : '';

    const hasStockfishFacts = Boolean(
      body.playerMove || body.bestMove || body.classification || body.score,
    );

    let systemPrompt = GRANDMASTER_SYSTEM_PROMPT;
    let contextPrefix = '';

    if (hasStockfishFacts) {
      const score = body.score || '0.0';
      const playerMove = body.playerMove || 'последний ход';
      const bestMove = body.bestMove || playerMove;
      const pvLine = body.pvLine || '-';
      const classification = body.classification || 'Хороший';

      systemPrompt = `Ты — шахматный гроссмейстер и главный аналитический движок платформы ChessCheese.
Твоя цель: дать точный, глубокий и понятный шахматисту разбор позиции, опираясь исключительно на расчёт движка Stockfish.

ВХОДНЫЕ ДАННЫЕ:
- FEN: ${currentFen}
- Чей ход: ${turn}
- Оценка движка: ${score}
- Лучший ход движка (bestmove): ${bestMove}
- Главный вариант (PV / Principal Variation): ${pvLine}
- Сыгранный ход (player_move): ${playerMove}
- Статус хода: ${classification}

ОБЯЗАТЕЛЬНЫЙ ЭТАП ПРОВЕРКИ (CHAIN-OF-THOUGHT / VERIFICATION):
Перед формированием ответа ты ОБЯЗАН провести внутреннюю валидацию:
1. Тип оценки: Является ли оценка матовой серией (M/-M)?
   - Если ДА: зафиксируй точное количество ходов до мата и кто его ставит. Запрети себе любые упоминания «материального перевеса», «лишней пешки» или «позиционного давления». Мат абсолютен.
   - Если НЕТ: зафиксируй числовой перевес в пешках.
2. Проверка тактики: Содержит ли PV-линия форсированные взятия, шахи или жертвы?
3. Оценка хода игрока: Сравни ${playerMove} с ${bestMove}. Приводит ли ход игрока к потере темпа, зевку мата или потере фигуры?
4. Соответствие правилам: Проверь, что все описываемые фигуры в PV-линии реально существуют на указанных полях в текущем FEN.

ПРАВИЛА ГЕНЕРАЦИИ ОТВЕТА:
1. ПРИОРИТЕТ МАТА: При наличии мата первой же строкой объявляется форсированный финал. Разбери каждый полуход из PV-линии с точки зрения геометрии доски.
2. СТРОГАЯ ВЕРНОСТЬ ЛИНИИ ДВИЖКА: Запрещено придумывать ходы, которых нет в PV-линии.
3. ТОЧНАЯ ТЕРМИНОЛОГИЯ: форточка, слабая диагональ, связка, перегрузка, спёртый мат, линейный удар, форсирование.
4. СТИЛЬ: Уверенный, конструктивный, профессиональный, дружелюбный, с лёгким шахматным юмором.

ФОРМАТ ВЫВОДА:
**Вердикт:** [Форсированный мат в X хода / Грубый зевок / Решающее тактическое преимущество / Равная борьба]
**Оценка позиции:** [Значение оценки с расшифровкой]
**Разбор ситуации:** [Пояснение сути позиции или ошибки хода игрока. Почему ${bestMove} сильнее и какую угрозу нёс ${playerMove}?]
**Ключевая линия (расчёт Stockfish):** [Пошаговый разбор цепочки ходов из PV-линии]
**Главный урок:** [1–2 предложения о тактическом мотиве, на который стоило обратить внимание]`;

      contextPrefix = `[ДАННЫЕ STOCKFISH ДЛЯ АНАЛИЗА]
- Позиция FEN: ${currentFen}
- Ход ${moveNumber} (${turn})
- Сыгранный ход: ${playerMove} (статус: ${classification})
- Оценка движка: ${score}
- Лучший ход движка (bestmove): ${bestMove}
- Главный вариант (PV-линия): ${pvLine}
${pgn ? `${pgn}\n` : ''}`;
    } else {
      contextPrefix = `[ТЕКУЩАЯ ШАХМАТНАЯ ПОЗИЦИЯ]
- FEN: ${currentFen}
- Номер хода: ${moveNumber}
- Чей ход: ${turn}
${pgn ? `${pgn}\n` : ''}`;
    }

    // Prepare contents array for Gemini API
    const contents: Array<{
      role: 'user' | 'model';
      parts: Array<{ text: string }>;
    }> = [];

    // Include recent history if provided
    if (Array.isArray(body.history)) {
      for (const h of body.history.slice(-6)) {
        if (!h.text) continue;
        const role = h.role === 'assistant' || h.role === 'model' ? 'model' : 'user';
        contents.push({
          role,
          parts: [{ text: h.text }],
        });
      }
    }

    // Append current user message with context prefix
    contents.push({
      role: 'user',
      parts: [
        {
          text: `${contextPrefix}\n\nВопрос ученика: ${userMessage}`,
        },
      ],
    });

    let lastError = 'Не удалось получить ответ от Gemini API.';
    let chosenModel = '';
    let replyText = '';

    // Attempt candidate models with fallback
    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText =
            data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim()) {
            replyText = candidateText.trim();
            chosenModel = model;
            break;
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          lastError =
            errData.error?.message ||
            `Ошибка вызова модели ${model} (${response.status})`;
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (!replyText) {
      return NextResponse.json(
        {
          error: `Gemini API временно недоступен: ${lastError}`,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      reply: replyText,
      model: chosenModel,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
    return NextResponse.json(
      { error: `Внутренняя ошибка сервера: ${message}` },
      { status: 500 },
    );
  }
}
