// app/(auth)/reset-password/components/ResetPasswordOverlay.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { sendResetPasswordEmail } from '@/lib/auth-actions';

interface ResetPasswordOverlayProps {
  onClose: () => void;
  onOpenLogin?: () => void;
}

export const ResetPasswordOverlay = ({ onClose, onOpenLogin }: ResetPasswordOverlayProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Prevent default form submission
      const formData = new FormData();
      formData.append('email', email);

      // Use fetch API to prevent page reload
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccessMessage(result.success);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <Card className="mx-auto w-[350px] sm:w-[400px] relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" aria-label="Close reset password">
          ✕
        </button>
        <CardHeader>
          <CardTitle className="text-2xl text-center font-semibold">VISCONN</CardTitle>
        </CardHeader>
        <CardContent>
          {successMessage ? (
            <div className="space-y-4 text-center">
              <div className="text-green-500 py-4">{successMessage}</div>
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="text-start text-sm font-semibold text-gray-900 pb-4">Reset Password</div>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Input name="email" type="email" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                  </div>

                  {error && <div className="text-red-500 text-sm">{error}</div>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Email'}
                  </Button>
                </div>
              </form>
              <div className="mt-4 text-center text-sm">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogin?.();
                  }}
                  className="underline hover:text-primary">
                  Login
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
