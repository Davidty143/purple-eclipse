//SidebarThreadBlock
'use client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface SidebarThreadBlockProps {
  title: string;
  avatar: string;
  author: string;
}

export function SidebarThreadBlock({ title, avatar, author }: SidebarThreadBlockProps) {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors cursor-pointer">
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar} />
        <AvatarFallback>
          {author
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">by {author}</p>
      </div>
    </div>
  );
}
