'use client';
import { useState } from 'react';
import { LoginOverlay } from '@/app/(auth)/login/components/LoginOverlay';
import { SignUpOverlay } from '@/app/(auth)/signup/components/SignUpOverlay';
import { ResetPasswordOverlay } from '@/app/(auth)/reset-password/components/ResetPasswordForm';
import { Button } from '@/components/ui/button';
import { MdOutlineLogin } from 'react-icons/md';

export default function LoggedOutHeaderRight() {
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [showSignUpOverlay, setShowSignUpOverlay] = useState(false);
  const [showResetPasswordOverlay, setShowResetPasswordOverlay] = useState(false);

  return (
    <div className="flex items-center gap-4 bg-green-200">
      {/* Login Button */}
      <Button variant="default" onClick={() => setShowLoginOverlay(true)} className="focus:outline-none focus:ring-0 text-white">
        <MdOutlineLogin className="text-lg mr-2" />
        <span>Login</span>
      </Button>

      {/* Signup Button */}
      <Button variant="outline" onClick={() => setShowSignUpOverlay(true)} className="hidden sm:inline-flex focus:outline-none focus:ring-0">
        <MdOutlineLogin className="text-lg mr-2" />
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
