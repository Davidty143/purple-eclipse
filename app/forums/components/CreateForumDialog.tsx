// components/CreateForumDialog.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CreateForumDialogProps {
  onSuccess?: () => void;
}

export function CreateForumDialog({ onSuccess }: CreateForumDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    forum_name: '',
    forum_description: ''
  });
  const [errors, setErrors] = useState({
    forum_name: '',
    forum_description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.forum_name.trim()) {
      setErrors({ ...errors, forum_name: 'Forum name is required' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/create-forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      setOpen(false);
      setFormData({ forum_name: '', forum_description: '' });
      onSuccess?.();
    } catch (error: any) {
      setErrors({
        ...errors,
        forum_name: error.message || 'Failed to create forum'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Forum</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Forum</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="forum_name">Forum Name *</Label>
            <Input id="forum_name" name="forum_name" value={formData.forum_name} onChange={handleChange} placeholder="Enter forum name" />
            {errors.forum_name && <p className="text-sm text-destructive">{errors.forum_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="forum_description">Description</Label>
            <Textarea id="forum_description" name="forum_description" value={formData.forum_description} onChange={handleChange} placeholder="Describe the purpose of this forum" rows={4} />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Forum'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
