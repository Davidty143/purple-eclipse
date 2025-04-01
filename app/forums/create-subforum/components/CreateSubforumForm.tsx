'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Forum {
  id: number;
  name: string;
}

interface CreateSubforumFormProps {
  parentId?: number; // Add this interface for props
}

export default function CreateSubforumForm({ parentId }: CreateSubforumFormProps) {
  // Accept the prop
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    forum_id: parentId ? parentId.toString() : '' // Initialize with parentId if provided
  });
  const [forums, setForums] = useState<Forum[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const response = await fetch('/api/get-forums');
        if (!response.ok) throw new Error('Failed to fetch forums');
        const data = await response.json();
        setForums(data);

        // If parentId is provided, verify it exists in the fetched forums
        if (parentId) {
          const parentExists = data.some((forum: Forum) => forum.id === parentId);
          if (!parentExists) {
            setError('The specified parent forum does not exist');
          }
        }
      } catch (err) {
        console.error('Fetch forums error:', err);
        setError('Failed to load forums. Please refresh the page.');
      }
    };
    fetchForums();
  }, [parentId]); // Add parentId to dependency array

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.forum_id) {
      setError('Please select a parent forum');
      return;
    }
    if (!formData.name.trim()) {
      setError('Subforum name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/subforums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subforum_name: formData.name.trim(),
          subforum_description: formData.description.trim(),
          forum_id: Number(formData.forum_id) // Ensure it's a number
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create subforum');
      }

      router.push('/forums');
      router.refresh();
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to create subforum. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Subforum</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="forum_id">Parent Forum *</Label>
            <Select
              onValueChange={(value) => setFormData({ ...formData, forum_id: value })}
              value={formData.forum_id}
              required
              disabled={!!parentId} // Disable if parentId is provided
            >
              <SelectTrigger>
                <SelectValue placeholder={parentId ? 'Parent forum is pre-selected' : 'Select a forum'} />
              </SelectTrigger>
              {!parentId && ( // Only show dropdown if no parentId
                <SelectContent>
                  {forums.map((forum) => (
                    <SelectItem key={forum.id} value={forum.id.toString()}>
                      {forum.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              )}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Subforum Name *</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter subforum name" required disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe this subforum" rows={3} disabled={isSubmitting} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push('/forums')} disabled={isSubmitting}>
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
