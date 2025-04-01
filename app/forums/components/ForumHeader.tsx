// components/forum-header.tsx
'use client';

import { Button } from '@/components/ui/button';
import { CreateForumDialog } from './CreateForumDialog'; // Adjust path as needed

export function ForumHeader() {
  return (
    <div className="flex items-center justify-between border-t-2 pt-4 mt-2">
      <h2 className="text-lg font-semibold">Forums List</h2>
      <CreateForumDialog />
    </div>
  );
}
