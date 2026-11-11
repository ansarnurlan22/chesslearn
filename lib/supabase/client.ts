"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://gpqtzrxxyaskanjhevzg.supabase.co";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_jhU8FAvKBk95E6yfr047sA_vCuOUvDd";

  return createBrowserClient(url, anonKey);
}
