'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as LucideIcons from 'lucide-react';

interface Forum {
  id: number;
  name: string;
}

interface CreateSubforumFormProps {
  parentId?: number;
}

export default function CreateSubforumForm({ parentId }: CreateSubforumFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    forum_id: parentId ? parentId.toString() : '',
    icon: ''
  });

  const [forums, setForums] = useState<Forum[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const iconOptions = Object.keys(LucideIcons)
    .filter((key) => /^[A-Z]/.test(key))
    .slice(0, 100);

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const response = await fetch('/api/get-forums');
        if (!response.ok) throw new Error('Failed to fetch forums');
        const data = await response.json();
        setForums(data);

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
  }, [parentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      // Simulated POST request
      await new Promise((res) => setTimeout(res, 1000));
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

          {/* Parent Forum Select */}
          <div className="space-y-2">
            <Label htmlFor="forum_id">Parent Forum *</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, forum_id: value })} value={formData.forum_id} required disabled={!!parentId}>
              <SelectTrigger>
                <SelectValue placeholder={parentId ? 'Parent forum is pre-selected' : 'Select a forum'} />
              </SelectTrigger>
              {!parentId && (
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

          {/* Subforum Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Subforum Name *</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter subforum name" required disabled={isSubmitting} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe this subforum" rows={3} disabled={isSubmitting} />
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (optional)</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, icon: value })} value={formData.icon}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  {formData.icon &&
                    (() => {
                      const Icon = LucideIcons[formData.icon as keyof typeof LucideIcons];
                      return <Icon className="w-4 h-4" />;
                    })()}
                  <SelectValue placeholder="Select an icon" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-64 overflow-y-auto z-50">
                {iconOptions.map((iconName) => {
                  const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons];
                  return (
                    <SelectItem key={iconName} value={iconName}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        <span>{iconName}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Submit & Cancel Buttons */}
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
