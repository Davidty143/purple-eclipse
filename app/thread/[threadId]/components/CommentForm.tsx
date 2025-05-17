'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';

interface CommentFormProps {
  user: any | null;
  loading: boolean;
  newComment: string;
  setNewComment: (content: string) => void;
  isSubmitting: boolean;
  handleCommentSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function CommentForm({ user, loading, newComment, setNewComment, isSubmitting, handleCommentSubmit }: CommentFormProps) {
  const [userStatus, setUserStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        const supabase = createClient();
        const { data } = await supabase.from('Account').select('account_status').eq('account_id', user.id).single();

        if (data) {
          setUserStatus(data.account_status);
        }
      }
    };

    checkUserStatus();
  }, [user]);

  return (
    <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-gray-200">
      <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Add Your Comment</h3>
      {loading ? (
        <div className="text-center py-3 sm:py-4">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mx-auto" />
        </div>
      ) : user ? (
        userStatus === 'RESTRICTED' ? (
          <div className="text-center py-5 sm:py-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-700">Your account is currently restricted. You cannot post comments at this time.</p>
          </div>
        ) : userStatus === 'BANNED' ? (
          <div className="text-center py-5 sm:py-6 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700">Your account has been banned. You cannot post comments.</p>
          </div>
        ) : (
          <form onSubmit={handleCommentSubmit}>
            <div className="border rounded-lg p-3 sm:p-4 bg-white">
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write your comment..." className="w-full min-h-[80px] sm:min-h-[100px] p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-[#267858] text-sm sm:text-base" disabled={isSubmitting} />
              <div className="mt-3 sm:mt-4 flex justify-end">
                <Button type="submit" disabled={isSubmitting || !newComment.trim()} className="bg-[#267858] text-white hover:bg-[#267858] disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm h-8 sm:h-9">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Comment'
                  )}
                </Button>
              </div>
            </div>
          </form>
        )
      ) : (
        <div className="text-center py-5 sm:py-6 bg-gray-50 rounded-lg border border-gray-200">
          Please{' '}
          <Link href="/login" className="text-[#267858] hover:underline">
            sign in
          </Link>{' '}
          to post a comment
        </div>
      )}
    </div>
  );
}
