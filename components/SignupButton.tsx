// components/SignupButton.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { MdOutlineLogin } from 'react-icons/md';
import { createClient } from '@/app/utils/supabase/client';

interface SignupProps {
  className?: string;
  onOpenSignUp?: () => void;
}

const Signup: React.FC<SignupProps> = ({ className, onOpenSignUp }) => {
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
    return null;
  }

  return (
    <Button variant="outline" onClick={() => onOpenSignUp?.()} className={`focus:outline-none focus:ring-0 focus:border-none border-none ${className}`}>
      <MdOutlineLogin className="text-lg mr-2 border-none" />
      <span>Register</span>
    </Button>
  );
};

export default Signup;
