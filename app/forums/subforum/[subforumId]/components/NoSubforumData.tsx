// components/NoSubforumData.tsx
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface NoSubforumDataProps {
  error?: string;
}

export function NoSubforumData({ error }: NoSubforumDataProps) {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold mb-2">{error ? 'Error Loading Subforum' : 'Subforum Not Found'}</h2>
      <p className="text-gray-600 mb-6">{error || "The requested subforum doesn't exist or has no content yet."}</p>
      <Button asChild>
        <Link href="/forums">Back to Forums</Link>
      </Button>
    </div>
  );
}
