'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Comment, Thread } from './interfaces';

interface CommentsListProps {
  thread: Thread;
  user: any | null;
  isSubmitting: boolean;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleReplySubmit: (parentCommentId: number, content?: string) => Promise<void>;
  handleNestedReplySubmit?: (replyId: number, content: string) => Promise<boolean | void>;
}

// Helper function to format date in a dynamic way
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInHours < 48) {
    return 'yesterday';
  } else if (diffInHours < 168) {
    // 7 days
    return `${Math.floor(diffInHours / 24)}d ago`;
  } else {
    return format(date, 'MMM d, yyyy');
  }
};

// Utility function to deduplicate replies based on comment_id
function deduplicateReplies(replies: Comment[] | undefined): Comment[] {
  if (!replies || replies.length === 0) return [];

  // Use a Map to track unique replies by ID
  const uniqueReplies = new Map<number, Comment>();

  // Add each non-deleted reply to the map (will overwrite duplicates)
  replies.filter((reply) => !reply.comment_deleted).forEach((reply) => uniqueReplies.set(reply.comment_id, reply));

  // Convert back to array and sort by creation date
  return Array.from(uniqueReplies.values()).sort((a, b) => new Date(a.comment_created).getTime() - new Date(b.comment_created).getTime());
}

export default function CommentsList({ thread, user, isSubmitting, replyingTo, setReplyingTo, replyContent, setReplyContent, handleReplySubmit, handleNestedReplySubmit }: CommentsListProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold">Comments</h2>
        <div className="text-xs sm:text-sm text-gray-500">{thread.comments.filter((c) => !c.comment_deleted).length} comments</div>
      </div>

      {/* Comments List */}
      <div className="space-y-3 sm:space-y-4">
        {thread.comments
          .filter((comment) => !comment.comment_deleted && !comment.parent_comment_id)
          .map((comment) => (
            <CommentCard key={`comment-${comment.comment_id}`} comment={comment} user={user} isSubmitting={isSubmitting} replyingTo={replyingTo} setReplyingTo={setReplyingTo} replyContent={replyContent} setReplyContent={setReplyContent} handleReplySubmit={handleReplySubmit} handleNestedReplySubmit={handleNestedReplySubmit} />
          ))}
      </div>
    </div>
  );
}

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
}

