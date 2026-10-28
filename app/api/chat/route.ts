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
}

const GRANDMASTER_SYSTEM_PROMPT = `Ты живой шахматный гроссмейстер-наставник ChessCheese Bot.
Тебе передается текущий FEN позиции, номер хода и чей ход.
КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО отвечать абстрактными фразами. Смотри в реальный FEN:
1. Оценивай конкретные угрозы (шахи, связки, вилки, незащищенные фигуры).
2. Объясняй идеи ходов на пальцах с конкретными вариантами (например: "Белые сыграли Ne5, создавая давление на пункт f7").
3. Отвечай дружелюбно, профессионально и с легким шахматным юмором.`;

// Prioritized list of models supported by the Gemini API
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
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

    // Build contextual prompt
    const contextPrefix = `[ТЕКУЩАЯ ШАХМАТНАЯ ПОЗИЦИЯ]
- FEN: ${currentFen}
- Номер хода: ${moveNumber}
- Чей ход: ${turn}
${pgn ? `${pgn}\n` : ''}
Внимательно оцени эту позицию и ответь на вопрос ученика:`;

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
          text: `${contextPrefix}\n\n${userMessage}`,
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

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: GRANDMASTER_SYSTEM_PROMPT }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          lastError = errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          // If model deprecated or high load, try next candidate
          continue;
        }

        const data = await res.json();
        const candidate = data.candidates?.[0];
        const textPart = candidate?.content?.parts?.[0]?.text;

        if (textPart) {
          replyText = textPart;
          chosenModel = model;
          break;
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          lastError = err.message;
        }
      }
    }

    if (!replyText) {
      return NextResponse.json(
        {
          error: `Ошибка генерации ответа от Gemini API: ${lastError}`,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      reply: replyText,
      model: chosenModel,
      fen: currentFen,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Внутренняя ошибка сервера.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
