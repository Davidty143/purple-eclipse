'use client';

import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { EditSubforumDialog } from './EditSubforumDialog';
import { DeleteSubforumDialog } from './DeleteSubforumDialog';

interface SubforumCardProps {
  name: string;
  subforumId: number;
  icon: string;
  showActions?: boolean;
}

export function SubforumCard({ name, subforumId, icon, showActions = false }: SubforumCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/forums/subforum/${subforumId}`);
  };

  const IconComponent = LucideIcons[icon as keyof typeof LucideIcons] as React.ComponentType<LucideProps> | undefined;

  return (
    <div className="flex flex-row justify-between items-center py-4 px-6 gap-2 border border-gray-300 rounded-lg hover:bg-[#edf4f2] cursor-pointer transition-colors">
      <div className="flex items-center space-x-2 flex-grow" onClick={handleClick}>
        {IconComponent ? <IconComponent className="w-5 h-5 text-[#267851]" strokeWidth={2} /> : null}
        <h3 className="font-medium hover:underline">{name}</h3>
      </div>

      {showActions && (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <EditSubforumDialog subforumId={subforumId} currentName={name}>
            <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[#edf4f2] hover:bg-[#267858]" aria-label="Edit subforum">
              <Edit className="h-4 w-4" />
            </Button>
          </EditSubforumDialog>

          <DeleteSubforumDialog subforumId={subforumId} subforumName={name}>
            <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[#edf4f2] hover:bg-[#267858]" aria-label="Delete subforum">
              <Trash className="h-4 w-4" />
            </Button>
          </DeleteSubforumDialog>
        </div>
      )}
    </div>
  );
}
