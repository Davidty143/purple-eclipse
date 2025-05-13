import { createClientForServer } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';
import { RoleType } from '@prisma/client';

interface AccountWithRole {
  account_id: string;
  account_role: {
    role_type: RoleType;
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
  const { data: account, error: accountError } = await supabase
    .from('Account')
    .select(
      `
      account_id,
      account_role:Role!inner (
        role_type
      )
    `
    )
    .eq('account_id', session.user.id)
    .single();

  if (accountError || !account) {
    return {
      error: 'Account not found',
      status: 404
    };
  }

  // Since we used !inner join, we know account_role exists and is not null
  const typedAccount: AccountWithRole = {
    account_id: account.account_id,
    account_role: {
      role_type: account.account_role[0].role_type as RoleType
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
