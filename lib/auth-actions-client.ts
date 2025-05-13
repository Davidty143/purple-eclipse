// lib/client-auth.ts
'use client';

import { createClient } from '@/app/utils/supabase/client';

const supabase = createClient();

export async function signInWithGoogle(next: string = '/') {
  const redirectUrl = `${window.location.origin}/callback?next=${encodeURIComponent(next)}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl
    }
  });

  if (error) {
    console.error('Google sign-in error:', error.message);
  }
}
