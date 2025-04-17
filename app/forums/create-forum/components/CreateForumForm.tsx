'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function CreateForumForm() {
  const router = useRouter();
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

    // Client-side validation
    if (!formData.forum_name.trim()) {
      setErrors({ ...errors, forum_name: 'Forum name is required' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/create-forum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      router.push('/forums');
      router.refresh();
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
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Forum</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="forum_name">Forum Name *</Label>
            <Input id="forum_name" name="forum_name" value={formData.forum_name} onChange={handleChange} placeholder="Enter forum name" disabled={isSubmitting} />
            {errors.forum_name && <p className="text-sm font-medium text-destructive">{errors.forum_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="forum_description">Description</Label>
            <Textarea id="forum_description" name="forum_description" value={formData.forum_description} onChange={handleChange} placeholder="Describe the purpose of this forum" rows={4} disabled={isSubmitting} />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/forums')} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Forum'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
