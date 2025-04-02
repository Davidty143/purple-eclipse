import { createClientForServer } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: { forumId: string } }) {
  try {
    const { forumId } = await Promise.resolve(params);

    const supabase = await createClientForServer();

    const { error } = await supabase.from('Forum').update({ forum_deleted: true }).eq('forum_id', forumId);

    if (error) throw error;

    return NextResponse.json({ message: 'Forum deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete forum' }, { status: 500 });
  }
}
