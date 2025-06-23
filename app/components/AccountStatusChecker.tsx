'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';

export function AccountStatusChecker() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    const checkAccountStatus = async () => {
      try {
        const response = await fetch('/api/account-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to check account status');
        }

        const data = await response.json();

        // If status was updated to ACTIVE, refresh the page to update UI
        if (data.status === 'ACTIVE' && data.message === 'Account restriction has been lifted') {
          router.refresh();
        }
      } catch (error) {}
    };

    // Check immediately when component mounts
    checkAccountStatus();

    // Then check every 5 minutes
    const interval = setInterval(checkAccountStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [router, user, isLoading]);

  // This component doesn't render anything
  return null;
}
