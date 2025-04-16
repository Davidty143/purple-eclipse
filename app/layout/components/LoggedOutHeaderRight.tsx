// layout/components/LoggedOutHeaderRight.tsx
'use client';
import { useState } from 'react';
import LoginButton from '@/components/LoginLogoutButton';
import Signup from '@/components/SignupButton';
import { LoginOverlay } from '@/app/(auth)/login/components/LoginOverlay';
import { SignUpOverlay } from '@/app/(auth)/signup/components/SignUpOverlay';

export default function LoggedOutHeaderRight() {
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [showSignUpOverlay, setShowSignUpOverlay] = useState(false);

  return (
    <div className="flex items-center gap-4">
      {/* Login Button */}
      <LoginButton onOpenLogin={() => setShowLoginOverlay(true)} />

      {/* Signup Button */}
      <Signup className="hidden sm:inline-flex" onOpenSignUp={() => setShowSignUpOverlay(true)} />

      {/* Login Overlay */}
      {showLoginOverlay && (
        <LoginOverlay
          onClose={() => setShowLoginOverlay(false)}
          onSuccess={() => setShowLoginOverlay(false)}
          onOpenSignUp={() => {
            setShowLoginOverlay(false);
            setShowSignUpOverlay(true);
          }}
        />
      )}

      {/* Signup Overlay */}
      {showSignUpOverlay && (
        <SignUpOverlay
          onClose={() => setShowSignUpOverlay(false)}
          onSuccess={() => setShowSignUpOverlay(false)}
          onOpenLogin={() => {
            setShowSignUpOverlay(false);
            setShowLoginOverlay(true);
          }}
        />
      )}
    </div>
  );
}
