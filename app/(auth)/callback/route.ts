// app/(auth)/callback/route.ts
import { NextResponse } from 'next/server';
import { createClientForServer } from '@/app/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    console.error('No code received during OAuth.');
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const supabase = await createClientForServer();

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error during code exchange:', error.message);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    const session = data?.session;

    if (session) {
      // Redirect to /auth/sync and pass the intended "next" page
      const redirectUrl = `${origin}/sync?next=${encodeURIComponent(next)}`;

      return NextResponse.redirect(redirectUrl);
    } else {
      console.error('No session found after code exchange.');
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  } catch (error) {
    console.error('Error during code exchange handling:', error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }
}
