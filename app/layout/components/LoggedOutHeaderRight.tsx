'use client';
import { useState } from 'react';
import { LoginOverlay } from '@/app/(auth)/login/components/LoginOverlay';
import { SignUpOverlay } from '@/app/(auth)/signup/components/SignUpOverlay';
import { ResetPasswordOverlay } from '@/app/(auth)/reset-password/components/ResetPasswordForm';
import { Button } from '@/components/ui/button';
import { MdOutlineLogin } from 'react-icons/md';
import { AiOutlineUserAdd } from 'react-icons/ai';

export default function LoggedOutHeaderRight() {
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [showSignUpOverlay, setShowSignUpOverlay] = useState(false);
  const [showResetPasswordOverlay, setShowResetPasswordOverlay] = useState(false);

  return (
    <div className="flex items-center gap-4">
      {/* Login Button */}
      <Button variant="default" onClick={() => setShowLoginOverlay(true)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#267858] text-white bg-[#267858] hover:bg-[#1f5c47] hover:opacity-90 active:bg-[#1f5c47] font-medium py-2 px-4 rounded-lg transition-colors duration-300 ease-in-out flex items-center gap-2">
        <MdOutlineLogin className="text-lg" />
        <span>Login</span>
      </Button>

      {/* Signup Button with Outlined Icon */}
      <Button variant="outline" onClick={() => setShowSignUpOverlay(true)} className="hidden sm:inline-flex focus:outline-none focus:ring-2 focus:ring-[#267858] focus:ring-offset-2 text-[#267858] hover:bg-[#267858] hover:text-white hover:opacity-90 active:bg-[#1f5c47] active:text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 ease-in-out flex items-center gap-2">
        <AiOutlineUserAdd className="text-lg" />
        <span>Register</span>
      </Button>

      {/* Login Overlay */}
      {showLoginOverlay && (
        <LoginOverlay
          onClose={() => setShowLoginOverlay(false)}
          onSuccess={() => {
            setShowLoginOverlay(false);
            window.location.reload();
          }}
          onOpenSignUp={() => {
            setShowLoginOverlay(false);
            setShowSignUpOverlay(true);
          }}
          onOpenResetPassword={() => {
            setShowLoginOverlay(false);
            setShowResetPasswordOverlay(true);
          }}
        />
      )}

      {/* Signup Overlay */}
      {showSignUpOverlay && (
        <SignUpOverlay
          onClose={() => setShowSignUpOverlay(false)}
          onSuccess={() => {
            setShowSignUpOverlay(false);
            window.location.reload();
          }}
          onOpenLogin={() => {
            setShowSignUpOverlay(false);
            setShowLoginOverlay(true);
          }}
        />
      )}

      {/* Reset Password Overlay */}
      {showResetPasswordOverlay && (
        <ResetPasswordOverlay
          onClose={() => setShowResetPasswordOverlay(false)}
          onOpenLogin={() => {
            setShowResetPasswordOverlay(false);
            setShowLoginOverlay(true);
          }}
        />
      )}
    </div>
  );
}
