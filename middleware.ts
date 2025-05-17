import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Define the protected routes that should be accessible only by authenticated users
const protectedRoutes = ['/dashboard', '/admin/settings', '/protected'];

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
  if (isProtectedRoute && sessionError) {
    console.log('User is not authenticated, redirecting to login page.');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is authenticated, check their status
  if (session) {
    const { data: account, error: accountError } = await supabase.from('Account').select('account_status, restriction_end_date, restriction_reason').eq('account_id', session.user.id).single();

    if (!accountError && account) {
      console.log('Account status check:', {
        accountId: session.user.id,
        status: account.account_status,
        endDate: account.restriction_end_date,
        currentDate: new Date().toISOString()
      });

      // Handle banned users
      if (account.account_status === 'BANNED') {
        return NextResponse.redirect(new URL('/banned', request.url));
      }

      // Handle restricted users
      if (account.account_status === 'RESTRICTED') {
        // Only update status if restriction has expired AND there is an end date
        if (account.restriction_end_date) {
          // Convert both dates to UTC to ensure proper comparison
          const endDate = new Date(account.restriction_end_date);
          const currentDate = new Date();

          // Set both dates to midnight UTC for date-only comparison
          const endDateUTC = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
          const currentDateUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));

          console.log('Date comparison:', {
            endDate: endDateUTC.toISOString(),
            currentDate: currentDateUTC.toISOString(),
            isExpired: endDateUTC < currentDateUTC
          });

          if (endDateUTC < currentDateUTC) {
            console.log('Restriction expired, updating status to ACTIVE');
            // Restriction has expired, update status to ACTIVE and clear restriction data
            await supabase
              .from('Account')
              .update({
                account_status: 'ACTIVE',
                restriction_reason: null,
                restriction_date: null,
                restriction_end_date: null,
                restriction_notes: null,
                restricted_by: null
              })
              .eq('account_id', session.user.id);
          } else {
            console.log('Restriction still active, keeping status as RESTRICTED');
          }
        } else {
          console.log('No end date set, keeping indefinite restriction');
        }
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
