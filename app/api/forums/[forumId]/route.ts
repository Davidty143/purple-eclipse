import { createClientForServer } from '@/app/utils/supabase/server';
import { requireAdminRole } from '@/lib/auth-middleware';
import { NextResponse } from 'next/server';

// Use Promise and await for dynamic params
export async function DELETE(request: Request, { params }: { params: Promise<{ forumId: string }> }) {
  try {
    // Check if user has admin role
    const adminCheck = await requireAdminRole(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck; // Returns error response if not admin
    }

    // Await params to resolve the promise
    const { forumId } = await params; // Accessing the forumId from params
    const supabase = await createClientForServer();

    const { error } = await supabase.from('Forum').update({ forum_deleted: true }).eq('forum_id', forumId);

    if (error) throw error;

    return NextResponse.json({ message: 'Forum deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete forum' }, { status: 500 });
  }
}
