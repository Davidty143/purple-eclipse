'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface DeleteForumDialogProps {
  children?: React.ReactNode;
  forumId: number;
  forumName: string;
  onSuccess?: () => void;
}

export function DeleteForumDialog({ children, forumId, forumName, onSuccess }: DeleteForumDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/forums/${forumId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete forum');
      }

      // Close dialog first
      setOpen(false);

      // Then trigger success actions
      onSuccess?.();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children || <Button variant="destructive">Delete</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Forum</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <p>
            Are you sure you want to delete <strong>{forumName}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">This action cannot be undone. All subforums will also be removed.</p>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Forum'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
