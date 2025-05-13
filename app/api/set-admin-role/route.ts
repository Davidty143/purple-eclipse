import { setAdminRole } from '@/lib/auth-actions';
import { createClientForServer } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClientForServer();

    // Get the session
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Set the admin role for the current user
    await setAdminRole(session.user.id);

    return NextResponse.json({ message: 'Admin role set successfully' });
  } catch (error: any) {
    console.error('Error setting admin role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
