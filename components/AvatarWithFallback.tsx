// components/AvatarWithFallback.tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Get initials from the username
const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  return parts.length === 1
    ? parts[0].charAt(0).toUpperCase()
    : parts
        .slice(0, 2)
        .map((p) => p.charAt(0).toUpperCase())
        .join('');
};

// Avatar fallback component
export const AvatarWithFallback = ({ name, avatar }: { name: string; avatar?: string }) => {
  const initials = getInitials(name);

  return <Avatar className="w-10 h-10 flex-shrink-0">{avatar && avatar.trim() ? <AvatarImage src={avatar} alt={name} /> : <AvatarFallback className="text-xs">{initials}</AvatarFallback>}</Avatar>;
};
