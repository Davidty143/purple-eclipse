// (auth)/login/components/SignInWithGoogleButton.tsx
'use client';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/auth-actions';
import React from 'react';
import { FcGoogle } from 'react-icons/fc'; // ✅ Colored Google icon

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
    <Button type="button" variant="outline" className="w-full h-12 rounded-2xl text-sm border border-gray-300 text-gray-800 !text-left px-4 flex items-center gap-3" onClick={handleClick}>
      <FcGoogle className="w-5 h-5" /> {/* ✅ Icon on the left */}
      Continue with Google
    </Button>
  );
};

export default SignInWithGoogleButton;
