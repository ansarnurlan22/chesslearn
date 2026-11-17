import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') || '/';

  // Determine external origin (supports production domain chesscheese.site and localhost)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  // 1. Handle OAuth error returned by provider
  if (error) {
    const errorMsg = errorDescription || error || 'Ошибка авторизации через Google';
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorMsg)}`, origin),
    );
  }

  // 2. Exchange authorization code for session
  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('exchangeCodeForSession error:', exchangeError.message);
      return NextResponse.redirect(
        new URL(
          `/auth?error=${encodeURIComponent(exchangeError.message)}`,
          origin,
        ),
      );
    }

    // Safe redirect to next destination (ensure relative path to avoid open redirects)
    const safeNext = next.startsWith('/') ? next : '/';
    return NextResponse.redirect(new URL(safeNext, origin));
  }

  // 3. Fallback
  return NextResponse.redirect(new URL('/auth', origin));
}
