// app/api/get-forums-with-subforums/route.ts
import { createClientForServer } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClientForServer();

    const { data, error } = await supabase
      .from('Forum')
      .select(
        `
        forum_id, 
        forum_name,
        Subforum (
          subforum_id,
          subforum_name
        )
      `
      )
      .eq('forum_deleted', false)
      .order('forum_name');

    if (error) throw error;

    const forums = data.map((forum) => ({
      id: forum.forum_id,
      name: forum.forum_name,
      subforums: forum.Subforum.map((sub) => ({
        id: sub.subforum_id,
        name: sub.subforum_name
      }))
    }));

    return NextResponse.json(forums);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load forums';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
