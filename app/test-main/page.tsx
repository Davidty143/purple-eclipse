import Image from 'next/image';

import { FeaturedTopics } from '../landing-page/components/FeaturedTopics';
import { LandingHeader } from '../landing-page/components/LandingHeader';
import { NewTopics } from '../landing-page/components/NewTopics';

import BodyHeader from '@/components/BodyHeader';
import ThreadBlock from '@/components/ThreadBlock';
import ThreadNameBlock from '@/components/ThreadNameBlock';

export default function TestMain() {
  return (
    <main>
      {/* Main Wrapper */}
      <div className="bg-red-200 min-h-screen flex justify-center">
        {/* Focus Content */}
        <div className="bg-green-200 w-[1250px] 2xl:w-[80%] flex flex-col">
          {/* Main Body */}
          <div className="bg-purple-400 w-full flex flex-col lg:flex-row justify-between gap-6">
            {/* Content Body */}
            <div className="bg-blue-200 w-full flex flex-col gap-4">
              <BodyHeader />
              <ThreadBlock />
              <ThreadBlock />
              <ThreadBlock />
              <ThreadBlock />
              <ThreadBlock />
            </div>
            {/* Sidebar Body */}
            <div className="bg-gray-200 lg:w-[300px] flex-shrink-0">
              <ThreadNameBlock />
            </div>
          </div>
          {/* Footer */}
          <div className="bg-orange-200 w-full h-[10vh]">FOOTER</div>
        </div>
      </div>
    </main>
  );
}
