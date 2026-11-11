'use client';

import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  /** If set, only allow users with this role through */
  requiredRole?: 'student' | 'trainer';
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/auth');
      return;
    }

    if (requiredRole && profile && profile.role !== requiredRole) {
      // Wrong role — redirect to appropriate dashboard
      if (profile.role === 'trainer') {
        router.push('/dashboard/trainer');
      } else {
        router.push('/');
      }
    }
  }, [user, profile, loading, requiredRole, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#161512]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#fbbf24]" />
          <p className="text-sm text-[#7a7672]">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && profile && profile.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
