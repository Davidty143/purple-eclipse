import { createClientForServer } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
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

    // Direct query to check user and role
    const { data, error } = await supabase
      .from('Account')
      .select(
        `
        account_id,
        account_role_id,
        Role:Role (
          role_id,
          role_type
        )
      `
      )
      .eq('account_id', session.user.id)
      .single();

    console.log(data);

    if (error) {
      console.error('Query error:', error);
      return NextResponse.json(
        {
          error: 'Query failed',
          details: error.message,
          userId: session.user.id
        },
        { status: 500 }
      );
    }

    // Also check what roles exist in the system
    const { data: allRoles, error: rolesError } = await supabase.from('Role').select('role_id, role_type');

    console.log(allRoles);

    return NextResponse.json({
      userId: session.user.id,
      userData: data,
      allRoles: rolesError ? [] : allRoles,
      queryDetails: {
        accountExists: !!data,
        hasRole: !!data?.Role,
        roleType: data?.Role?.[0]?.role_type
      }
    });
  } catch (error: any) {
    console.error('Error checking role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
