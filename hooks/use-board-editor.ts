'use client';

import { Chess, type PieceSymbol, type Color, type Square } from 'chess.js';
import { useCallback, useState } from 'react';

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface BoardPiece {
  type: PieceType;
  color: PieceColor;
}

export interface CastlingRights {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
}

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const EMPTY_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';

export function useBoardEditor(initialFen = STARTING_FEN) {
  const [fen, setFen] = useState<string>(initialFen);
  const [turn, setTurn] = useState<PieceColor>('w');
  const [castling, setCastling] = useState<CastlingRights>({
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
  });
  const [selectedPiece, setSelectedPiece] = useState<BoardPiece | null>(null);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(true);

  // Re-build FEN from internal board
  const updateFenFromChess = useCallback((chess: Chess, newTurn: PieceColor, newCastling: CastlingRights) => {
    try {
      const tokens = chess.fen().split(' ');
      tokens[1] = newTurn;

      // Castling token
      let castlingStr = '';
      if (newCastling.whiteKingSide) castlingStr += 'K';
      if (newCastling.whiteQueenSide) castlingStr += 'Q';
      if (newCastling.blackKingSide) castlingStr += 'k';
      if (newCastling.blackQueenSide) castlingStr += 'q';
      tokens[2] = castlingStr || '-';

      const candidateFen = tokens.join(' ');
      // Validate with chess.js
      const test = new Chess();
      test.load(candidateFen);
      setFen(candidateFen);
      setIsValid(true);
    } catch {
      setIsValid(false);
    }
  }, []);

  const loadFen = useCallback((newFen: string): boolean => {
    try {
      const chess = new Chess();
      chess.load(newFen);
      setFen(chess.fen());
      setTurn(chess.turn());
      const castlingStr = chess.fen().split(' ')[2] || '-';
      setCastling({
        whiteKingSide: castlingStr.includes('K'),
        whiteQueenSide: castlingStr.includes('Q'),
        blackKingSide: castlingStr.includes('k'),
        blackQueenSide: castlingStr.includes('q'),
      });
      setIsValid(true);
      return true;
    } catch {
      setIsValid(false);
      return false;
    }
  }, []);

  const clearBoard = useCallback(() => {
    loadFen(EMPTY_FEN);
    setCastling({
      whiteKingSide: false,
      whiteQueenSide: false,
      blackKingSide: false,
      blackQueenSide: false,
    });
  }, [loadFen]);

  const resetToStart = useCallback(() => {
    loadFen(STARTING_FEN);
  }, [loadFen]);

  const handleSquareClick = useCallback(
    (square: string) => {
      try {
        const chess = new Chess();
        chess.load(fen);

        if (isEraser) {
          chess.remove(square as Square);
        } else if (selectedPiece) {
          chess.put(
            { type: selectedPiece.type as PieceSymbol, color: selectedPiece.color as Color },
            square as Square,
          );
        }

        updateFenFromChess(chess, turn, castling);
      } catch {
        // invalid square placement
      }
    },
    [fen, isEraser, selectedPiece, turn, castling, updateFenFromChess],
  );

  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string): boolean => {
      try {
        const chess = new Chess();
        chess.load(fen);
        const piece = chess.get(sourceSquare as Square);
        if (!piece) return false;
        chess.remove(sourceSquare as Square);
        chess.put(piece, targetSquare as Square);
        updateFenFromChess(chess, turn, castling);
        return true;
      } catch {
        return false;
      }
    },
    [fen, turn, castling, updateFenFromChess],
  );

  const toggleTurn = useCallback(() => {
    const nextTurn = turn === 'w' ? 'b' : 'w';
    setTurn(nextTurn);
    try {
      const chess = new Chess();
      chess.load(fen);
      updateFenFromChess(chess, nextTurn, castling);
    } catch {
      // ignore
    }
  }, [fen, turn, castling, updateFenFromChess]);

  const updateCastling = useCallback(
    (rights: Partial<CastlingRights>) => {
      const nextCastling = { ...castling, ...rights };
      setCastling(nextCastling);
      try {
        const chess = new Chess();
        chess.load(fen);
        updateFenFromChess(chess, turn, nextCastling);
      } catch {
        // ignore
      }
    },
    [fen, turn, castling, updateFenFromChess],
  );

  return {
    fen,
    turn,
    castling,
    selectedPiece,
    setSelectedPiece,
    isEraser,
    setIsEraser,
    isValid,
    loadFen,
    clearBoard,
    resetToStart,
    handleSquareClick,
    handlePieceDrop,
    toggleTurn,
    updateCastling,
  };
}
