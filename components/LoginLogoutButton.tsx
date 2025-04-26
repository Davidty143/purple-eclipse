// components/LoginLogoutButton.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { createClient } from '@/utils/supabase/client';
import { signout } from '@/lib/auth-actions';
import { AiOutlineUserAdd } from 'react-icons/ai';

interface LoginButtonProps {
  onOpenLogin?: () => void;
}

const LoginButton = ({ onOpenLogin }: LoginButtonProps) => {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
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
    <Button variant="outline" onClick={() => onOpenLogin?.()} className="focus:outline-none focus:ring-0 focus:border-none !outline-none !ring-0 !border-none">
      <AiOutlineUserAdd className="text-xl mr-2" />
      <span>Login</span>
    </Button>
  );
};

export default LoginButton;
