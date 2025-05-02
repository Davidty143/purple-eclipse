'use client';

import { ForumTitle } from './ForumTitle';
import { SubforumCard } from './SubforumCard';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateForumDialog } from './CreateForumDialog';
import { Button } from '@/components/ui/button';

interface Subforum {
  id: number;
  name: string;
  icon: string;
}

interface ForumData {
  id: number;
  name: string;
  description?: string;
  subforums: Subforum[];
}

export function ForumComponentWrapper() {
  const [forums, setForums] = useState<ForumData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchForums = async () => {
    try {
      const response = await fetch('/api/get-forums-with-subforums');
      if (!response.ok) throw new Error('Failed to fetch forums');
      const data = await response.json();

      setForums(
        data.map((forum: ForumData) => ({
          id: forum.id,
          name: forum.name,
          description: forum.description || ' ',
          subforums: forum.subforums.map((subforum: Subforum) => ({
            id: subforum.id,
            name: subforum.name,
            icon: subforum.icon
          }))
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForums();
  }, []);

  const handleDeleteSuccess = () => {
    fetchForums();
  };

  const handleAddSuccess = () => {
    fetchForums();
  };

  const handleEditSuccess = () => {
    fetchForums();
  };

  if (loading) return <div className="p-4">Loading forums...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (forums.length === 0)
    return (
      <div className="p-4 text-center">
        <p>No forums available</p>
        <CreateForumDialog onSuccess={handleAddSuccess} />
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Main content header */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-semibold">Forums List</h2>
        <CreateForumDialog onSuccess={handleAddSuccess} />
      </div>
      {forums.map((forum) => (
        <div key={forum.id} className="space-y-4">
          {/* Rounded line above each forum */}
          <div className="h-1 bg-[#267858] rounded-full w-full mb-6" />

          {/* Forum Title */}
          <ForumTitle title={forum.name} forumId={forum.id} description={forum.description} onAddSuccess={handleAddSuccess} onDeleteSuccess={handleDeleteSuccess} onEditSuccess={handleEditSuccess} />

          {/* Subforum grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {forum.subforums.map((subforum) => (
              <SubforumCard key={subforum.id} name={subforum.name} subforumId={subforum.id} icon={subforum.icon} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
