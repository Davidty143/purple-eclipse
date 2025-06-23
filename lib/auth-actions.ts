//lib/auth-actions.ts
'use server';
import { createClientForServer } from '@/app/utils/supabase/server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

enum RestrictionReason {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  VIOLATION_OF_RULES = 'VIOLATION_OF_RULES',
  OTHER = 'OTHER'
}

interface UserRole {
  Role: {
    role_type: string;
  };
}

interface UserRoleData {
  account_id: string;
  account_role_id: string;
  Role: {
    role_id: string;
    role_type: string;
  };
}

export async function login(formData: FormData) {
  const supabase = await createClientForServer();

  try {
    const emailOrUsername = formData.get('emailOrUsername')?.toString().trim();
    const password = formData.get('password')?.toString().trim();

    if (!emailOrUsername) {
      return { error: 'Email or username is required' };
    }
    if (!password) {
      return { error: 'Password is required' };
    }

    let email = emailOrUsername;
    let userId: string | null = null;

    if (!emailOrUsername.includes('@')) {
      const { data: userData, error: userError } = await supabase.from('Account').select('account_email, account_id, account_status, restriction_end_date').eq('account_username', emailOrUsername).single();

      if (userError || !userData?.account_email) {
        return { error: 'Invalid username or password.' };
      }

      email = userData.account_email;
      userId = userData.account_id;

      // Check account status for username login
      if (userData.account_status === 'BANNED') {
        return { error: 'This account has been banned. Please contact support for more information.' };
      }
      if (userData.account_status === 'RESTRICTED') {
        if (userData.restriction_end_date) {
          const restrictionEnd = new Date(userData.restriction_end_date);
          const now = new Date();
          if (now <= restrictionEnd) {
            return { error: `This account is restricted until ${restrictionEnd.toLocaleDateString()}. Please contact support for more information.` };
          }
        }
        return { error: 'This account is currently restricted. Please contact support for more information.' };
      }
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { error: 'Invalid username or password.' };
    }

    // If we haven't checked status yet (email login), check it now
    if (!userId) {
      const { data: accountData, error: accountError } = await supabase.from('Account').select('account_status, restriction_end_date').eq('account_id', authData.user.id).single();

      if (accountError) {
        return { error: 'Error verifying account status. Please try again.' };
      }
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function signup(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClientForServer();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        username: formData.get('username') as string
      }
    }
  };

  if (formData.get('password') !== formData.get('password_confirm')) {
    return { error: 'Passwords do not match' };
  }

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function signout() {
  const supabase = await createClientForServer();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error('Logout failed');
  }
  revalidatePath('/');
  redirect('/logout');
}

const sendResetPasswordEmail = async (formData: FormData) => {
  const supabase = await createClientForServer();
  const email = formData.get('email');

  if (!email || typeof email !== 'string') {
    return {
      success: '',
      error: 'Email is required.'
    };
  }

  //const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`;

  const redirectUrl = process.env.NODE_ENV === 'development' ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://visconn.vercel.app'}/update-password` : `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`;

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  });

  if (error) {
    return {
      success: '',
      error: error.message
    };
  }

  return {
    success: 'Please check your email to reset your password.',
    error: ''
  };
};

const updatePassword = async (state: { error: string; success: string }, formData: FormData) => {
  const supabase = await createClientForServer();
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  // Basic validation
  if (typeof password !== 'string' || password.length < 8) {
    return { error: 'Password must be at least 8 characters', success: '' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match', success: '' };
  }

  // Simplified regex without special character requirement
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return {
      error: 'Password must contain at least one uppercase letter and one number',
      success: ''
    };
  }

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return { error: 'Recovery link invalid or expired, please retry the recovery process.', success: '' };
  }

  return { error: '', success: 'Password updated successfully' };
};

export async function updateUsername(formData: FormData) {
  const supabase = await createClientForServer();
  const username = (formData.get('username') as string)?.trim();

  if (!username) {
    throw new Error('Username cannot be empty.');
  }
  if (username.length < 3 || username.length > 20) {
    throw new Error('Username must be between 3 and 20 characters.');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new Error('Username can only contain letters, numbers, and underscores.');
  }

  const lowercasedUsername = username.toLowerCase();

  try {
    const { data: existingUsers, error: usernameCheckError } = await supabase.from('Account').select('account_username').ilike('account_username', lowercasedUsername);

    if (usernameCheckError) {
      throw new Error('Error checking username availability.');
    }

    if (existingUsers && existingUsers.length > 0) {
      throw new Error('Username is already taken.');
    }

    const { data: session, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !session?.user) {
      throw new Error('User not authenticated.');
    }

    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: { username }
    });
    if (authUpdateError) {
      throw new Error(authUpdateError.message);
    }

    const { error: accountUpdateError } = await supabase.from('Account').update({ account_username: username }).eq('account_id', session.user.id);

    if (accountUpdateError) {
      throw new Error('That username is already taken or invalid. Please choose a different one.');
    }

    // Success
  } catch (error: any) {
    throw new Error(error.message || 'Something went wrong.');
  }
}

