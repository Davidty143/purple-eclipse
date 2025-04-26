// (auth)/login/components/SignInWithGoogleButton.tsx
'use client';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/auth-actions';
import React from 'react';

interface SignInWithGoogleButtonProps {
  onSuccess?: () => void;
}

const SignInWithGoogleButton = ({ onSuccess }: SignInWithGoogleButtonProps) => {
  const handleClick = async () => {
    try {
      await signInWithGoogle();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  return (
    <Button type="button" variant="outline" className="w-full text-sm text-gray-800 !text-left" onClick={handleClick}>
      Continue with Google
    </Button>
  );
};

export default SignInWithGoogleButton;
