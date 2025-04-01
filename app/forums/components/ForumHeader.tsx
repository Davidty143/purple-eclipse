// components/forum-header.tsx
'use client';

import { Button } from '@/components/ui/button';

export function ForumHeader({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between border-t-2 pt-4 mt-2">
      <h2 className="text-lg font-semibold">Forums List</h2>
      <Button variant="outline" className="px-4 text-sm hover:bg-gray-100/80">
        Add Forum
      </Button>{' '}
    </div>
  );
}
