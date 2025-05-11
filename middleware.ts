import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const middleware = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  let supabaseResponse = NextResponse.next({ request });

  // Log the pathname for debugging
  console.log(`Middleware triggered for: ${pathname}`);

  // Initialize Supabase client
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
    // Fetch user data from Supabase
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      // If error is 'Auth session missing', handle unauthenticated users
      if (error.message === 'Auth session missing!') {
        // If unauthenticated, allow access to all pages except /set-username
        if (pathname === '/set-username') {
          console.log('Unauthenticated user tried to access /set-username, redirecting to homepage');
          return NextResponse.redirect(new URL('/', request.url)); // Redirect to homepage (or login page)
        }
        return supabaseResponse; // Allow access to other pages
      } else {
        console.error('Error fetching user:', error.message);
        return NextResponse.redirect(new URL('/', request.url)); // Redirect to home in case of other errors
      }
    }

    if (data?.user) {
      const user = data.user;
      const hasUsername = !!user.user_metadata?.username;
      console.log('User metadata:', user.user_metadata);
      console.log('User has username:', hasUsername);

      // If the user is authenticated
      if (hasUsername) {
        // If the user has a username, allow access to all pages except /set-username
        if (pathname === '/set-username') {
          console.log('Redirecting to homepage because username is already set');
          return NextResponse.redirect(new URL('/', request.url)); // Redirect to homepage (or another page)
        }
      } else {
        // If the user is authenticated but does not have a username, ensure they go to /set-username
        if (pathname !== '/set-username') {
          console.log('Redirecting to /set-username because username is missing');
          return NextResponse.redirect(new URL('/set-username', request.url)); // Redirect to set-username page
        }
      }
    }
  } catch (error) {
    console.error('Error in Supabase auth.getUser():', error);
    return NextResponse.redirect(new URL('/', request.url)); // Redirect to homepage (or login page)
  }

  return supabaseResponse; // Proceed as normal if no issues
};

export const config = {
  matcher: ['/', '/set-username', '/dashboard', '/profile', '/other-page'] // Include all pages where this logic should apply
};
