import { classifyGameWithEngine } from '@/lib/engine/classification';
import type {
  CriticalMove,
  GameReviewData,
  MoveAnalysis,
  MoveTypeSummary,
} from '@/types/review';
import { NextResponse } from 'next/server';

interface AnalyzeRequestBody {
  pgn: string;
  playerColor?: 'white' | 'black';
  username?: string;
}

/**
 * Generates an authoritative, game-specific summary and key takeaway
 * computed 100% directly from Stockfish 19 Lite evaluation metrics.
 */
function buildStockfishSummaryAndTakeaway({
  username,
  playerColor,
  whiteAccuracy,
  blackAccuracy,
  whiteStats,
  blackStats,
  criticalMoves,
  allMoves,
}: {
  username: string;
  playerColor: 'white' | 'black';
  whiteAccuracy: number;
  blackAccuracy: number;
  whiteStats: MoveTypeSummary;
  blackStats: MoveTypeSummary;
  criticalMoves: CriticalMove[];
  allMoves: MoveAnalysis[];
}): { summary: string; keyTakeaway: string } {
  const userAccuracy = playerColor === 'white' ? whiteAccuracy : blackAccuracy;
  const oppAccuracy = playerColor === 'white' ? blackAccuracy : whiteAccuracy;
  const userStats = playerColor === 'white' ? whiteStats : blackStats;

  const userBlunders = allMoves.filter(
    (m) => m.color === playerColor && m.type === 'blunder',
  );
  const userMistakes = allMoves.filter(
    (m) => m.color === playerColor && m.type === 'mistake',
  );
  const userInaccuracies = allMoves.filter(
    (m) => m.color === playerColor && m.type === 'inaccuracy',
  );

  // 1. Determine key turning point from engine critical moves
  let turningPointSentence = '';
  if (criticalMoves.length > 0) {
    const tp = criticalMoves[0];
    const tpColorName = tp.color === 'white' ? 'Белых' : 'Чёрных';
    const tpMoveNotation = `${tp.moveNumber}${tp.color === 'white' ? '.' : '...'}${tp.san}`;
    let tpDesc = 'решающим моментом';
    if (tp.type === 'blunder') tpDesc = 'грубым тактическим зевком';
    else if (tp.type === 'mistake') tpDesc = 'ощутимой позиционной ошибкой';
    else if (tp.type === 'brilliant') tpDesc = 'блестящей тактической жертвой';

    const betterAlternative = tp.betterMove
      ? ` В качестве сильнейшей альтернативы Stockfish 19 Lite рекомендовал ход ${tp.betterMove}${tp.pvLine ? ` с линией ${tp.pvLine}` : ''}.`
      : '';

    turningPointSentence = ` Главным переломным моментом стал ход ${tpMoveNotation} (${tpColorName}), оказавшийся ${tpDesc} (оценка ${tp.score || '0.0'}).${betterAlternative}`;
  } else {
    turningPointSentence =
      ' Партия развивалась в равной борьбе, где обе стороны демонстрировали дисциплинированную дебютную и тактическую игру.';
  }

  // 2. Build complete summary
  const summary = `Партия ${username} (${playerColor === 'white' ? 'Белые' : 'Чёрные'}) полностью рассчитана движком Stockfish 19 Lite. Точность игры составила ${userAccuracy}% против ${oppAccuracy}% у соперника.${turningPointSentence} В активе ${username}: ${userStats.best + userStats.great} сильнейших ходов Stockfish, ${userStats.good} надёжных решений, ${userStats.inaccuracy} неточностей, ${userStats.mistake} ошибок и ${userStats.blunder} зевков.`;

  // 3. Build practical key takeaway based on error profile
  let keyTakeaway = '';
  if (userBlunders.length > 0) {
    const sample = userBlunders[0];
    const blunderMovesStr = userBlunders
      .slice(0, 3)
      .map((b) => `${b.moveNumber}${b.color === 'white' ? '.' : '...'}${b.san}`)
      .join(', ');

    keyTakeaway = `Главный практический урок для ${username}: уделите пристальное внимание тактической безопасности на ходах ${blunderMovesStr}. В позиции после хода ${sample.san} Stockfish 19 Lite настаивал на продолжении ${sample.betterMove || 'более надёжном плане'}. Перед каждым ходом обязательно сканируйте вилки, сквозные удары и незащищённые фигуры.`;
  } else if (userMistakes.length > 0) {
    const sample = userMistakes[0];
    const mistakeMovesStr = userMistakes
      .slice(0, 3)
      .map((m) => `${m.moveNumber}${m.color === 'white' ? '.' : '...'}${m.san}`)
      .join(', ');

    keyTakeaway = `Главный практический урок для ${username}: тактическая основа на высоком уровне, но позиционные решения на ходах ${mistakeMovesStr} позволили сопернику навязать давление. В частности, на ${sample.moveNumber}-м ходу точнее было ${sample.betterMove || 'активизировать фигуры'}. Укрепляйте фигурные форпосты и избегайте уступки центра.`;
  } else if (userInaccuracies.length > 0) {
    const inaccMovesStr = userInaccuracies
      .slice(0, 3)
      .map((i) => `${i.moveNumber}${i.color === 'white' ? '.' : '...'}${i.san}`)
      .join(', ');

    keyTakeaway = `Отличная дисциплина ходов без грубых тактических провалов! Единственный резерв для роста — устранение микро-неточностей на ходах ${inaccMovesStr}. Развивайте активность ладей по открытым вертикалям, чтобы реализовывать позиционный перевес на уровне первой линии Stockfish 19 Lite.`;
  } else {
    keyTakeaway = `Гроссмейстерский уровень точности (${userAccuracy}%)! Ни одного зевка или ошибки за всю партию — эталонное следование первой линии шахматного движка Stockfish 19 Lite.`;
  }

  return { summary, keyTakeaway };
}

export async function POST(request: Request) {
  let body: AnalyzeRequestBody = { pgn: '' };
  try {
    body = await request.json();
  } catch {
    // Graceful fallback
  }

  const { pgn = '', playerColor = 'white', username = 'Игрок' } = body;

  try {
    // 1. Stockfish 19 Lite performs 100% of the mathematical calculations
    // (evaluations, CPL loss, move classifications, accuracy formula, and PV lines)
    const engineResult = await classifyGameWithEngine(pgn);

    // 2. Generate detailed engine summary & key takeaways based directly on Stockfish results
    const { summary, keyTakeaway } = buildStockfishSummaryAndTakeaway({
      username,
      playerColor,
      whiteAccuracy: engineResult.accuracy.white,
      blackAccuracy: engineResult.accuracy.black,
      whiteStats: engineResult.stats.white,
      blackStats: engineResult.stats.black,
      criticalMoves: engineResult.criticalMoves,
      allMoves: engineResult.moves,
    });

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
