import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClientForServer() {
  const cookieStore = await cookies(); // Await the cookies() Promise

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll(); // Now it's safe to call getAll() on the resolved cookieStore
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options); // Set cookies using the cookieStore
            });
          } catch (error) {
            console.error("Error setting cookies:", error);
          }
        },
      },
    }
  );
}
