import { SupabaseClient } from '@supabase/supabase-js';
import { ThreadData } from '../types/forum';

export class ThreadRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getThreadsForSubforum(subforumId: number, limit: number = 5): Promise<ThreadData[]> {
    const { data: threadsData, error: threadsError } = await this.supabase
      .from('Thread')
      .select(
        `
        thread_id,
        thread_title,
        thread_created,
        thread_category,
        comments:Comment(count),
        author:Account!author_id(
          account_username,
          account_email,
          account_avatar_url
        )
      `
      )
      .eq('subforum_id', subforumId)
      .eq('thread_deleted', false)
      .order('thread_created', { ascending: false })
      .limit(limit);

    if (threadsError) {
      console.error(`Error fetching threads for subforum ${subforumId}:`, threadsError.message, threadsError.details, threadsError.hint);
      throw new Error(`Thread fetch error: ${threadsError.message}`);
    }

    if (!threadsData || threadsData.length === 0) {
      return [];
    }

    // Transform data to match our interface
    return threadsData.map((thread: any) => ({
      thread_id: thread.thread_id,
      thread_title: thread.thread_title,
      thread_created: thread.thread_created,
      thread_category: thread.thread_category,
      author: {
        account_username: thread.author?.account_username || null,
        account_email: thread.author?.account_email || null,
        account_avatar_url: thread.author?.account_avatar_url || null
      },
      comments: thread.comments || []
    }));
  }
}
