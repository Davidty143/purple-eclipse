//SidebarThreadBlock
'use client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface SidebarThreadBlockProps {
  title: string;
  author: {
    account_username: string | null;
    account_avatar_url?: string | null;
  };
}

export function SidebarThreadBlock({ title, author }: SidebarThreadBlockProps) {
  const username = author.account_username || 'Anonymous';

  return (
    <div className="flex items-center gap-3 p-2 hover:bg-[#edf4f2] rounded-md transition-colors cursor-pointer">
      <Avatar className="h-8 w-8">
        <AvatarImage src={author.account_avatar_url || undefined} />
        <AvatarFallback className="bg-secondary">
          {username
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">by {username}</p>
      </div>
    </div>
  );
}
