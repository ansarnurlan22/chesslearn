/**
 * Comprehensive Opening Book for ChessCheese.
 * Contains ECO codes, opening names, and main lines up to 8-20 plies.
 * Used to classify theoretical moves as 'book' (📖) with 0 centipawn loss,
 * matching Chess.com and Lichess behavior.
 */

export interface OpeningInfo {
  eco: string;
  name: string;
  moves: string[]; // Sequence of SAN moves
}

export const OPENING_DATABASE: OpeningInfo[] = [
  // --- Italian Game ---
  { eco: 'C50', name: 'Итальянская партия (Giuoco Piano)', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'] },
  { eco: 'C53', name: 'Итальянская партия: Классический вариант', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3'] },
  { eco: 'C54', name: 'Итальянская партия: Центровой удар', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4', 'cxd4', 'Bb4+'] },
  { eco: 'C55', name: 'Защита двух коней', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'] },
  { eco: 'C57', name: 'Защита двух коней: Атака Тракслера', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'Bc5'] },
  { eco: 'C58', name: 'Защита двух коней: Вариант Полериo', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Na5', 'Bb5+', 'c6', 'dxc6', 'bxc6'] },
  { eco: 'C51', name: 'Гамбит Эванса', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3', 'Ba5', 'd4'] },
  { eco: 'C52', name: 'Гамбит Эванса: Главная линия', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3', 'Ba5', 'd4', 'exd4', 'O-O'] },

  // --- Ruy Lopez (Spanish) ---
  { eco: 'C60', name: 'Испанская партия', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'] },
  { eco: 'C65', name: 'Испанская партия: Берлинская защита', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6', 'O-O', 'Nxe4', 'd4', 'Nd6', 'Bxc6', 'dxc6', 'dxe5', 'Nf5'] },
  { eco: 'C68', name: 'Испанская партия: Разменный вариант', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6', 'dxc6', 'O-O'] },
  { eco: 'C70', name: 'Испанская партия: Отступление слона', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4'] },
  { eco: 'C78', name: 'Испанская партия: Атака Архангельска', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'b5', 'Bb3', 'Bb7'] },
  { eco: 'C84', name: 'Испанская партия: Закрытый вариант', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O'] },
  { eco: 'C88', name: 'Испанская партия: Атака Маршалла', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd5', 'exd5', 'Nxd5', 'Nxe5', 'Nxe5', 'Rxe5', 'c6'] },

  // --- Scotch & Other 1.e4 e5 ---
  { eco: 'C45', name: 'Шотландская партия', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6', 'Nc3', 'Bb4'] },
  { eco: 'C47', name: 'Дебют четырех коней', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6', 'd4', 'exd4', 'Nxd4', 'Bb4'] },
  { eco: 'C42', name: 'Русская партия (Защита Петрофф)', moves: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'd6', 'Nf3', 'Nxe4', 'd4', 'd5', 'Bd3'] },
  { eco: 'C41', name: 'Защита Филидора', moves: ['e4', 'e5', 'Nf3', 'd6', 'd4', 'exd4', 'Nxd4', 'Nf6', 'Nc3', 'Be7'] },
  { eco: 'C30', name: 'Королевский гамбит', moves: ['e4', 'e5', 'f4', 'exf4', 'Nf3', 'g5', 'Bc4', 'g4', 'O-O'] },
  { eco: 'C25', name: 'Венская партия', moves: ['e4', 'e5', 'Nc3', 'Nf6', 'f4', 'd5', 'fxe5', 'Nxe4'] },

  // --- Sicilian Defense (1.e4 c5) ---
  { eco: 'B20', name: 'Сицилианская защита', moves: ['e4', 'c5'] },
  { eco: 'B22', name: 'Сицилианская защита: Вариант Алапина', moves: ['e4', 'c5', 'c3', 'Nf6', 'e5', 'Nd5', 'd4', 'cxd4', 'Nf3', 'Nc6'] },
  { eco: 'B23', name: 'Сицилианская защита: Закрытый вариант', moves: ['e4', 'c5', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7', 'd3', 'd6'] },
  { eco: 'B27', name: 'Сицилианская защита: Открытая', moves: ['e4', 'c5', 'Nf3'] },
  { eco: 'B90', name: 'Сицилианская защита: Вариант Найдорфа', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'] },
  { eco: 'B90', name: 'Сицилианская: Найдорф (Английская атака)', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3', 'e5', 'Nb3', 'Be6', 'f3', 'Be7', 'Qd2', 'O-O'] },
  { eco: 'B70', name: 'Сицилианская защита: Вариант Дракона', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O', 'Qd2', 'Nc6'] },
  { eco: 'B33', name: 'Сицилианская защита: Вариант Свешникова', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e5', 'Ndb5', 'd6', 'Bg5', 'a6', 'Na3', 'b5'] },
  { eco: 'B40', name: 'Сицилианская защита: Вариант Паульсена / Кана', moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'a6', 'Nc3', 'Qc7'] },
  { eco: 'B45', name: 'Сицилианская защита: Вариант Тайманова', moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nc6', 'Nc3', 'Qc7', 'Be3', 'a6'] },
  { eco: 'B80', name: 'Сицилианская защита: Вариант Шевенингена', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e6', 'Be2', 'Be7', 'O-O', 'O-O'] },

  // --- French Defense (1.e4 e6) ---
  { eco: 'C00', name: 'Французская защита', moves: ['e4', 'e6'] },
  { eco: 'C02', name: 'Французская защита: Вариант движения (Advance)', moves: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Nc6', 'Nf3', 'Qb6'] },
  { eco: 'C15', name: 'Французская защита: Вариант Винавера', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4', 'e5', 'c5', 'a3', 'Bxc3+', 'bxc3', 'Ne7'] },
  { eco: 'C11', name: 'Французская защита: Классический вариант', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e5', 'Nfd7', 'h4'] },
  { eco: 'C05', name: 'Французская защита: Вариант Тарраша', moves: ['e4', 'e6', 'd4', 'd5', 'Nd2', 'Nf6', 'e5', 'Nfd7', 'Bd3', 'c5', 'c3', 'Nc6'] },

  // --- Caro-Kann Defense (1.e4 c6) ---
  { eco: 'B10', name: 'Защита Каро-Канн', moves: ['e4', 'c6'] },
  { eco: 'B12', name: 'Каро-Канн: Вариант движения (Advance)', moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'Nf3', 'e6', 'Be2', 'c5', 'Be3', 'Qb6'] },
  { eco: 'B18', name: 'Каро-Канн: Классический вариант', moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4', 'h6', 'Nf3', 'Nd7'] },
  { eco: 'B14', name: 'Каро-Канн: Атака Панова-Ботвинника', moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'c4', 'Nf6', 'Nc3', 'e6', 'Nf3', 'Be7'] },

  // --- Scandinavian, Alekhine, Pirc ---
  { eco: 'B01', name: 'Скандинавская защита', moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'Nf6', 'Nf3', 'c6'] },
  { eco: 'B01', name: 'Скандинавская защита: Португальский вариант', moves: ['e4', 'd5', 'exd5', 'Nf6', 'd4', 'Bg4'] },
  { eco: 'B02', name: 'Защита Алехина', moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6', 'Nf3', 'g6', 'Bc4', 'Nb6', 'Bb3', 'Bg7'] },
  { eco: 'B07', name: 'Защита Пирца-Уфимцева', moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'Nf3', 'Bg7', 'Be2', 'O-O', 'O-O'] },

  // --- Queen's Gambit & 1.d4 d5 ---
  { eco: 'D00', name: 'Дебют ферзевой пешки', moves: ['d4', 'd5'] },
  { eco: 'D02', name: 'Лондонская система', moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'c5', 'c3', 'Nc6', 'Nd2', 'e6', 'Ngf3', 'Bd6', 'Bg3', 'O-O'] },
  { eco: 'D06', name: 'Ферзевый гамбит', moves: ['d4', 'd5', 'c4'] },
  { eco: 'D20', name: 'Принятый ферзевый гамбит', moves: ['d4', 'd5', 'c4', 'dxc4', 'Nf3', 'Nf6', 'e3', 'e6', 'Bxc4', 'c5', 'O-O', 'a6'] },
  { eco: 'D30', name: 'Отказанный ферзевый гамбит', moves: ['d4', 'd5', 'c4', 'e6'] },
  { eco: 'D35', name: 'Отказанный ферзевый гамбит: Разменный вариант', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'cxd5', 'exd5', 'Bg5', 'c6', 'e3', 'Be7'] },
  { eco: 'D50', name: 'Ортодоксальная защита ферзевого гамбита', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'Nbd7', 'Rc1', 'c6'] },
  { eco: 'D10', name: 'Славянская защита', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'dxc4', 'a4', 'Bf5', 'e3', 'e6', 'Bxc4', 'Bb4'] },
  { eco: 'D45', name: 'Полуславянская защита', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'e6', 'e3', 'Nbd7', 'Qc2', 'Bd6'] },

  // --- Indian Defenses (1.d4 Nf6) ---
  { eco: 'E60', name: 'Староиндийская защита', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6'] },
  { eco: 'E97', name: 'Староиндийская: Классическая система', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7'] },
  { eco: 'E70', name: 'Староиндийская: Система Земиша', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f3', 'O-O', 'Be3', 'e5', 'd5'] },
  { eco: 'D85', name: 'Защита Грюнфельда: Разменный вариант', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'e4', 'Nxc3', 'bxc3', 'Bg7', 'Nf3', 'c5'] },
  { eco: 'E20', name: 'Защита Нимцовича', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'] },
  { eco: 'E32', name: 'Защита Нимцовича: Ленинградский вариант', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qc2', 'O-O', 'a3', 'Bxc3+', 'Qxc3', 'b6'] },
  { eco: 'E40', name: 'Защита Нимцовича: Вариант Рубинштейна', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3', 'O-O', 'Bd3', 'd5', 'Nf3', 'c5', 'O-O'] },
  { eco: 'E12', name: 'Новоиндийская защита', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'b6', 'g3', 'Ba6', 'b3', 'Bb4+', 'Bd2', 'Be7'] },
  { eco: 'A56', name: 'Защита Бенони', moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'e6', 'Nc3', 'exd5', 'cxd5', 'd6', 'e4', 'g6'] },
  { eco: 'A57', name: 'Волжский гамбит (Бенко)', moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'b5', 'cxb5', 'a6', 'bxa6', 'g6'] },
  { eco: 'E04', name: 'Каталонское начало', moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'dxc4', 'Qc2', 'a6'] },

  // --- Flank & Others ---
  { eco: 'A10', name: 'Английское начало', moves: ['c4'] },
  { eco: 'A20', name: 'Английское начало: Обратная сицилианка', moves: ['c4', 'e5', 'Nc3', 'Nf6', 'g3', 'd5', 'cxd5', 'Nxd5', 'Bg2', 'Nb6'] },
  { eco: 'A30', name: 'Английское начало: Симметричный вариант', moves: ['c4', 'c5', 'Nf3', 'Nf6', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7', 'O-O', 'O-O'] },
  { eco: 'A04', name: 'Дебют Рети', moves: ['Nf3', 'd5', 'c4', 'c6', 'g3', 'Nf6', 'Bg2', 'Bf5', 'O-O', 'e6'] },
  { eco: 'A07', name: 'Староиндийское начало (King\'s Indian Attack)', moves: ['Nf3', 'd5', 'g3', 'Nf6', 'Bg2', 'c6', 'O-O', 'Bg4', 'd3', 'Nbd7', 'Nbd2', 'e5'] },
  { eco: 'A80', name: 'Голландская защита', moves: ['d4', 'f5', 'g3', 'Nf6', 'Bg2', 'e6', 'Nf3', 'd5', 'O-O', 'Bd6'] },
];

/**
 * Prefix Trie structure for fast opening lookups
 */
interface TrieNode {
  children: Map<string, TrieNode>;
  opening?: OpeningInfo;
}

const rootNode: TrieNode = { children: new Map() };

// Build Trie index once
for (const opening of OPENING_DATABASE) {
  let curr = rootNode;
  for (let i = 0; i < opening.moves.length; i++) {
    const san = opening.moves[i];
    if (!curr.children.has(san)) {
      curr.children.set(san, { children: new Map() });
    }
    curr = curr.children.get(san)!;
    // Store best matching opening info
    if (i === opening.moves.length - 1 || !curr.opening) {
      curr.opening = opening;
    }
  }
}

/**
 * Checks if a played move at plyIndex (0-based) is part of recognized book opening theory.
 * A move is a book move if and only if all preceding moves were also in book,
 * and the current move matches a recognized branch in the opening tree.
 */
export function isOpeningBookMove(
  playedMoves: string[],
  plyIndex: number,
): { isBook: boolean; openingName?: string; eco?: string } {
  if (plyIndex < 0 || plyIndex >= playedMoves.length) {
    return { isBook: false };
  }

  // Maximum standard opening book depth (plies 1 to 24)
  if (plyIndex > 24) {
    return { isBook: false };
  }

  let curr = rootNode;
  let lastMatchedOpening: OpeningInfo | undefined = undefined;

  for (let i = 0; i <= plyIndex; i++) {
    const move = playedMoves[i];
    if (!curr.children.has(move)) {
      // Diverged from opening book
      return { isBook: false };
    }
    curr = curr.children.get(move)!;
    if (curr.opening) {
      lastMatchedOpening = curr.opening;
    }
  }

  return {
    isBook: true,
    openingName: lastMatchedOpening?.name,
    eco: lastMatchedOpening?.eco,
  };
}

/**
 * Returns the highest opening book ply in the played game.
 */
export function getBookPlyDepth(playedMoves: string[]): number {
  let depth = 0;
  let curr = rootNode;
  for (let i = 0; i < playedMoves.length; i++) {
    const move = playedMoves[i];
    if (!curr.children.has(move)) {
      break;
    }
    curr = curr.children.get(move)!;
    depth = i + 1;
  }
  return depth;
}
