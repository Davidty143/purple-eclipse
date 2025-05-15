import { NextResponse } from 'next/server';
import { createClientForServer } from '@/app/utils/supabase/server';
import { requireAdminRole } from '@/lib/auth-middleware';
import { restrictUser, banUser, unrestrictUser, unbanUser } from '@/lib/auth-actions';
import { RoleType } from '@prisma/client';

// Define the restriction reasons enum to match the schema
enum RestrictionReason {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  VIOLATION_OF_RULES = 'VIOLATION_OF_RULES',
  OTHER = 'OTHER'
}

interface AccountWithRole {
  account_id: string;
  account_role: {
    role_type: RoleType;
  };
}

export async function POST(request: Request) {
  try {
    // Check if the user is an admin
    const adminAccount = await requireAdminRole(request);
    if (!adminAccount || 'error' in adminAccount) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const typedAdminAccount = adminAccount as AccountWithRole;
    const { action, userId, reason, endDate, notes } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    switch (action) {
      case 'restrict':
        if (!reason || !Object.values(RestrictionReason).includes(reason)) {
          return NextResponse.json({ error: 'Valid reason is required for restriction' }, { status: 400 });
        }
        await restrictUser(userId, reason as RestrictionReason, endDate ? new Date(endDate) : null, notes, typedAdminAccount.account_id);
        break;

      case 'ban':
        if (!reason || !Object.values(RestrictionReason).includes(reason)) {
          return NextResponse.json({ error: 'Valid reason is required for ban' }, { status: 400 });
        }
        await banUser(userId, reason as RestrictionReason, notes, typedAdminAccount.account_id);
        break;

      case 'unrestrict':
        await unrestrictUser(userId);
        break;

      case 'unban':
        await unbanUser(userId);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Action completed successfully' });
  } catch (error: any) {
    console.error('Error in user management:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Check if the user is an admin
    const adminAccount = await requireAdminRole(request);
    if (!adminAccount || 'error' in adminAccount) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const typedAdminAccount = adminAccount as AccountWithRole;
    const supabase = await createClientForServer();

    // Get all users except admins
    const { data: users, error } = await supabase
      .from('Account')
      .select(
        `
        account_id,
        account_username,
        account_email,
        account_status,
        restriction_reason,
        restriction_date,
        restriction_end_date,
        restriction_notes,
        banned_by,
        restricted_by
      `
      )
      .neq('account_role.role_type', typedAdminAccount.account_role.role_type)
      .order('account_username');

    if (error) {
      console.error('Error fetching users:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error in user management:', error);
    return NextResponse.json(
      {
        error: error.message || 'An unexpected error occurred',
        details: error.stack
      },
      { status: 500 }
    );
  }
}
