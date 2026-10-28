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

const GRANDMASTER_SYSTEM_PROMPT = `Ты живой шахматный гроссмейстер-наставник ChessCheese Bot.
Тебе передается текущий FEN позиции, номер хода и чей ход.
КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО отвечать абстрактными фразами. Смотри в реальный FEN:
1. Оценивай конкретные угрозы (шахи, связки, вилки, незащищенные фигуры).
2. Объясняй идеи ходов на пальцах с конкретными вариантами (например: "Белые сыграли Ne5, создавая давление на пункт f7").
3. Отвечай дружелюбно, профессионально и с легким шахматным юмором.`;

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

      systemPrompt = `Ты шахматный наставник ChessCheese. Все расчеты УЖЕ сделаны движком Stockfish:
- Оценка позиции: ${score}
- Игрок сыграл: ${playerMove}
- Лучший ход движка: ${bestMove}
- Опровержение Stockfish (PV-линия): ${pvLine}
- Статус хода: ${classification}
Твоя задача — не считать позицию самому, а объяснить игроку простыми словами, почему ход ${bestMove} сильнее и какую угрозу нес ход ${playerMove} по линии ${pvLine}.
Отвечай профессионально, дружелюбно, по-шахматному точно и с легким юмором.`;

      contextPrefix = `[ДАННЫЕ STOCKFISH ДЛЯ АНАЛИЗА]
- Позиция FEN: ${currentFen}
- Ход ${moveNumber} (${turn})
- Игрок сыграл: ${playerMove} (статус: ${classification})
- Оценка позиции: ${score}
- Рекомендация Stockfish: ${bestMove}
- Опровержение / линия: ${pvLine}
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
