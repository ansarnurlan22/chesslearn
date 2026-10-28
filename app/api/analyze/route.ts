import { classifyGameWithEngine } from '@/lib/engine/classification';
import type { GameReviewData } from '@/types/review';
import { NextResponse } from 'next/server';

interface AnalyzeRequestBody {
  pgn: string;
  playerColor?: 'white' | 'black';
  username?: string;
}

const CANDIDATE_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-flash',
];

export async function POST(request: Request) {
  let body: AnalyzeRequestBody = { pgn: '' };
  try {
    body = await request.json();
  } catch {
    // Graceful fallback
  }

  const { pgn = '', playerColor = 'white', username = 'Игрок' } = body;

  try {
    // 1. Stockfish performs 100% of the mathematical calculations (eval, CPL, classifications)
    const engineResult = await classifyGameWithEngine(pgn);

    const userAccuracy =
      playerColor === 'white'
        ? engineResult.accuracy.white
        : engineResult.accuracy.black;

    const userStats =
      playerColor === 'white' ? engineResult.stats.white : engineResult.stats.black;

    // Default summaries in case Gemini is not configured or encounters an issue
    let summary = `Партия ${username} (${playerColor === 'white' ? 'Белые' : 'Чёрные'}) сыграна с точностью ${userAccuracy}%. Движок Stockfish зафиксировал ${userStats.blunder} зевков, ${userStats.mistake} ошибок и ${userStats.best + userStats.great} сильнейших ходов.`;
    let keyTakeaway =
      userStats.blunder > 0
        ? 'Уделяйте больше внимания проверке незащищенных фигур и прямым тактическим угрозам соперника перед каждым ходом.'
        : 'Отличная дисциплина ходов! Для дальнейшего прогресса развивайте давление по открытым вертикалям и форпостам в центре.';

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. Gemini acts strictly as a natural language translator for the precalculated facts
    if (apiKey && engineResult.criticalMoves.length > 0) {
      try {
        const criticalFacts = engineResult.criticalMoves
          .map(
            (cm) =>
              `- Ход ${cm.moveNumber} (ply ${cm.ply}, ${cm.color === 'white' ? 'Белые' : 'Чёрные'}): ${cm.san}. Статус: ${cm.type}. Лучший ход Stockfish: ${cm.betterMove}. Оценка: ${cm.score || 'Равенство'}. PV: ${cm.pvLine || '-'}`,
          )
          .join('\n');

        const prompt = `Ты шахматный наставник ChessCheese. Все расчеты УЖЕ сделаны движком Stockfish:
- Игрок: "${username}" играл за ${playerColor === 'white' ? 'Белых' : 'Чёрных'}.
- Точность игры: Белые ${engineResult.accuracy.white}%, Чёрные ${engineResult.accuracy.black}%.
- Статистика ходов:
  Белые: ${JSON.stringify(engineResult.stats.white)}
  Чёрные: ${JSON.stringify(engineResult.stats.black)}
- Ключевые ходы партии от Stockfish:
${criticalFacts}

Твоя задача — НЕ считать позицию самому, а выступить переводчиком на живой гроссмейстерский язык:
1. Напиши живое и вдохновляющее резюме партии (summary) на русском языке (2-3 предложения): как развивалась борьба и где был переломный момент.
2. Дай главный практический совет (keyTakeaway) игроку "${username}" на основе допущенных неточностей.
3. Для каждого ключевого хода объясни простыми словами, почему ход Stockfish был сильнее и какую угрозу нес ход игрока.

Верни СТРОГИЙ JSON следующего формата:
{
  "summary": "<Текст резюме>",
  "keyTakeaway": "<Главный практический совет>",
  "criticalMoveComments": [
    {
      "ply": <число ply>,
      "comment": "<Живое тренерское объяснение хода>"
    }
  ]
}`;

        for (const model of CANDIDATE_MODELS) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const geminiRes = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.3,
                },
              }),
            });

            if (geminiRes.ok) {
              const data = await geminiRes.json();
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                const parsed = JSON.parse(text) as {
                  summary?: string;
                  keyTakeaway?: string;
                  criticalMoveComments?: Array<{ ply: number; comment: string }>;
                };

                if (parsed.summary) summary = parsed.summary;
                if (parsed.keyTakeaway) keyTakeaway = parsed.keyTakeaway;

                if (Array.isArray(parsed.criticalMoveComments)) {
                  const commentsMap = new Map<number, string>();
                  for (const c of parsed.criticalMoveComments) {
                    if (c && typeof c.ply === 'number' && c.comment) {
                      commentsMap.set(c.ply, c.comment);
                    }
                  }

                  // Update critical moves with Gemini's lively comments
                  for (const cm of engineResult.criticalMoves) {
                    const aiComment = commentsMap.get(cm.ply);
                    if (aiComment) {
                      cm.comment = aiComment;
                    }
                  }

                  // Also update allMoves
                  for (const mv of engineResult.moves) {
                    const aiComment = commentsMap.get(mv.ply);
                    if (aiComment) {
                      mv.comment = aiComment;
                    }
                  }
                }

                break; // successfully translated
              }
            }
          } catch {
            // try next model or fallback
          }
        }
      } catch {
        // use engine default summary
      }
    }

    const responseData: GameReviewData = {
      accuracy: engineResult.accuracy,
      summary,
      keyTakeaway,
      criticalMoves: engineResult.criticalMoves,
      allMoves: engineResult.moves,
      stats: engineResult.stats,
    };

    return NextResponse.json(responseData);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Analysis error';
    return NextResponse.json(
      { error: `Не удалось завершить анализ партии: ${errorMsg}` },
      { status: 500 },
    );
  }
}
