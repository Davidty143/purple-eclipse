'use client';

import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { CreateSubforumDialog } from './CreateSubforumDialog';
import { DeleteForumDialog } from './DeleteForumDialog';
import { EditForumDialog } from './EditForumDialog';
import { useEffect, useState } from 'react';

interface ForumTitleProps {
  title: string;
  forumId: number;
  showActions?: boolean;
  onAddSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onEditSuccess?: () => void;
  description?: string;
  refreshData?: () => Promise<void>; // Optional data refresh function
}

export function ForumTitle({ title, forumId, showActions = true, onAddSuccess, onDeleteSuccess, onEditSuccess, description = '', refreshData }: ForumTitleProps) {
  const [currentDescription, setCurrentDescription] = useState(description);

  // Optionally refresh description when parent data changes
  useEffect(() => {
    setCurrentDescription(description);
  }, [description]);

  const handleEditSuccess = () => {
    onEditSuccess?.();
    refreshData?.();
  };

  return (
    <div className="flex items-center justify-between border py-4 px-6 rounded-lg bg-[#edf4f2]">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold">{title}</h1>
        {currentDescription && <p className="text-sm text-gray-500 mt-1">{currentDescription}</p>}
      </div>

      {showActions && (
        <div className="flex gap-1">
          <EditForumDialog forumId={forumId} currentName={title} currentDescription={currentDescription} onSuccess={handleEditSuccess}>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hover:bg-gray-200" aria-label="Edit forum">
              <Edit className="h-4 w-4" />
            </Button>
          </EditForumDialog>

          <DeleteForumDialog forumId={forumId} forumName={title} onSuccess={onDeleteSuccess}>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hover:bg-gray-200" aria-label="Delete forum">
              <Trash className="h-4 w-4" />
            </Button>
          </DeleteForumDialog>

          <CreateSubforumDialog parentId={forumId} parentName={title} onSuccess={onAddSuccess}>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hover:bg-gray-200" aria-label="Add subforum">
              <Plus className="h-4 w-4" />
            </Button>
          </CreateSubforumDialog>
        </div>
      )}
    </div>
  );
}