function CommentCard({ comment, user, isSubmitting, replyingTo, setReplyingTo, replyContent, setReplyContent, handleReplySubmit, handleNestedReplySubmit }: CommentCardProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyingToNestedId, setReplyingToNestedId] = useState<number | null>(null);
  const [nestedReplyContent, setNestedReplyContent] = useState('');
  const [showNestedReplies, setShowNestedReplies] = useState<Record<number, boolean>>({});

  // Get deduplicated replies - memoize this to prevent infinite re-renders
  const uniqueReplies = useMemo(() => deduplicateReplies(comment.replies), [comment.replies]);
  const replyCount = uniqueReplies.length;

  // Function to get filtered nested replies
  const getFilteredNestedReplies = useCallback((replyObj: Comment) => {
    if (!replyObj.replies) return [];
    return replyObj.replies.filter((r) => !r.comment_deleted);
  }, []);

  // Initialize nested replies to be hidden - only run once when the component mounts
  useEffect(() => {
    if (uniqueReplies.length > 0) {
      const initialState: Record<number, boolean> = {};
      uniqueReplies.forEach((reply) => {
        if (reply.replies && reply.replies.length > 0) {
          initialState[reply.comment_id] = false;
        }
      });
      setShowNestedReplies(initialState);
    }
  }, [uniqueReplies]); // Include uniqueReplies as a dependency

  const toggleNestedReplies = (replyId: number) => {
    setShowNestedReplies((prev) => ({
      ...prev,
      [replyId]: !prev[replyId]
    }));
  };

  const onNestedReplySubmit = async (replyId: number) => {
    if (!nestedReplyContent.trim()) return;

    try {
      // If external handler is provided, use it
      if (handleNestedReplySubmit) {
        const success = await handleNestedReplySubmit(replyId, nestedReplyContent);
        if (success !== false) {
          // Reset form after submission
          setNestedReplyContent('');
          setReplyingToNestedId(null);
          // Make sure replies are visible after submitting
          setShowReplies(true);
          // Show nested replies for this reply
          setShowNestedReplies((prev) => ({
            ...prev,
            [replyId]: true
          }));
        }
      } else {
        // Otherwise use the default behavior
        await handleReplySubmit(replyId, nestedReplyContent);
        // Reset form after submission
        setNestedReplyContent('');
        setReplyingToNestedId(null);
        // Make sure replies are visible after submitting
        setShowReplies(true);
        // Show nested replies for this reply
        setShowNestedReplies((prev) => ({
          ...prev,
          [replyId]: true
        }));
      }
    } catch (error) {
      console.error('Error submitting nested reply:', error);
    }
  };

  return (
    <Card className="comment-card">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-4">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
            <AvatarImage src={comment.author.account_avatar_url || `https://avatar.vercel.sh/${comment.author.account_username || 'anon'}`} alt={comment.author.account_username || 'User'} />
            <AvatarFallback>{comment.author.account_username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2 sm:space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <div className="font-medium text-sm sm:text-base">{comment.author.account_username}</div>
              <div className="text-xs sm:text-sm text-gray-500">{formatRelativeTime(new Date(comment.comment_created))}</div>
            </div>
            <div className="text-sm sm:text-base text-gray-700">{comment.comment_content}</div>

            {/* Reply Button */}
            {user && (
              <div>
                <Button variant="ghost" size="sm" onClick={() => setReplyingTo(replyingTo === comment.comment_id ? null : comment.comment_id)} className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 h-auto py-1" disabled={isSubmitting}>
                  {replyingTo === comment.comment_id ? 'Cancel' : 'Reply'}
                </Button>
              </div>
            )}

            {/* View Replies Button */}
            {replyCount > 0 && (
              <div>
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

            {/* Reply Form - placed before the replies for better context */}
            {replyingTo === comment.comment_id && (
              <div className="pl-2 sm:pl-4 border-l-2 border-blue-200 py-2">
                <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder={`Reply to ${comment.author.account_username}...`} className="w-full min-h-[60px] sm:min-h-[80px] p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" disabled={isSubmitting} />
                <div className="mt-2 flex justify-end">
                  <Button size="sm" disabled={isSubmitting || !replyContent.trim()} onClick={() => handleReplySubmit(comment.comment_id)} className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 sm:mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      'Post Reply'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Replies section */}
            {showReplies && replyCount > 0 && (
              <div className="pt-1 sm:pt-2 space-y-3 sm:space-y-4">
                <div className="border-l-2 border-gray-200">
                  {uniqueReplies.map((reply, index) => (
                    <div key={`${comment.comment_id}-reply-${reply.comment_id}-${index}`} className="pl-2 sm:pl-4 py-2 sm:py-3">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
                          <AvatarImage src={reply.author.account_avatar_url || `https://avatar.vercel.sh/${reply.author.account_username || 'anon'}`} alt={reply.author.account_username || 'User'} />
                          <AvatarFallback>{reply.author.account_username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1 sm:space-y-1.5">
                          <div className="flex flex-col">
                            <div className="font-medium text-xs sm:text-sm">{reply.author.account_username}</div>
                            <div className="text-xs sm:text-sm text-gray-700 mt-1">{reply.comment_content}</div>
                            <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-1.5">
                              <div className="text-xs text-gray-500">{formatRelativeTime(new Date(reply.comment_created))}</div>
                              {user && (
                                <Button variant="ghost" size="sm" className="text-xs text-gray-500 h-auto p-0" onClick={() => setReplyingToNestedId(replyingToNestedId === reply.comment_id ? null : reply.comment_id)} disabled={isSubmitting}>
                                  {replyingToNestedId === reply.comment_id ? 'Cancel' : 'Reply'}
                                </Button>
                              )}
                            </div>

                            {/* Nested Reply Form */}
                            {replyingToNestedId === reply.comment_id && (
                              <div className="mt-2 pl-2 sm:pl-3 border-l border-blue-100 py-2">
                                <textarea value={nestedReplyContent} onChange={(e) => setNestedReplyContent(e.target.value)} placeholder={`Reply to ${reply.author.account_username}...`} className="w-full min-h-[50px] sm:min-h-[60px] p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm" disabled={isSubmitting} />
                                <div className="mt-1 flex justify-end">
                                  <Button size="sm" disabled={isSubmitting || !nestedReplyContent.trim()} onClick={() => onNestedReplySubmit(reply.comment_id)} className="bg-[#267858] text-white hover:bg-[#267858] disabled:opacity-50 disabled:cursor-not-allowed text-xs h-7 sm:h-8">
                                    {isSubmitting ? (
                                      <>
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        Posting...
                                      </>
                                    ) : (
                                      'Reply'
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Display nested replies (replies to replies) */}
                            {reply.replies &&
                              reply.replies.length > 0 &&
                              (() => {
                                // Calculate this once per render
                                const filteredNestedReplies = getFilteredNestedReplies(reply);
                                const nestedReplyCount = filteredNestedReplies.length;

                                return nestedReplyCount > 0 ? (
                                  <div className="mt-2 sm:mt-3 pl-2 sm:pl-3 pt-1 sm:pt-2 space-y-2 sm:space-y-3 border-l border-gray-100">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1 sm:mb-2">
                                      <Button variant="ghost" size="sm" className="text-xs text-gray-500 h-auto p-0 flex items-center gap-1" onClick={() => toggleNestedReplies(reply.comment_id)}>
                                        {showNestedReplies[reply.comment_id] ? (
                                          <>
                                            <ChevronUp className="h-3 w-3" />
                                            Hide
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown className="h-3 w-3" />
                                            Show
                                          </>
                                        )}
                                      </Button>
                                      <span>
                                        {nestedReplyCount} nested {nestedReplyCount === 1 ? 'reply' : 'replies'}
                                      </span>
                                    </div>

                                    {showNestedReplies[reply.comment_id] &&
                                      filteredNestedReplies.map((nestedReply, nestedIndex) => (
                                        <div key={`nested-${reply.comment_id}-${nestedReply.comment_id}-${nestedIndex}`} className="pl-1 sm:pl-2 pt-1 sm:pt-2">
                                          <div className="flex items-start gap-1 sm:gap-2">
                                            <div className="w-1 h-full bg-gray-100 rounded-full"></div>
                                            <Avatar className="h-5 w-5 sm:h-7 sm:w-7 shrink-0">
                                              <AvatarImage src={nestedReply.author.account_avatar_url || `https://avatar.vercel.sh/${nestedReply.author.account_username || 'anon'}`} alt={nestedReply.author.account_username || 'User'} />
                                              <AvatarFallback>{nestedReply.author.account_username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                              <div className="flex flex-col">
                                                <div className="font-medium text-xs sm:text-sm">{nestedReply.author.account_username}</div>
                                                <div className="text-xs sm:text-sm text-gray-700 mt-1">{nestedReply.comment_content}</div>
                                                <div className="flex items-center gap-4 mt-0.5 sm:mt-1">
                                                  <div className="text-xs text-gray-500">{formatRelativeTime(new Date(nestedReply.comment_created))}</div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                ) : null;
                              })()}
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
