import { PopularSubforumsGrid } from './components/PopularSubforums';
import BodyHeader from '@/components/BodyHeader';
import Footer from '@/components/Footer';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/app/components/error-boundary';
import NewTopicsWrapper from './components/NewTopicsWrapper';

// Loading fallbacks
const PopularSubforumsSkeletons = () => (
  <div className="space-y-6">
    {Array(3)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="w-full border rounded-lg overflow-hidden">
          <div className="h-12 bg-gray-100 px-5 py-4 flex items-center">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="p-4 space-y-4">
            {Array(3)
              .fill(0)
              .map((_, j) => (
                <div key={j} className="flex items-start gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full max-w-[200px] mb-2" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
  </div>
);

const NewTopicsSkeletons = () => (
  <div className="w-[300px]">
    <div className="bg-gray-50 h-12 rounded-t-lg border border-gray-300 flex items-center px-4">
      <Skeleton className="h-5 w-24" />
    </div>
    <div className="p-3 border-x border-b border-gray-300 rounded-b-lg space-y-3">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-3 w-full max-w-[160px] mb-1" />
              <Skeleton className="h-2 w-20" />
            </div>
          </div>
        ))}
    </div>
  </div>
);

// Custom fallback components for error states
const SubforumsErrorFallback = () => (
  <div className="p-6 rounded-lg bg-gray-50 border border-gray-200 text-center">
    <p className="text-gray-600">Unable to load forums content. Please try again later.</p>
  </div>
);

const NewTopicsErrorFallback = () => (
  <div className="w-[300px] p-3 rounded-lg bg-gray-50 border border-gray-200 text-center">
    <p className="text-sm text-gray-600">Unable to load new topics.</p>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="flex justify-center py-8 flex-grow">
        <div className="w-[1250px] 2xl:w-[80%] flex flex-col px-3">
          <div className="w-full flex flex-col lg:flex-row justify-between gap-8">
            <div className="w-full flex flex-col gap-4">
              <BodyHeader />
              <div className="h-1 w-full bg-[#308b6a] rounded-full mt-3 mb-3"></div>
              <ErrorBoundary fallback={<SubforumsErrorFallback />}>
                <Suspense fallback={<PopularSubforumsSkeletons />}>
                  <PopularSubforumsGrid />
                </Suspense>
              </ErrorBoundary>
            </div>
            <div className="flex flex-1 flex-col space-y-14 max-h-auto h-auto">
              <ErrorBoundary fallback={<NewTopicsErrorFallback />}>
                <Suspense fallback={<NewTopicsSkeletons />}>
                  <NewTopicsWrapper />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
