// app/(auth)/signup/components/SignUpOverlay.tsx
'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SignUpOverlayProps {
  onClose: () => void;
  onSuccess?: () => void;
  showLoginLink?: boolean;
  onOpenLogin?: () => void;
}

export function SignUpOverlay({ onClose, onSuccess, showLoginLink = true, onOpenLogin }: SignUpOverlayProps) {
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPasswordError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('password_confirm') as string;

    // Client-side validation
    if (password !== passwordConfirm) {
      setPasswordError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        setPasswordError(result.error || 'Signup failed');
      } else {
        setRegisteredEmail(email);
        setEmailSent(true);
      }
    } catch (error) {
      setPasswordError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="mx-auto w-[350px] sm:w-[400px] h-[500px] relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" aria-label="Close signup">
          ✕
        </button>
        <CardHeader>
          <CardTitle className="text-2xl text-center">VISCONN</CardTitle>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="h-full flex flex-col justify-center gap-4 text-center">
              <div className="text-green-500">
                <p className="font-medium">Confirmation email sent!</p>
                <p className="text-sm mt-2">Please check your inbox at:</p>
                <p className="font-medium">{registeredEmail}</p>
              </div>
              <div className="text-sm text-gray-600">Click the confirmation link to activate your account.</div>
              <Button onClick={onClose} className="w-full mt-4">
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="text-start text-sm font-semibold text-gray-900 pb-4">Signup</div>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-4">
                    <Input name="username" id="username" placeholder="Enter Username" required disabled={isLoading} />
                  </div>
                  <div className="grid">
                    <Input name="email" id="email" type="email" placeholder="Enter Email" required disabled={isLoading} />
                  </div>
                  <div className="grid">
                    <Input name="password" id="password" type="password" placeholder="Enter Password" required ref={passwordRef} disabled={isLoading} />
                  </div>
                  <div className="grid">
                    <Input name="password_confirm" id="password_confirm" type="password" placeholder="Re-enter Password" required ref={passwordConfirmRef} disabled={isLoading} />
                  </div>

                  {passwordError && <div className="text-red-500 text-sm mt-2">{passwordError}</div>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create an account'}
                  </Button>
                </div>
              </form>
              {showLoginLink && (
                <div className="mt-4 text-center text-sm">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLogin?.();
                    }}
                    className="underline hover:text-primary">
                    Sign in
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
