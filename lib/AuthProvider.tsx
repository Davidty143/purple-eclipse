// context/AuthProvider.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface AuthContextValue {
  user: any;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextValue>({
    user: null,
    isLoading: true,
  });
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        setState({
          user: error ? null : user,
          isLoading: false,
        });
      } catch (error) {
        setState({
          user: null,
          isLoading: false,
        });
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setState({
        user: session?.user ?? null,
        isLoading: false,
      });
    });

    checkAuth();

    return () => subscription?.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
