import { createServerClient } from '@supabase/ssr';

export async function createClientForServer() {
  console.log('CALLED CREATE CLIENT SERVER');
  const { cookies } = await import('next/headers');

  // Await the cookies promise
  const cookieStore = await cookies();

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll(); // Safe to call getAll() after awaiting cookies
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options); // Set cookies using the cookieStore
          });
        } catch (error) {
          console.error('Error setting cookies:', error);
        }
      }
    }
  });

  return supabase;
}
