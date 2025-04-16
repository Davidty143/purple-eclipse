// app/(auth)/signup/components/SignUpOverlay.tsx
'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { signup } from '@/lib/auth-actions';
import { createClient } from '@/utils/supabase/client';

interface SignUpOverlayProps {
  onClose: () => void;
  onSuccess?: () => void;
  showLoginLink?: boolean;
  onOpenLogin?: () => void; // New prop for opening login overlay
}

export function SignUpOverlay({ onClose, onSuccess, showLoginLink = true, onOpenLogin }: SignUpOverlayProps) {
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPasswordError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('password_confirm') as string;

    // Client-side validation
    if (password !== passwordConfirm) {
      setPasswordError('Passwords do not match.');
      passwordRef.current && (passwordRef.current.value = '');
      passwordConfirmRef.current && (passwordConfirmRef.current.value = '');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      passwordRef.current && (passwordRef.current.value = '');
      passwordConfirmRef.current && (passwordConfirmRef.current.value = '');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signup(formData);

      if (error) {
        setPasswordError(error);
      } else {
        onSuccess ? onSuccess() : onClose();
        // Refresh user state
        supabase.auth.getUser().then(({ data: { user } }) => {
          // Optional: Handle user state update if needed
        });
      }
    } catch (error) {
      setPasswordError('An unexpected error occurred.');
      console.error('Signup error:', error);
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
                onClick={() => {
                  onClose();
                  onOpenLogin?.();
                }}
                className="underline hover:text-primary">
                Sign in
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
