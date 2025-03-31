// app/forums/page.tsx
import { LandingHeader } from '@/app/(landingPage)/components/LandingHeader';
import { NewTopics } from '@/app/(landingPage)/components/NewTopics';
import { ForumTitle } from './components/ForumTitle';

const ForumsPage = () => {
  return (
    <div className="min-h-screen flex justify-center bg-gray-100 py-5">
      <div className="w-[1250px] 2xl:w-[80%] flex flex-col">
        <div className="w-full flex flex-col lg:flex-row justify-between gap-6">
          <div className="w-full flex flex-col gap-4">
            <LandingHeader />
            <ForumTitle title="General Forum" showActions={true} />
          </div>

          <div className="lg:w-[350px] flex-shrink-0 flex flex-col space-y-6">
            <NewTopics />
          </div>
        </div>

        <footer className="w-full mt-auto py-4">{/* Footer content */}</footer>
      </div>
    </div>
  );
};

export default ForumsPage;
