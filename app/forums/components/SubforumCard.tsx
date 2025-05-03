'use client';

import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface SubforumCardProps {
  name: string;
  subforumId: number;
  icon: string;
}

export function SubforumCard({ name, subforumId, icon }: SubforumCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/forums/subforum/${subforumId}`);
  };

  const IconComponent = LucideIcons[icon as keyof typeof LucideIcons] as React.ComponentType<LucideProps> | undefined;

  return (
    <div className="py-4 px-6 gap-2 border border-gray-300 rounded-lg hover:underline hover:text-medium hover:bg-[#edf4f2] cursor-pointer transition-colors" onClick={handleClick}>
      <div className="flex items-center space-x-2">
        {IconComponent ? <IconComponent className="w-5 h-5 text-[#267851]" strokeWidth={2} /> : null}
        <h3 className="font-medium">{name}</h3>
      </div>
    </div>
  );
}
