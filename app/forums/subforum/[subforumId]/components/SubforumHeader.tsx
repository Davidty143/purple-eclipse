import { Button } from '@/components/ui/button';

interface SubforumHeaderProps {
  title?: string;
  description?: string;
}

const SubforumHeader = ({ title = 'ACADEMICS', description = 'Ask for academic assistance, get the support you need, and help others succeed!' }: SubforumHeaderProps) => {
  return (
    <div className="border rounded-lg px-5 py-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        <Button variant="outline" className="px-4 py-2 text-sm font-medium border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
          Post Thread
        </Button>
      </div>
      <p className="text-sm text-gray-600 w-full md:w-4/5">{description}</p>
    </div>
  );
};

export default SubforumHeader;
