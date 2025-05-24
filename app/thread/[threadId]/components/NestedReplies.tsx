import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Comment } from './interfaces';
import { formatRelativeTime } from './utils/dateUtils';
import { getFilteredNestedReplies } from './utils/commentUtils';

interface NestedRepliesProps {
  reply: Comment;
  showNestedReplies: Record<number, boolean>;
  toggleNestedReplies: (replyId: number) => void;
}

export function NestedReplies({ reply, showNestedReplies, toggleNestedReplies }: NestedRepliesProps) {
  if (!reply.replies || reply.replies.length === 0) return null;

  const filteredNestedReplies = getFilteredNestedReplies(reply);
  const nestedReplyCount = filteredNestedReplies.length;

  if (nestedReplyCount === 0) return null;

  return (
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
                <AvatarImage src={nestedReply.author.account_avatar_url || 'anon'} alt={nestedReply.author.account_username || 'User'} />
                <AvatarFallback>{nestedReply.author.account_username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-xs sm:text-sm truncate">{nestedReply.author.account_username}</div>
                    <div className="text-xs text-gray-500 shrink-0">{formatRelativeTime(new Date(nestedReply.comment_created))}</div>
                  </div>
                  <div className="prose prose-xs sm:prose-sm max-w-none break-words whitespace-pre-wrap overflow-hidden text-gray-700 mt-1">{nestedReply.comment_content}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
