// app/auth/sync/page.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthSyncPage() {
  console.log('SYNC WORKING1');
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') ?? '/';

  useEffect(() => {
    // Refresh the page or navigate to the intended path
    window.location.href = next;
  }, [next]);

  return (
    <main style={{ textAlign: 'center', marginTop: '50px' }}>
      <p>Signing you in...</p>
    </main>
  );
}
