'use client';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { signout } from '@/lib/auth-actions';
import { AiOutlineUserAdd } from 'react-icons/ai';
import { LoginOverlay } from '@/app/(auth)/login/components/LoginOverlay';

const LoginButton = () => {
  const [user, setUser] = useState<any>(null);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  if (user) {
    return (
      <Button
        onClick={async () => {
          await signout();
          setUser(null);
        }}>
        Log out
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={() => setShowLoginOverlay(true)} className="focus:outline-none focus:ring-0 focus:border-none !outline-none !ring-0 !border-none">
        <AiOutlineUserAdd className="text-xl mr-2" />
        <span>Login</span>
      </Button>

      {showLoginOverlay && (
        <LoginOverlay
          onClose={() => setShowLoginOverlay(false)}
          onSuccess={() => {
            setShowLoginOverlay(false);
            // Refresh user state
            supabase.auth.getUser().then(({ data: { user } }) => {
              setUser(user);
            });
          }}
        />
      )}
    </>
  );
};

export default LoginButton;
