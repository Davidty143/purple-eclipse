'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Thread {
  thread_id: number;
  thread_title: string;
  thread_content: string;
  thread_category?: string;
  subforum_id: number;
  subforum: {
    subforum_name: string;
    subforum_id: number;
  };
}

interface EditThreadFormProps {
  thread: Thread;
  user: User;
}

export default function EditThreadForm({ thread, user }: EditThreadFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(thread.thread_title);
  const [content, setContent] = useState(thread.thread_content);
  const [category, setCategory] = useState(thread.thread_category || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !category.trim()) {
      toast.error('Title, content and category are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Update the thread
      const { error } = await supabase
        .from('Thread')
        .update({
          thread_title: title,
          thread_content: content,
          thread_category: category,
          thread_modified: new Date().toISOString()
        })
        .eq('thread_id', thread.thread_id)
        .eq('author_id', user.id); // Ensure the user is the author

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Thread updated successfully');
      // Redirect to the thread page
      router.push(`/thread/${thread.thread_id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(`Failed to update thread: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Thread Title" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded-lg border-gray-300" required>
            <option value="">Select a category</option>
            <option value="Help">Help</option>
            <option value="Discussion">Discussion</option>
            <option value="Question">Question</option>
            <option value="Tutorial">Tutorial</option>
            <option value="News">News</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your thread content here..." className="min-h-[200px]" required />
        </div>

        <div className="flex items-center space-x-3 justify-end">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
