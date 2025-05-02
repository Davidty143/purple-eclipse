'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { CreateSubforumDialog } from './CreateSubforumDialog';
import { DeleteForumDialog } from './DeleteForumDialog';
import { EditForumDialog } from './EditForumDialog';

interface ForumTitleProps {
  title: string;
  forumId: number;
  showActions?: boolean;
  onAddSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onEditSuccess?: () => void;
  description?: string;
  refreshData?: () => Promise<void>;
}

export function ForumTitle({ title, forumId, showActions = true, onAddSuccess, onDeleteSuccess, onEditSuccess, description = '', refreshData }: ForumTitleProps) {
  const [currentDescription, setCurrentDescription] = useState(description);

  useEffect(() => {
    setCurrentDescription(description);
  }, [description]);

  const handleEditSuccess = () => {
    onEditSuccess?.();
    refreshData?.();
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-gray-300 py-4 px-6 rounded-lg bg-[#edf4f2] gap-4 sm:gap-0">
      {/* Left: Title, Tag, Description */}
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold">{title}</h1>
          <span className="px-2 py-0.5 text-xs font-semibold text-white bg-[#267858] rounded-full">Forum</span>
        </div>
        {currentDescription && <p className="text-sm text-gray-700 mt-1">{currentDescription}</p>}
      </div>

      {/* Right: Action Buttons */}
      {showActions && (
        <div className="flex gap-1 justify-start sm:justify-end">
          <EditForumDialog forumId={forumId} currentName={title} currentDescription={currentDescription} onSuccess={handleEditSuccess}>
            <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[#edf4f2] hover:bg-[#267858]" aria-label="Edit forum">
              <Edit className="h-4 w-4" />
            </Button>
          </EditForumDialog>

          <DeleteForumDialog forumId={forumId} forumName={title} onSuccess={onDeleteSuccess}>
            <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[#edf4f2] hover:bg-[#267858]" aria-label="Delete forum">
              <Trash className="h-4 w-4" />
            </Button>
          </DeleteForumDialog>

          <CreateSubforumDialog parentId={forumId} parentName={title} onSuccess={onAddSuccess}>
            <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[#edf4f2] hover:bg-[#267858]" aria-label="Add subforum">
              <Plus className="h-4 w-4" />
            </Button>
          </CreateSubforumDialog>
        </div>
      )}
    </div>
  );
}
