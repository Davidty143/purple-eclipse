import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const middleware = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;

  // Skip static assets, public files, or OAuth-specific URLs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('/auth/callback') // Allow OAuth callback URLs
  ) {
    return NextResponse.next();
  }

  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, options);
        });
      }
    }
  });

  const { data, error } = await supabase.auth.getUser();

  if (data?.user) {
    const hasUsername = !!data.user.user_metadata?.username;

    // 🚫 If user is missing username and not already on /set-username, redirect them
    if (!hasUsername && pathname !== '/set-username') {
      return NextResponse.redirect(new URL('/set-username', request.url));
    }

    // ✅ If user has username or is already on /set-username, continue
    return supabaseResponse;
  }

  // Not logged in — let them go anywhere (including /set-username if public)
  return supabaseResponse;
};

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
