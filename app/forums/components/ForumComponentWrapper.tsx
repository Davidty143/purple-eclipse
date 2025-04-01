// components/forum-wrapper.tsx
'use client';

import { ForumTitle } from './ForumTitle';
import { SubforumCard } from './SubforumCard';
import { useEffect, useState } from 'react';

interface Subforum {
  id: number;
  name: string;
}

interface ForumData {
  id: number;
  name: string;
  subforums: Subforum[];
}

export function ForumComponentWrapper() {
  const [forums, setForums] = useState<ForumData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchForums() {
      try {
        const response = await fetch('/api/get-forums-with-subforums');
        if (!response.ok) throw new Error('Failed to fetch forums');
        const data = await response.json();

        // Print the raw API response to console
        console.log('API Response:', data);

        setForums(data);

        // Also print the transformed data that will be used in the component
        console.log(
          'Mapped Forum Data:',
          data.map((forum) => ({
            id: forum.id,
            name: forum.name,
            subforums: forum.subforums.map((sub) => ({
              id: sub.id,
              name: sub.name
            }))
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchForums();
  }, []);

  if (loading) return <div className="p-4">Loading forums...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (forums.length === 0) return <div className="p-4">No forums available</div>;

  return (
    <div className="space-y-8">
      {forums.map((forum) => (
        <div key={forum.id} className="space-y-4">
          <ForumTitle title={forum.name} showActions={true} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {forum.subforums.map((subforum) => (
              <SubforumCard key={subforum.id} name={subforum.name} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
