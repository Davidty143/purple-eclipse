'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/auth-actions';
import { createClient } from '@/utils/supabase/client';
import SignInWithGoogleButton from './SignInWithGoogleButton';
import { Mail, Lock } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <Card className="mx-auto w-[350px] sm:w-[400px] h-[500px] sm:h-[600px] relative shadow-lg rounded-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" aria-label="Close login">
          ✕
        </button>
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-[#267858] ">VISCONN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-start text-base font-semibold text-gray-900 pb-4">Login</div>

          <SignInWithGoogleButton />

          {/* OR Divider */}
          <div className="my-4 flex items-center text-gray-400 text-sm">
            <div className="flex-grow border-t border-gray-300" />
            <span className="mx-2">OR</span>
            <div className="flex-grow border-t border-gray-300" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              {/* Email / Username Input */}
              <div className="flex items-center gap-3 h-12 border border-gray-300 rounded-2xl px-4 bg-white focus-within:ring-2 focus-within:ring-[#267858] transition">
                <Mail className="text-gray-400 w-5 h-5" />
                <input id="emailOrUsername" name="emailOrUsername" type="text" placeholder="Enter email or username" className="flex-1 bg-transparent outline-none text-sm" required value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} disabled={isLoading} />
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 h-12 border border-gray-300 rounded-2xl px-4 bg-white focus-within:ring-2 focus-within:ring-[#267858] transition">
                  <Lock className="text-gray-400 w-5 h-5" />
                  <input id="password" name="password" type="password" placeholder="Enter password" className="flex-1 bg-transparent outline-none text-sm" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenResetPassword?.();
                  }}
                  className="ml-auto text-xs underline hover:text-[#267858] mt-1">
                  Forgot your password?
                </button>
              </div>

              {/* Error Message */}
              {error && <div className="text-red-500 text-sm mt-1">{error}</div>}

              {/* Submit Button */}
              <Button type="submit" className="w-full h-12 text-base rounded-2xl bg-[#267858] hover:bg-[#1f5e4a] transition text-white" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Login'}
              </Button>
            </div>
          </form>

          {/* Sign Up Link */}
          {showSignUpLink && (
            <div className="mt-4 text-center text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSignUp?.();
                }}
                className="underline hover:text-[#267858]">
                Sign up
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
