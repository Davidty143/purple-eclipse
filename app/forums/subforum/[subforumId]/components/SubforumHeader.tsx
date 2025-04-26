import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { EditSubforumDialog, SubforumData } from './EditSubforumDialog';
import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react'; // <-- Import LucideProps

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
    router.push(`/forums/subforum/${subforumId}/create-thread`);
  };

  const handleEditSuccess = (updatedSubforum: SubforumData) => {
    console.log('Updated subforum:', updatedSubforum);
  };

  const IconComponent = icon && (LucideIcons[icon as keyof typeof LucideIcons] as React.ComponentType<LucideProps> | undefined);

  return (
    <div className="relative border border-gray-300 rounded-lg px-5 py-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {IconComponent && <IconComponent className="w-6 h-6 text-[#267859]" strokeWidth={2} />}
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
          </div>

          <div className="ml-4">
            <EditSubforumDialog subforumId={subforumId} currentTitle={title} currentDescription={description} currentIcon={icon} onSuccess={onEditSuccess || handleEditSuccess} />
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600">{description}</p>

      <div className="absolute top-2 right-2">
        <Button variant="outline" className="px-4 py-2 text-sm font-medium border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors" onClick={handlePostThread}>
          Post Thread
        </Button>
      </div>
    </div>
  );
};

export default SubforumHeader;
