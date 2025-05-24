import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Define the protected routes that should be accessible only by authenticated users
const protectedRoutes = ['/dashboard', '/admin/settings', '/protected', '/login', '/set-username', '/register', '/signup', '/post-thread', '/profile', '/notifications', '/messages'];

// Define routes that are accessible even when restricted
const allowedRestrictedRoutes = ['/profile', '/settings'];

/**
 * Middleware function to handle session management and route protection
 * @param {NextRequest} request
 */
export const middleware = async (request: NextRequest) => {
  // Initialize the response object
  let supabaseResponse = NextResponse.next({
    request
  });

  // Create Supabase client with cookie management
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

  // Get the requested route path
  const pathname = request.nextUrl.pathname;

  // Check if the route is one of the protected routes
  const isProtectedRoute = protectedRoutes.includes(pathname);

  // Fetch the user session using Supabase
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  // If the user is not authenticated and trying to access a protected route, redirect them
  if (isProtectedRoute && !session) {
    console.log('User is not authenticated, redirecting to login page.');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If the user is authenticated, check their status
  if (session) {
    const { data: account, error: accountError } = await supabase.from('Account').select('account_status').eq('account_id', session.user.id).single();

    if (!accountError && account) {
      // Handle banned users
      if (account.account_status === 'BANNED') {
        return NextResponse.redirect(new URL('/banned', request.url));
      }
    }

    // If the user is authenticated but needs to set their username,
    // redirect them to the set-username page, but only if they're not already on it.
    if (!session.user.user_metadata?.username && pathname !== '/set-username') {
      console.log('User needs to set a username, redirecting to set-username page.');
      return NextResponse.redirect(new URL('/set-username', request.url));
    }
  }

  return supabaseResponse;
};

// Configuration to match all routes except for static assets and others
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};

// import { createServerClient } from "@supabase/ssr";
// import { NextResponse, type NextRequest } from "next/server";

// // Define the protected routes that should be accessible only by authenticated users
// const protectedRoutes = ["/dashboard", "/admin/settings", "/protected"];

// /**
//  * Middleware function to handle session management and route protection
//  * @param {NextRequest} request
//  */
// export const middleware = async (request: NextRequest) => {
//   // Initialize the response object
//   let supabaseResponse = NextResponse.next({
//     request,
//   });

//   // Create Supabase client with cookie management
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) => {
//             request.cookies.set(name, value);
//             supabaseResponse.cookies.set(name, value, options);
//           });
//         },
//       },
//     }
//   );

//   // Get the requested route path
//   const pathname = request.nextUrl.pathname;

//   // Check if the route is one of the protected routes
//   const isProtectedRoute = protectedRoutes.includes(pathname);

//   // Fetch the user session using Supabase
//   const { data, error } = await supabase.auth.getUser();

//   // If the user is not authenticated and trying to access a protected route, redirect them
//   if (isProtectedRoute && error) {
//     console.log("User is not authenticated, redirecting to login page.");
//     return NextResponse.redirect(new URL("/login", request.url)); // Redirect to the login page
//   }

//   // Return the response with updated cookies
//   return supabaseResponse;
// };

// // Configuration to match all routes except for static assets and others
// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// };
