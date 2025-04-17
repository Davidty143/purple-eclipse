import { NewTopics } from './components/NewTopics';
import { PopularSubforumsGrid } from './components/PopularSubforums';
import BodyHeader from '@/components/BodyHeader';
const LandingPage = () => {
  return (
    <div className="min-h-screen flex justify-center py-8">
      {/* Focus Content */}
      <div className="w-[1250px] 2xl:w-[80%] flex flex-col px-3">
        {/* Main Body */}
        <div className="w-full flex flex-col lg:flex-row justify-between gap-8">
          {/* Content Body */}
          <div className="w-full flex flex-col gap-4">
            <div className="border-b-2 mb-3">
              <BodyHeader />
            </div>

            <PopularSubforumsGrid />
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
