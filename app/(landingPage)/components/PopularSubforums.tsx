'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { popularMockSubforums } from './PopularMockSubforums';

interface Thread {
  id: string;
  title: string;
  author: {
    name: string;
    avatar?: string;
  };
  tag: string;
  createdAt: Date;
}

interface Subforum {
  id: string;
  name: string;
  description: string;
  threads: Thread[];
}

export function ThreadRow({ thread }: { thread: Thread }) {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-accent rounded-md transition-colors cursor-pointer">
      {/* Avatar on the leftmost */}
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={thread.author.avatar} />
        <AvatarFallback className="text-xs">
          {thread.author.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {thread.tag}
          </Badge>
          <span className="text-sm font-semibold truncate">{thread.title}</span>
        </div>

        <div className="text-xs text-muted-foreground mt-1">
          Posted by {thread.author.name} • {format(thread.createdAt, 'MMM d, yyyy')}
        </div>
      </div>
    </div>
  );
}

export function SubforumBlock({ subforum }: { subforum: Subforum }) {
  return (
    <Card className="w-full">
      <CardHeader className=" px-5 py-4 bg-gray-100">
        <CardTitle className="text-md">{subforum.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 mt-4">
        {subforum.threads.slice(0, 10).map((thread) => (
          <ThreadRow key={thread.id} thread={thread} />
        ))}
      </CardContent>
    </Card>
  );
}

export function PopularSubforumsGrid() {
  return (
    <div className="space-y-6">
      {popularMockSubforums.slice(0, 5).map((subforum) => (
        <SubforumBlock key={subforum.id} subforum={subforum} />
      ))}
    </div>
  );
}