export async function setAdminRole(accountId: string) {
  const supabase = await createClientForServer();

  // First get the admin role ID
  const { data: adminRole, error: roleError } = await supabase.from('Role').select('role_id').eq('role_type', 'ADMIN').single();

  if (roleError) {
    throw new Error('Failed to fetch admin role');
  }

  // Update the account with the admin role
  const { error: updateError } = await supabase.from('Account').update({ account_role_id: adminRole.role_id }).eq('account_id', accountId);

  if (updateError) {
    throw new Error('Failed to update account role');
  }

  return true;
}

export async function restrictUser(userId: string, reason: RestrictionReason, endDate: Date | null, notes: string | null, adminId: string) {
  const supabase = await createClientForServer();

  // First check if the user has the correct role type
  const { data: userRole, error: roleError } = (await supabase
    .from('Account')
    .select(
      `
      account_id,
      account_role_id,
      Role (
        role_id,
        role_type
      )
    `
    )
    .eq('account_id', userId)
    .single()) as { data: UserRoleData | null; error: any };

  if (roleError) {
    throw new Error('Failed to check user role');
  }

  if (!userRole || !userRole.Role || !userRole.Role.role_type) {
    throw new Error('User role not found');
  }

  if (userRole.Role.role_type !== 'USER') {
    throw new Error('Cannot restrict non-user accounts');
  }

  const { error } = await supabase
    .from('Account')
    .update({
      account_status: 'RESTRICTED',
      restriction_reason: reason,
      restriction_date: new Date().toISOString(),
      restriction_end_date: endDate?.toISOString() || null,
      restriction_notes: notes,
      restricted_by: adminId
    })
    .eq('account_id', userId);

  if (error) {
    throw new Error('Failed to restrict user');
  }

  return true;
}

export async function banUser(userId: string, reason: RestrictionReason, notes: string | null, adminId: string) {
  const supabase = await createClientForServer();

  // First check if the user has the correct role type
  const { data: userRole, error: roleError } = (await supabase
    .from('Account')
    .select(
      `
      account_id,
      account_role_id,
      Role (
        role_id,
        role_type
      )
    `
    )
    .eq('account_id', userId)
    .single()) as { data: UserRoleData | null; error: any };

  if (roleError) {
    throw new Error('Failed to check user role');
  }

  if (!userRole || !userRole.Role || !userRole.Role.role_type) {
    throw new Error('User role not found');
  }

  if (userRole.Role.role_type !== 'USER') {
    throw new Error('Cannot ban non-user accounts');
  }

  const { error } = await supabase
    .from('Account')
    .update({
      account_status: 'BANNED',
      restriction_reason: reason,
      restriction_date: new Date().toISOString(),
      restriction_notes: notes,
      banned_by: adminId
    })
    .eq('account_id', userId);

  if (error) {
    throw new Error('Failed to ban user');
  }

  return true;
}

export async function unrestrictUser(userId: string) {
  const supabase = await createClientForServer();

  // First check if the user has the correct role type
  const { data: userRole, error: roleError } = (await supabase
    .from('Account')
    .select(
      `
      account_id,
      account_role_id,
      Role (
        role_id,
        role_type
      )
    `
    )
    .eq('account_id', userId)
    .single()) as { data: UserRoleData | null; error: any };

  if (roleError) {
    throw new Error('Failed to check user role');
  }

  if (!userRole || !userRole.Role || !userRole.Role.role_type) {
    throw new Error('User role not found');
  }

  if (userRole.Role.role_type !== 'USER') {
    throw new Error('Cannot unrestrict non-user accounts');
  }

  const { error } = await supabase
    .from('Account')
    .update({
      account_status: 'ACTIVE',
      restriction_reason: null,
      restriction_date: null,
      restriction_end_date: null,
      restriction_notes: null,
      restricted_by: null
    })
    .eq('account_id', userId);

  if (error) {
    throw new Error('Failed to unrestrict user');
  }

  return true;
}

export async function unbanUser(userId: string) {
  const supabase = await createClientForServer();

  // First check if the user has the correct role type
  const { data: userRole, error: roleError } = (await supabase
    .from('Account')
    .select(
      `
      account_id,
      account_role_id,
      Role (
        role_id,
        role_type
      )
    `
    )
    .eq('account_id', userId)
    .single()) as { data: UserRoleData | null; error: any };

  if (roleError) {
    throw new Error('Failed to check user role');
  }

  if (!userRole || !userRole.Role || !userRole.Role.role_type) {
    throw new Error('User role not found');
  }

  if (userRole.Role.role_type !== 'USER') {
    throw new Error('Cannot unban non-user accounts');
  }

  const { error } = await supabase
    .from('Account')
    .update({
      account_status: 'ACTIVE',
      restriction_reason: null,
      restriction_date: null,
      restriction_end_date: null,
      restriction_notes: null,
      banned_by: null
    })
    .eq('account_id', userId);

  if (error) {
    throw new Error('Failed to unban user');
  }

  return true;
}

export { updatePassword, sendResetPasswordEmail };
