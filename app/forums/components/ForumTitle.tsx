// components/ForumTitle.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { CreateSubforumDialog } from './CreateSubforumDialog';
import { DeleteForumDialog } from './DeleteForumDialog';

interface ForumTitleProps {
  title: string;
  forumId: number;
  showActions?: boolean;
  onEdit?: () => void;
  onAddSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function ForumTitle({ title, forumId, showActions = true, onEdit = () => console.log('Edit clicked'), onAddSuccess, onDeleteSuccess }: ForumTitleProps) {
  return (
    <div className="flex items-center justify-between border-2 py-4 px-6 rounded-lg bg-gray-50">
      <h1 className="text-lg font-semibold">{title}</h1>

      {showActions && (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} className="text-gray-500 hover:text-gray-700 hover:bg-gray-200">
            <Edit className="h-4 w-4" />
          </Button>

          <DeleteForumDialog forumId={forumId} forumName={title} onSuccess={onDeleteSuccess}>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hover:bg-gray-200">
              <Trash className="h-4 w-4" />
            </Button>
          </DeleteForumDialog>

          <CreateSubforumDialog parentId={forumId} parentName={title} onSuccess={onAddSuccess}>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hover:bg-gray-200">
              <Plus className="h-4 w-4" />
            </Button>
          </CreateSubforumDialog>
        </div>
      )}
    </div>
  );
}
