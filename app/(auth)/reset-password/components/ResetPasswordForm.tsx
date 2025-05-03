'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

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
      const formData = new FormData();
      formData.append('email', email);

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
      <Card className="mx-auto w-[350px] sm:w-[400px] h-[500px] sm:h-[600px] relative shadow-lg rounded-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" aria-label="Close reset password">
          ✕
        </button>
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-[#267858]">VISCONN</CardTitle>
        </CardHeader>
        <CardContent>
          {successMessage ? (
            <div className="h-full flex flex-col justify-center gap-4 text-center">
              <div className="text-green-500 text-sm font-medium">{successMessage}</div>
              <Button onClick={onClose} className="w-full mt-4 bg-[#267858] hover:bg-[#1f5e4a] text-white">
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="text-start text-sm font-semibold text-gray-900 pb-4">Reset Password</div>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 h-12 border border-gray-300 rounded-2xl px-4 bg-white focus-within:ring-2 focus-within:ring-[#267858] transition">
                    <Mail className="text-gray-400 w-5 h-5" />
                    <input name="email" type="email" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="flex-1 bg-transparent outline-none text-sm" />
                  </div>

                  {error && <div className="text-red-500 text-sm">{error}</div>}

                  <Button type="submit" className="w-full h-12 text-base rounded-2xl bg-[#267858] hover:bg-[#1f5e4a] transition text-white" disabled={isLoading}>
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
                  className="underline hover:text-[#267858]">
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
