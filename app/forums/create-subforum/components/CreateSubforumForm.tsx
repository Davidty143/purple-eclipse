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

export default function CreateSubforumForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    forum_id: ''
  });
  const [forums, setForums] = useState<Forum[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const response = await fetch('/api/get-forums');

        if (!response.ok) {
          throw new Error('Failed to fetch forums');
        }

        const data = await response.json();
        setForums(data);
      } catch (err) {
        console.error('Error loading forums:', err);
        setError('Failed to load forums. Please try again.');
      }
    };

    fetchForums();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.forum_id) {
      setError('Please select a parent forum');
      return;
    }

    if (!formData.name.trim()) {
      setError('Subforum name is required');
      return;
    }

    setIsSubmitting(true);

    console.log('name: ' + formData.name);
    console.log('description:' + formData.description);
    console.log('ID: ' + formData.forum_id);

    try {
      const response = await fetch('/api/subforums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subforum_name: formData.name,
          subforum_description: formData.description,
          forum_id: formData.forum_id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subforum');
      }

      router.push('/forums');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
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
          <div className="space-y-2">
            <Label htmlFor="parent_id">Parent Forum *</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, forum_id: value })} value={formData.forum_id} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a forum" />
              </SelectTrigger>
              <SelectContent>
                {forums.map((forum) => (
                  <SelectItem key={forum.id} value={forum.id.toString()}>
                    {forum.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Subforum Name *</Label>
            <Input id="name" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter subforum name" required disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe this subforum" rows={3} disabled={isSubmitting} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

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
