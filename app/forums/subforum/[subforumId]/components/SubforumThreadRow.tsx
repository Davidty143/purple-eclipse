// components/subforumthread-row.tsx
import { Card, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
          {/* Author and Thread Info */}
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={thread.author.avatar} />
              <AvatarFallback>
                {thread.author.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {thread.tag}
                </Badge>
                <h3 className="text-sm font-semibold truncate">{thread.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Posted by {thread.author.name} • {format(thread.createdAt, 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground sm:ml-auto sm:pl-4">
            <div className="text-center min-w-[50px]">
              <p className="font-medium">{thread.replies}</p>
              <p className="text-xs">Replies</p>
            </div>

            <div className="text-center min-w-[50px]">
              <p className="font-medium">{thread.views}</p>
              <p className="text-xs">Views</p>
            </div>

            {thread.lastComment && (
              <div className="flex items-center gap-2 min-w-[120px]">
                <div className="text-right">
                  <p className="font-medium text-xs">{format(thread.lastComment.createdAt, 'MMM d')}</p>
                  <p className="text-xs truncate max-w-[120px]">by {thread.lastComment.author.name}</p>
                </div>
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={thread.lastComment.author.avatar} />
                  <AvatarFallback>
                    {thread.lastComment.author.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
