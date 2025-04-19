import { NewTopics } from './components/NewTopics';
import { PopularSubforumsGrid } from './components/PopularSubforums';
import BodyHeader from '@/components/BodyHeader';
import Footer from '@/components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="flex justify-center py-8 flex-grow">
        <div className="w-[1250px] 2xl:w-[80%] flex flex-col px-3">
          <div className="w-full flex flex-col lg:flex-row justify-between gap-8">
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
