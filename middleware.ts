import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const middleware = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, options);
        });
      }
    }
  });

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      if (error.message === 'Auth session missing!') {
        if (pathname === '/set-username') {
          return NextResponse.redirect(new URL('/', request.url));
        }
        return supabaseResponse;
      } else {
        console.error('Error fetching user:', error.message);
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    if (data?.user) {
      const user = data.user;
      const hasUsername = !!user.user_metadata?.username;

      if (hasUsername) {
        if (pathname === '/set-username') {
          return NextResponse.redirect(new URL('/', request.url));
        }
      } else {
        if (pathname !== '/set-username') {
          return NextResponse.redirect(new URL('/set-username', request.url));
        }
      }
    }
  } catch (error) {
    console.error('Error in Supabase auth.getUser():', error);
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
};

export const config = {
  matcher: ['/', '/set-username', '/dashboard', '/profile', '/other-page'] // Include all pages where this logic should apply
};
