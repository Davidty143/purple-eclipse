'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ForumTitle } from './ForumTitle';
import { SubforumCard } from './SubforumCard';
import { CreateForumDialog } from './CreateForumDialog';
import { CreateSubforumDialog } from './CreateSubforumDialog';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/lib/useUserRole';

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
  const { isAdmin, loading: roleLoading, userRole } = useUserRole();

  const fetchForums = async () => {
    try {
      const response = await fetch('/api/get-forums-with-subforums');
      if (!response.ok) throw new Error('Failed to fetch forums');
      const data = await response.json();

      setForums(
        data.map((forum: ForumData) => ({
          id: forum.id,
          name: forum.name,
          description: forum.description || '',
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

  const handleDeleteSuccess = () => fetchForums();
  const handleAddSuccess = () => fetchForums();
  const handleEditSuccess = () => fetchForums();

  if (loading || roleLoading) {
    return (
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
          <Skeleton className="w-32 h-6" />
          <Skeleton className=" w-full sm:w-24  h-8" />
        </div>

        <Skeleton className="w-full h-1" />

        {/* Forum Section Skeleton */}
        <div className="space-y-4">
          <div className="h-1 rounded-full w-full mb-6" />

          <div className="flex flex-col border py-4 px-6 rounded-lg w-full gap-2">
            <div className="flex flex-row justify-between items-start flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="w-40 h-6" />
                <span className="px-4 py-4 text-xs font-semibold text-white rounded-full">Forum</span>
              </div>
              <div className="flex gap-1 -mt-1.5">
                <Skeleton className="w-8 h-8" />
                <Skeleton className="w-8 h-8" />
                <Skeleton className="w-8 h-8" />
              </div>
            </div>
            <div className="mt-1">
              <Skeleton className="w-3/4 h-6" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="py-4 px-6 gap-2 border rounded-lg hover:underline hover:text-medium hover:bg-[#edf4f2] cursor-pointer transition-colors">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-8 h-8" />
                  <Skeleton className="w-24 h-6" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forum Section Skeleton */}
        <div className="space-y-4">
          <div className="h-1 rounded-full w-full mb-6" />

          <div className="flex flex-col border py-4 px-6 rounded-lg w-full gap-2">
            <div className="flex flex-row justify-between items-start flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="w-40 h-6" />
                <span className="px-4 py-4 text-xs font-semibold text-white rounded-full">Forum</span>
              </div>
              <div className="flex gap-1 -mt-1.5">
                <Skeleton className="w-8 h-8" />
                <Skeleton className="w-8 h-8" />
                <Skeleton className="w-8 h-8" />
              </div>
            </div>
            <div className="mt-1">
              <Skeleton className="w-3/4 h-6" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="py-4 px-6 gap-2 border rounded-lg hover:underline hover:text-medium hover:bg-[#edf4f2] cursor-pointer transition-colors">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-8 h-8" />
                  <Skeleton className="w-24 h-6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
        <h2 className="text-lg font-semibold">Forums List</h2>
        {isAdmin && <CreateForumDialog onSuccess={handleAddSuccess} />}
      </div>

      {/* Forum Sections */}
      {forums.map((forum) => (
        <div key={forum.id} className="space-y-4">
          <div className="h-1 bg-[#267858] rounded-full w-full mb-6" />

          <ForumTitle title={forum.name} forumId={forum.id} description={forum.description} onAddSuccess={handleAddSuccess} onDeleteSuccess={handleDeleteSuccess} onEditSuccess={handleEditSuccess} showActions={isAdmin} />

          {forum.subforums.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {forum.subforums.map((subforum) => (
                <SubforumCard key={subforum.id} name={subforum.name} subforumId={subforum.id} icon={subforum.icon} showActions={isAdmin} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-2 text-sm text-gray-500 italic px-1">
              <span>There are no subforums in this forum yet.</span>
              {isAdmin && (
                <CreateSubforumDialog parentId={forum.id} parentName={forum.name} onSuccess={handleAddSuccess}>
                  <Button variant="outline" className="text-[#267858] border-[#267858] hover:bg-[#edf4f2]">
                    Create Subforum
                  </Button>
                </CreateSubforumDialog>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
