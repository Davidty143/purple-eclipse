'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CommentFormProps {
  user: any | null;
  loading: boolean;
  newComment: string;
  setNewComment: (content: string) => void;
  isSubmitting: boolean;
  handleCommentSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function CommentForm({ user, loading, newComment, setNewComment, isSubmitting, handleCommentSubmit }: CommentFormProps) {
  return (
    <div className="mt-8 pt-4 border-t border-gray-200">
      <h3 className="text-lg font-medium mb-4">Add Your Comment</h3>
      {loading ? (
        <div className="text-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      ) : user ? (
        <form onSubmit={handleCommentSubmit}>
          <div className="border rounded-lg p-4 bg-white">
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write your comment..." className="w-full min-h-[100px] p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isSubmitting} />
            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting || !newComment.trim()} className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
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
          <Link href="/login" className="text-blue-600 hover:underline">
            sign in
          </Link>{' '}
          to post a comment
        </div>
      )}
    </div>
  );
}
