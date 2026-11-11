'use client';

import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import { GraduationCap, LogOut, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function TrainerNav() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#161512]/95 border-b border-[#302e2b] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size="md" />
          </Link>
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#302e2b]">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] text-xs font-bold tracking-tight">
              <GraduationCap className="w-3.5 h-3.5" />
              Панель тренера
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden md:flex items-center gap-1.5 text-xs text-[#c3c2c1] hover:text-white px-3 py-1.5 rounded-lg border border-[#302e2b] bg-[#211f1c] hover:bg-[#262421] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>К анализу партий</span>
          </Link>

          <Link
            href="/for-trainers"
            className="hidden sm:flex items-center gap-1.5 text-xs text-[#fbbf24] hover:text-[#f59e0b] px-3 py-1.5 rounded-lg border border-[#fbbf24]/30 bg-[#fbbf24]/5 hover:bg-[#fbbf24]/10 transition-all font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>О платформе</span>
          </Link>

          {user && (
            <div className="flex items-center gap-3 pl-2 sm:pl-3 sm:border-l border-[#302e2b]">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-[#8b8987] font-mono truncate max-w-[140px]">
                  {user.email}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 transition-all cursor-pointer"
                title="Выйти из аккаунта"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
