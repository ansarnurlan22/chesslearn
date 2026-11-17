/**
 * Comprehensive Opening Book for ChessCheese.
 * Contains ECO codes, opening names, and main lines up to 8-24 plies.
 * Used to classify theoretical moves as 'book' (📖) with 0 centipawn loss,
 * matching Chess.com and Lichess behavior.
 */

export interface OpeningInfo {
  eco: string;
  name: string;
  moves: string[]; // Sequence of SAN moves
}

export const OPENING_DATABASE: OpeningInfo[] = [
  // --- Italian Game (Итальянская партия) ---
  { eco: 'C50', name: 'Итальянская партия (Giuoco Piano)', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'] },
  { eco: 'C50', name: 'Итальянская партия: Тишайшая игра (Giuoco Pianissimo)', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'O-O', 'Nf6', 'd3', 'd6', 'c3', 'a6'] },
  { eco: 'C53', name: 'Итальянская партия: Классический вариант', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3', 'd6', 'O-O', 'O-O', 'Nbd2', 'a6', 'Bb3', 'Ba7'] },
  { eco: 'C54', name: 'Итальянская партия: Центровой удар', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4', 'cxd4', 'Bb4+', 'Bd2', 'Bxd2+', 'Nbxd2', 'd5'] },
  { eco: 'C55', name: 'Защита двух коней', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'] },
  { eco: 'C55', name: 'Защита двух коней: 4.d3', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'd3', 'Be7', 'O-O', 'O-O', 'Re1', 'd6', 'a4'] },
  { eco: 'C57', name: 'Защита двух коней: Атака Тракслера', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'Bc5', 'Bxf7+', 'Ke7', 'Bd5', 'Rf8'] },
  { eco: 'C58', name: 'Защита двух коней: Вариант Полерио', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Na5', 'Bb5+', 'c6', 'dxc6', 'bxc6', 'Bd3', 'Nd5', 'Nf3', 'Bd6'] },
  { eco: 'C51', name: 'Гамбит Эванса', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3', 'Ba5', 'd4', 'exd4', 'O-O', 'Nge7'] },
  { eco: 'C52', name: 'Гамбит Эванса: Главная линия', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3', 'Ba5', 'd4', 'exd4', 'O-O'] },

  // --- Ruy Lopez (Испанская партия) ---
  { eco: 'C60', name: 'Испанская партия', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'] },
  { eco: 'C65', name: 'Испанская партия: Берлинская защита', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6', 'O-O', 'Nxe4', 'd4', 'Nd6', 'Bxc6', 'dxc6', 'dxe5', 'Nf5', 'Qxd8+', 'Kxd8'] },
  { eco: 'C68', name: 'Испанская партия: Разменный вариант', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6', 'dxc6', 'O-O', 'f6', 'd4', 'exd4', 'Nxd4', 'c5'] },
  { eco: 'C70', name: 'Испанская партия: Отступление слона', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4'] },
  { eco: 'C78', name: 'Испанская партия: Атака Архангельска', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'b5', 'Bb3', 'Bc5', 'a4', 'Rb8'] },
  { eco: 'C80', name: 'Испанская партия: Открытый вариант', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Nxe4', 'd4', 'b5', 'Bb3', 'd5', 'dxe5', 'Be6', 'c3', 'Be7'] },
  { eco: 'C84', name: 'Испанская партия: Закрытый вариант', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O'] },
  { eco: 'C88', name: 'Испанская партия: Атака Маршалла', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd5', 'exd5', 'Nxd5', 'Nxe5', 'Nxe5', 'Rxe5', 'c6', 'd4', 'Bd6', 'Re1', 'Qh4', 'g3', 'Qh3'] },
  { eco: 'C92', name: 'Испанская партия: Вариант Зайцева', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Bb7', 'd4', 'Re8'] },
  { eco: 'C95', name: 'Испанская партия: Вариант Брейера', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Nb8', 'd4', 'Nbd7'] },
  { eco: 'C97', name: 'Испанская партия: Вариант Чигорина', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Na5', 'Bc2', 'c5', 'd4', 'Qc7'] },

  // --- Sicilian Defense (Сицилианская защита) ---
  { eco: 'B20', name: 'Сицилианская защита', moves: ['e4', 'c5'] },
  { eco: 'B22', name: 'Сицилианская защита: Вариант Алапина (2...d5)', moves: ['e4', 'c5', 'c3', 'd5', 'exd5', 'Qxd5', 'd4', 'Nf6', 'Nf3', 'e6'] },
  { eco: 'B22', name: 'Сицилианская защита: Вариант Алапина (2...Nf6)', moves: ['e4', 'c5', 'c3', 'Nf6', 'e5', 'Nd5', 'd4', 'cxd4', 'Nf3', 'Nc6', 'cxd4', 'd6'] },
  { eco: 'B23', name: 'Сицилианская защита: Закрытый вариант', moves: ['e4', 'c5', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7', 'd3', 'd6', 'f4', 'e6', 'Nf3', 'Nge7', 'O-O', 'O-O'] },
  { eco: 'B23', name: 'Сицилианская защита: Атака Гран-при', moves: ['e4', 'c5', 'Nc3', 'Nc6', 'f4', 'g6', 'Nf3', 'Bg7', 'Bc4', 'e6'] },
  { eco: 'B27', name: 'Сицилианская защита: Открытая', moves: ['e4', 'c5', 'Nf3'] },
  { eco: 'B30', name: 'Сицилианская защита: Вариант Россолимо', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'Bb5', 'g6', 'O-O', 'Bg7', 'Re1', 'e5', 'Bxc6', 'dxc6'] },
  { eco: 'B33', name: 'Сицилианская защита: Вариант Свешникова (Челябинский)', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e5', 'Ndb5', 'd6', 'Bg5', 'a6', 'Na3', 'b5', 'Nd5', 'Be7', 'Bxf6', 'Bxf6', 'c3'] },
  { eco: 'B40', name: 'Сицилианская защита: Вариант Кана (4.g3 b5)', moves: ['e4', 'c5', 'Nf3', 'e6', 'Nc3', 'a6', 'g3', 'b5'] },
  { eco: 'B40', name: 'Сицилианская защита: Вариант Паульсена / Кана', moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'a6'] },
  { eco: 'B40', name: 'Сицилианская защита: Кан 3.Nc3 a6', moves: ['e4', 'c5', 'Nf3', 'e6', 'Nc3', 'a6', 'd4', 'cxd4', 'Nxd4'] },
  { eco: 'B42', name: 'Сицилианская защита: Кан 5.Bd3', moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'a6', 'Bd3', 'Bc5'] },
  { eco: 'B43', name: 'Сицилианская защита: Кан 5.Nc3 Qc7', moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'a6', 'Nc3', 'Qc7', 'Bd3', 'Nf6', 'O-O'] },
  { eco: 'B45', name: 'Сицилианская защита: Вариант Тайманова', moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nc6', 'Nc3', 'Qc7', 'Be3', 'a6', 'Be2', 'Nf6', 'O-O'] },
  { eco: 'B45', name: 'Сицилианская защита: Вариант четырех коней', moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nc6', 'Nc3', 'Nf6', 'Ndb5', 'Bb4', 'a3', 'Bxc3+', 'Nxc3', 'd5'] },
  { eco: 'B50', name: 'Сицилианская защита: 2...d6 3.c3', moves: ['e4', 'c5', 'Nf3', 'd6', 'c3', 'Nf6', 'Be2'] },
  { eco: 'B52', name: 'Сицилианская защита: Вариант Московского / Канала', moves: ['e4', 'c5', 'Nf3', 'd6', 'Bb5+', 'Bd7', 'Bxd7+', 'Qxd7', 'O-O', 'Nf6', 'Re1', 'Nc6', 'c3'] },
  { eco: 'B70', name: 'Сицилианская защита: Вариант Дракона', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'] },
  { eco: 'B76', name: 'Сицилианская защита: Дракон (Югославская атака)', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O', 'Qd2', 'Nc6', 'Bc4', 'Bd7', 'O-O-O'] },
  { eco: 'B80', name: 'Сицилианская защита: Вариант Шевенингена', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e6', 'Be2', 'Be7', 'O-O', 'O-O'] },
  { eco: 'B80', name: 'Сицилианская: Шевенинген (Английская атака)', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e6', 'Be3', 'a6', 'f3', 'b5', 'g4'] },
  { eco: 'B81', name: 'Сицилианская защита: Шевенинген (Атака Кереса)', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e6', 'g4'] },
  { eco: 'B90', name: 'Сицилианская защита: Вариант Найдорфа', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'] },
  { eco: 'B90', name: 'Сицилианская: Найдорф (Английская атака)', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3', 'e5', 'Nb3', 'Be6', 'f3', 'Be7', 'Qd2', 'O-O', 'O-O-O', 'Nbd7'] },
  { eco: 'B95', name: 'Сицилианская: Найдорф (6.Bg5)', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Bg5', 'e6', 'f4', 'Be7', 'Qf3', 'Qc7', 'O-O-O', 'Nbd7'] },
  { eco: 'B97', name: 'Сицилианская: Найдорф (Отравленная пешка)', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Bg5', 'e6', 'f4', 'Qb6', 'Qd2', 'Qxb2'] },

  // --- French Defense (Французская защита) ---
  { eco: 'C00', name: 'Французская защита', moves: ['e4', 'e6'] },
  { eco: 'C01', name: 'Французская защита: Разменный вариант', moves: ['e4', 'e6', 'd4', 'd5', 'exd5', 'exd5', 'Nf3', 'Bd6', 'Bd3', 'Ne7', 'O-O', 'O-O'] },
  { eco: 'C02', name: 'Французская защита: Вариант движения (Advance)', moves: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Nc6', 'Nf3', 'Qb6', 'a3', 'c4'] },
  { eco: 'C02', name: 'Французская защита: Вариант движения (6.Be2)', moves: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Nc6', 'Nf3', 'Bd7', 'Be2', 'Nge7'] },
  { eco: 'C05', name: 'Французская защита: Вариант Тарраша (3...Nf6)', moves: ['e4', 'e6', 'd4', 'd5', 'Nd2', 'Nf6', 'e5', 'Nfd7', 'Bd3', 'c5', 'c3', 'Nc6', 'Ne2', 'cxd4', 'cxd4', 'f6', 'exf6', 'Nxf6', 'Nf3', 'Bd6'] },
  { eco: 'C07', name: 'Французская защита: Вариант Тарраша (3...c5)', moves: ['e4', 'e6', 'd4', 'd5', 'Nd2', 'c5', 'exd5', 'Qxd5', 'Ngf3', 'cxd4', 'Bc4', 'Qd6', 'O-O', 'Nf6', 'Nb3', 'Nc6', 'Nbxd4', 'Nxd4', 'Nxd4'] },
  { eco: 'C10', name: 'Французская защита: Вариант Рубинштейна', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nd7', 'Nf3', 'Ngf6', 'Nxf6+', 'Nxf6'] },
  { eco: 'C11', name: 'Французская защита: Классический вариант (Атака Стейница)', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'e5', 'Nfd7', 'f4', 'c5', 'Nf3', 'Nc6', 'Be3', 'a6', 'Qd2', 'b5'] },
  { eco: 'C15', name: 'Французская защита: Вариант Винавера', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4', 'e5', 'c5', 'a3', 'Bxc3+', 'bxc3', 'Ne7', 'Qg4', 'Qc7', 'Qxg7', 'Rg8', 'Qxh7', 'cxd4', 'Ne2', 'Nbc6', 'f4', 'Bd7'] },

  // --- Caro-Kann Defense (Защита Каро-Канн) ---
  { eco: 'B10', name: 'Защита Каро-Канн', moves: ['e4', 'c6'] },
  { eco: 'B11', name: 'Каро-Канн: Вариант двух коней', moves: ['e4', 'c6', 'Nc3', 'd5', 'Nf3', 'Bg4', 'h3', 'Bxf3', 'Qxf3', 'e6', 'd3'] },
  { eco: 'B12', name: 'Каро-Канн: Вариант движения (Advance)', moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'Nf3', 'e6', 'Be2', 'c5', 'Be3', 'Qb6', 'Nc3', 'Nc6', 'O-O', 'Qxb2'] },
  { eco: 'B12', name: 'Каро-Канн: Вариант движения (4.h4)', moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'h4', 'h5', 'Bd3', 'Bxd3', 'Qxd3', 'e6'] },
  { eco: 'B12', name: 'Каро-Канн: Вариант движения (3...c5)', moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'c5', 'dxc5', 'Nc6', 'Nf3', 'Bg4'] },
  { eco: 'B13', name: 'Каро-Канн: Разменный вариант', moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'Bd3', 'Nc6', 'c3', 'Nf6', 'Bf4', 'Bg4', 'Qb3', 'Qd7', 'Nd2', 'e6', 'Ngf3'] },
  { eco: 'B14', name: 'Каро-Канн: Атака Панова-Ботвинника', moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'c4', 'Nf6', 'Nc3', 'e6', 'Nf3', 'Be7', 'cxd5', 'Nxd5', 'Bd3', 'Nc6', 'O-O', 'O-O'] },
  { eco: 'B17', name: 'Каро-Канн: Вариант Карпова (Стейн)', moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nd7', 'Ng5', 'Ngf6', 'Bd3', 'e6', 'N1f3', 'Bd6'] },
  { eco: 'B18', name: 'Каро-Канн: Классический вариант', moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4', 'h6', 'Nf3', 'Nd7', 'h5', 'Bh7', 'Bd3', 'Bxd3', 'Qxd3', 'e6'] },

  // --- Queen's Gambit (Ферзевый гамбит) ---
  { eco: 'D00', name: 'Дебют ферзевой пешки', moves: ['d4', 'd5'] },
  { eco: 'D02', name: 'Лондонская система', moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'c5', 'c3', 'Nc6', 'Nd2', 'e6', 'Ngf3', 'Bd6', 'Bg3', 'O-O'] },
  { eco: 'D06', name: 'Ферзевый гамбит', moves: ['d4', 'd5', 'c4'] },
  { eco: 'D20', name: 'Принятый ферзевый гамбит (3.e4)', moves: ['d4', 'd5', 'c4', 'dxc4', 'e4', 'e5', 'Nf3', 'exd4', 'Bxc4', 'Bb4+', 'Bd2'] },
  { eco: 'D27', name: 'Принятый ферзевый гамбит: Классическая система', moves: ['d4', 'd5', 'c4', 'dxc4', 'Nf3', 'Nf6', 'e3', 'e6', 'Bxc4', 'c5', 'O-O', 'a6', 'dxc5', 'Bxc5', 'Qxd8+', 'Kxd8'] },
  { eco: 'D30', name: 'Отказанный ферзевый гамбит', moves: ['d4', 'd5', 'c4', 'e6'] },
  { eco: 'D30', name: 'Отказанный ферзевый гамбит: Вариант 3...Nf6 4.e3', moves: ['d4', 'd5', 'c4', 'e6', 'Nf3', 'Nf6', 'e3', 'Be7', 'b3', 'O-O', 'Bb2', 'b6'] },
  { eco: 'D32', name: 'Защита Тарраша', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'c5', 'cxd5', 'exd5', 'Nf3', 'Nc6', 'g3', 'Nf6', 'Bg2', 'Be7', 'O-O', 'O-O'] },
  { eco: 'D35', name: 'Отказанный ферзевый гамбит: Разменный вариант', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'cxd5', 'exd5', 'Bg5', 'c6', 'e3', 'Be7', 'Bd3', 'Nbd7', 'Qc2', 'O-O', 'Nge2', 'Re8'] },
  { eco: 'D37', name: 'Отказанный ферзевый гамбит: Вариант 5.Bf4', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Nf3', 'Be7', 'Bf4', 'O-O', 'e3', 'c5', 'dxc5', 'Bxc5'] },
  { eco: 'D38', name: 'Защита Рагозина', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Nf3', 'Bb4', 'cxd5', 'exd5', 'Bg5', 'h6', 'Bh4', 'c5'] },
  { eco: 'D55', name: 'Отказанный ферзевый гамбит: Вариант Тартаковера', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'h6', 'Bh4', 'b6', 'cxd5', 'Nxd5', 'Bxe7', 'Qxe7', 'Nxd5', 'exd5', 'Rc1', 'Be6'] },

  // --- Slav Defense (Славянская защита) ---
  { eco: 'D10', name: 'Славянская защита', moves: ['d4', 'd5', 'c4', 'c6'] },
  { eco: 'D11', name: 'Славянская защита: Вариант 4.e3 Bf5', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'e3', 'Bf5', 'Nc3', 'e6', 'Nh4', 'Bg6'] },
  { eco: 'D12', name: 'Славянская защита: Вариант 5.Bd3', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'e3', 'Bf5', 'Bd3', 'Bxd3', 'Qxd3', 'e6', 'O-O', 'Nbd7'] },
  { eco: 'D13', name: 'Славянская защита: Разменный вариант', moves: ['d4', 'd5', 'c4', 'c6', 'cxd5', 'cxd5', 'Nc3', 'Nf6', 'Bf4', 'Nc6', 'e3', 'a6', 'Bd3', 'Bg4'] },
  { eco: 'D15', name: 'Славянская защита: Вариант Чебаненко (4...a6)', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'a6', 'c5', 'Bf5', 'Bf4', 'Nbd7', 'h3'] },
  { eco: 'D17', name: 'Славянская защита: Главная открытая линия', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'dxc4', 'a4', 'Bf5', 'Ne5', 'e6', 'f3', 'Bb4', 'e4', 'Bxe4', 'fxe4', 'Nxe4', 'Bd2', 'Qxd4'] },
  { eco: 'D45', name: 'Полуславянская защита', moves: ['d4', 'd5', 'c4', 'c6', 'Nc3', 'Nf6', 'e3', 'e6', 'Nf3', 'Nbd7', 'Qc2', 'Bd6', 'b3', 'O-O', 'Be2', 'b6', 'O-O', 'Bb7'] },
  { eco: 'D47', name: 'Полуславянская защита: Меранский вариант', moves: ['d4', 'd5', 'c4', 'c6', 'Nc3', 'Nf6', 'e3', 'e6', 'Nf3', 'Nbd7', 'Bd3', 'dxc4', 'Bxc4', 'b5', 'Bd3', 'a6', 'e4', 'c5', 'd5'] },

  // --- King's Indian Defense (Староиндийская защита) ---
  { eco: 'E60', name: 'Староиндийская защита', moves: ['d4', 'Nf6', 'c4', 'g6'] },
  { eco: 'E61', name: 'Староиндийская защита: Вариант 3...Bg7', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'Nf3', 'd6', 'g3', 'O-O', 'Bg2', 'c6', 'O-O', 'Qa5'] },
  { eco: 'E70', name: 'Староиндийская защита: Система Земиша', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f3', 'O-O', 'Be3', 'e5', 'd5', 'c6', 'Qd2', 'cxd5', 'cxd5', 'a6'] },
  { eco: 'E73', name: 'Староиндийская защита: Система Авербаха', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Be2', 'O-O', 'Bg5', 'c5', 'd5', 'h6', 'Bf4', 'e6'] },
  { eco: 'E76', name: 'Староиндийская защита: Атака четырех пешек', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f4', 'O-O', 'Nf3', 'c5', 'd5', 'e6'] },
  { eco: 'E90', name: 'Староиндийская защита: 5.Nf3 O-O 6.h3', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'h3', 'e5', 'd5', 'Na6', 'Be3'] },
  { eco: 'E97', name: 'Староиндийская защита: Классическая система (Мар-дель-Плата)', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7', 'b4', 'Nh5', 'Re1', 'f5'] },

  // --- Nimzo-Indian Defense (Защита Нимцовича) ---
  { eco: 'E20', name: 'Защита Нимцовича', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'] },
  { eco: 'E21', name: 'Защита Нимцовича: Вариант трех коней', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Nf3', 'b6', 'Qb3', 'c5', 'a3', 'Ba5', 'Bg5', 'Bb7'] },
  { eco: 'E24', name: 'Защита Нимцовича: Вариант Земиша', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'a3', 'Bxc3+', 'bxc3', 'c5', 'f3', 'd5', 'cxd5', 'Nxd5', 'dxc5', 'f5'] },
  { eco: 'E32', name: 'Защита Нимцовича: Классический вариант (4.Qc2)', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qc2', 'O-O', 'a3', 'Bxc3+', 'Qxc3', 'b6', 'Bg5', 'Bb7', 'f3', 'h6', 'Bh4', 'd5'] },
  { eco: 'E40', name: 'Защита Нимцовича: Вариант Рубинштейна', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3', 'c5', 'Bd3', 'Nc6', 'Ne2', 'cxd4', 'exd4', 'd5', 'cxd5', 'Nxd5', 'O-O', 'O-O'] },
  { eco: 'E54', name: 'Защита Нимцовича: Главная линия (4.e3 O-O 5.Bd3)', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3', 'O-O', 'Bd3', 'd5', 'Nf3', 'c5', 'O-O', 'dxc4', 'Bxc4', 'cxd4', 'exd4', 'b6', 'Bg5', 'Bb7'] },

  // --- English Opening & Flank (Английское начало и фланговые дебюты) ---
  { eco: 'A10', name: 'Английское начало', moves: ['c4'] },
  { eco: 'A13', name: 'Английское начало: Новокаталонская расстановка', moves: ['c4', 'e6', 'Nf3', 'd5', 'g3', 'Nf6', 'Bg2', 'Be7', 'O-O', 'O-O', 'b3', 'c5'] },
  { eco: 'A20', name: 'Английское начало: Обратная сицилианка (2.g3)', moves: ['c4', 'e5', 'g3', 'Nf6', 'Bg2', 'd5', 'cxd5', 'Nxd5', 'Nf3', 'Nc6', 'O-O', 'Nb6'] },
  { eco: 'A20', name: 'Английское начало: Обратная сицилианка', moves: ['c4', 'e5', 'Nc3', 'Nf6', 'g3', 'd5', 'cxd5', 'Nxd5', 'Bg2', 'Nb6'] },
  { eco: 'A28', name: 'Английское начало: Вариант четырех коней', moves: ['c4', 'e5', 'Nc3', 'Nf6', 'Nf3', 'Nc6', 'e3', 'Bb4', 'Qc2', 'O-O', 'Nd5', 'Re8', 'Qf5', 'd6'] },
  { eco: 'A30', name: 'Английское начало: Симметричный вариант (Еж)', moves: ['c4', 'c5', 'Nf3', 'Nf6', 'Nc3', 'b6', 'g3', 'Bb7', 'Bg2', 'e6', 'O-O', 'Be7', 'd4', 'cxd4', 'Qxd4', 'd6'] },
  { eco: 'A36', name: 'Английское начало: Система Ботвинника', moves: ['c4', 'c5', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7', 'e4', 'd6', 'Nge2', 'e5', 'd3', 'Nge7', 'O-O', 'O-O'] },
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

let isTrieBuilt = false;
const rootNode: TrieNode = { children: new Map() };

/**
 * Ленивая сборка префиксного дерева при первом обращении
 */
function ensureTrie(): void {
  if (isTrieBuilt) return;
  for (const opening of OPENING_DATABASE) {
    let curr = rootNode;
    for (let i = 0; i < opening.moves.length; i++) {
      const san = opening.moves[i];
      if (!curr.children.has(san)) {
        curr.children.set(san, { children: new Map() });
      }
      curr = curr.children.get(san)!;
      // Сохраняем наиболее специфичное определение дебюта
      if (i === opening.moves.length - 1 || !curr.opening) {
        curr.opening = opening;
      }
    }
  }
  isTrieBuilt = true;
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

  ensureTrie();

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
  ensureTrie();
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
