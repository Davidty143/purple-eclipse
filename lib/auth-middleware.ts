import { createClientForServer } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';
import { RoleType } from '@prisma/client';

interface AccountWithRole {
  account_id: string;
  account_role: {
    role_type: RoleType;
  };
}

interface AccountData {
  account_id: string;
  Role: {
    role_type: string;
  };
}

export async function checkUserRole(request: Request, requiredRole: RoleType = 'ADMIN') {
  const supabase = await createClientForServer();

  // Get the session
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return {
      error: 'Unauthorized',
      status: 401
    };
  }

  // Get the user's account with role information
  const { data: account, error: accountError } = (await supabase
    .from('Account')
    .select(
      `
      account_id,
      Role (
        role_type
      )
    `
    )
    .eq('account_id', session.user.id)
    .single()) as { data: AccountData | null; error: any };

  if (accountError || !account) {
    return {
      error: 'Account not found',
      status: 404
    };
  }

  // Check if role exists
  if (!account.Role || !account.Role.role_type) {
    return {
      error: 'Role not found',
      status: 404
    };
  }

  // Create typed account with role
  const typedAccount: AccountWithRole = {
    account_id: account.account_id,
    account_role: {
      role_type: account.Role.role_type as RoleType
    }
  };

  // Check if user has the required role
  if (typedAccount.account_role.role_type !== requiredRole) {
    return {
      error: 'Forbidden: Insufficient permissions',
      status: 403
    };
  }

  return { account: typedAccount };
}

export async function requireAdminRole(request: Request) {
  const result = await checkUserRole(request, 'ADMIN');

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return result.account;
}
