import { NewTopics } from './components/NewTopics';

import { FeaturedTopics } from './components/FeaturedTopics';
import BodyHeader from '@/components/BodyHeader';
const LandingPage = () => {
  return (
    <div className="min-h-screen flex justify-center py-5">
      {/* Focus Content */}
      <div className="w-[1250px] 2xl:w-[80%] flex flex-col">
        {/* Main Body */}
        <div className="w-full flex flex-col lg:flex-row justify-between gap-6">
          {/* Content Body */}
          <div className="w-full flex flex-col gap-4">
            <BodyHeader />
            <FeaturedTopics />
          </div>
          <div className="flex flex-1 flex-col space-y-14 max-h-auto h-auto">
            <NewTopics />
          </div>
        </div>
        <div className="w-full h-[10vh]">FOOTER</div>
      </div>
    </div>
  );
};

export default LandingPage;
