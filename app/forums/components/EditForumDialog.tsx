'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface EditForumDialogProps {
  children?: React.ReactNode;
  forumId: number;
  currentName: string;
  currentDescription?: string;
  onSuccess?: () => void;
}

export function EditForumDialog({ children, forumId, currentName, currentDescription = '', onSuccess }: EditForumDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: currentName,
    description: currentDescription
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens or current props change
  useEffect(() => {
    if (open) {
      setFormData({
        name: currentName,
        description: currentDescription
      });
      setError('');
    }
  }, [open, currentName, currentDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Forum name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/edit-forum/${forumId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.error && (errorData.error.toLowerCase().includes('forum name is already taken') || errorData.error.toLowerCase().includes('duplicate') || errorData.error.toLowerCase().includes('unique'))) {
          throw new Error('Forum name is already taken (including deleted forums). Please choose another name.');
        }

        throw new Error(errorData.error || 'Failed to update forum');
      }

      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      // Fallback error message with custom message for unique name
      if (err.message === 'Failed to update forum') {
        setError('Failed to update forum. Please try again.');
      } else {
        setError(err.message || 'Failed to update forum');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Forum</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && <p className="text-sm text-destructive p-2 bg-destructive/10 rounded-md">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="forum-name">Forum Name *</Label>
            <Input id="forum-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter forum name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forum-description">Description</Label>
            <Textarea id="forum-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe this forum" rows={4} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#267858] hover:bg-[#267858] border-[#267858] text-white hover:bg-opacity-95">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
