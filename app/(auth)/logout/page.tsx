// app/logout/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signout } from "@/lib/auth-actions";
import { useAuth } from "@/lib/AuthProvider";
import { createClient } from "@/utils/supabase/client";

const LogoutPage = () => {
  const router = useRouter();
  const auth = useAuth(); // Get the auth context
  const supabase = createClient();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await supabase.auth.signOut();
        auth.setUser(null);
        await signout();
        window.location.href = "/";
      } catch (error) {
        console.error("Logout failed:", error);
        router.replace("/");
      }
    };

    handleLogout();
  }, [auth, router]);

  return <div>Logging out...</div>;
};

export default LogoutPage;
