'use client';

import { ChessCheeseIcon } from '@/components/logo';
import { CLASSIFICATION_META } from '@/lib/chess-classifier';
import type { ChessPlatform } from '@/lib/api/types';
import type { MoveClassificationType } from '@/types/review';
import {
  AlertCircle,
  Bot,
  CornerDownLeft,
  HelpCircle,
  Lightbulb,
  Loader2,
  RotateCcw,
  SendHorizontal,
  Sparkles,
  User,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  fen?: string;
  moveNumber?: number;
  activeMoveSan?: string;
}

export interface ActiveMoveContext {
  ply: number;
  moveNumber: number;
  san: string;
  color: 'white' | 'black';
  classification: string;
  type?: MoveClassificationType;
  glyph?: string;
  score?: string;
  bestMove?: string;
  pvLine?: string;
  comment?: string;
}

export interface ChessChatProps {
  currentFen: string;
  moveNumber: number;
  turn: 'w' | 'b';
  pgn?: string;
  platform?: ChessPlatform;
  className?: string;
  activeMove?: ActiveMoveContext | null;
}

const GENERAL_QUESTIONS = [
  'В чем идея этой позиции?',
  'Какая главная угроза соперника?',
  'Какой здесь план игры?',
];

export function ChessChat({
  currentFen,
  moveNumber,
  turn,
  pgn,
  platform = 'lichess',
  className = '',
  activeMove,
}: ChessChatProps) {
  const isChessCom = platform === 'chesscom';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Приветствую за доской! Я твой гроссмейстер-наставник ChessCheese Bot. Все расчеты позиций ведутся на движке Stockfish. Выбери любой ход на доске или задай вопрос!',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setErrorMessage(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      fen: currentFen,
      moveNumber,
      activeMoveSan: activeMove?.san,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: newHistory.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          currentFen,
          pgn,
          moveNumber: activeMove?.moveNumber ?? moveNumber,
          turn,
          // Stockfish facts for hybrid analysis
          score: activeMove?.score,
          playerMove: activeMove?.san,
          bestMove: activeMove?.bestMove || activeMove?.san,
          pvLine: activeMove?.pvLine,
          classification: activeMove?.classification,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Ошибка сервера (${response.status})`);
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Не удалось сформировать ответ.',
        fen: currentFen,
        moveNumber: activeMove?.moveNumber ?? moveNumber,
        activeMoveSan: activeMove?.san,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка связи с наставником.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: 'История диалога очищена. Я готов разбирать новую позицию!',
      },
    ]);
    setErrorMessage(null);
  };

  // Determine active classification metadata
  const moveType: MoveClassificationType = activeMove?.type || 'good';
  const meta = CLASSIFICATION_META[moveType] || CLASSIFICATION_META.good;

  // Contextual quick questions
  const contextualQuestions = activeMove && activeMove.san
    ? [
        `Почему это ${activeMove.classification}?`,
        'Какое опровержение нашел Stockfish?',
        `Что было бы при ходе ${activeMove.bestMove || activeMove.san}?`,
      ]
    : GENERAL_QUESTIONS;

  return (
    <div
      className={`w-full flex flex-col rounded-3xl border shadow-lg overflow-hidden transition-all duration-300 ${
        isChessCom
          ? 'bg-[#211f1c] border-[#302e2b]'
          : 'bg-[#24221f] border-[#33312c]'
      } ${className}`}
    >
      {/* Top Header */}
      <div
        className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${
          isChessCom ? 'border-[#302e2b] bg-[#191815]/90' : 'border-[#33312c] bg-[#1c1a17]/90'
        } backdrop-blur-sm`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f59e0b] to-[#fbbf24] p-1.5 shadow-md flex items-center justify-center">
              <ChessCheeseIcon className="w-full h-full drop-shadow-sm" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#161512]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base tracking-tight">
                ChessCheese Bot
              </h3>
              <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-[#fbbf24]/20 border border-[#fbbf24]/40 text-[#fbbf24]">
                Stockfish + Gemini
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#fbbf24] animate-pulse" />
              <span>
                Ход {activeMove?.moveNumber ?? (moveNumber > 0 ? moveNumber : 1)} (
                {turn === 'w' ? 'Ход белых' : 'Ход чёрных'})
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearHistory}
          title="Очистить переписку"
          className={`p-2 rounded-xl border text-zinc-400 hover:text-white transition-colors cursor-pointer touch-manipulation ${
            isChessCom
              ? 'bg-[#211f1c] border-[#302e2b] hover:bg-[#262421]'
              : 'bg-[#24221f] border-[#33312c] hover:bg-[#292723]'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Synchronized Move Header Card (Chess.com Style) */}
      {activeMove && activeMove.san && (
        <div
          className={`mx-4 mt-3 p-3.5 rounded-2xl border ${meta.bgClass} ${meta.borderClass} shadow-sm flex flex-col gap-2.5 transition-all animate-in fade-in slide-in-from-top-1 duration-200`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${meta.borderClass} ${meta.colorClass} bg-black/50`}
              >
                <span>{meta.glyph}</span>
                <span>{activeMove.classification}</span>
              </span>

              <span className="text-xs sm:text-sm font-bold text-white font-mono">
                Ход {activeMove.moveNumber}: {activeMove.san} — {activeMove.classification} (Оценка: {activeMove.score || '0.0'})
              </span>
            </div>

            {activeMove.bestMove && activeMove.bestMove !== activeMove.san && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-zinc-400">Лучший ход:</span>
                <strong
                  className={`font-mono px-2 py-0.5 rounded border font-bold ${
                    isChessCom
                      ? 'bg-[#81b64c]/20 text-[#81b64c] border-[#81b64c]/40'
                      : 'bg-[#3692e7]/20 text-[#3692e7] border-[#3692e7]/40'
                  }`}
                >
                  {activeMove.bestMove}
                </strong>
              </div>
            )}
          </div>

          {/* 3 Contextual Quick Action Buttons directly under the Card */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleSendMessage(`Почему это ${activeMove.classification}?`)}
              disabled={isLoading}
              className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all cursor-pointer touch-manipulation disabled:opacity-50 ${
                isChessCom
                  ? 'bg-[#191815] hover:bg-[#262421] text-zinc-200 border-[#302e2b] hover:border-[#fbbf24]/50 hover:text-white'
                  : 'bg-[#1c1a17] hover:bg-[#292723] text-zinc-200 border-[#33312c] hover:border-[#fbbf24]/50 hover:text-white'
              } active:scale-95`}
            >
              «Почему это {activeMove.classification}?»
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage('Какое опровержение нашел Stockfish?')}
              disabled={isLoading}
              className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all cursor-pointer touch-manipulation disabled:opacity-50 ${
                isChessCom
                  ? 'bg-[#191815] hover:bg-[#262421] text-zinc-200 border-[#302e2b] hover:border-[#fbbf24]/50 hover:text-white'
                  : 'bg-[#1c1a17] hover:bg-[#292723] text-zinc-200 border-[#33312c] hover:border-[#fbbf24]/50 hover:text-white'
              } active:scale-95`}
            >
              «Какое опровержение нашел Stockfish?»
            </button>

            <button
              type="button"
              onClick={() =>
                handleSendMessage(
                  `Что было бы при ходе ${activeMove.bestMove || activeMove.san}?`,
                )
              }
              disabled={isLoading}
              className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all cursor-pointer touch-manipulation disabled:opacity-50 ${
                isChessCom
                  ? 'bg-[#191815] hover:bg-[#262421] text-zinc-200 border-[#302e2b] hover:border-[#fbbf24]/50 hover:text-white'
                  : 'bg-[#1c1a17] hover:bg-[#292723] text-zinc-200 border-[#33312c] hover:border-[#fbbf24]/50 hover:text-white'
              } active:scale-95`}
            >
              «Что было бы при ходе {activeMove.bestMove || activeMove.san}?»
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 min-h-[300px] max-h-[460px] overflow-y-auto p-4 sm:p-5 flex flex-col gap-3.5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 items-start animate-in fade-in duration-200 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser
                    ? 'bg-zinc-700 text-zinc-200'
                    : 'bg-[#fbbf24]/15 border border-[#fbbf24]/40 text-[#fbbf24]'
                }`}
              >
                {isUser ? (
                  <User className="w-3.5 h-3.5" />
                ) : (
                  <Bot className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? isChessCom
                      ? 'bg-[#81b64c] text-white rounded-tr-sm font-medium'
                      : 'bg-[#3692e7] text-white rounded-tr-sm font-medium'
                    : isChessCom
                      ? 'bg-[#191815] border border-[#302e2b] text-zinc-200 rounded-tl-sm'
                      : 'bg-[#1c1a17] border border-[#33312c] text-zinc-200 rounded-tl-sm'
                }`}
              >
                {msg.activeMoveSan && !isUser && (
                  <div className="text-[10px] text-[#fbbf24] font-mono font-semibold mb-1 pb-1 border-b border-white/5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Разбор хода {msg.activeMoveSan}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 items-start animate-in fade-in duration-300">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-[#fbbf24]/15 border border-[#fbbf24]/40 text-[#fbbf24]">
              <Bot className="w-4 h-4" />
            </div>
            <div
              className={`rounded-2xl px-4 py-3 text-xs flex items-center gap-2.5 border rounded-tl-sm ${
                isChessCom
                  ? 'bg-[#191815] border-[#302e2b] text-zinc-400'
                  : 'bg-[#1c1a17] border-[#33312c] text-zinc-400'
              }`}
            >
              <Loader2 className="w-4 h-4 animate-spin text-[#fbbf24]" />
              <span>Гроссмейстер анализирует позицию со Stockfish...</span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Ошибка ответа AI</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* General Quick Action Buttons (if no active move selected) */}
      {(!activeMove || !activeMove.san) && (
        <div
          className={`px-4 py-2.5 border-t flex items-center gap-2 overflow-x-auto scrollbar-none ${
            isChessCom ? 'border-[#302e2b] bg-[#191815]/50' : 'border-[#33312c] bg-[#1c1a17]/50'
          }`}
        >
          <span className="text-[11px] text-zinc-500 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#fbbf24]" /> Быстрые вопросы:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {contextualQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap font-medium transition-all cursor-pointer touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${
                  isChessCom
                    ? 'bg-[#211f1c] hover:bg-[#262421] text-zinc-300 border-[#302e2b] hover:border-[#fbbf24]/50'
                    : 'bg-[#24221f] hover:bg-[#292723] text-zinc-300 border-[#33312c] hover:border-[#fbbf24]/50'
                } hover:text-[#fbbf24] active:scale-95`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={onSubmit}
        className={`p-3 border-t flex items-center gap-2 ${
          isChessCom ? 'border-[#302e2b] bg-[#191815]' : 'border-[#33312c] bg-[#1c1a17]'
        }`}
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Спроси тренера о ходе, опровержении Stockfish или плане..."
            disabled={isLoading}
            className={`w-full text-xs sm:text-sm text-white placeholder:text-zinc-500 rounded-xl px-4 py-3 outline-none border transition-all ${
              isChessCom
                ? 'bg-[#211f1c] border-[#302e2b] focus:border-[#fbbf24]'
                : 'bg-[#24221f] border-[#33312c] focus:border-[#fbbf24]'
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          title="Отправить (Enter)"
          className="h-11 px-4 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] hover:from-[#d97706] hover:to-[#f59e0b] text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-md active:scale-95 cursor-pointer touch-manipulation"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
          ) : (
            <>
              <span className="hidden sm:inline">Спросить</span>
              <SendHorizontal className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
