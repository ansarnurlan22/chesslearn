'use client';

import { ChessChat, type ActiveMoveContext } from '@/components/chess-chat';
import { ChessViewer } from '@/components/chess-viewer';
import { GameReview } from '@/components/game-review';
import { Logo } from '@/components/logo';
import { StudentProfileModal } from '@/components/student-profile-modal';
import { AnalysisBoard } from '@/components/tools/analysis-board';
import { BoardEditor } from '@/components/tools/board-editor';
import { BoardSetupDrill } from '@/components/tools/board-setup-drill';
import { ChessClock } from '@/components/tools/chess-clock';
import { ChesscomStatus } from '@/components/tools/chesscom-status';
import { EloCalculator } from '@/components/tools/elo-calculator';
import { FenAnalyzer } from '@/components/tools/fen-analyzer';
import { OpeningExplorer } from '@/components/tools/opening-explorer';
import { PgnAnalyzer } from '@/components/tools/pgn-analyzer';
import { PieceMovesDrill } from '@/components/tools/piece-moves-drill';
import { RoundRobinGenerator } from '@/components/tools/round-robin-generator';
import { BrainGames } from '@/components/train/brain-games';
import { BlunderShield } from '@/components/train/blunder-shield';
import { ConversionTrainer } from '@/components/train/conversion-trainer';
import { DailyPuzzle } from '@/components/train/daily-puzzle';
import { OpeningTrainer } from '@/components/train/opening-trainer';
import { TrainHub } from '@/components/train/train-hub';
import { WoodpeckerTrainer } from '@/components/train/woodpecker-trainer';
import { useAuth } from '@/hooks/use-auth';
import type { ChessPlatform, UnifiedGame, UnifiedPlayerProfile } from '@/lib/api/types';
import { CLASSIFICATION_META } from '@/lib/chess-classifier';
import { sfx } from '@/lib/sound-effects';
import type { GameReviewData, MoveAnalysis } from '@/types/review';
import {
  AlertCircle,
  BookOpen,
  Bot,
  Brain,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Crown,
  Edit2,
  ExternalLink,
  FileText,
  Flame,
  Globe,
  GraduationCap,
  Loader2,
  LogOut,
  Menu,
  MinusCircle,
  Scan,
  Search,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  User,
  Users,
  Wrench,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';

export type DashboardTab =
  | 'analysis'
  | 'trainHub'
  | 'trainWoodpecker'
  | 'trainDaily'
  | 'trainOpenings'
  | 'trainBlunder'
  | 'trainConversion'
  | 'trainBrain'
  | 'analysisBoard'
  | 'editor'
  | 'boardSetup'
  | 'pieceMoves'
  | 'elo'
  | 'clock'
  | 'roundRobin'
  | 'openings'
  | 'status';

export interface TrainItem {
  id: DashboardTab;
  label: string;
  shortDesc: string;
  icon: React.ElementType;
  badge?: string;
  category: 'Тактика' | 'Мастерство' | 'Когнитивные';
}

export const TRAIN_ITEMS: TrainItem[] = [
  {
    id: 'trainWoodpecker',
    label: 'Метод Дятла',
    shortDesc: 'Интервальное повторение тактики в 5 циклов',
    icon: Zap,
    badge: '5 циклов',
    category: 'Тактика',
  },
  {
    id: 'trainDaily',
    label: 'Задача дня & Календарь',
    shortDesc: 'Ежедневная тактика с серией побед',
    icon: Calendar,
    badge: 'Стрик',
    category: 'Тактика',
  },
  {
    id: 'trainOpenings',
    label: 'Тренер дебютов',
    shortDesc: '4 режима: Обучение, Практика, Арена, Стрик',
    icon: BookOpen,
    badge: '4 режима',
    category: 'Мастерство',
  },
  {
    id: 'trainBlunder',
    label: 'Щит от зевков',
    shortDesc: 'Поиск угроз и защита от тактических ловушек',
    icon: Shield,
    badge: 'Оборона',
    category: 'Мастерство',
  },
  {
    id: 'trainConversion',
    label: 'Реализация перевеса',
    shortDesc: 'Доведение позиций (+3..+5) до победы против бота',
    icon: Swords,
    badge: 'Миттельшпиль',
    category: 'Мастерство',
  },
  {
    id: 'trainBrain',
    label: 'Brain Gym (Фитнес мозга)',
    shortDesc: 'Square Rush, 8 Ферзей и игра вслепую',
    icon: Brain,
    badge: 'Спринт',
    category: 'Когнитивные',
  },
];

export interface ToolItem {
  id: DashboardTab;
  label: string;
  shortDesc: string;
  icon: React.ElementType;
  badge?: string;
  category: 'Анализ' | 'Тренировка' | 'Утилиты';
}

export const TOOLS_ITEMS: ToolItem[] = [
  {
    id: 'analysisBoard',
    label: 'Доска анализа',
    shortDesc: 'Интерактивный анализ ходов, мульти-PV и стрелки',
    icon: Compass,
    badge: 'Engine',
    category: 'Анализ',
  },
  {
    id: 'editor',
    label: 'Редактор доски',
    shortDesc: 'Расстановка фигур, рокировки и экспорт FEN',
    icon: Edit2,
    badge: 'FEN',
    category: 'Анализ',
  },
  {
    id: 'boardSetup',
    label: 'Расстановка доски',
    shortDesc: 'Спринт расстановки стартовой позиции на время',
    icon: Trophy,
    badge: 'Спринт',
    category: 'Тренировка',
  },
  {
    id: 'pieceMoves',
    label: 'Ходы фигур',
    shortDesc: 'Тренажёр правил всех ходов фигуры с 3 жизнями',
    icon: Target,
    badge: 'Тренажёр',
    category: 'Тренировка',
  },
  {
    id: 'openings',
    label: 'Дебютный справочник',
    shortDesc: 'База более 200 дебютов с кодами ECO и ходами',
    icon: BookOpen,
    badge: '200+',
    category: 'Тренировка',
  },
  {
    id: 'elo',
    label: 'ELO / FIDE Калькулятор',
    shortDesc: 'Калькулятор одиночных партий и турниров FIDE',
    icon: Calculator,
    category: 'Утилиты',
  },
  {
    id: 'clock',
    label: 'Шахматные часы',
    shortDesc: 'Часы с контролем Bullet/Blitz и переворотом экрана',
    icon: Clock,
    badge: 'Звук',
    category: 'Утилиты',
  },
  {
    id: 'roundRobin',
    label: 'Генератор турниров',
    shortDesc: 'Таблицы Бергера для 3–20 игроков и жеребьёвка',
    icon: Users,
    badge: 'Бергер',
    category: 'Утилиты',
  },
  {
    id: 'status',
    label: 'Статус Chess.com',
    shortDesc: 'Живой мониторинг серверов Chess.com и Lichess',
    icon: Globe,
    category: 'Утилиты',
  },
];

export interface ChessDashboardProps {
  initialUsername?: string;
  initialPlatform?: ChessPlatform;
  profile: UnifiedPlayerProfile | null;
  error?: string | null;
}

const PLATFORM_CHIPS: Record<ChessPlatform, string[]> = {
  lichess: ['MagnusCarlsen', 'Hikaru', 'DanielNaroditsky'],
  chesscom: ['Hikaru', 'MagnusCarlsen', 'GothamChess', 'DanielNaroditsky'],
};

export function ChessDashboard({
  initialUsername = '',
  initialPlatform = 'lichess',
  profile,
  error,
}: ChessDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') as DashboardTab | null;
  const [activeTab, setActiveTab] = useState<DashboardTab>(tabParam || 'analysis');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsFlyoutOpen, setIsToolsFlyoutOpen] = useState(false);
  const [isTrainFlyoutOpen, setIsTrainFlyoutOpen] = useState(false);
  const [isMobileToolsAccordionOpen, setIsMobileToolsAccordionOpen] = useState(true);
  const [isMobileTrainAccordionOpen, setIsMobileTrainAccordionOpen] = useState(true);
  const flyoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const trainFlyoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleToolsMouseEnter = () => {
    if (flyoutTimerRef.current) {
      clearTimeout(flyoutTimerRef.current);
      flyoutTimerRef.current = null;
    }
    setIsToolsFlyoutOpen(true);
  };

  const handleToolsMouseLeave = () => {
    flyoutTimerRef.current = setTimeout(() => {
      setIsToolsFlyoutOpen(false);
    }, 200);
  };

  const handleTrainMouseEnter = () => {
    if (trainFlyoutTimerRef.current) {
      clearTimeout(trainFlyoutTimerRef.current);
      trainFlyoutTimerRef.current = null;
    }
    setIsTrainFlyoutOpen(true);
  };

  const handleTrainMouseLeave = () => {
    trainFlyoutTimerRef.current = setTimeout(() => {
      setIsTrainFlyoutOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (flyoutTimerRef.current) {
        clearTimeout(flyoutTimerRef.current);
      }
      if (trainFlyoutTimerRef.current) {
        clearTimeout(trainFlyoutTimerRef.current);
      }
    };
  }, []);

  const isTrainActive = activeTab.startsWith('train');
  const currentActiveTrain = TRAIN_ITEMS.find((t) => t.id === activeTab);
  const isToolActive = TOOLS_ITEMS.some((t) => t.id === activeTab);
  const currentActiveTool = TOOLS_ITEMS.find((t) => t.id === activeTab);
  const [analysisFen, setAnalysisFen] = useState<string | undefined>(undefined);
  const [editorFen, setEditorFen] = useState<string | undefined>(undefined);
  const { user, profile: authProfile, signOut } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [platform, setPlatform] = useState<ChessPlatform>(initialPlatform);
  const [usernameInput, setUsernameInput] = useState(initialUsername);
  const [isPending, startTransition] = useTransition();

  const handleEditBoard = (fenToEdit: string) => {
    setEditorFen(fenToEdit);
    setActiveTab('editor');
  };

  const handleAnalyzePosition = (fenToAnalyze: string) => {
    setAnalysisFen(fenToAnalyze);
    setActiveTab('analysisBoard');
  };

  // Sync activeTab when query param changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // If user is logged in with a linked chess username and opened without ?u=, auto-load their profile
  useEffect(() => {
    if (!initialUsername && authProfile?.chess_username && !usernameInput) {
      const targetPlatform = authProfile.chess_platform || platform;
      setUsernameInput(authProfile.chess_username);
      setPlatform(targetPlatform);
      router.push(`/?u=${encodeURIComponent(authProfile.chess_username)}&p=${targetPlatform}`);
    }
  }, [initialUsername, authProfile?.chess_username, authProfile?.chess_platform]);

  const isChessCom = platform === 'chesscom';

  const games: UnifiedGame[] = profile?.recentGames ?? [];
  const [selectedGameId, setSelectedGameId] = useState<string | null>(
    games.length > 0 ? games[0].id : null,
  );
  const [targetStep, setTargetStep] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isLargeBoard, setIsLargeBoard] = useState<boolean>(false);
  const [loadedReview, setLoadedReview] = useState<GameReviewData | null>(null);
  const [retryMove, setRetryMove] = useState<{
    moveNumber: number;
    ply: number;
    betterMove: string;
  } | null>(null);
  const [currentGameState, setCurrentGameState] = useState<{
    fen: string;
    turn: 'w' | 'b';
    currentStep: number;
    moveNumber: number;
    activeMove?: MoveAnalysis | null;
  }>({
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    turn: 'w',
    currentStep: 0,
    moveNumber: 1,
    activeMove: null,
  });
  const [sidebarTab, setSidebarTab] = useState<'review' | 'chat'>('review');

  const activeMoveContext: ActiveMoveContext | null = useMemo(() => {
    const mv = currentGameState.activeMove;
    if (!mv) return null;
    return {
      ply: mv.ply,
      moveNumber: mv.moveNumber,
      san: mv.san,
      color: mv.color,
      classification: CLASSIFICATION_META[mv.type]?.label || 'Хороший',
      type: mv.type,
      glyph: mv.glyph,
      score: mv.score || '0.0',
      bestMove: mv.betterMove || mv.san,
      pvLine: mv.pvLine,
      comment: mv.comment,
    };
  }, [currentGameState.activeMove]);

  const handleAskCoach = (ply: number) => {
    setTargetStep(ply);
    setSidebarTab('chat');
  };

  // Sync state when props change
  useEffect(() => {
    setPlatform(initialPlatform);
  }, [initialPlatform]);

  useEffect(() => {
    if (initialUsername) {
      setUsernameInput(initialUsername);
    }
  }, [initialUsername]);

  useEffect(() => {
    const nextGames = profile?.recentGames ?? [];
    if (nextGames.length > 0) {
      setSelectedGameId(nextGames[0].id);
    } else {
      setSelectedGameId(null);
    }
    setTargetStep(null);
    setRetryMove(null);
  }, [profile?.username, profile?.platform]);

  // Reset targetStep, retry and loadedReview when game selection changes
  useEffect(() => {
    setTargetStep(null);
    setRetryMove(null);
    setLoadedReview(null);
  }, [selectedGameId]);

  const handleSelectMovePly = (ply: number) => {
    setTargetStep(ply);
    setRetryMove(null);
  };

  const handleRetryMove = (ply: number, betterMove: string) => {
    const prevPly = Math.max(0, ply - 1);
    setTargetStep(prevPly);
    setRetryMove({
      moveNumber: Math.ceil(ply / 2),
      ply,
      betterMove,
    });
  };

  const handleSearch = (targetName: string, targetPlatform: ChessPlatform = platform) => {
    const trimmed = targetName.trim();
    if (!trimmed) return;
    startTransition(() => {
      router.push(`/?u=${encodeURIComponent(trimmed)}&p=${targetPlatform}`);
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(usernameInput, platform);
  };

  const onPlatformChange = (newPlatform: ChessPlatform) => {
    setPlatform(newPlatform);
    if (usernameInput.trim()) {
      handleSearch(usernameInput, newPlatform);
    }
  };

  // Selected game
  const selectedGame = games.find((g) => g.id === selectedGameId) ?? games[0] ?? null;

  // Selected game orientation
  const selectedOrientation: 'white' | 'black' = selectedGame?.white ? 'white' : 'black';

  // Winrate calculation
  const totalGamesCount =
    profile ? profile.record.win + profile.record.loss + profile.record.draw : 0;
  const wins = profile?.record.win ?? 0;
  const losses = profile?.record.loss ?? 0;
  const draws = profile?.record.draw ?? 0;
  const winRate =
    totalGamesCount > 0 ? Math.round((wins / totalGamesCount) * 100) : 0;
  const lossRate =
    totalGamesCount > 0 ? Math.round((losses / totalGamesCount) * 100) : 0;
  const drawRate =
    totalGamesCount > 0 ? Math.max(0, 100 - winRate - lossRate) : 0;

  return (
    <div className={`min-h-screen ${isChessCom ? 'bg-[#161512]' : 'bg-[#161512]'} text-white font-sans antialiased flex flex-col md:flex-row transition-colors duration-200`}>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 h-16 border-b border-[#302e2b] bg-[#1a1815] px-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <Logo size="sm" />
        </a>
        <div className="flex items-center gap-2">
          {user ? (
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#302e2b] bg-[#211f1c] text-xs font-semibold text-white cursor-pointer"
            >
              <div className="w-5 h-5 rounded-md bg-[#81b64c] flex items-center justify-center text-[10px] font-black">
                {authProfile?.full_name ? authProfile.full_name[0].toUpperCase() : 'U'}
              </div>
              <span className="truncate max-w-[90px]">
                {authProfile?.full_name || user.email?.split('@')[0]}
              </span>
            </button>
          ) : (
            <Link
              href="/auth"
              className="px-3 py-1.5 rounded-lg bg-[#81b64c] text-white text-xs font-bold"
            >
              Войти
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#211f1c] transition-colors cursor-pointer"
            aria-label="Меню"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer (if open) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-[#161512]/95 backdrop-blur-md p-4 flex flex-col justify-between overflow-y-auto">
          <div className="flex flex-col gap-2">
            <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1 px-2">
              Навигация
            </div>

            {/* 1. Обзор партий */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('analysis');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
                activeTab === 'analysis'
                  ? isChessCom
                    ? 'bg-[#81b64c]/15 text-[#81b64c] border border-[#81b64c]/30 font-semibold'
                    : 'bg-[#3692e7]/15 text-[#3692e7] border border-[#3692e7]/30 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-[#211f1c]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Swords className="w-5 h-5" />
                <span>Обзор партий</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#211f1c] text-zinc-400 border border-[#302e2b]">
                Review
              </span>
            </button>

            {/* 2. Тренировки (Аккордеон) */}
            <div className="flex flex-col rounded-xl border border-[#302e2b] bg-[#1a1815] overflow-hidden">
              <button
                type="button"
                onClick={() => setIsMobileTrainAccordionOpen(!isMobileTrainAccordionOpen)}
                className={`flex items-center justify-between px-3.5 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  isTrainActive
                    ? isChessCom
                      ? 'text-[#81b64c]'
                      : 'text-[#3692e7]'
                    : 'text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5" />
                  <span>Тренировки</span>
                </div>
                <div className="flex items-center gap-2">
                  {currentActiveTrain && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#211f1c] text-zinc-300 border border-[#302e2b]">
                      {currentActiveTrain.label}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isMobileTrainAccordionOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {isMobileTrainAccordionOpen && (
                <div className="p-2 border-t border-[#302e2b] bg-[#161512] flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('trainHub');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg text-xs font-bold text-amber-400 hover:bg-[#211f1c] text-left cursor-pointer"
                  >
                    <span>★ Все тренировки (Центр)</span>
                  </button>
                  {TRAIN_ITEMS.map((train) => {
                    const TrainIcon = train.icon;
                    const isItemActive = activeTab === train.id;
                    return (
                      <button
                        key={train.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(train.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                          isItemActive
                            ? isChessCom
                              ? 'bg-[#81b64c]/20 text-[#81b64c] font-bold border border-[#81b64c]/40'
                              : 'bg-[#3692e7]/20 text-[#3692e7] font-bold border border-[#3692e7]/40'
                            : 'text-zinc-400 hover:text-white hover:bg-[#211f1c]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <TrainIcon className="w-4 h-4" />
                          <span>{train.label}</span>
                        </div>
                        {train.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#211f1c] text-zinc-500">
                            {train.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Инструменты (Аккордеон) */}
            <div className="flex flex-col rounded-xl border border-[#302e2b] bg-[#1a1815] overflow-hidden">
              <button
                type="button"
                onClick={() => setIsMobileToolsAccordionOpen(!isMobileToolsAccordionOpen)}
                className={`flex items-center justify-between px-3.5 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  isToolActive
                    ? isChessCom
                      ? 'text-[#81b64c]'
                      : 'text-[#3692e7]'
                    : 'text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5" />
                  <span>Инструменты</span>
                </div>
                <div className="flex items-center gap-2">
                  {currentActiveTool && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#211f1c] text-zinc-300 border border-[#302e2b]">
                      {currentActiveTool.label}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isMobileToolsAccordionOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {isMobileToolsAccordionOpen && (
                <div className="p-2 border-t border-[#302e2b] bg-[#161512] flex flex-col gap-1">
                  {TOOLS_ITEMS.map((tool) => {
                    const ToolIcon = tool.icon;
                    const isItemActive = activeTab === tool.id;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tool.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                          isItemActive
                            ? isChessCom
                              ? 'bg-[#81b64c]/20 text-[#81b64c] font-bold border border-[#81b64c]/40'
                              : 'bg-[#3692e7]/20 text-[#3692e7] font-bold border border-[#3692e7]/40'
                            : 'text-zinc-400 hover:text-white hover:bg-[#211f1c]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <ToolIcon className="w-4 h-4" />
                          <span>{tool.label}</span>
                        </div>
                        {tool.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#211f1c] text-zinc-500">
                            {tool.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Platform switcher in mobile menu */}
            <div className="mt-4 pt-4 border-t border-[#302e2b]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-2 px-2">
                Платформа партий
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onPlatformChange('lichess')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                    platform === 'lichess'
                      ? 'bg-[#3692e7] border-[#3692e7] text-white'
                      : 'border-[#302e2b] bg-[#211f1c] text-zinc-400'
                  }`}
                >
                  Lichess
                </button>
                <button
                  type="button"
                  onClick={() => onPlatformChange('chesscom')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                    platform === 'chesscom'
                      ? 'bg-[#81b64c] border-[#81b64c] text-white'
                      : 'border-[#302e2b] bg-[#211f1c] text-zinc-400'
                  }`}
                >
                  Chess.com
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#302e2b] flex items-center justify-between text-xs text-zinc-500">
            <span>© ChessCheese</span>
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar (как на chessigma.com) */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-[#302e2b] bg-[#1a1815] shrink-0 z-30 select-none">
        {/* Logo */}
        <div className="p-4 border-b border-[#302e2b] flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <Logo size="md" />
          </a>
        </div>

        {/* Platform Selector in Sidebar */}
        <div className="p-3 border-b border-[#302e2b]">
          <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 px-1 flex items-center justify-between">
            <span>Платформа</span>
            <span className="text-[10px] font-mono text-zinc-600">{platform}</span>
          </div>
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#211f1c] border border-[#302e2b]">
            <button
              type="button"
              onClick={() => onPlatformChange('lichess')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                platform === 'lichess'
                  ? 'bg-[#3692e7] text-white shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Lichess</span>
            </button>
            <button
              type="button"
              onClick={() => onPlatformChange('chesscom')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                platform === 'chesscom'
                  ? 'bg-[#81b64c] text-white shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Chess.com</span>
            </button>
          </div>
        </div>

        {/* Nav Items List */}
        <div className="flex-1 p-3 space-y-1.5">
          <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-2 px-2">
            Навигация
          </div>

          {/* 1. Обзор партий */}
          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer text-left ${
              activeTab === 'analysis'
                ? isChessCom
                  ? 'bg-[#81b64c]/15 text-[#81b64c] border border-[#81b64c]/30 font-semibold shadow-sm'
                  : 'bg-[#3692e7]/15 text-[#3692e7] border border-[#3692e7]/30 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#211f1c]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Swords
                className={`w-4 h-4 ${
                  activeTab === 'analysis'
                    ? isChessCom
                      ? 'text-[#81b64c]'
                      : 'text-[#3692e7]'
                    : 'text-zinc-500'
                }`}
              />
              <span>Обзор партий</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#211f1c] text-zinc-400 border border-[#302e2b]">
              Review
            </span>
          </button>

          {/* 2. Единая кнопка "Тренировки" с выпадающим меню вариантов при наведении */}
          <div
            className="relative"
            onMouseEnter={handleTrainMouseEnter}
            onMouseLeave={handleTrainMouseLeave}
          >
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'analysis' || isToolActive) {
                  setActiveTab('trainHub');
                }
                setIsTrainFlyoutOpen(!isTrainFlyoutOpen);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer text-left ${
                isTrainActive
                  ? isChessCom
                    ? 'bg-[#81b64c]/15 text-[#81b64c] border border-[#81b64c]/30 font-semibold shadow-sm'
                    : 'bg-[#3692e7]/15 text-[#3692e7] border border-[#3692e7]/30 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#211f1c]'
              }`}
            >
              <div className="flex items-center gap-3">
                <GraduationCap
                  className={`w-4 h-4 ${
                    isTrainActive
                      ? isChessCom
                        ? 'text-[#81b64c]'
                        : 'text-[#3692e7]'
                      : 'text-zinc-500'
                  }`}
                />
                <span>Тренировки</span>
              </div>
              <div className="flex items-center gap-1.5">
                {currentActiveTrain && (
                  <span className="text-[9px] max-w-[70px] truncate px-1.5 py-0.5 rounded bg-[#211f1c] text-zinc-300 border border-[#302e2b]">
                    {currentActiveTrain.label.split(' ')[0]}
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
                    isTrainFlyoutOpen ? 'translate-x-0.5 text-white' : ''
                  }`}
                />
              </div>
            </button>

            {/* Flyout Popover Menu — высвечивается при наводке */}
            {isTrainFlyoutOpen && (
              <div
                className="absolute left-[calc(100%+8px)] top-0 z-50 w-80 rounded-2xl bg-[#1c1a17]/98 border border-[#302e2b] shadow-2xl p-2.5 backdrop-blur-xl animate-in fade-in slide-in-from-left-2 duration-150 before:absolute before:-left-3 before:top-0 before:w-4 before:h-full before:content-['']"
                onMouseEnter={handleTrainMouseEnter}
                onMouseLeave={handleTrainMouseLeave}
              >
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#302e2b] mb-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('trainHub');
                      setIsTrainFlyoutOpen(false);
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    Центр тренировок
                  </button>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {TRAIN_ITEMS.length} режима
                  </span>
                </div>

                <div className="max-h-[calc(100vh-140px)] overflow-y-auto space-y-1 pr-1">
                  {TRAIN_ITEMS.map((train) => {
                    const TrainIcon = train.icon;
                    const isItemActive = activeTab === train.id;
                    return (
                      <button
                        key={train.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(train.id);
                          setIsTrainFlyoutOpen(false);
                        }}
                        className={`w-full flex items-start gap-3 p-2 rounded-xl text-left transition-all cursor-pointer group ${
                          isItemActive
                            ? isChessCom
                              ? 'bg-[#81b64c]/20 text-white border border-[#81b64c]/40 shadow-sm'
                              : 'bg-[#3692e7]/20 text-white border border-[#3692e7]/40 shadow-sm'
                            : 'text-zinc-300 hover:text-white hover:bg-[#262420] border border-transparent'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                            isItemActive
                              ? isChessCom
                                ? 'bg-[#81b64c] text-white shadow-sm'
                                : 'bg-[#3692e7] text-white shadow-sm'
                              : 'bg-[#262420] text-zinc-400 group-hover:text-white group-hover:bg-[#302e2b]'
                          }`}
                        >
                          <TrainIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white truncate">
                              {train.label}
                            </span>
                            {train.badge && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#161512] text-zinc-400 border border-[#302e2b] font-mono shrink-0">
                                {train.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5 font-normal">
                            {train.shortDesc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Единая кнопка "Инструменты" с выпадающим меню вариантов при наведении */}
          <div
            className="relative"
            onMouseEnter={handleToolsMouseEnter}
            onMouseLeave={handleToolsMouseLeave}
          >
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'analysis') {
                  setActiveTab('analysisBoard');
                }
                setIsToolsFlyoutOpen(!isToolsFlyoutOpen);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer text-left ${
                isToolActive
                  ? isChessCom
                    ? 'bg-[#81b64c]/15 text-[#81b64c] border border-[#81b64c]/30 font-semibold shadow-sm'
                    : 'bg-[#3692e7]/15 text-[#3692e7] border border-[#3692e7]/30 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#211f1c]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wrench
                  className={`w-4 h-4 ${
                    isToolActive
                      ? isChessCom
                        ? 'text-[#81b64c]'
                        : 'text-[#3692e7]'
                      : 'text-zinc-500'
                  }`}
                />
                <span>Инструменты</span>
              </div>
              <div className="flex items-center gap-1.5">
                {currentActiveTool && (
                  <span className="text-[9px] max-w-[70px] truncate px-1.5 py-0.5 rounded bg-[#211f1c] text-zinc-300 border border-[#302e2b]">
                    {currentActiveTool.label.split(' ')[0]}
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
                    isToolsFlyoutOpen ? 'translate-x-0.5 text-white' : ''
                  }`}
                />
              </div>
            </button>

            {/* Flyout Popover Menu — высвечивается при наводке */}
            {isToolsFlyoutOpen && (
              <div
                className="absolute left-[calc(100%+8px)] top-0 z-50 w-80 rounded-2xl bg-[#1c1a17]/98 border border-[#302e2b] shadow-2xl p-2.5 backdrop-blur-xl animate-in fade-in slide-in-from-left-2 duration-150 before:absolute before:-left-3 before:top-0 before:w-4 before:h-full before:content-['']"
                onMouseEnter={handleToolsMouseEnter}
                onMouseLeave={handleToolsMouseLeave}
              >
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#302e2b] mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#81b64c]" />
                    Все инструменты
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {TOOLS_ITEMS.length} шт
                  </span>
                </div>

                <div className="max-h-[calc(100vh-140px)] overflow-y-auto space-y-1 pr-1">
                  {TOOLS_ITEMS.map((tool) => {
                    const ToolIcon = tool.icon;
                    const isItemActive = activeTab === tool.id;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tool.id);
                          setIsToolsFlyoutOpen(false);
                        }}
                        className={`w-full flex items-start gap-3 p-2 rounded-xl text-left transition-all cursor-pointer group ${
                          isItemActive
                            ? isChessCom
                              ? 'bg-[#81b64c]/20 text-white border border-[#81b64c]/40 shadow-sm'
                              : 'bg-[#3692e7]/20 text-white border border-[#3692e7]/40 shadow-sm'
                            : 'text-zinc-300 hover:text-white hover:bg-[#262420] border border-transparent'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                            isItemActive
                              ? isChessCom
                                ? 'bg-[#81b64c] text-white shadow-sm'
                                : 'bg-[#3692e7] text-white shadow-sm'
                              : 'bg-[#262420] text-zinc-400 group-hover:text-white group-hover:bg-[#302e2b]'
                          }`}
                        >
                          <ToolIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white truncate">
                              {tool.label}
                            </span>
                            {tool.badge && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#161512] text-zinc-400 border border-[#302e2b] font-mono shrink-0">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5 font-normal">
                            {tool.shortDesc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom User Area */}
        <div className="p-3 border-t border-[#302e2b] bg-[#161512]/60">
          {user ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#211f1c] transition-all text-left border border-transparent hover:border-[#302e2b] cursor-pointer"
                title="Личный кабинет"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 ${
                    isChessCom ? 'bg-[#81b64c]' : 'bg-[#3692e7]'
                  }`}
                >
                  {authProfile?.full_name ? authProfile.full_name[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {authProfile?.full_name || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">
                    {authProfile?.chess_username
                      ? `@${authProfile.chess_username}`
                      : 'Профиль игрока'}
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={signOut}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#302e2b] bg-[#211f1c] hover:bg-[#262421] text-zinc-400 hover:text-white text-xs font-medium transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Выйти</span>
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white shadow-md transition-all ${
                isChessCom
                  ? 'bg-[#81b64c] hover:bg-[#74a643]'
                  : 'bg-[#3692e7] hover:bg-[#2c7ec9]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Войти в аккаунт</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col pb-16 md:pb-0">
        {activeTab === 'analysis' && (
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="w-full flex flex-col gap-10 pt-10 pb-16">
          {/* Hero Section */}
          <section className="flex flex-col items-center text-center max-w-3xl mx-auto px-4">
            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
              Анализ партий{' '}
              <span className={isChessCom ? 'text-[#81b64c]' : 'text-[#3692e7]'}>
                нового поколения
              </span>
            </h1>

            <p className={`text-base sm:text-lg max-w-xl mb-8 leading-relaxed ${isChessCom ? 'text-[#c3c2c1]' : 'text-[#bababa]'}`}>
              Изучай статистику, просматривай партии и получай подробный анализ ходов с точностью и оценкой позиции.
            </p>

            {/* Matte Search & Platform Selector Card */}
            <div className={`w-full max-w-xl ${isChessCom ? 'bg-[#211f1c] border-[#302e2b]' : 'bg-[#24221f] border-[#33312c]'} border p-3 sm:p-4 rounded-3xl shadow-sm flex flex-col gap-3`}>
              {/* Platform Switcher Tabs */}
              <div className={`grid grid-cols-2 p-1 rounded-2xl ${isChessCom ? 'bg-[#191815] border-[#302e2b]' : 'bg-[#1c1a17] border-[#33312c]'} border`}>
                <button
                  type="button"
                  onClick={() => onPlatformChange('lichess')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    platform === 'lichess'
                      ? 'bg-[#3692e7] text-white font-bold'
                      : 'text-[#bababa] hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4 text-white" />
                  <span>Lichess.org</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPlatformChange('chesscom')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    platform === 'chesscom'
                      ? 'bg-[#81b64c] text-white font-bold'
                      : 'text-[#c3c2c1] hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>Chess.com</span>
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2.5 sm:gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Никнейм игрока..."
                    className={`w-full ${
                      isChessCom
                        ? 'bg-[#191815] border-[#302e2b] focus:border-[#81b64c]'
                        : 'bg-[#1c1a17] border-[#33312c] focus:border-[#3692e7]'
                    } border text-white placeholder:text-zinc-500 rounded-xl px-4 py-3.5 pl-11 text-sm sm:text-base outline-none transition-all`}
                    disabled={isPending}
                  />
                  {isPending && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className={`w-5 h-5 ${isChessCom ? 'text-[#81b64c]' : 'text-[#3692e7]'} animate-spin`} />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isPending || !usernameInput.trim()}
                  className={`w-full sm:w-auto h-12 sm:h-auto ${
                    isChessCom
                      ? 'bg-[#81b64c] hover:bg-[#74a643]'
                      : 'bg-[#3692e7] hover:bg-[#2b7ecc]'
                  } text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0 active:scale-[0.98] cursor-pointer touch-manipulation`}
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Search className="w-4 h-4 text-white stroke-[2.5]" />
                  )}
                  <span>Анализировать</span>
                </button>
              </form>
            </div>

            {/* Quick select chip pills */}
            <div className={`flex flex-wrap items-center justify-center gap-2 mt-4 text-xs ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} px-2`}>
              <span className="w-full sm:w-auto text-center sm:text-left mb-0.5 sm:mb-0">
                {platform === 'chesscom' ? 'Топ на Chess.com:' : 'Топ на Lichess:'}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {PLATFORM_CHIPS[platform].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setUsernameInput(name);
                      handleSearch(name, platform);
                    }}
                    disabled={isPending}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium ${
                      isChessCom
                        ? 'bg-[#211f1c] hover:bg-[#262421] text-[#c3c2c1] border-[#302e2b]'
                        : 'bg-[#24221f] hover:bg-[#292723] text-[#bababa] border-[#33312c]'
                    } hover:text-white border transition-all cursor-pointer touch-manipulation`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Error notification */}
          {error && (
            <div className="max-w-xl mx-auto w-full px-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-sm shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-300">Ошибка поиска</p>
                  <p className="text-rose-400/90 text-xs mt-0.5">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results View */}
          {profile && (
            <div className="flex flex-col gap-10 max-w-6xl mx-auto w-full">
              {/* Profile Overview Card */}
              <section className={`${isChessCom ? 'bg-[#211f1c] border-[#302e2b]' : 'bg-[#24221f] border-[#33312c]'} border rounded-3xl p-6 sm:p-8 shadow-sm`}>
                {/* Header row */}
                <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b ${isChessCom ? 'border-[#302e2b]' : 'border-[#33312c]'}`}>
                  <div className="flex items-center gap-5">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.username}
                        className={`w-16 h-16 rounded-2xl object-cover border ${isChessCom ? 'border-[#302e2b] bg-[#191815]' : 'border-[#33312c] bg-[#1c1a17]'} shrink-0`}
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl ${isChessCom ? 'bg-[#262421] border-[#302e2b] text-[#81b64c]' : 'bg-[#292723] border-[#33312c] text-[#3692e7]'} border flex items-center justify-center font-black text-2xl shrink-0`}>
                        {profile.title ? profile.title : <User className="w-8 h-8" />}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          {profile.name || profile.username}
                        </h2>
                        {profile.name && (
                          <span className={`text-sm ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} font-mono`}>
                            (@{profile.username})
                          </span>
                        )}
                        {profile.title && (
                          <span className="px-2.5 py-0.5 text-xs font-black rounded bg-amber-400 text-zinc-950 uppercase tracking-wider shadow-sm">
                            {profile.title}
                          </span>
                        )}
                        {/* Platform Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border font-semibold ${
                            profile.platform === 'chesscom'
                              ? 'border-[#81b64c]/40 bg-[#81b64c]/15 text-[#81b64c]'
                              : 'border-[#3692e7]/40 bg-[#3692e7]/15 text-[#3692e7]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              profile.platform === 'chesscom' ? 'bg-[#81b64c]' : 'bg-[#3692e7]'
                            }`}
                          />
                          {profile.platform === 'chesscom' ? 'Chess.com' : 'Lichess'}
                        </span>
                        {profile.online !== undefined && (
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border ${
                              profile.online
                                ? isChessCom
                                  ? 'border-[#81b64c]/40 bg-[#81b64c]/15 text-[#81b64c]'
                                  : 'border-[#3692e7]/40 bg-[#3692e7]/15 text-[#3692e7]'
                                : 'border-zinc-700 bg-zinc-800/60 text-zinc-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                profile.online
                                  ? isChessCom ? 'bg-[#81b64c] animate-pulse' : 'bg-[#3692e7] animate-pulse'
                                  : 'bg-zinc-500'
                              }`}
                            />
                            {profile.online ? 'В сети' : 'Офлайн'}
                          </span>
                        )}
                      </div>
                      {profile.profileUrl && (
                        <a
                          href={profile.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 text-xs ${isChessCom ? 'text-[#8b8987] hover:text-[#81b64c]' : 'text-[#7e7b76] hover:text-[#3692e7]'} transition-colors mt-1.5 font-mono`}
                        >
                          <span className="truncate max-w-[280px]">{profile.profileUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Match Stats Counters */}
                  <div className={`flex items-center gap-6 sm:gap-8 ${isChessCom ? 'bg-[#191815] border-[#302e2b]' : 'bg-[#1c1a17] border-[#33312c]'} px-6 py-3.5 rounded-2xl border`}>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-black text-emerald-400">{wins}</div>
                      <div className={`text-xs ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} font-medium`}>Победы</div>
                    </div>
                    <div className={`w-px h-8 ${isChessCom ? 'bg-[#302e2b]' : 'bg-[#33312c]'}`} />
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-black text-amber-400">{draws}</div>
                      <div className={`text-xs ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} font-medium`}>Ничьи</div>
                    </div>
                    <div className={`w-px h-8 ${isChessCom ? 'bg-[#302e2b]' : 'bg-[#33312c]'}`} />
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-black text-rose-400">{losses}</div>
                      <div className={`text-xs ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} font-medium`}>Поражения</div>
                    </div>
                  </div>
                </div>

                {/* Ratings Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {/* Blitz */}
                  <div className={`${isChessCom ? 'bg-[#191815] border-[#302e2b] hover:bg-[#262421]' : 'bg-[#1c1a17] border-[#33312c] hover:bg-[#292723]'} border rounded-2xl p-5 transition-all group`}>
                    <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                      <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                        <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        Блиц
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">Blitz</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                      {profile.ratings.blitz ?? '—'}
                    </div>
                    <div className={`text-[11px] ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} mt-1`}>Рейтинг Blitz</div>
                  </div>

                  {/* Rapid */}
                  <div className={`${isChessCom ? 'bg-[#191815] border-[#302e2b] hover:bg-[#262421]' : 'bg-[#1c1a17] border-[#33312c] hover:bg-[#292723]'} border rounded-2xl p-5 transition-all group`}>
                    <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                      <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                        <Clock className={`w-4 h-4 ${isChessCom ? 'text-[#81b64c]' : 'text-[#3692e7]'} group-hover:scale-110 transition-transform`} />
                        Рапид
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">Rapid</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                      {profile.ratings.rapid ?? '—'}
                    </div>
                    <div className={`text-[11px] ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} mt-1`}>Рейтинг Rapid</div>
                  </div>

                  {/* Bullet */}
                  <div className={`${isChessCom ? 'bg-[#191815] border-[#302e2b] hover:bg-[#262421]' : 'bg-[#1c1a17] border-[#33312c] hover:bg-[#292723]'} border rounded-2xl p-5 transition-all group`}>
                    <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                      <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                        <Flame className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                        Пуля
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">Bullet</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                      {profile.ratings.bullet ?? '—'}
                    </div>
                    <div className={`text-[11px] ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} mt-1`}>Рейтинг Bullet</div>
                  </div>

                  {/* Classical / Daily */}
                  <div className={`${isChessCom ? 'bg-[#191815] border-[#302e2b] hover:bg-[#262421]' : 'bg-[#1c1a17] border-[#33312c] hover:bg-[#292723]'} border rounded-2xl p-5 transition-all group`}>
                    <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                      <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                        <Trophy className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                        {profile.platform === 'chesscom' ? 'Заочные' : 'Классика'}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {profile.platform === 'chesscom' ? 'Daily' : 'Classical'}
                      </span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                      {profile.ratings.classical ?? '—'}
                    </div>
                    <div className={`text-[11px] ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} mt-1`}>
                      {profile.platform === 'chesscom' ? 'Рейтинг Daily' : 'Рейтинг Classical'}
                    </div>
                  </div>
                </div>

                {/* Colored Segmented Progress Bar */}
                <div className={`mt-6 pt-5 border-t ${isChessCom ? 'border-[#302e2b]' : 'border-[#33312c]'}`}>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2.5">
                    <span className="font-medium text-zinc-300">Соотношение результатов</span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> {winRate}% побед
                      </span>
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-amber-400" /> {drawRate}% ничьих
                      </span>
                      <span className="flex items-center gap-1 text-rose-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-rose-400" /> {lossRate}% поражений
                      </span>
                    </div>
                  </div>
                  <div className={`w-full h-2.5 rounded-full ${isChessCom ? 'bg-[#191815] border-[#302e2b]' : 'bg-[#1c1a17] border-[#33312c]'} overflow-hidden flex border`}>
                    <div
                      style={{ width: `${winRate}%` }}
                      title={`Победы: ${winRate}%`}
                      className="bg-emerald-500 h-full transition-all duration-700"
                    />
                    <div
                      style={{ width: `${drawRate}%` }}
                      title={`Ничьи: ${drawRate}%`}
                      className="bg-amber-400 h-full transition-all duration-700"
                    />
                    <div
                      style={{ width: `${lossRate}%` }}
                      title={`Поражения: ${lossRate}%`}
                      className="bg-rose-500 h-full transition-all duration-700"
                    />
                  </div>
                </div>
              </section>

              {/* Main Layout: 2 columns (Left: Matches, Right: Board + Review) */}
              <section className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
                {/* Interactive Chessboard & AI Game Review */}
                <div
                  className={`w-full order-1 lg:order-2 ${
                    isLargeBoard ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-7'
                  } flex flex-col gap-6 transition-all duration-300`}
                >
                  {selectedGame ? (
                    <>
                      <div className="flex flex-col gap-2.5">
                        <div className="text-xs px-1 font-medium flex items-center justify-between">
                          <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isChessCom ? 'bg-[#81b64c]' : 'bg-[#3692e7]'}`} />
                            Интерактивная доска & Оценка
                          </span>
                          {selectedGame.url && (
                            <a
                              href={selectedGame.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${isChessCom ? 'text-[#81b64c] hover:underline' : 'text-[#3692e7] hover:underline'} flex items-center gap-1 transition-colors font-medium touch-manipulation`}
                            >
                              <span>
                                {profile.platform === 'chesscom'
                                  ? 'Смотреть на Chess.com'
                                  : 'Смотреть на Lichess'}
                              </span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <ChessViewer
                          pgn={selectedGame.pgn}
                          moves={selectedGame.moves}
                          whitePlayer={selectedGame.white ? profile.username : selectedGame.opponent}
                          blackPlayer={selectedGame.white ? selectedGame.opponent : profile.username}
                          whiteRating={selectedGame.white ? undefined : selectedGame.opponentRating}
                          blackRating={selectedGame.white ? selectedGame.opponentRating : undefined}
                          initialOrientation={selectedOrientation}
                          openingName={selectedGame.opening}
                          targetStep={targetStep}
                          onStepChange={setActiveStep}
                          onGameStateChange={setCurrentGameState}
                          retryMove={retryMove}
                          onClearRetry={() => setRetryMove(null)}
                          criticalMoves={loadedReview?.criticalMoves}
                          allMoves={loadedReview?.allMoves}
                          isLarge={isLargeBoard}
                          onToggleSize={() => setIsLargeBoard((prev) => !prev)}
                          platform={platform}
                        />
                      </div>

                      {/* Unified Review & AI Coach Chat Panel */}
                      <div className="w-full flex flex-col gap-3">
                        {/* Tab Switcher */}
                        <div
                          className={`p-1.5 rounded-2xl ${
                            isChessCom
                              ? 'bg-[#211f1c] border-[#302e2b]'
                              : 'bg-[#24221f] border-[#33312c]'
                          } border flex items-center gap-2 shadow-sm`}
                        >
                          <button
                            type="button"
                            onClick={() => setSidebarTab('review')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                              sidebarTab === 'review'
                                ? isChessCom
                                  ? 'bg-[#81b64c] text-white shadow-md'
                                  : 'bg-[#3692e7] text-white shadow-md'
                                : isChessCom
                                  ? 'text-[#8b8987] hover:text-white'
                                  : 'text-[#7e7b76] hover:text-white'
                            }`}
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Разбор партии</span>
                            {loadedReview && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/25 text-white font-mono">
                                {loadedReview.accuracy[selectedOrientation].toFixed(0)}%
                              </span>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setSidebarTab('chat')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                              sidebarTab === 'chat'
                                ? 'bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-zinc-950 shadow-md font-black'
                                : isChessCom
                                  ? 'text-[#8b8987] hover:text-white'
                                  : 'text-[#7e7b76] hover:text-white'
                            }`}
                          >
                            <Bot className="w-4 h-4" />
                            <span>Чат с тренером</span>
                            {activeMoveContext?.san && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/20 font-mono font-bold">
                                {activeMoveContext.san} ({activeMoveContext.classification})
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Active Panel View */}
                        {sidebarTab === 'review' ? (
                          <GameReview
                            key={selectedGame.id}
                            pgn={selectedGame.pgn}
                            playerColor={selectedOrientation}
                            username={profile.username}
                            onSelectMovePly={handleSelectMovePly}
                            onRetryMove={handleRetryMove}
                            onAskCoach={handleAskCoach}
                            onReviewLoaded={setLoadedReview}
                            activePly={activeStep}
                            platform={platform}
                          />
                        ) : (
                          <ChessChat
                            key={`chat-${selectedGame.id}`}
                            currentFen={currentGameState.fen}
                            moveNumber={currentGameState.moveNumber}
                            turn={currentGameState.turn}
                            pgn={selectedGame.pgn}
                            platform={platform}
                            activeMove={activeMoveContext}
                          />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className={`p-16 text-center ${isChessCom ? 'bg-[#211f1c] border-[#302e2b] text-[#8b8987]' : 'bg-[#24221f] border-[#33312c] text-[#7e7b76]'} rounded-3xl border text-sm`}>
                      Выбери партию в списке для анализа
                    </div>
                  )}
                </div>

                {/* Match Archive List */}
                <div
                  className={`w-full order-2 lg:order-1 ${
                    isLargeBoard ? 'lg:col-span-4 xl:col-span-3' : 'lg:col-span-5'
                  } flex flex-col gap-3.5 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-1 px-1">
                    <div className="flex items-center gap-2">
                      <Swords className={`w-4 h-4 ${isChessCom ? 'text-[#81b64c]' : 'text-[#3692e7]'}`} />
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        Недавние партии
                      </h3>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full ${isChessCom ? 'bg-[#191815] border-[#302e2b] text-[#8b8987]' : 'bg-[#1c1a17] border-[#33312c] text-[#7e7b76]'} border font-mono`}>
                      {games.length} {games.length === 1 ? 'партия' : 'партий'}
                    </span>
                  </div>

                  {games.length === 0 ? (
                    <div className={`p-12 text-center ${isChessCom ? 'bg-[#211f1c] border-[#302e2b] text-[#8b8987]' : 'bg-[#24221f] border-[#33312c] text-[#7e7b76]'} rounded-2xl border text-sm`}>
                      Недавние партии не найдены в архиве игрока
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {games.map((game) => {
                        let resultBadge = (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
                            <MinusCircle className="w-3.5 h-3.5" /> Ничья
                          </span>
                        );
                        if (game.result === 'win') {
                          resultBadge = (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Победа
                            </span>
                          );
                        } else if (game.result === 'loss') {
                          resultBadge = (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold">
                              <XCircle className="w-3.5 h-3.5" /> Поражение
                            </span>
                          );
                        }

                        const isSelected = selectedGame?.id === game.id;

                        return (
                          <button
                            key={game.id}
                            type="button"
                            onClick={() => setSelectedGameId(game.id)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2.5 cursor-pointer touch-manipulation ${
                              isSelected
                                ? isChessCom
                                  ? 'bg-[#262421] border-[#81b64c] ring-1 ring-[#81b64c]'
                                  : 'bg-[#292723] border-[#3692e7] ring-1 ring-[#3692e7]'
                                : isChessCom
                                  ? 'bg-[#191815] border-[#302e2b] hover:bg-[#262421]'
                                  : 'bg-[#1c1a17] border-[#33312c] hover:bg-[#292723]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`text-xs px-2 py-0.5 rounded-md ${isChessCom ? 'bg-[#211f1c] text-[#c3c2c1] border-[#302e2b]' : 'bg-[#24221f] text-[#bababa] border-[#33312c]'} border font-mono shrink-0`}>
                                  {game.white ? '♔ Белые' : '♚ Чёрные'}
                                </span>
                                <span className="font-bold text-sm text-zinc-100 truncate">
                                  vs {game.opponent}
                                </span>
                                {game.opponentRating && (
                                  <span className={`text-xs ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'} font-mono shrink-0`}>
                                    ({game.opponentRating})
                                  </span>
                                )}
                              </div>
                              <div className="shrink-0">{resultBadge}</div>
                            </div>

                            <div className={`flex items-center justify-between text-xs pt-1.5 border-t ${isChessCom ? 'border-[#302e2b]' : 'border-[#33312c]'}`}>
                              <span
                                className={`truncate max-w-[200px] ${isChessCom ? 'text-[#c3c2c1]' : 'text-[#bababa]'} font-medium`}
                                title={game.opening}
                              >
                                {game.opening ?? 'Стандартное начало'}
                              </span>
                              <div className={`flex items-center gap-2 shrink-0 ${isChessCom ? 'text-[#8b8987]' : 'text-[#7e7b76]'}`}>
                                <span className="capitalize">{game.timeControl}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-mono">
                                  <Calendar className="w-3 h-3" />
                                  {game.date}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Initial Empty State */}
          {!profile && !error && (
            <div className="max-w-md mx-auto text-center py-12 px-4">
              <div className={`w-16 h-16 rounded-3xl ${isChessCom ? 'bg-[#211f1c] border-[#302e2b] text-[#81b64c]' : 'bg-[#24221f] border-[#33312c] text-[#3692e7]'} border flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                <Trophy className="w-8 h-8" />
              </div>
              <h4 className="text-white font-bold text-lg mb-1.5">Готов к анализу</h4>
              <p className={`text-xs sm:text-sm leading-relaxed ${isChessCom ? 'text-[#c3c2c1]' : 'text-[#bababa]'}`}>
                Выбери платформу (Lichess или Chess.com), введи никнейм или нажми на одного из гроссмейстеров выше, чтобы мгновенно загрузить статистику и разобрать партии.
              </p>
            </div>
          )}
        </div>
      </main>
      )}

        {/* Tab: Train Hub */}
        {activeTab === 'trainHub' && (
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <TrainHub onSelectTrack={(track) => setActiveTab(track as DashboardTab)} />
          </main>
        )}

        {/* Tab: Woodpecker Trainer */}
        {activeTab === 'trainWoodpecker' && (
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <WoodpeckerTrainer />
          </main>
        )}

        {/* Tab: Daily Puzzle & Calendar */}
        {activeTab === 'trainDaily' && (
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <DailyPuzzle />
          </main>
        )}

        {/* Tab: Opening Repertoire Trainer */}
        {activeTab === 'trainOpenings' && (
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <OpeningTrainer />
          </main>
        )}

        {/* Tab: Blunder Shield */}
        {activeTab === 'trainBlunder' && (
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <BlunderShield />
          </main>
        )}

        {/* Tab: Conversion Trainer */}
        {activeTab === 'trainConversion' && (
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <ConversionTrainer />
          </main>
        )}

        {/* Tab: Brain Games */}
        {activeTab === 'trainBrain' && (
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <BrainGames />
          </main>
        )}

        {/* Tab: Analysis Board (Interactive Stockfish 19 Lite Board) */}
        {activeTab === 'analysisBoard' && (
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#81b64c]/15 border border-[#81b64c]/30 flex items-center justify-center text-[#81b64c]">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Доска интерактивного анализа</h1>
                <p className="text-xs text-zinc-500">
                  Играйте ходы на доске, получайте шкалу перевеса и оценку вариантов Stockfish 19 Lite
                </p>
              </div>
            </div>
            <div className="border border-[#302e2b] rounded-3xl bg-[#211f1c] p-6 shadow-xl">
              <AnalysisBoard initialFen={analysisFen} onEditBoard={handleEditBoard} />
            </div>
          </main>
        )}

        {/* Tab: Board Editor */}
        {activeTab === 'editor' && (
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Редактор доски (Board Editor)</h1>
                <p className="text-xs text-zinc-500">
                  Расставьте любую позицию из палитры фигур и запустите анализ в один клик
                </p>
              </div>
            </div>
            <div className="border border-[#302e2b] rounded-3xl bg-[#211f1c] p-6 shadow-xl">
              <BoardEditor initialFen={editorFen} onAnalyzePosition={handleAnalyzePosition} />
            </div>
          </main>
        )}

        {/* Tab: Board Setup Drill */}
        {activeTab === 'boardSetup' && (
          <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Спринт расстановки доски (Setup Sprint)</h1>
                <p className="text-xs text-zinc-500">
                  Тренируйтесь расставлять шахматную доску на скорость без ошибок
                </p>
              </div>
            </div>
            <div className="border border-[#302e2b] rounded-3xl bg-[#211f1c] p-6 shadow-xl">
              <BoardSetupDrill />
            </div>
          </main>
        )}

        {/* Tab: Piece Moves Drill */}
        {activeTab === 'pieceMoves' && (
          <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Тренажёр ходов фигур (Piece Moves)</h1>
                <p className="text-xs text-zinc-500">
                  Найдите все возможные поля для хода фигуры. Берегите жизни!
                </p>
              </div>
            </div>
            <div className="border border-[#302e2b] rounded-3xl bg-[#211f1c] p-6 shadow-xl">
              <PieceMovesDrill />
            </div>
          </main>
        )}

        {/* Tab: Openings */}
        {activeTab === 'openings' && (
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <OpeningExplorer onAnalyzePosition={handleAnalyzePosition} />
          </main>
        )}

        {/* Tab: ELO Calculator */}
        {activeTab === 'elo' && (
          <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Калькулятор ELO / FIDE</h1>
                <p className="text-xs text-zinc-500">
                  Расчет рейтинга для одной партии или многораундового турнира по правилам FIDE
                </p>
              </div>
            </div>
            <div className="border border-[#302e2b] rounded-2xl bg-[#211f1c] p-6 shadow-md">
              <EloCalculator />
            </div>
          </main>
        )}

        {/* Tab: Chess Clock */}
        {activeTab === 'clock' && (
          <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Шахматные часы онлайн</h1>
                <p className="text-xs text-zinc-500">
                  Цифровой таймер с перевёрнутым экраном для соперника за доской
                </p>
              </div>
            </div>
            <div className="border border-[#302e2b] rounded-2xl bg-[#211f1c] p-6 shadow-md">
              <ChessClock />
            </div>
          </main>
        )}

        {/* Tab: Round Robin Tournament Generator */}
        {activeTab === 'roundRobin' && (
          <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Генератор турниров (Таблицы Бергера)</h1>
                <p className="text-xs text-zinc-500">
                  Расчёт партий по турам для круговых турниров от 3 до 20 участников
                </p>
              </div>
            </div>
            <div className="border border-[#302e2b] rounded-2xl bg-[#211f1c] p-6 shadow-md">
              <RoundRobinGenerator />
            </div>
          </main>
        )}

        {/* Tab: Chess.com Status */}
        {activeTab === 'status' && (
          <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Статус сервисов Chess.com</h1>
                <p className="text-xs text-zinc-500">
                  Мониторинг доступности серверов, публикации партий и публичного API
                </p>
              </div>
            </div>
            <div className="border border-[#302e2b] rounded-2xl bg-[#211f1c] p-6 shadow-md">
              <ChesscomStatus />
            </div>
          </main>
        )}

        {/* Footer */}
        <footer className={`border-t ${isChessCom ? 'border-[#302e2b] bg-[#161512] text-[#8b8987]' : 'border-[#33312c] bg-[#161512] text-[#7e7b76]'} py-8 text-center text-xs transition-colors mt-auto`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="text-zinc-500">•</span>
              <span>Анализ шахматных партий & AI-наставник • Stockfish 19 Lite</span>
            </div>
            <div className="text-zinc-600 text-[11px]">
              © {new Date().getFullYear()} ChessCheese — все права защищены
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar (как на мобильной версии chessigma) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#1a1815]/95 backdrop-blur-md border-t border-[#302e2b] flex items-center justify-around py-2 px-2 text-[10px]">
        <button
          type="button"
          onClick={() => setActiveTab('analysis')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'analysis'
              ? isChessCom
                ? 'text-[#81b64c] font-bold'
                : 'text-[#3692e7] font-bold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>Обзор</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!isTrainActive) {
              setActiveTab('trainHub');
            }
            setIsMobileMenuOpen(true);
            setIsMobileTrainAccordionOpen(true);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            isTrainActive
              ? isChessCom
                ? 'text-[#81b64c] font-bold'
                : 'text-[#3692e7] font-bold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Тренировка</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (activeTab === 'analysis') {
              setActiveTab('analysisBoard');
            }
            setIsMobileMenuOpen(true);
            setIsMobileToolsAccordionOpen(true);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            isToolActive
              ? isChessCom
                ? 'text-[#81b64c] font-bold'
                : 'text-[#3692e7] font-bold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>{currentActiveTool ? currentActiveTool.label.split(' ')[0] : 'Инструменты'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (user) {
              setIsProfileModalOpen(true);
            } else {
              router.push('/auth');
            }
          }}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <User className="w-4 h-4" />
          <span>{user ? 'Профиль' : 'Войти'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4" />
          <span>Меню</span>
        </button>
      </nav>

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSignOut={signOut}
        platformTheme={platform}
      />
    </div>
  );
}
