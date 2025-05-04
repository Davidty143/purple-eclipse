import { SubforumRepository } from '../repositories/subforum-repository';
import { ThreadRepository } from '../repositories/thread-repository';
import { SubforumData } from '../types/forum';
import { createClientForServer } from '@/app/utils/supabase/server';

export async function getPopularSubforums(): Promise<SubforumData[]> {
  const supabase = await createClientForServer();
  const subforumRepo = new SubforumRepository(supabase);
  const threadRepo = new ThreadRepository(supabase);

  // Get active subforums
  const subforumData = await subforumRepo.getActiveSubforums(5);

  if (subforumData.length === 0) {
    return [];
  }

  // For each subforum, fetch threads with author data
  const subforumsWithThreads = await Promise.all(
    subforumData.map(async (subforum) => {
      try {
        const threads = await threadRepo.getThreadsForSubforum(subforum.subforum_id, 5);

        return {
          ...subforum,
          threads
        };
      } catch (err) {
        console.error(`Error processing subforum ${subforum.subforum_id}:`, err);
        // Return subforum with empty threads rather than failing completely
        return {
          ...subforum,
          threads: []
        };
      }
    })
  );

  return subforumsWithThreads;
}
