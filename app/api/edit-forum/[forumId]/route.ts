import { createClientForServer } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { forumId: string } }) {
  try {
    const { forumId } = await Promise.resolve(params);
    const supabase = await createClientForServer();

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Forum name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('Forum')
      .update({
        forum_name: name,
        forum_description: description
      })
      .eq('forum_id', forumId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
