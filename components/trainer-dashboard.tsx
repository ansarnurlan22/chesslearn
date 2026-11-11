'use client';

import {
  addGroupMemberAction,
  createGroupAction,
  deleteGroupAction,
  getAllProfilesAction,
  getGroupMembersAction,
  getStudentStatsAction,
  removeGroupMemberAction,
  updateUserRoleAction,
  deleteUserProfileAction,
} from '@/lib/api/trainer-actions';
import type { UnifiedPlayerProfile } from '@/lib/api/types';
import type {
  ChessPlatform,
  GroupMemberWithProfile,
  GroupWithMemberCount,
  Profile,
  UserRole,
} from '@/types/auth';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Database,
  ExternalLink,
  Flame,
  Globe,
  GraduationCap,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Shield,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';

interface TrainerDashboardProps {
  initialGroups: GroupWithMemberCount[];
  profile: Profile | null;
}

export function TrainerDashboard({ initialGroups, profile }: TrainerDashboardProps) {
  const [groups, setGroups] = useState<GroupWithMemberCount[]>(initialGroups);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    initialGroups[0]?.id ?? null,
  );
  const [membersMap, setMembersMap] = useState<Record<string, GroupMemberWithProfile[]>>({});
  const [statsMap, setStatsMap] = useState<Record<string, UnifiedPlayerProfile>>({});
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
  const [loadingStatsFor, setLoadingStatsFor] = useState<string | null>(null);

  // Group creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Add student form state
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPlatform, setStudentPlatform] = useState<ChessPlatform>('chesscom');
  const [addStudentError, setAddStudentError] = useState<string | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Tab switcher: 'groups' | 'users'
  const [activeTab, setActiveTab] = useState<'groups' | 'users'>('groups');
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'trainer' | 'student'>('all');

  // Copy status
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedShareText, setCopiedShareText] = useState(false);

  // Current selected group
  const activeGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  // Fetch members for the selected group
  const loadGroupMembers = useCallback(async (groupId: string) => {
    setLoadingMembers(true);
    const res = await getGroupMembersAction(groupId);
    if (res.success) {
      setMembersMap((prev) => ({ ...prev, [groupId]: res.members }));
    }
    setLoadingMembers(false);
  }, []);

  useEffect(() => {
    if (selectedGroupId && !membersMap[selectedGroupId]) {
      loadGroupMembers(selectedGroupId);
    }
  }, [selectedGroupId, membersMap, loadGroupMembers]);

  // Aggregate stats
  const totalStudents = useMemo(() => {
    const allUsernames = new Set<string>();
    Object.values(membersMap).forEach((list) => {
      list.forEach((m) => allUsernames.add(`${m.chess_platform}:${m.chess_username.toLowerCase()}`));
    });
    // Fallback if not all groups loaded yet
    const sum = groups.reduce((acc, g) => acc + (g.member_count || 0), 0);
    return Math.max(allUsernames.size, sum);
  }, [membersMap, groups]);

  // Copy helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCopyWhatsAppInvite = (groupName: string, inviteCode: string) => {
    const text = `👋 Привет! Для разбора шахматных партий мы в группе "${groupName}" используем сервис ChessCheese 🧀\n\n1. Переходи по ссылке: https://chesscheese.kz/auth\n2. Регистрируйся и вводи код группы: ${inviteCode}\n3. Твои партии с Chess.com и Lichess будут автоматически анализироваться AI-тренером!\n\nРазбирай ошибки после каждой игры! ♟️`;
    navigator.clipboard.writeText(text);
    setCopiedShareText(true);
    setTimeout(() => setCopiedShareText(false), 3000);
  };

  // Create group
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setCreateError('Введите название группы');
      return;
    }
    setCreateError(null);

    startTransition(async () => {
      const res = await createGroupAction(newGroupName, newGroupDescription);
      if (res.success && res.group) {
        const newGroupWithCount: GroupWithMemberCount = {
          ...res.group,
          member_count: 0,
        };
        setGroups((prev) => [newGroupWithCount, ...prev]);
        setSelectedGroupId(res.group.id);
        setIsCreateModalOpen(false);
        setNewGroupName('');
        setNewGroupDescription('');
      } else {
        setCreateError(res.error || 'Ошибка при создании группы');
      }
    });
  };

  // Delete group
  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Вы действительно хотите удалить группу "${groupName}"?`)) {
      return;
    }
    const res = await deleteGroupAction(groupId);
    if (res.success) {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (selectedGroupId === groupId) {
        const remaining = groups.filter((g) => g.id !== groupId);
        setSelectedGroupId(remaining[0]?.id ?? null);
      }
    } else {
      alert(res.error || 'Не удалось удалить группу');
    }
  };

  // Add student to current group
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;
    const trimmed = studentUsername.trim();
    if (!trimmed) {
      setAddStudentError('Введите никнейм ученика');
      return;
    }
    setAddStudentError(null);
    setIsAddingStudent(true);

    const res = await addGroupMemberAction(selectedGroupId, trimmed, studentPlatform);
    if (res.success && res.member) {
      // Reload members
      await loadGroupMembers(selectedGroupId);
      setGroups((prev) =>
        prev.map((g) => (g.id === selectedGroupId ? { ...g, member_count: g.member_count + 1 } : g)),
      );
      setStudentUsername('');
    } else {
      setAddStudentError(res.error || 'Ошибка при добавлении');
    }
    setIsAddingStudent(false);
  };

  // Remove student
  const handleRemoveStudent = async (memberId: string, username: string) => {
    if (!confirm(`Убрать ученика @${username} из группы?`)) return;
    const res = await removeGroupMemberAction(memberId);
    if (res.success && selectedGroupId) {
      setMembersMap((prev) => ({
        ...prev,
        [selectedGroupId]: (prev[selectedGroupId] || []).filter((m) => m.id !== memberId),
      }));
      setGroups((prev) =>
        prev.map((g) => (g.id === selectedGroupId ? { ...g, member_count: Math.max(0, g.member_count - 1) } : g)),
      );
    } else {
      alert(res.error || 'Не удалось удалить');
    }
  };

  // Load student stats lazily
  const handleLoadStudentStats = async (username: string, platform: ChessPlatform) => {
    const key = `${platform}:${username.toLowerCase()}`;
    if (statsMap[key]) return;
    setLoadingStatsFor(key);
    const res = await getStudentStatsAction(username, platform);
    if (res.success && res.profile) {
      setStatsMap((prev) => ({ ...prev, [key]: res.profile! }));
    }
    setLoadingStatsFor(null);
  };

  // Load all platform users
  const loadAllUsers = useCallback(async () => {
    setLoadingUsers(true);
    const res = await getAllProfilesAction();
    if (res.success) {
      setAllUsers(res.profiles);
    }
    setLoadingUsers(false);
  }, []);

  // Change user role
  const handleToggleRole = async (targetUser: Profile) => {
    const newRole: UserRole = targetUser.role === 'trainer' ? 'student' : 'trainer';
    const roleName = newRole === 'trainer' ? 'Тренер' : 'Ученик';
    if (!confirm(`Изменить роль пользователя "${targetUser.full_name || targetUser.email}" на "${roleName}"?`)) {
      return;
    }
    const res = await updateUserRoleAction(targetUser.id, newRole);
    if (res.success) {
      setAllUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u)),
      );
    } else {
      alert(res.error || 'Не удалось обновить роль');
    }
  };

  // Delete user profile
  const handleDeleteUser = async (targetUser: Profile) => {
    if (!confirm(`Удалить профиль пользователя "${targetUser.full_name || targetUser.email}"?`)) {
      return;
    }
    const res = await deleteUserProfileAction(targetUser.id);
    if (res.success) {
      setAllUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
    } else {
      alert(res.error || 'Не удалось удалить');
    }
  };

  // Filtered users for the management table
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      // Role filter
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      // Search query
      if (!userSearchQuery.trim()) return true;
      const q = userSearchQuery.toLowerCase();
      return (
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.chess_username?.toLowerCase().includes(q)
      );
    });
  }, [allUsers, userRoleFilter, userSearchQuery]);

  const currentMembers = selectedGroupId ? membersMap[selectedGroupId] ?? [] : [];

  return (
    <div className="w-full flex flex-col gap-8 pb-20">
      {/* Welcome & Top Stats Banner */}
      <section className="bg-gradient-to-br from-[#211f1c] to-[#191815] border border-[#302e2b] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#302e2b]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Тренерская панель
              </span>
              <span className="text-xs text-[#8b8987]">г. Астана</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {profile?.full_name ? `Тренер: ${profile.full_name}` : 'Шахматная студия'}
            </h1>
            <p className="text-sm text-[#c3c2c1] mt-1 max-w-xl">
              Управляйте группами учеников, контролируйте домашние разборы партий и отслеживайте прогресс в реальном времени.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#fbbf24] hover:bg-[#f59e0b] text-zinc-950 font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Создать группу</span>
          </button>
        </div>

        {/* Counters & Goal Tracker */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          {/* Card 1: Groups */}
          <div className="bg-[#191815] border border-[#302e2b] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#3692e7]/10 border border-[#3692e7]/20 flex items-center justify-center text-[#3692e7] shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">{groups.length}</div>
              <div className="text-xs text-[#8b8987] font-medium">Активных групп</div>
            </div>
          </div>

          {/* Card 2: Students */}
          <div className="bg-[#191815] border border-[#302e2b] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#81b64c]/10 border border-[#81b64c]/20 flex items-center justify-center text-[#81b64c] shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">{totalStudents}</div>
              <div className="text-xs text-[#8b8987] font-medium">Учеников в группах</div>
            </div>
          </div>

          {/* Card 3: Platforms */}
          <div className="bg-[#191815] border border-[#302e2b] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center text-[#fbbf24] shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-white">Lichess + Chess.com</div>
              <div className="text-xs text-[#8b8987] font-medium">Синхронизация партий</div>
            </div>
          </div>
        </div>
      </section>

      {/* View Switcher: Groups vs All Users Table */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#211f1c] border border-[#302e2b] shadow-sm w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('groups')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'groups'
                ? 'bg-[#fbbf24] text-zinc-950 shadow-md font-black'
                : 'text-[#8b8987] hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Мои группы ({groups.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('users');
              if (allUsers.length === 0) {
                loadAllUsers();
              }
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#fbbf24] text-zinc-950 shadow-md font-black'
                : 'text-[#8b8987] hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>База всех пользователей {allUsers.length > 0 && `(${allUsers.length})`}</span>
          </button>
        </div>

        {activeTab === 'users' && (
          <button
            type="button"
            onClick={loadAllUsers}
            disabled={loadingUsers}
            className="flex items-center gap-2 text-xs text-[#c3c2c1] hover:text-white bg-[#211f1c] hover:bg-[#262421] border border-[#302e2b] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin text-[#fbbf24]' : ''}`} />
            <span>Обновить</span>
          </button>
        )}
      </div>

      {activeTab === 'groups' ? (
        /* Main Grid: Left = Groups List, Right = Selected Group Members */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Groups List */}
          <section className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#fbbf24]" />
                <h2 className="text-base font-bold text-white tracking-tight">Ваши группы</h2>
              </div>
              <span className="text-xs text-[#8b8987] font-mono">
                {groups.length} {groups.length === 1 ? 'группа' : 'групп'}
              </span>
            </div>

            {groups.length === 0 ? (
              <div className="bg-[#211f1c] border border-[#302e2b] rounded-2xl p-8 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#191815] border border-[#302e2b] flex items-center justify-center text-[#8b8987]">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white">Нет созданных групп</p>
                <p className="text-xs text-[#8b8987] max-w-xs leading-relaxed">
                  Создайте первую группу для своей секции или клуба в Астане и начните добавлять учеников.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#fbbf24] text-zinc-950 font-bold text-xs transition-all hover:bg-[#f59e0b]"
                >
                  + Создать группу
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {groups.map((group) => {
                  const isSelected = group.id === selectedGroupId;
                  return (
                    <div
                      key={group.id}
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                        isSelected
                          ? 'bg-[#262421] border-[#fbbf24] ring-1 ring-[#fbbf24]/50'
                          : 'bg-[#211f1c] border-[#302e2b] hover:bg-[#262421]/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-white truncate">{group.name}</h3>
                          {group.description && (
                            <p className="text-xs text-[#8b8987] truncate mt-0.5">{group.description}</p>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#191815] text-[#fbbf24] border border-[#302e2b] shrink-0">
                          {group.member_count} уч.
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#302e2b]/80">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8b8987]">
                          <span>Код:</span>
                          <code className="text-[#fbbf24] bg-[#191815] px-1.5 py-0.5 rounded border border-[#302e2b]">
                            {group.invite_code}
                          </code>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(group.invite_code);
                            }}
                            className="p-1 hover:text-white transition-colors"
                            title="Скопировать код"
                          >
                            {copiedCode === group.invite_code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(group.id, group.name);
                            }}
                            className="p-1 text-[#8b8987] hover:text-rose-400 transition-colors"
                            title="Удалить группу"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#fbbf24] translate-x-0.5' : 'text-[#8b8987]'}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Right Column: Group Details & Students Management */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            {activeGroup ? (
              <>
                {/* Group Banner & Invite Widget */}
                <div className="bg-[#211f1c] border border-[#302e2b] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#302e2b]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-white">{activeGroup.name}</h2>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] font-semibold">
                          {activeGroup.member_count} учеников
                        </span>
                      </div>
                      {activeGroup.description && (
                        <p className="text-xs sm:text-sm text-[#8b8987] mt-1">{activeGroup.description}</p>
                      )}
                    </div>

                    {/* Share to WhatsApp Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyWhatsAppInvite(activeGroup.name, activeGroup.invite_code)}
                      className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-xs font-bold transition-all cursor-pointer shrink-0"
                      title="Скопировать готовое приглашение для WhatsApp группы"
                    >
                      {copiedShareText ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Скопировано в буфер!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Пригласить в WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Invite Code Bar */}
                  <div className="bg-[#191815] border border-[#302e2b] rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#8b8987]">Инвайт-код для учеников:</span>
                      <span className="font-mono text-sm font-bold text-[#fbbf24] bg-[#211f1c] px-2.5 py-1 rounded-lg border border-[#302e2b] select-all">
                        {activeGroup.invite_code}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(activeGroup.invite_code)}
                      className="flex items-center gap-1.5 text-xs text-[#c3c2c1] hover:text-white transition-colors"
                    >
                      {copiedCode === activeGroup.invite_code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Скопировано</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Скопировать код</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Add Student Quick Form */}
                  <form onSubmit={handleAddStudent} className="flex flex-col gap-3 pt-2">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-[#fbbf24]" />
                      Добавить ученика по никнейму
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        <input
                          type="text"
                          value={studentUsername}
                          onChange={(e) => setStudentUsername(e.target.value)}
                          placeholder="Никнейм на Chess.com или Lichess..."
                          className="w-full bg-[#191815] border border-[#302e2b] focus:border-[#fbbf24] text-white placeholder:text-zinc-500 rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm outline-none transition-all"
                        />
                      </div>

                      <div className="flex gap-1.5 bg-[#191815] border border-[#302e2b] p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setStudentPlatform('chesscom')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            studentPlatform === 'chesscom'
                              ? 'bg-[#81b64c] text-white font-bold'
                              : 'text-[#8b8987] hover:text-white'
                          }`}
                        >
                          Chess.com
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentPlatform('lichess')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            studentPlatform === 'lichess'
                              ? 'bg-[#3692e7] text-white font-bold'
                              : 'text-[#8b8987] hover:text-white'
                          }`}
                        >
                          Lichess
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isAddingStudent || !studentUsername.trim()}
                        className="px-4 py-2.5 rounded-xl bg-[#fbbf24] hover:bg-[#f59e0b] disabled:opacity-50 text-zinc-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {isAddingStudent ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        )}
                        <span>Добавить</span>
                      </button>
                    </div>

                    {addStudentError && (
                      <p className="text-xs text-rose-400 mt-1">{addStudentError}</p>
                    )}
                  </form>
                </div>

                {/* Members List */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Ученики в группе</span>
                      <span className="text-xs text-[#8b8987] font-mono font-normal">
                        ({currentMembers.length})
                      </span>
                    </h3>
                  </div>

                  {loadingMembers ? (
                    <div className="bg-[#211f1c] border border-[#302e2b] rounded-2xl p-10 flex flex-col items-center justify-center gap-2 text-zinc-500">
                      <Loader2 className="w-6 h-6 animate-spin text-[#fbbf24]" />
                      <span className="text-xs">Загрузка списка учеников...</span>
                    </div>
                  ) : currentMembers.length === 0 ? (
                    <div className="bg-[#211f1c] border border-[#302e2b] rounded-2xl p-10 text-center flex flex-col items-center gap-2">
                      <User className="w-8 h-8 text-[#8b8987]" />
                      <p className="text-sm font-semibold text-white">В этой группе пока нет учеников</p>
                      <p className="text-xs text-[#8b8987] max-w-sm">
                        Добавьте их по никнейму выше или скопируйте инвайт-код для WhatsApp чата с родителями.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {currentMembers.map((member) => {
                        const statKey = `${member.chess_platform}:${member.chess_username.toLowerCase()}`;
                        const cachedStats = statsMap[statKey];
                        const isLoadingThis = loadingStatsFor === statKey;

                        return (
                          <div
                            key={member.id}
                            className="bg-[#211f1c] border border-[#302e2b] hover:border-[#383531] rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            {/* Student Info */}
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-[#191815] border border-[#302e2b] flex items-center justify-center font-bold text-[#fbbf24] text-base shrink-0">
                                {member.chess_username.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-white truncate">
                                    {member.profiles?.full_name || member.chess_username}
                                  </span>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                                      member.chess_platform === 'chesscom'
                                        ? 'border-[#81b64c]/40 bg-[#81b64c]/15 text-[#81b64c]'
                                        : 'border-[#3692e7]/40 bg-[#3692e7]/15 text-[#3692e7]'
                                    }`}
                                  >
                                    {member.chess_platform === 'chesscom' ? 'Chess.com' : 'Lichess'}
                                  </span>
                                </div>
                                <p className="text-xs text-[#8b8987] font-mono mt-0.5">
                                  @{member.chess_username}
                                </p>
                              </div>
                            </div>

                            {/* Ratings and Actions */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#302e2b]">
                              {/* Live ratings display */}
                              {cachedStats ? (
                                <div className="flex items-center gap-2 text-xs font-mono">
                                  {cachedStats.ratings.rapid && (
                                    <span className="flex items-center gap-1 bg-[#191815] px-2 py-1 rounded-lg border border-[#302e2b] text-[#c3c2c1]" title="Рейтинг Rapid">
                                      <Clock className="w-3 h-3 text-[#3692e7]" />
                                      {cachedStats.ratings.rapid}
                                    </span>
                                  )}
                                  {cachedStats.ratings.blitz && (
                                    <span className="flex items-center gap-1 bg-[#191815] px-2 py-1 rounded-lg border border-[#302e2b] text-[#c3c2c1]" title="Рейтинг Blitz">
                                      <Zap className="w-3 h-3 text-amber-400" />
                                      {cachedStats.ratings.blitz}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleLoadStudentStats(member.chess_username, member.chess_platform)}
                                  disabled={isLoadingThis}
                                  className="text-[11px] text-[#8b8987] hover:text-[#fbbf24] px-2 py-1 rounded-lg border border-[#302e2b] bg-[#191815] hover:bg-[#211f1c] transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  {isLoadingThis ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-[#fbbf24]" />
                                  ) : (
                                    <Sparkles className="w-3 h-3 text-[#fbbf24]" />
                                  )}
                                  <span>Рейтинг</span>
                                </button>
                              )}

                              {/* Direct Analysis Link */}
                              <Link
                                href={`/?u=${encodeURIComponent(member.chess_username)}&p=${member.chess_platform}`}
                                target="_blank"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#81b64c]/10 hover:bg-[#81b64c]/20 border border-[#81b64c]/30 text-[#81b64c] hover:text-emerald-300 text-xs font-bold transition-all shadow-sm"
                                title="Открыть партии ученика для анализа"
                              >
                                <span>Анализ партий</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>

                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveStudent(member.id, member.chess_username)}
                                className="p-1.5 rounded-lg text-[#8b8987] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Удалить из группы"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-[#211f1c] border border-[#302e2b] rounded-3xl p-16 text-center flex flex-col items-center gap-3">
                <Users className="w-12 h-12 text-[#8b8987]" />
                <p className="text-base font-bold text-white">Выберите группу</p>
                <p className="text-xs text-[#8b8987] max-w-sm">
                  Выберите существующую группу слева или создайте новую для добавления учеников.
                </p>
              </div>
            )}
          </section>
        </div>
      ) : (
        /* Full Platform Users Table View */
        <div className="bg-[#211f1c] border border-[#302e2b] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          {/* Header row & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#302e2b]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">Все зарегистрированные пользователи</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] font-semibold">
                  {allUsers.length} пользователей
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#8b8987] mt-1">
                Просмотр всех аккаунтов платформы ChessCheese, смена ролей (ученик/тренер) и переход к партиям.
              </p>
            </div>

            {/* Role Filter tabs */}
            <div className="flex items-center gap-1.5 bg-[#191815] border border-[#302e2b] p-1 rounded-xl self-start md:self-auto">
              <button
                type="button"
                onClick={() => setUserRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  userRoleFilter === 'all'
                    ? 'bg-[#fbbf24] text-zinc-950 font-bold'
                    : 'text-[#8b8987] hover:text-white'
                }`}
              >
                Все ({allUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('trainer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  userRoleFilter === 'trainer'
                    ? 'bg-[#fbbf24] text-zinc-950 font-bold'
                    : 'text-[#8b8987] hover:text-white'
                }`}
              >
                Тренеры ({allUsers.filter((u) => u.role === 'trainer').length})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('student')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  userRoleFilter === 'student'
                    ? 'bg-[#fbbf24] text-zinc-950 font-bold'
                    : 'text-[#8b8987] hover:text-white'
                }`}
              >
                Ученики ({allUsers.filter((u) => u.role === 'student').length})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Поиск по имени, email или шахматному никнейму..."
              className="w-full bg-[#191815] border border-[#302e2b] focus:border-[#fbbf24] text-white placeholder:text-zinc-500 rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm outline-none transition-all"
            />
          </div>

          {/* Table Container */}
          {loadingUsers ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-7 h-7 animate-spin text-[#fbbf24]" />
              <span className="text-sm">Загрузка базы пользователей...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center bg-[#191815] border border-[#302e2b] rounded-2xl flex flex-col items-center gap-2">
              <User className="w-8 h-8 text-[#8b8987]" />
              <p className="text-sm font-semibold text-white">
                {allUsers.length === 0
                  ? 'Пока нет зарегистрированных пользователей'
                  : 'Пользователи не найдены по вашему запросу'}
              </p>
              <p className="text-xs text-[#8b8987] max-w-sm">
                Как только ученики или тренеры регистрируются на сайте, они моментально отображаются в этой таблице.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#302e2b]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#191815] text-[#8b8987] uppercase text-[11px] font-bold border-b border-[#302e2b]">
                  <tr>
                    <th className="py-3 px-4">Пользователь</th>
                    <th className="py-3 px-4">Роль</th>
                    <th className="py-3 px-4">Шахматный профиль</th>
                    <th className="py-3 px-4">Дата регистрации</th>
                    <th className="py-3 px-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#302e2b] bg-[#211f1c]">
                  {filteredUsers.map((u) => {
                    const isTrainer = u.role === 'trainer';
                    const initials = (u.full_name || u.email || 'U').charAt(0).toUpperCase();

                    return (
                      <tr key={u.id} className="hover:bg-[#262421] transition-colors">
                        {/* Name & Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#191815] border border-[#302e2b] flex items-center justify-center font-bold text-[#fbbf24] shrink-0 text-sm">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate max-w-[180px]">
                                {u.full_name || 'Без имени'}
                              </p>
                              <p className="text-[11px] text-[#8b8987] font-mono truncate max-w-[180px]">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role & Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleRole(u)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                              isTrainer
                                ? 'bg-[#fbbf24]/10 border-[#fbbf24]/30 text-[#fbbf24] hover:bg-[#fbbf24]/20'
                                : 'bg-[#3692e7]/10 border-[#3692e7]/30 text-[#3692e7] hover:bg-[#3692e7]/20'
                            }`}
                            title="Нажмите, чтобы сменить роль (Тренер / Ученик)"
                          >
                            {isTrainer ? (
                              <GraduationCap className="w-3.5 h-3.5" />
                            ) : (
                              <User className="w-3.5 h-3.5" />
                            )}
                            <span>{isTrainer ? 'Тренер' : 'Ученик'}</span>
                            <span className="text-[10px] text-zinc-500 underline ml-0.5">сменить</span>
                          </button>
                        </td>

                        {/* Chess Profile */}
                        <td className="py-3.5 px-4">
                          {u.chess_username ? (
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                                  u.chess_platform === 'chesscom'
                                    ? 'border-[#81b64c]/40 bg-[#81b64c]/15 text-[#81b64c]'
                                    : 'border-[#3692e7]/40 bg-[#3692e7]/15 text-[#3692e7]'
                                }`}
                              >
                                {u.chess_platform === 'chesscom' ? 'Chess.com' : 'Lichess'}
                              </span>
                              <span className="font-mono text-white text-xs">
                                @{u.chess_username}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#8b8987] text-xs italic">Не привязан</span>
                          )}
                        </td>

                        {/* Registered Date */}
                        <td className="py-3.5 px-4 font-mono text-xs text-[#8b8987]">
                          {u.created_at
                            ? new Date(u.created_at).toLocaleDateString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.chess_username && (
                              <Link
                                href={`/?u=${encodeURIComponent(u.chess_username)}&p=${u.chess_platform || 'chesscom'}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#81b64c]/10 hover:bg-[#81b64c]/20 border border-[#81b64c]/30 text-[#81b64c] text-xs font-semibold transition-all"
                                title="Открыть партии пользователя"
                              >
                                <span>Партии</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg text-[#8b8987] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Удалить пользователя"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Group */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#211f1c] border border-[#302e2b] w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#302e2b]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#fbbf24]" />
                <h3 className="font-extrabold text-lg text-white">Новая группа учеников</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#8b8987] hover:text-white text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#c3c2c1]">
                  Название группы *
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Например: ЦШК Астана — Разрядники (10-12 лет)"
                  className="bg-[#191815] border border-[#302e2b] focus:border-[#fbbf24] text-white placeholder:text-zinc-500 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#c3c2c1]">
                  Описание (необязательно)
                </label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Расписание, дни тренировок или заметки для группы..."
                  rows={3}
                  className="bg-[#191815] border border-[#302e2b] focus:border-[#fbbf24] text-white placeholder:text-zinc-500 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all resize-none"
                />
              </div>

              {createError && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                  {createError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#302e2b]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-[#8b8987] hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isPending || !newGroupName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#fbbf24] hover:bg-[#f59e0b] disabled:opacity-50 text-zinc-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Создать группу</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
