'use client';

import { Logo } from '@/components/logo';
import { StudentProfileModal } from '@/components/student-profile-modal';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft, GraduationCap, Loader2, LogIn, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161512] flex flex-col items-center justify-center gap-3 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#81b64c]" />
        <span className="text-sm">Загрузка профиля...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#161512] text-white flex flex-col">
        <header className="h-16 border-b border-[#302e2b] flex items-center px-6">
          <Link href="/">
            <Logo size="md" />
          </Link>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#211f1c] border border-[#302e2b] flex items-center justify-center text-zinc-400 mb-4">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black mb-2">Требуется вход</h1>
          <p className="text-sm text-zinc-400 mb-6">
            Чтобы просматривать личный кабинет ученика, свои группы и статистику, войдите в аккаунт.
          </p>
          <Link
            href="/auth"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#81b64c] hover:bg-[#74a643] text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            <span>Войти или зарегистрироваться</span>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161512] text-white flex flex-col">
      <header className="h-16 border-b border-[#302e2b] flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold">
            Личный кабинет
          </span>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-[#302e2b] bg-[#211f1c] hover:bg-[#262421] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>На главную</span>
        </Link>
      </header>

      <StudentProfileModal
        isOpen={isModalOpen}
        onClose={() => router.push('/')}
        onSignOut={async () => {
          await signOut();
          router.push('/');
        }}
        platformTheme={profile?.chess_platform === 'lichess' ? 'lichess' : 'chesscom'}
      />
    </div>
  );
}
