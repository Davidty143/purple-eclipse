'use client';

import React, { useState, useEffect } from 'react';
import { SubforumBlock } from './SubforumBlock';
import { getSubforumsData } from '../lib/subforumApi';
import { SubforumData } from '@/types/forum';
import { Skeleton } from '@/components/ui/skeleton';

export function PopularSubforumsGrid() {
  // State for client-side rendering
  const [subforums, setSubforums] = useState<SubforumData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data client-side to avoid hydration mismatch
    getSubforumsData()
      .then((data) => {
        setSubforums(data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching subforums data:', error);
        setLoading(false);
      });
  }, []);

  // While loading, show skeletons
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, subforumIdx) => (
          <div key={subforumIdx} className="border rounded-lg space-y-4 w-full">
            {/* Subforum title skeleton */}
            <div className="border-b p-4 w-full">
              <Skeleton className="h-6 w-40 rounded" />
            </div>
            {/* 5 thread skeletons per subforum */}
            {[...Array(5)].map((_, threadIdx) => (
              <div key={threadIdx} className="flex items-start gap-4 py-3 px-2">
                {/* Avatar Skeleton */}
                <Skeleton className="h-12 w-12 rounded-full mt-1 flex-shrink-0" />

                {/* Right Side */}
                <div className="flex-1 min-w-0 mt-1.5 space-y-2">
                  {/* Top row: tag + title */}
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-1/3 rounded" />
                  </div>

                  {/* Bottom row: username + date */}
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // If no subforums and loading is finished, show the "No active subforums" message
  if (!loading && subforums.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No active subforums found.</p>
      </div>
    );
  }

  // Once data is available, render the subforums
  return (
    <div className="space-y-6">
      {subforums.map((subforum: SubforumData) => (
        <SubforumBlock key={subforum.subforum_id} subforum={subforum} />
      ))}
    </div>
  );
}
