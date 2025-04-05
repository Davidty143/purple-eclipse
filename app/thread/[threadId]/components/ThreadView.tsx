'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  comment_id: number;
  comment_content: string;
  comment_created: string;
  comment_deleted: boolean;
  author: {
    account_username: string;
    account_email: string;
  };
}

interface Thread {
  thread_id: number;
  thread_title: string;
  thread_content: string;
  thread_created: string;
  thread_deleted: boolean;
  subforum: {
    subforum_name: string;
    forum: {
      forum_name: string;
    };
  };
  comments: Comment[];
}

interface ThreadViewProps {
  thread: Thread;
}

export default function ThreadView({ thread: initialThread }: ThreadViewProps) {
  const [thread, setThread] = useState(initialThread);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    const commentContent = newComment.trim();

    // Create optimistic comment
    const optimisticComment: Comment = {
      comment_id: Math.random(), // temporary ID
      comment_content: commentContent,
      comment_created: new Date().toISOString(),
      comment_deleted: false,
      author: {
        account_username: user.user_metadata?.username || 'Anonymous',
        account_email: user.email || ''
      }
    };

    // Optimistically update UI
    setThread((prev) => ({
      ...prev,
      comments: [...prev.comments, optimisticComment]
    }));
    setNewComment('');

    try {
      // Validate user ID is available
      if (!user.id) {
        throw new Error('User ID is missing');
      }

      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      // First check if the account exists in the Account table
      const { data: accountData, error: accountError } = await supabase.from('Account').select('account_id').eq('account_id', user.id).single();

      // If the account doesn't exist, create one
      if (accountError || !accountData) {
        console.log('Account not found, creating new account');
        const { error: createAccountError } = await supabase.from('Account').insert({
          account_id: user.id,
          account_username: user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
          account_email: user.email,
          account_is_deleted: false
        });

        if (createAccountError) {
          console.error('Error creating account:', createAccountError);
          throw new Error(`Account creation failed: ${createAccountError.message}`);
        }
      }

      // Now insert the comment
      const { data, error } = await supabase
        .from('Comment')
        .insert({
          comment_content: commentContent,
          thread_id: thread.thread_id,
          author_id: user.id,
          comment_deleted: false,
          comment_created: new Date().toISOString(),
          comment_modified: new Date().toISOString()
        })
        .select(
          `
          *,
          author:author_id (
            account_username,
            account_email
          )
        `
        )
        .single();

      if (error) {
        console.error('Comment insert error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from comment insertion');
      }

      // Update with real comment data
      setThread((prev) => ({
        ...prev,
        comments: prev.comments.map((c) => (c === optimisticComment ? data : c))
      }));

      toast.success('Comment posted successfully');
    } catch (error: any) {
      console.error('Error posting comment:', error);
      // Log more details about the error
      if (error.code) {
        console.error(`Error code: ${error.code}, Message: ${error.message}, Details:`, error.details);
      }

      // Revert optimistic update
      setThread((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c !== optimisticComment)
      }));
      toast.error(`Failed to post comment: ${error.message || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!thread || thread.thread_deleted) {
    return <div className="flex items-center justify-center min-h-screen">Thread not found or has been deleted</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <span>{thread.subforum.forum.forum_name}</span>
          <span className="mx-2">/</span>
          <span>{thread.subforum.subforum_name}</span>
        </div>

        {/* Main Thread Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{thread.thread_title}</CardTitle>
            <div className="text-sm text-gray-500">Posted {format(new Date(thread.thread_created), 'MMM d, yyyy')}</div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">{thread.thread_content}</div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Comments</h2>
            <div className="text-sm text-gray-500">{thread.comments.filter((c) => !c.comment_deleted).length} comments</div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {thread.comments
              .filter((comment) => !comment.comment_deleted)
              .map((comment) => (
                <Card key={comment.comment_id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://avatar.vercel.sh/${comment.author.account_username}`} />
                        <AvatarFallback>{comment.author.account_username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{comment.author.account_username}</div>
                          <div className="text-sm text-gray-500">{format(new Date(comment.comment_created), 'MMM d, yyyy')}</div>
                        </div>
                        <div className="mt-2 text-gray-700">{comment.comment_content}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Comment Form - Moved below the comments list */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-4">Add Your Comment</h3>
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            ) : user ? (
              <form onSubmit={handleCommentSubmit}>
                <div className="border rounded-lg p-4 bg-white">
                  <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write your comment..." className="w-full min-h-[100px] p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="mt-4 flex justify-end">
                    <Button type="submit" disabled={isSubmitting || !newComment.trim()} className="bg-blue-600 text-white hover:bg-blue-700">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        'Post Comment'
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                Please{' '}
                <a href="/login" className="text-blue-600 hover:underline">
                  sign in
                </a>{' '}
                to post a comment
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
