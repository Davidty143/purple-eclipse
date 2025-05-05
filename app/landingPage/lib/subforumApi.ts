import { createCachedFetch } from '@/lib/use-cached-fetch';
import { SubforumData } from '@/types/forum';

// Function to fetch popular subforums data from the API
export const fetchSubforums = async (): Promise<SubforumData[]> => {
  try {
    // Fetch data from an API endpoint instead of direct Supabase access
    const response = await fetch('/api/subforums/popular', {
      cache: 'no-store',
      next: { revalidate: 120 } // 2 minutes cache, matching our TTL
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching subforums:', error);
    return [];
  }
};

// Create a cached fetcher with a 2-minute TTL
export const getSubforumsData = createCachedFetch<SubforumData[]>(
  'popular-subforums',
  fetchSubforums,
  { ttl: 2 * 60 * 1000 } // 2 minutes cache
);
