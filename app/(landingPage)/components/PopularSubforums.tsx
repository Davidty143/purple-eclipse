'use client';
import React, { useState, useEffect } from 'react';
import { SubforumBlock } from './SubforumBlock';
import { SubforumSkeleton } from './SubforumSkeleton';
import { getSubforumsData } from '../lib/subforumApi';
import { SubforumData } from '@/types/forum';

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

  // Show loading state during initial render
  if (loading) {
    return (
      <div className="space-y-6">
        <SubforumSkeleton />
        <SubforumSkeleton />
      </div>
    );
  }

  // If there was an error, it would be thrown and caught by the nearest error boundary
  if (!subforums || subforums.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No active subforums found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subforums.map((subforum: SubforumData) => (
        <SubforumBlock key={subforum.subforum_id} subforum={subforum} />
      ))}
    </div>
  );
}
