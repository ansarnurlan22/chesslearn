'use client';

import {
  getStudentProfileDataAction,
  joinGroupByInviteCodeAction,
  leaveGroupAction,
  updateStudentProfileAction,
  type StudentGroupInfo,
  type StudentProfileData,
} from '@/lib/api/student-actions';
import type { ChessPlatform } from '@/types/auth';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  Flame,
  GraduationCap,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Save,
  Sparkles,
  Trophy,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => Promise<void>;
  platformTheme?: 'chesscom' | 'lichess';
}

export function StudentProfileModal({
  isOpen,
  onClose,
  onSignOut,
  platformTheme = 'chesscom',
}: StudentProfileModalProps) {
  const router = useRouter();
  const isChessCom = platformTheme === 'chesscom';

  const [data, setData] = useState<StudentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editChessUsername, setEditChessUsername] = useState('');
  const [editChessPlatform, setEditChessPlatform] = useState<ChessPlatform>('chesscom');
  const [isSavingProfile, startSavingProfile] = useTransition();
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Join group state
  const [inviteCode, setInviteCode] = useState('');
  const [isJoiningGroup, startJoiningGroup] = useTransition();
  const [joinGroupError, setJoinGroupError] = useState<string | null>(null);
  const [joinGroupSuccess, setJoinGroupSuccess] = useState<string | null>(null);

  // Leaving group state
  const [leavingGroupId, setLeavingGroupId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getStudentProfileDataAction();
      if (res.success && res.data) {
        setData(res.data);
        setEditFullName(res.data.profile.full_name || '');
        setEditChessUsername(res.data.profile.chess_username || '');
        setEditChessPlatform(res.data.profile.chess_platform || 'chesscom');
      } else {
        setError(res.error || 'Не удалось загрузить данные профиля');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка соединения';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setIsEditing(false);
      setSaveSuccessMsg(null);
      setJoinGroupError(null);
      setJoinGroupSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg(null);
    setError(null);

    startSavingProfile(async () => {
      const res = await updateStudentProfileAction({
        fullName: editFullName,
        chessUsername: editChessUsername,
        chessPlatform: editChessPlatform,
      });

      if (res.success) {
        setSaveSuccessMsg('Профиль успешно обновлен!');
        setIsEditing(false);
        await loadData();
      } else {
        setError(res.error || 'Не удалось сохранить профиль');
      }
    });
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setJoinGroupError(null);
    setJoinGroupSuccess(null);

    startJoiningGroup(async () => {
      const res = await joinGroupByInviteCodeAction(inviteCode);
      if (res.success) {
        setJoinGroupSuccess(`Вы успешно вступили в группу «${res.groupName}»!`);
        setInviteCode('');
        await loadData();
      } else {
        setJoinGroupError(res.error || 'Не удалось вступить в группу');
      }
    });
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm('Вы уверены, что хотите покинуть эту группу?')) return;
    setLeavingGroupId(groupId);
    try {
      const res = await leaveGroupAction(groupId);
      if (res.success) {
        await loadData();
      } else {
        alert(res.error || 'Ошибка при выходе из группы');
      }
    } finally {
      setLeavingGroupId(null);
    }
  };

  const handleViewMyGames = (username: string, platform: ChessPlatform) => {
    onClose();
    router.push(`/?u=${encodeURIComponent(username)}&p=${platform}`);
  };

  const profile = data?.profile;
  const groups = data?.groups || [];
  const stats = data?.chessStats;

  // Format creation date
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  // Get user avatar initials
  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : profile?.email
      ? profile.email[0].toUpperCase()
      : 'U';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto ${
          isChessCom ? 'bg-[#211f1c] border-[#302e2b]' : 'bg-[#24221f] border-[#33312c]'
        } border rounded-3xl shadow-2xl flex flex-col text-white transition-all`}
      >
        {/* Modal Top Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 border-b ${
            isChessCom ? 'bg-[#211f1c]/95 border-[#302e2b]' : 'bg-[#24221f]/95 border-[#33312c]'
          } backdrop-blur-md`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                isChessCom ? 'bg-[#81b64c]' : 'bg-[#3692e7]'
              }`}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Профиль шахматиста</span>
                <span
                  className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                    profile?.role === 'trainer'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {profile?.role === 'trainer' ? 'Тренер' : 'Ученик'}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                {profile?.email || 'Личный кабинет и статистика'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 flex flex-col gap-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <span className="text-sm">Загрузка данных профиля...</span>
            </div>
          ) : error && !data ? (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Profile Overview Card */}
              <div
                className={`p-5 rounded-2xl border ${
                  isChessCom ? 'bg-[#191815] border-[#302e2b]' : 'bg-[#1c1a17] border-[#33312c]'
                } flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4`}
              >
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left min-w-0">
                  <div
                    className={`w-16 h-16 rounded-2xl ${
                      isChessCom ? 'bg-[#81b64c]/20 text-[#81b64c] border-[#81b64c]/40' : 'bg-[#3692e7]/20 text-[#3692e7] border-[#3692e7]/40'
                    } border-2 flex items-center justify-center text-2xl font-black shadow-inner shrink-0`}
                  >
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-white truncate">
                      {profile?.full_name || 'Без имени'}
                    </h3>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-xs text-zinc-400">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{profile?.email}</span>
                    </div>
                    {memberSince && (
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-[11px] text-zinc-500">
                        <Clock className="w-3 h-3 text-zinc-600" />
                        <span>На платформе с {memberSince}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isEditing
                        ? 'bg-zinc-800 text-white border-zinc-700'
                        : isChessCom
                          ? 'bg-[#211f1c] hover:bg-[#262421] text-[#c3c2c1] hover:text-white border-[#302e2b]'
                          : 'bg-[#24221f] hover:bg-[#292723] text-[#bababa] hover:text-white border-[#33312c]'
                    }`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Отмена' : 'Редактировать'}</span>
                  </button>

                  {profile?.role === 'trainer' && (
                    <Link
                      href="/dashboard/trainer"
                      onClick={onClose}
                      className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Панель тренера</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Success / Error alerts */}
              {saveSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Edit Form */}
              {isEditing && (
                <form
                  onSubmit={handleSaveProfile}
                  className={`p-5 rounded-2xl border ${
                    isChessCom ? 'bg-[#191815] border-[#302e2b]' : 'bg-[#1c1a17] border-[#33312c]'
                  } flex flex-col gap-4 animate-in fade-in duration-150`}
                >
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-emerald-400" />
                    <span>Редактирование профиля</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                        Ваше имя и фамилия
                      </label>
                      <input
                        type="text"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        placeholder="Например, Арман Сериков"
                        required
                        className="w-full bg-[#161512] border border-zinc-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                        Шахматный никнейм
                      </label>
                      <input
                        type="text"
                        value={editChessUsername}
                        onChange={(e) => setEditChessUsername(e.target.value)}
                        placeholder="Например, MagnusCarlsen"
                        className="w-full bg-[#161512] border border-zinc-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                      Платформа никнейма
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditChessPlatform('chesscom')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          editChessPlatform === 'chesscom'
                            ? 'bg-[#81b64c] text-white border-[#81b64c]'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        Chess.com
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditChessPlatform('lichess')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          editChessPlatform === 'lichess'
                            ? 'bg-[#3692e7] text-white border-[#3692e7]'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        Lichess
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingProfile || !editFullName.trim()}
                      className={`px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${
                        isChessCom ? 'bg-[#81b64c] hover:bg-[#74a643]' : 'bg-[#3692e7] hover:bg-[#2b7ecc]'
                      }`}
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Сохраняю...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Сохранить изменения</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Chess Account & Stats Card */}
              <div
                className={`p-5 rounded-2xl border ${
                  isChessCom ? 'bg-[#191815] border-[#302e2b]' : 'bg-[#1c1a17] border-[#33312c]'
                } flex flex-col gap-4`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        profile?.chess_platform === 'lichess'
                          ? 'bg-[#3692e7]/20 text-[#3692e7] border border-[#3692e7]/40'
                          : 'bg-[#81b64c]/20 text-[#81b64c] border border-[#81b64c]/40'
                      }`}
                    >
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Привязанный шахматный аккаунт</h4>
                      <p className="text-xs text-zinc-400">
                        {profile?.chess_username ? (
                          <span className="font-mono text-zinc-200">
                            {profile.chess_username} ({profile.chess_platform || 'chesscom'})
                          </span>
                        ) : (
                          'Аккаунт не привязан. Нажмите «Редактировать», чтобы указать никнейм.'
                        )}
                      </p>
                    </div>
                  </div>

                  {profile?.chess_username && (
                    <button
                      type="button"
                      onClick={() =>
                        handleViewMyGames(
                          profile.chess_username!,
                          profile.chess_platform || 'chesscom',
                        )
                      }
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                        isChessCom
                          ? 'bg-[#81b64c] hover:bg-[#74a643] border-[#81b64c]'
                          : 'bg-[#3692e7] hover:bg-[#2b7ecc] border-[#3692e7]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Анализировать мои партии</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Ratings Grid (if stats loaded) */}
                {stats && (
                  <div className="pt-2 border-t border-zinc-800/80">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-[#161512] border border-zinc-800 rounded-xl p-3 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Блиц</span>
                        </div>
                        <span className="text-xl font-black text-white">
                          {stats.ratings.blitz ?? '—'}
                        </span>
                      </div>

                      <div className="bg-[#161512] border border-zinc-800 rounded-xl p-3 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Рапид</span>
                        </div>
                        <span className="text-xl font-black text-white">
                          {stats.ratings.rapid ?? '—'}
                        </span>
                      </div>

                      <div className="bg-[#161512] border border-zinc-800 rounded-xl p-3 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <Flame className="w-3.5 h-3.5 text-rose-400" />
                          <span>Пуля</span>
                        </div>
                        <span className="text-xl font-black text-white">
                          {stats.ratings.bullet ?? '—'}
                        </span>
                      </div>

                      <div className="bg-[#161512] border border-zinc-800 rounded-xl p-3 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Классика</span>
                        </div>
                        <span className="text-xl font-black text-white">
                          {stats.ratings.classical ?? '—'}
                        </span>
                      </div>
                    </div>

                    {/* Win / Draw / Loss Bar */}
                    {stats.record && (
                      <div className="mt-3 bg-[#161512] border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium">Баланс партий:</span>
                        <div className="flex items-center gap-4 font-mono font-bold">
                          <span className="text-emerald-400">+{stats.record.win}</span>
                          <span className="text-amber-400">={stats.record.draw}</span>
                          <span className="text-rose-400">-{stats.record.loss}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Groups & Coach Section */}
              <div
                className={`p-5 rounded-2xl border ${
                  isChessCom ? 'bg-[#191815] border-[#302e2b]' : 'bg-[#1c1a17] border-[#33312c]'
                } flex flex-col gap-4`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-amber-400" />
                    <span>Мои группы и тренер ({groups.length})</span>
                  </h4>
                </div>

                {/* Joined Groups List */}
                {groups.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className="p-3.5 rounded-xl bg-[#161512] border border-zinc-800 flex items-center justify-between gap-3 flex-wrap"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-white truncate">
                            {group.name}
                          </div>
                          <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>
                              Тренер:{' '}
                              <strong className="text-zinc-200">{group.trainerName}</strong>
                            </span>
                            {group.description && (
                              <span className="text-zinc-500">• {group.description}</span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleLeaveGroup(group.id)}
                          disabled={leavingGroupId === group.id}
                          className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 px-2.5 py-1 rounded-lg border border-rose-500/20 transition-all cursor-pointer"
                        >
                          {leavingGroupId === group.id ? 'Выхожу...' : 'Покинуть группу'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-zinc-500 bg-[#161512]/50 border border-zinc-800/60 rounded-xl p-4">
                    Вы пока не состоите ни в одной учебной группе. Введите инвайт-код от вашего тренера ниже, чтобы подключиться.
                  </div>
                )}

                {/* Join by Invite Code Form */}
                <form
                  onSubmit={handleJoinGroup}
                  className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2"
                >
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Вступить в группу по инвайт-коду тренера</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Введите 8-значный код (например, a8f12b3c)"
                      className="flex-1 bg-[#161512] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isJoiningGroup || !inviteCode.trim()}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      {isJoiningGroup ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Вступаю...</span>
                        </>
                      ) : (
                        <span>Вступить</span>
                      )}
                    </button>
                  </div>

                  {joinGroupSuccess && (
                    <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{joinGroupSuccess}</span>
                    </p>
                  )}
                  {joinGroupError && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{joinGroupError}</span>
                    </p>
                  )}
                </form>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`sticky bottom-0 z-10 flex items-center justify-between p-4 sm:p-6 border-t ${
            isChessCom ? 'bg-[#211f1c]/95 border-[#302e2b]' : 'bg-[#24221f]/95 border-[#33312c]'
          } backdrop-blur-md`}
        >
          <button
            type="button"
            onClick={async () => {
              onClose();
              await onSignOut();
            }}
            className="flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 px-3.5 py-2 rounded-xl border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Выйти из аккаунта</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-all cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
