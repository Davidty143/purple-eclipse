'use client';

import { Button } from '@/components/ui/button';
import { EditSubforumDialog, SubforumData } from './EditSubforumDialog';
import { DeleteSubforumDialog } from './DeleteSubforumDialog'; // Import delete dialog
import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';
import { FiPlus } from 'react-icons/fi';

interface SubforumHeaderProps {
  title: string;
  description: string;
  icon: string | null;
  subforumId: number;
  onEditSuccess?: (updatedSubforum: SubforumData) => void;
}

const SubforumHeader = ({ title, description, icon, subforumId, onEditSuccess }: SubforumHeaderProps) => {
  const router = useRouter();

  const handlePostThread = () => {
    router.push(`/post-thread`);
  };

  const handleEditSuccess = (updatedSubforum: SubforumData) => {
    console.log('Updated subforum:', updatedSubforum);
  };

  const handleDeleteSuccess = () => {
    router.push('/forums'); // Redirect on successful delete
  };

  const IconComponent = icon && (LucideIcons[icon as keyof typeof LucideIcons] as React.ComponentType<LucideProps> | undefined);

  return (
    <div className="bg-gradient-to-r from-[#267858] to-[#3a9f7e] text-white p-5 rounded-md mb-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Icon + Title */}
          <div className="flex items-center gap-2">
            {IconComponent && <IconComponent className="w-6 h-6 text-white" strokeWidth={2} />}
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>

          {/* Right: Edit + Delete buttons tightly grouped */}
          <div className="flex items-center space-x-0">
            <EditSubforumDialog subforumId={subforumId} currentTitle={title} currentDescription={description} currentIcon={icon} onSuccess={onEditSuccess || handleEditSuccess} />
            <DeleteSubforumDialog subforumId={subforumId} subforumName={title} onSuccess={handleDeleteSuccess} />
          </div>
        </div>

        <Button onClick={handlePostThread} className="flex items-center justify-between gap-2 px-4 text-sm border border-white bg-white text-[#267858] hover:bg-gray-100 w-full sm:w-auto">
          <span>Post Thread</span>
          <FiPlus className="text-[#267858]" />
        </Button>
      </div>

      <p className="mt-3 pl-3 text-sm text-white w-full sm:w-3/5">{description}</p>
    </div>
  );
};

export default SubforumHeader;
