'use client';
import dynamic from 'next/dynamic';
import BodyHeader from '@/components/BodyHeader';
import Footer from '@/components/Footer';

const PopularSubforumsWrapper = dynamic(() => import('./components/PopularSubforumsWrapper'), { ssr: false });
const NewTopicsWrapper = dynamic(() => import('./components/NewTopicsWrapper'), { ssr: false });

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="flex justify-center py-8 flex-grow">
        <div className="w-[1250px] 2xl:w-[80%] flex flex-col px-3">
          <div className="w-full flex flex-col lg:flex-row justify-between gap-8">
            {/* Left Column */}
            <div className="w-full flex flex-col gap-4">
              <BodyHeader />
              <div className="h-1 w-full bg-[#308b6a] rounded-full mt-3 mb-3"></div>
              <PopularSubforumsWrapper />
            </div>

            {/* Right Column */}
            <div className="flex flex-1 flex-col space-y-14 max-h-auto h-auto">
              <NewTopicsWrapper />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
