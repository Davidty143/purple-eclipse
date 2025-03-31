'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function CreateSubforumForm({ forumId }: { forumId: number }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subforum_name: '',
    subforum_description: '',
    forum_id: forumId
  });
  const [errors, setErrors] = useState({
    subforum_name: '',
    subforum_description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Client-side validation
    if (!formData.subforum_name.trim()) {
      setErrors({ ...errors, subforum_name: 'Subforum name is required' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/subforums', {
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

      router.push(`/forums/${forumId}`);
      router.refresh();
    } catch (error: any) {
      setErrors({
        ...errors,
        subforum_name: error.message || 'Failed to create subforum'
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
        <CardTitle className="text-2xl">Create New Subforum</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subforum_name">Subforum Name *</Label>
            <Input id="subforum_name" name="subforum_name" value={formData.subforum_name} onChange={handleChange} placeholder="Enter subforum name" disabled={isSubmitting} />
            {errors.subforum_name && <p className="text-sm font-medium text-destructive">{errors.subforum_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subforum_description">Description</Label>
            <Textarea id="subforum_description" name="subforum_description" value={formData.subforum_description} onChange={handleChange} placeholder="Describe the purpose of this subforum" rows={4} disabled={isSubmitting} />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push(`/forums/${forumId}`)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Subforum'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
