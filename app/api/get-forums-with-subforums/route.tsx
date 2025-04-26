//get-forums-with-subforums
import { createClientForServer } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClientForServer();

    const { data, error } = await supabase
      .from('Forum')
      .select(
        `
        forum_id, 
        forum_name,
        forum_description,
        forum_deleted,
        Subforum (
          subforum_id,
          subforum_name,
          subforum_description,
          subforum_deleted,
          subforum_icon 
        )
      `
      )
      .eq('forum_deleted', false)
      .order('forum_name', { ascending: true });

    if (error) throw error;

    const forumsWithSubforums = data.map((forum) => ({
      id: forum.forum_id,
      name: forum.forum_name,
      description: forum.forum_description,
      isDeleted: forum.forum_deleted,
      subforums: forum.Subforum.filter((subforum) => !subforum.subforum_deleted).map((subforum) => ({
        id: subforum.subforum_id,
        name: subforum.subforum_name,
        description: subforum.subforum_description,
        isDeleted: subforum.subforum_deleted,
        icon: subforum.subforum_icon
      }))
    }));

    return NextResponse.json(forumsWithSubforums);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch forums' }, { status: 500 });
  }
}
