import { useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Comment } from './interfaces';
import { formatRelativeTime } from './utils/dateUtils';
import { deduplicateReplies, MAX_COMMENT_CHARS } from './utils/commentUtils';
import { ReplyForm } from './ReplyForm';
import { NestedReplies } from './NestedReplies';

interface CommentCardProps {
  comment: Comment;
  user: any | null;
  isSubmitting: boolean;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleReplySubmit: (parentCommentId: number, content?: string) => Promise<void>;
  handleNestedReplySubmit?: (replyId: number, content: string) => Promise<boolean | void>;
  updateCommentReplies: (commentId: number, newReplies: Comment[]) => void;
}

export function CommentCard({ comment, user, isSubmitting, replyingTo, setReplyingTo, replyContent, setReplyContent, handleReplySubmit, handleNestedReplySubmit, updateCommentReplies }: CommentCardProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyingToNestedId, setReplyingToNestedId] = useState<number | null>(null);
  const [nestedReplyContent, setNestedReplyContent] = useState('');
  const [showNestedReplies, setShowNestedReplies] = useState<Record<number, boolean>>({});

  const uniqueReplies = useMemo(() => deduplicateReplies(comment.replies), [comment.replies]);
  const replyCount = uniqueReplies.length;

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_COMMENT_CHARS) {
      setReplyContent(value);
    }
  };

  const handleNestedReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_COMMENT_CHARS) {
      setNestedReplyContent(value);
    }
  };

  const toggleNestedReplies = (replyId: number) => {
    setShowNestedReplies((prev) => ({
      ...prev,
      [replyId]: !prev[replyId]
    }));
  };

  const handleMainReplySubmit = async () => {
    try {
      await handleReplySubmit(comment.comment_id, replyContent);
      setReplyContent(''); // Reset content after successful submission
      setReplyingTo(null); // Close the reply form
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const submitNestedReply = async (replyId: number) => {
    try {
      const success = await handleNestedReplySubmit?.(replyId, nestedReplyContent);
      if (success !== false) {
        setNestedReplyContent('');
        setReplyingToNestedId(null);
      }
    } catch (error) {
      console.error('Error submitting nested reply:', error);
    }
  };

  return (
    <Card className="comment-card">
      <CardContent className="p-4 sm:p-8">
        <div className="flex items-start gap-3 sm:gap-4">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
            <AvatarImage src={comment.author.account_avatar_url || 'anon'} alt={comment.author.account_username || 'User'} />
            <AvatarFallback>{comment.author.account_username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="font-medium text-sm sm:text-base truncate">{comment.author.account_username}</div>
              <div className="text-xs sm:text-sm text-gray-500 shrink-0">{formatRelativeTime(new Date(comment.comment_created))}</div>
            </div>

            <div className="prose prose-sm sm:prose-base max-w-none break-words whitespace-pre-wrap overflow-hidden text-gray-700">{comment.comment_content}</div>

            {/* Reply Button */}
            {user && (
              <div className="flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setReplyingTo(replyingTo === comment.comment_id ? null : comment.comment_id)} className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 h-auto py-1" disabled={isSubmitting}>
                  {replyingTo === comment.comment_id ? 'Cancel' : 'Reply'}
                </Button>
              </div>
            )}

            {/* View Replies Button */}
            {replyCount > 0 && (
              <div className="flex-shrink-0">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 pl-0 h-auto py-1" onClick={() => setShowReplies(!showReplies)}>
                  {showReplies ? (
                    <>
                      <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                      Hide replies
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                      View {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Reply Form */}
            {replyingTo === comment.comment_id && <ReplyForm content={replyContent} onChange={handleReplyChange} onSubmit={handleMainReplySubmit} isSubmitting={isSubmitting} placeholder={`Reply to ${comment.author.account_username}...`} authorUsername={comment.author.account_username} />}

            {/* Replies section */}
            {showReplies && replyCount > 0 && (
              <div className="pt-2 sm:pt-3 space-y-4 sm:space-y-5">
                <div className="border-l-2 border-gray-200">
                  {uniqueReplies.map((reply, index) => (
                    <div key={`${comment.comment_id}-reply-${reply.comment_id}-${index}`} className="pl-3 sm:pl-6 py-3 sm:py-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
                          <AvatarImage src={reply.author.account_avatar_url || 'anon'} alt={reply.author.account_username || 'User'} />
                          <AvatarFallback>{reply.author.account_username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-medium text-xs sm:text-sm truncate">{reply.author.account_username}</div>
                              <div className="text-xs text-gray-500 shrink-0">{formatRelativeTime(new Date(reply.comment_created))}</div>
                            </div>

                            <div className="prose prose-sm max-w-none break-words whitespace-pre-wrap overflow-hidden text-gray-700 mt-1">{reply.comment_content}</div>

                            <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-1.5">
                              {user && (
                                <Button variant="ghost" size="sm" className="text-xs text-gray-500 h-auto p-0" onClick={() => setReplyingToNestedId(replyingToNestedId === reply.comment_id ? null : reply.comment_id)} disabled={isSubmitting}>
                                  {replyingToNestedId === reply.comment_id ? 'Cancel' : 'Reply'}
                                </Button>
                              )}
                            </div>

                            {/* Nested Reply Form */}
                            {replyingToNestedId === reply.comment_id && <ReplyForm content={nestedReplyContent} onChange={handleNestedReplyChange} onSubmit={() => submitNestedReply(reply.comment_id)} isSubmitting={isSubmitting} placeholder={`Reply to ${reply.author.account_username}...`} authorUsername={reply.author.account_username} isNested />}

                            {/* Nested Replies */}
                            <NestedReplies reply={reply} showNestedReplies={showNestedReplies} toggleNestedReplies={toggleNestedReplies} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
