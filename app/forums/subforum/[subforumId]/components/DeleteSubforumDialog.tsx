'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteSubforumDialogProps {
  subforumId: number;
  subforumName: string;
  onSuccess?: () => void;
}

export function DeleteSubforumDialog({ subforumId, subforumName, onSuccess }: DeleteSubforumDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/subforums/${subforumId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete subforum');
      }

      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to delete subforum');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white hover:text-[#267858]" aria-label="Delete subforum">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md z-[60]">
        <DialogHeader>
          <DialogTitle>Delete Subforum</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p>
            Are you sure you want to delete the subforum <strong>{subforumName}</strong>? This action cannot be undone.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
