'use client';

import { Chess } from 'chess.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '@/lib/sound-effects';
import { CONVERSION_SCENARIOS, type ConversionScenario } from '@/lib/train-data/conversion-positions';

export function useConversionGame(initialScenarioId = 'conv-extra-piece') {
  const [scenarioId, setScenarioId] = useState<string>(initialScenarioId);
  const [currentFen, setCurrentFen] = useState<string>('');
  const [moveCount, setMoveCount] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'draw' | 'lost'>('playing');
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [botLevel, setBotLevel] = useState<number>(1400);

  const chessRef = useRef<Chess>(new Chess());

  const currentScenario: ConversionScenario =
    CONVERSION_SCENARIOS.find(s => s.id === scenarioId) || CONVERSION_SCENARIOS[0];

  const loadScenario = useCallback((scenario: ConversionScenario) => {
    try {
      const c = new Chess(scenario.fen);
      chessRef.current = c;
      setCurrentFen(c.fen());
      setMoveCount(0);
      setGameStatus('playing');
      setIsBotThinking(false);
    } catch {
      // fallback
    }
  }, []);

  useEffect(() => {
    loadScenario(currentScenario);
  }, [currentScenario, loadScenario]);

  // Bot move generator (heuristic: captures, checks, or center moves)
  const makeBotMove = useCallback(() => {
    const chess = chessRef.current;
    if (chess.isGameOver()) return;

    setIsBotThinking(true);
    setTimeout(() => {
      try {
        const moves = chess.moves({ verbose: true });
        if (moves.length === 0) {
          setIsBotThinking(false);
          return;
        }

        // Rank moves: prefer captures and checks, then random
        const captureMoves = moves.filter(m => m.captured);
        const checkMoves = moves.filter(m => m.san.includes('+'));

        let selectedMove = moves[Math.floor(Math.random() * moves.length)];
        if (captureMoves.length > 0 && Math.random() < 0.7) {
          selectedMove = captureMoves[Math.floor(Math.random() * captureMoves.length)];
        } else if (checkMoves.length > 0 && Math.random() < 0.6) {
          selectedMove = checkMoves[Math.floor(Math.random() * checkMoves.length)];
        }

        chess.move(selectedMove);
        setCurrentFen(chess.fen());
        sfx.playMove();

        if (chess.isCheckmate()) {
          sfx.playError();
          setGameStatus('lost');
        } else if (chess.isDraw() || chess.isStalemate()) {
          sfx.playError();
          setGameStatus('draw');
        }
      } catch {
        // ignore
      } finally {
        setIsBotThinking(false);
      }
    }, 400);
  }, []);

  const onPieceDrop = useCallback((sourceSquare: string, targetSquare: string): boolean => {
    if (gameStatus !== 'playing' || isBotThinking) return false;

    const chess = chessRef.current;
    try {
      const moveRes = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (!moveRes) {
        sfx.playError();
        return false;
      }

      sfx.playMove();
      setCurrentFen(chess.fen());
      const nextMoveCount = moveCount + 1;
      setMoveCount(nextMoveCount);

      if (chess.isCheckmate()) {
        sfx.playLevelUp();
        setGameStatus('won');
        return true;
      }

      if (chess.isDraw() || chess.isStalemate()) {
        sfx.playError();
        setGameStatus('draw');
        return true;
      }

      if (nextMoveCount >= currentScenario.maxMoves) {
        sfx.playError();
        setGameStatus('draw');
        return true;
      }

      // Schedule bot move
      makeBotMove();
      return true;
    } catch {
      sfx.playError();
      return false;
    }
  }, [gameStatus, isBotThinking, moveCount, currentScenario.maxMoves, makeBotMove]);

  const resetGame = useCallback(() => {
    sfx.playMove();
    loadScenario(currentScenario);
  }, [loadScenario, currentScenario]);

  return {
    scenarios: CONVERSION_SCENARIOS,
    currentScenario,
    scenarioId,
    setScenarioId: (id: string) => {
      sfx.playMove();
      setScenarioId(id);
    },
    currentFen: currentFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    boardOrientation: (currentScenario.playerColor === 'b' ? 'black' : 'white') as 'white' | 'black',
    onPieceDrop,
    moveCount,
    maxMoves: currentScenario.maxMoves,
    gameStatus,
    isBotThinking,
    botLevel,
    setBotLevel,
    resetGame,
  };
}
