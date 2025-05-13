import { createClientForServer } from '@/app/utils/supabase/server';
import { requireAdminRole } from '@/lib/auth-middleware';
import { NextResponse } from 'next/server';

// Use Promise and await for dynamic params
export async function PUT(request: Request, { params }: { params: Promise<{ forumId: string }> }) {
  try {
    // Check if user has admin role
    const adminCheck = await requireAdminRole(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck; // Returns error response if not admin
    }

    // Await params to resolve the promise
    const { forumId } = await params; // Accessing the forumId from params
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
