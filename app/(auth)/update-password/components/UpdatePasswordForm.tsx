'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updatePassword } from '@/lib/auth-actions';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export const UpdatePasswordForm = () => {
  const [state, formAction, isPending] = useActionState(updatePassword, {
    error: '',
    success: ''
  });

  const { error, success } = state;
  const router = useRouter();

  // Redirect on success
  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => router.push('/'), 1000);
      return () => clearTimeout(timeout);
    }
  }, [success, router]);

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <Card className="mx-auto w-[350px] sm:w-[400px] h-[500px] sm:h-[540px] relative shadow-lg rounded-xl">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg" aria-label="Close">
          ✕
        </button>

        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-[#267858]">VISCONN</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-start text-sm font-semibold text-gray-900 pb-4">Update Password</div>

          <form action={formAction}>
            <div className="grid gap-4">
              <div className="flex items-center gap-3 h-12 border border-gray-300 rounded-2xl px-4 bg-white focus-within:ring-2 focus-within:ring-[#267858] transition">
                <Lock className="text-gray-400 w-5 h-5" />
                <input name="password" type="password" placeholder="Enter new password" className="flex-1 bg-transparent outline-none text-sm" required disabled={isPending} />
              </div>

              <div className="flex items-center gap-3 h-12 border border-gray-300 rounded-2xl px-4 bg-white focus-within:ring-2 focus-within:ring-[#267858] transition">
                <Lock className="text-gray-400 w-5 h-5" />
                <input name="confirmPassword" type="password" placeholder="Confirm new password" className="flex-1 bg-transparent outline-none text-sm" required disabled={isPending} />
              </div>

              <div className="text-xs text-muted-foreground mt-1">
                Password must contain:
                <ul className="list-disc pl-4">
                  <li>Minimum 8 characters</li>
                  <li>At least 1 uppercase letter</li>
                  <li>At least 1 number</li>
                </ul>
              </div>

              {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
              {success && <div className="text-green-500 text-sm mt-1">{success}</div>}

              <Button type="submit" className="w-full h-12 text-base rounded-2xl bg-[#267858] hover:bg-[#1f5e4a] transition text-white" disabled={isPending}>
                {isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
