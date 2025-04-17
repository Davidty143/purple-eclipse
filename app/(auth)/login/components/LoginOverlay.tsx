// app/(auth)/login/components/LoginOverlay.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/auth-actions';
import { createClient } from '@/utils/supabase/client';
import SignInWithGoogleButton from './SignInWithGoogleButton';

interface LoginOverlayProps {
  onClose: () => void;
  onSuccess?: () => void;
  showSignUpLink?: boolean;
  onOpenSignUp?: () => void;
  onOpenResetPassword?: () => void;
}

export function LoginOverlay({ onClose, onSuccess, showSignUpLink = true, onOpenSignUp, onOpenResetPassword }: LoginOverlayProps) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('emailOrUsername', emailOrUsername);
    formData.append('password', password);

    try {
      const result = await login(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        onSuccess ? onSuccess() : onClose();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="mx-auto w-[350px] sm:w-[400px] h-[500px] sm-h-[600px] relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" aria-label="Close login">
          ✕
        </button>
        <CardHeader>
          <CardTitle className="text-2xl text-center font-semibold">VISCONN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-start text-sm font-semibold text-gray-900 pb-4">Login</div>
          <SignInWithGoogleButton />
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2 mt-4">
                <Input id="emailOrUsername" name="emailOrUsername" type="text" placeholder="Enter email or username" className="text-sm" required value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} disabled={isLoading} />
              </div>
              <div className="grid">
                <Input id="password" name="password" type="password" className="text-sm" placeholder="Enter password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenResetPassword?.();
                  }}
                  className="ml-auto inline-block text-xs underline p-2 hover:text-primary">
                  Forgot your password?
                </button>
              </div>

              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Login'}
              </Button>
            </div>
          </form>
          {showSignUpLink && (
            <div className="mt-4 text-center text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSignUp?.();
                }}
                className="underline hover:text-primary">
                Sign up
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
