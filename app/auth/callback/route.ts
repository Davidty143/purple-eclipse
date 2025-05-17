import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // After successful login, check and update account status
    try {
      const response = await fetch(`${requestUrl.origin}/api/account-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to check account status:', await response.text());
      }
    } catch (error) {
      console.error('Error checking account status:', error);
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
