'use client';

import { Logo } from '@/components/logo';
import { createClient } from '@/lib/supabase/client';
import {
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  User,
  Users,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useCallback, useEffect, useState } from 'react';

type AuthTab = 'login' | 'register';
type UserRole = 'student' | 'trainer';

interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  general?: string;
}

function formatAuthError(msg?: string): string {
  if (!msg) return 'Произошла ошибка при авторизации';
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'Неверный email или пароль. Проверьте правильность ввода.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Email не подтверждён! Перейдите по ссылке в письме (проверьте папку «Спам») или отключите Confirm Email в панели Supabase.';
  }
  if (lower.includes('user already registered')) {
    return 'Пользователь с таким email уже зарегистрирован. Перейдите во вкладку «Вход».';
  }
  if (lower.includes('password should be')) {
    return 'Пароль должен содержать как минимум 6 символов.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Слишком много попыток. Пожалуйста, подождите минуту.';
  }
  if (lower.includes('recursion')) {
    return 'Ошибка базы данных (RLS рекурсия). Запустите обновлённый SQL-скрипт в Supabase SQL Editor.';
  }
  return msg;
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Введите email';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Некорректный email';
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return 'Введите пароль';
  if (password.length < 6) return 'Минимум 6 символов';
  return undefined;
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Show error from URL params (e.g. from callback redirect)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setErrors((prev) => ({ ...prev, general: urlError }));
    }
  }, [searchParams]);

  const clearMessages = useCallback(() => {
    setErrors({});
    setSuccessMessage(null);
  }, []);

  const handleTabSwitch = useCallback(
    (newTab: AuthTab) => {
      setTab(newTab);
      clearMessages();
    },
    [clearMessages],
  );

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    const newErrors: FormErrors = {};
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrors({ general: formatAuthError(error.message) });
      setLoading(false);
      return;
    }

    // Determine redirect based on user role
    const userRole = data.user?.user_metadata?.role as string | undefined;
    if (userRole === 'trainer') {
      router.push('/dashboard/trainer');
    } else {
      router.push('/');
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    const newErrors: FormErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Введите имя';
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role,
        },
      },
    });

    if (error) {
      setErrors({ general: formatAuthError(error.message) });
      setLoading(false);
      return;
    }

    if (data.session) {
      // If email confirmation is disabled, redirect immediately!
      const userRole = data.user?.user_metadata?.role as string | undefined;
      if (userRole === 'trainer') {
        router.push('/dashboard/trainer');
      } else {
        router.push('/');
      }
      return;
    }

    setSuccessMessage(
      'Регистрация успешна! Если на почту пришло письмо — подтвердите email, либо отключите «Confirm email» в настройках Supabase.',
    );
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <Logo size="lg" />
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-[#302e2b] bg-[#211f1c] p-8 shadow-2xl shadow-black/40">
        {/* Tab Switcher */}
        <div className="mb-8 flex rounded-2xl bg-[#161512] p-1">
          <button
            type="button"
            onClick={() => handleTabSwitch('login')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
              tab === 'login'
                ? 'bg-[#fbbf24] text-[#161512] shadow-lg shadow-[#fbbf24]/20'
                : 'text-[#c3c2c1] hover:text-white'
            }`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('register')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
              tab === 'register'
                ? 'bg-[#fbbf24] text-[#161512] shadow-lg shadow-[#fbbf24]/20'
                : 'text-[#c3c2c1] hover:text-white'
            }`}
          >
            Регистрация
          </button>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-sm text-emerald-400">
            {successMessage}
          </div>
        )}

        {/* General error */}
        {errors.general && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400">
            {errors.general}
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-medium text-[#c3c2c1]"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7672]" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border bg-[#161512] py-3 pl-11 pr-4 text-sm text-white placeholder-[#5a5754] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#fbbf24]/40 ${
                    errors.email
                      ? 'border-red-500/50'
                      : 'border-[#302e2b] hover:border-[#4a4744]'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-[#c3c2c1]"
              >
                Пароль
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7672]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-[#161512] py-3 pl-11 pr-11 text-sm text-white placeholder-[#5a5754] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#fbbf24]/40 ${
                    errors.password
                      ? 'border-red-500/50'
                      : 'border-[#302e2b] hover:border-[#4a4744]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7a7672] transition-colors hover:text-[#c3c2c1]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#fbbf24] py-3 text-sm font-bold text-[#161512] shadow-lg shadow-[#fbbf24]/20 transition-all duration-200 hover:bg-[#f5b620] hover:shadow-[#fbbf24]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="register-name"
                className="mb-1.5 block text-sm font-medium text-[#c3c2c1]"
              >
                Полное имя
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7672]" />
                <input
                  id="register-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Иван Петров"
                  className={`w-full rounded-xl border bg-[#161512] py-3 pl-11 pr-4 text-sm text-white placeholder-[#5a5754] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#fbbf24]/40 ${
                    errors.fullName
                      ? 'border-red-500/50'
                      : 'border-[#302e2b] hover:border-[#4a4744]'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-400">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
                className="mb-1.5 block text-sm font-medium text-[#c3c2c1]"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7672]" />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border bg-[#161512] py-3 pl-11 pr-4 text-sm text-white placeholder-[#5a5754] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#fbbf24]/40 ${
                    errors.email
                      ? 'border-red-500/50'
                      : 'border-[#302e2b] hover:border-[#4a4744]'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
                className="mb-1.5 block text-sm font-medium text-[#c3c2c1]"
              >
                Пароль
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7672]" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className={`w-full rounded-xl border bg-[#161512] py-3 pl-11 pr-11 text-sm text-white placeholder-[#5a5754] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#fbbf24]/40 ${
                    errors.password
                      ? 'border-red-500/50'
                      : 'border-[#302e2b] hover:border-[#4a4744]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7a7672] transition-colors hover:text-[#c3c2c1]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Role Selector */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#c3c2c1]">
                Я —
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all duration-200 ${
                    role === 'student'
                      ? 'border-[#fbbf24]/50 bg-[#fbbf24]/10 text-[#fbbf24] shadow-lg shadow-[#fbbf24]/10'
                      : 'border-[#302e2b] bg-[#161512] text-[#c3c2c1] hover:border-[#4a4744] hover:text-white'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Ученик
                </button>
                <button
                  type="button"
                  onClick={() => setRole('trainer')}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all duration-200 ${
                    role === 'trainer'
                      ? 'border-[#fbbf24]/50 bg-[#fbbf24]/10 text-[#fbbf24] shadow-lg shadow-[#fbbf24]/10'
                      : 'border-[#302e2b] bg-[#161512] text-[#c3c2c1] hover:border-[#4a4744] hover:text-white'
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  Тренер
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#fbbf24] py-3 text-sm font-bold text-[#161512] shadow-lg shadow-[#fbbf24]/20 transition-all duration-200 hover:bg-[#f5b620] hover:shadow-[#fbbf24]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Создание...' : 'Создать аккаунт'}
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#7a7672]">
          {tab === 'login' ? (
            <>
              Нет аккаунта?{' '}
              <button
                type="button"
                onClick={() => handleTabSwitch('register')}
                className="text-[#fbbf24] transition-colors hover:text-[#f5b620] hover:underline"
              >
                Зарегистрироваться
              </button>
            </>
          ) : (
            <>
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                className="text-[#fbbf24] transition-colors hover:text-[#f5b620] hover:underline"
              >
                Войти
              </button>
            </>
          )}
        </p>
      </div>

      {/* Subtle branding footer */}
      <p className="mt-6 text-center text-xs text-[#5a5754]">
        © {new Date().getFullYear()} ChessCheese. Умный анализ шахматных партий.
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#fbbf24]" />
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
