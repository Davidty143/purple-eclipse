// components/forum-title.tsx
'use client';

import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash } from 'lucide-react';

interface ForumTitleProps {
  title: string;
  showActions?: boolean;
}

export function ForumTitle({ title, showActions = true }: ForumTitleProps) {
  const handleEdit = () => console.log('Edit clicked');
  const handleDelete = () => console.log('Delete clicked');
  const handleMore = () => console.log('More options clicked');

  return (
    <div className="flex items-center border-2 py-4 px-6 rounded-lg">
      <h1 className="text-lg font-semibold ">{title}</h1>

      {showActions && (
        <div className="flex gap-0">
          <Button variant="ghost" size="icon" onClick={handleEdit} className="ml-2 text-gray-500 hover:text-gray-700">
            <Edit className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-gray-500 hover:text-gray-700">
            <Trash className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleMore} className="text-gray-500 hover:text-gray-700">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
