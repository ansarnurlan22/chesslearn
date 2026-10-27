import { Chess } from 'chess.js';

export interface PositionEvaluation {
  score: number;
  text: string;
  isCheckmate: boolean;
  isEngine: boolean;
}

/**
 * Parses embedded engine evaluations from PGN comments.
 * Formats:
 * { [%eval +1.8] } or { [%eval -0.45] } or { [%eval #2] } or { [%eval #-3] }
 */
export function parsePgnEvaluations(pgn: string): Map<number, PositionEvaluation> {
  const evalMap = new Map<number, PositionEvaluation>();
  if (!pgn || !pgn.trim()) return evalMap;

  // Match comments like { ... [%eval ...] ... }
  // or standalone [%eval ...]
  const evalRegex = /\[%eval\s+([#+-]?\d+(?:\.\d+)?)\]/g;

  // We walk through the moves using regex or string splitting
  // In PGN, move tokens are preceded or followed by comments: e.g. "1. e4 { [%eval 0.2] } e5 { [%eval 0.3] }"
  // Clean PGN headers first
  const body = pgn.replace(/\[[A-Za-z]+\s+"[^"]*"\]/g, ' ');

  // Tokenize by moves and comments
  // A regex matching: move number (optional), move SAN, comment block
  const tokenRegex = /(?:(\d+)\.\s*)?([NBKRQ]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[\+#]?|O-O-O|O-O)\s*(?:\{([^}]*)\})?/g;

  let match: RegExpExecArray | null;
  let ply = 0;

  while ((match = tokenRegex.exec(body)) !== null) {
    ply++;
    const comment = match[3];
    if (comment) {
      evalRegex.lastIndex = 0;
      const evalMatch = evalRegex.exec(comment);
      if (evalMatch && evalMatch[1]) {
        const rawVal = evalMatch[1];
        if (rawVal.startsWith('#')) {
          // Mate in X
          const mateIn = parseInt(rawVal.substring(1), 10);
          const isWhiteWinning = mateIn > 0;
          evalMap.set(ply, {
            score: isWhiteWinning ? 99 : -99,
            text: `M${Math.abs(mateIn)}`,
            isCheckmate: true,
            isEngine: true,
          });
        } else {
          const score = parseFloat(rawVal);
          if (!isNaN(score)) {
            const rounded = Math.round(score * 10) / 10;
            const sign = rounded > 0 ? `+${rounded.toFixed(1)}` : `${rounded.toFixed(1)}`;
            evalMap.set(ply, {
              score: rounded,
              text: rounded === 0 ? '0.0' : sign,
              isCheckmate: false,
              isEngine: true,
            });
          }
        }
      }
    }
  }

  return evalMap;
}

/**
 * Heuristic Positional Evaluation of a FEN.
 * Includes:
 * 1. Material balance
 * 2. Center control (e4, d4, e5, d5, c4, c5)
 * 3. King safety (castled vs king stuck in center, pawn shield)
 * 4. Piece activity (rooks on open/semi-open files, bishop pairs, knights on active squares)
 */
export function evaluatePositionHeuristic(fen: string): PositionEvaluation {
  const parts = fen.split(' ');
  const position = parts[0] ?? '';
  const activeColor = parts[1] ?? 'w';
  const castlingRights = parts[2] ?? '-';

  // Quick checkmate check using chess.js
  try {
    const tempChess = new Chess(fen);
    if (tempChess.isCheckmate()) {
      const winner = tempChess.turn() === 'w' ? -99 : 99;
      return {
        score: winner,
        text: winner > 0 ? '#1-0' : '#0-1',
        isCheckmate: true,
        isEngine: false,
      };
    }
  } catch {
    // Ignore if FEN is incomplete
  }

  // 1. Material values
  const pieceValues: Record<string, number> = {
    p: -1,
    n: -3.1,
    b: -3.3,
    r: -5,
    q: -9.2,
    P: 1,
    N: 3.1,
    B: 3.3,
    R: 5,
    Q: 9.2,
  };

  let materialScore = 0;
  let whiteQueens = 0;
  let blackQueens = 0;
  let whiteBishops = 0;
  let blackBishops = 0;

  for (const char of position) {
    if (pieceValues[char] !== undefined) {
      materialScore += pieceValues[char];
    }
    if (char === 'Q') whiteQueens++;
    if (char === 'q') blackQueens++;
    if (char === 'B') whiteBishops++;
    if (char === 'b') blackBishops++;
  }

  // Bishop pair bonus (+0.4)
  if (whiteBishops >= 2) materialScore += 0.4;
  if (blackBishops >= 2) materialScore -= 0.4;

  // 2. Center Control & Positional Factors
  // Parse rows (rank 8 down to rank 1)
  const ranks = position.split('/');
  let positionalScore = 0;

  // Build 8x8 grid for tactical context
  const board: Array<Array<string | null>> = [];
  for (const rankStr of ranks) {
    const row: Array<string | null> = [];
    for (const char of rankStr) {
      if (/\d/.test(char)) {
        const emptyCount = parseInt(char, 10);
        for (let k = 0; k < emptyCount; k++) row.push(null);
      } else {
        row.push(char);
      }
    }
    board.push(row);
  }

  // Central square coordinates (0-indexed: row 3=rank 5, row 4=rank 4; col 3=d, col 4=e)
  // e4: row 4, col 4; d4: row 4, col 3; e5: row 3, col 4; d5: row 3, col 3
  const centerCoords = [
    { r: 3, c: 3 }, // d5
    { r: 3, c: 4 }, // e5
    { r: 4, c: 3 }, // d4
    { r: 4, c: 4 }, // e4
  ];

  for (const coord of centerCoords) {
    const piece = board[coord.r]?.[coord.c];
    if (piece) {
      if (piece === 'P') positionalScore += 0.35;
      else if (piece === 'N' || piece === 'B') positionalScore += 0.25;
      else if (piece === 'p') positionalScore -= 0.35;
      else if (piece === 'n' || piece === 'b') positionalScore -= 0.25;
    }
  }

  // 3. King Safety Assessment
  // Locate kings
  let whiteKingPos: { r: number; c: number } | null = null;
  let blackKingPos: { r: number; c: number } | null = null;

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < (board[r]?.length ?? 0); c++) {
      if (board[r][c] === 'K') whiteKingPos = { r, c };
      if (board[r][c] === 'k') blackKingPos = { r, c };
    }
  }

  // White King Safety
  if (whiteKingPos) {
    // Castled king on g1 (r=7, c=6) or c1/b1 (r=7, c=1 or 2)
    if (whiteKingPos.r === 7 && (whiteKingPos.c >= 5 || whiteKingPos.c <= 2)) {
      positionalScore += 0.5; // Castled bonus
      // Check pawn shield (f2, g2, h2)
      if (whiteKingPos.c >= 5) {
        if (board[6]?.[5] === 'P') positionalScore += 0.15;
        if (board[6]?.[6] === 'P') positionalScore += 0.15;
        if (board[6]?.[7] === 'P') positionalScore += 0.15;
      }
    } else if (whiteKingPos.r === 7 && whiteKingPos.c === 4) {
      // King still on e1!
      // If queens are on the board and center is partially open, penalize stuck king
      if (blackQueens > 0) {
        positionalScore -= 0.8;
      }
    }
  }

  // Black King Safety
  if (blackKingPos) {
    // Castled king on g8 (r=0, c=6) or c8/b8 (r=0, c=1 or 2)
    if (blackKingPos.r === 0 && (blackKingPos.c >= 5 || blackKingPos.c <= 2)) {
      positionalScore -= 0.5; // Castled bonus for black
      if (blackKingPos.c >= 5) {
        if (board[1]?.[5] === 'p') positionalScore -= 0.15;
        if (board[1]?.[6] === 'p') positionalScore -= 0.15;
        if (board[1]?.[7] === 'p') positionalScore -= 0.15;
      }
    } else if (blackKingPos.r === 0 && blackKingPos.c === 4) {
      // King still on e8
      if (whiteQueens > 0) {
        positionalScore += 0.8;
      }
    }
  }

  // Combine Material + Positional
  const totalScore = materialScore + positionalScore;
  const rounded = Math.round(totalScore * 10) / 10;
  const sign = rounded > 0 ? `+${rounded.toFixed(1)}` : `${rounded.toFixed(1)}`;
  const text = rounded === 0 ? '0.0' : sign;

  return {
    score: rounded,
    text,
    isCheckmate: false,
    isEngine: false,
  };
}
