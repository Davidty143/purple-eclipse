import { SupabaseClient } from '@supabase/supabase-js';

interface Subforum {
  subforum_id: number;
  subforum_name: string | null;
  subforum_description: string | null;
}

export class SubforumRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getActiveSubforums(limit: number = 5): Promise<Subforum[]> {
    const { data, error } = await this.supabase
      .from('Subforum')
      .select(
        `
        subforum_id,
        subforum_name,
        subforum_description
      `
      )
      .eq('subforum_deleted', false)
      .limit(limit);

    if (error) {
      console.error('Error fetching subforums:', error);
      throw new Error(`Subforum fetch error: ${error.message}`);
    }

    return data || [];
  }
}
