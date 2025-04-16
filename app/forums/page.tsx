// app/forums/page.tsx
import { NewTopics } from '@/app/(landingPage)/components/NewTopics';
import { ForumComponentWrapper } from './components/ForumComponentWrapper';
import BodyHeader from '@/components/BodyHeader';

const ForumsPage = () => {
  return (
    <div className="min-h-screen flex justify-center py-8">
      <div className="w-[1250px] 2xl:w-[80%] flex flex-col px-3">
        <div className="w-full flex flex-col lg:flex-row justify-between gap-8">
          {/* Main Content */}
          <div className="w-full flex flex-col gap-6">
            <BodyHeader />
            <ForumComponentWrapper /> {/* No props needed now */}
          </div>

          {/* Sidebar */}
          <div className="flex-shrink-0 flex flex-col space-y-6">
            <NewTopics />
          </div>
        </div>
        <footer className="w-full mt-auto py-4"></footer>
      </div>
    </div>
  );
};

export default ForumsPage;
