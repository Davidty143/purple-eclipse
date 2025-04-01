// components/forum-title.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';

interface ForumTitleProps {
  title: string;
  showActions?: boolean;
  onAdd?: () => void; // New prop for add action
}

export function ForumTitle({ title, showActions = true, onAdd }: ForumTitleProps) {
  const handleEdit = () => console.log('Edit clicked');
  const handleDelete = () => console.log('Delete clicked');
  const handleAdd = () => {
    console.log('Add clicked');
    onAdd?.(); // Call the onAdd callback if provided
  };

  return (
    <div className="flex items-center justify-between border-2 py-4 px-6 rounded-lg bg-gray-50">
      <h1 className="text-lg font-semibold">{title}</h1>

      {showActions && (
        <div className="flex">
          <Button variant="ghost" size="icon" onClick={handleEdit} className="text-gray-500 hover:text-gray-700 hover:bg-gray-200">
            <Edit className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-gray-500 hover:text-gray-700 hover:bg-gray-200">
            <Trash className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleAdd} className="text-gray-500 hover:text-gray-700 hover:bg-gray-200">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
