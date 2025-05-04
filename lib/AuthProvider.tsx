// context/AuthProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js'; // Import the User type from Supabase
import { createClient } from '@/app/utils/supabase/client';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
}

interface AuthProviderProps {
  children: React.ReactNode;
  serverUser?: User | null; // Add serverUser prop
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children, serverUser = null }: AuthProviderProps) {
  const [state, setState] = useState<AuthContextValue>({
    user: serverUser, // Initialize with serverUser if provided
    isLoading: !serverUser // If we have serverUser, no initial loading
  });

  const supabase = createClient();

  useEffect(() => {
    // Skip if we already initialized with serverUser
    if (serverUser) return;

    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error
        } = await supabase.auth.getUser();
        setState({
          user: error ? null : user,
          isLoading: false
        });
      } catch (error) {
        setState({
          user: null,
          isLoading: false
        });
      }
    };

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setState({
        user: session?.user ?? null,
        isLoading: false
      });
    });

    checkAuth();

    return () => subscription?.unsubscribe();
  }, [serverUser, supabase.auth]); // Add supabase.auth to dependencies

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
