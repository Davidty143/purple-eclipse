'use client';

import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AvatarWithFallback } from '@/components/AvatarWithFallback';
import { format } from 'date-fns';

export interface Author {
  name: string;
  avatar?: string;
}

export interface Thread {
  id: string;
  title: string;
  author: Author;
  tag: string;
  createdAt: Date;
  replies: number;
  views: number;
  lastComment?: {
    author: Author;
    createdAt: Date;
  };
}

interface ThreadRowProps {
  thread: Thread;
  className?: string;
}

export function ThreadRow({ thread, className }: ThreadRowProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* LEFT: Author + Thread Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <AvatarWithFallback name={thread.author.name} avatar={thread.author.avatar} />
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs text-white bg-[#267858]">
                  {thread.tag}
                </Badge>
                <h3 className="text-lg font-semibold truncate">{thread.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Posted by {thread.author.name} • {format(thread.createdAt, 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* CENTER: Comments Count (hidden on mobile) */}
          <div className="text-center min-w-[60px] sm:block hidden">
            <p className="font-medium text-base">{thread.replies}</p>
            <p className="text-xs text-muted-foreground">Comments</p>
          </div>

          {/* RIGHT: Last Comment (hidden on mobile) */}
          {thread.lastComment ? (
            <div className="flex items-center gap-2 min-w-[120px] sm:flex-row flex-col sm:items-end hidden sm:flex">
              <div className="text-right">
                <p className="font-medium text-xs">{format(thread.lastComment.createdAt, 'MMM d')}</p>
                <p className="text-xs truncate max-w-[120px]">by {thread.lastComment.author.name}</p>
              </div>
              <AvatarWithFallback name={thread.lastComment.author.name} avatar={thread.lastComment.author.avatar} />
            </div>
          ) : (
            <div className="text-center text-xs pt-6 text-muted-foreground hidden sm:flex">No comments yet</div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
