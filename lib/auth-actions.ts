//lib/auth-actions.ts
'use server';
import { createClientForServer } from '@/app/utils/supabase/server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  console.log('Starting login process...');
  const supabase = await createClientForServer();

  try {
    const emailOrUsername = formData.get('emailOrUsername')?.toString().trim();
    const password = formData.get('password')?.toString().trim();
    console.log('Received credentials:', { emailOrUsername, password });

    if (!emailOrUsername) {
      console.error('Validation failed: Missing email/username');
      return { error: 'Email or username is required' };
    }
    if (!password) {
      console.error('Validation failed: Missing password');
      return { error: 'Password is required' };
    }

    let email = emailOrUsername;

    if (!emailOrUsername.includes('@')) {
      console.log('Username detected, looking up email...');
      const { data: userData, error: userError } = await supabase.from('Account').select('account_email').eq('account_username', emailOrUsername).single();

      if (userError || !userData?.account_email) {
        console.error('Username lookup failed:', userError?.message || 'No email found');
        return { error: 'Invalid username or password.' };
      }

      email = userData.account_email;
      console.log('Mapped username to email:', email);
    }

    console.log('Attempting login with email:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Authentication failed:', error.message);
      return { error: 'Invalid username or password.' };
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Unexpected login error:', error);
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
    console.log(error);
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
    console.log('error', error);
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
    console.error('Password update error:', error);
    return { error: error.message, success: '' };
  }

  return { error: '', success: 'Password updated successfully' };
};

export async function updateUsername(formData: FormData) {
  const supabase = await createClientForServer();

  const username = formData.get('username') as string;

  if (!username || username.trim().length === 0) {
    throw new Error('Username cannot be empty.');
  }

  const { data: session, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !session?.user) {
    throw new Error('User not authenticated.');
  }
  console.log('USERNAMEE: ' + username);

  const { error } = await supabase.auth.updateUser({
    data: {
      username: username
    }
  });

  if (error) {
    console.log('Error updating username:', error);
    throw new Error(error.message);
  }

  console.log('Debugging variables:');
  console.log('Username being set:', username);
  console.log('Session user ID:', session?.user?.id); // Optional chaining to prevent errors
  console.log('Table name:', 'Account');
  console.log('Supabase client initialized:', !!supabase); // Check if client exists

  if (!session?.user?.id) {
    console.error('No valid session or user ID!');
    throw new Error('Authentication required');
  }

  const { error: accountUpdateError } = await supabase
    .from('Account')
    .update({
      account_username: username
    })
    .eq('account_id', session.user.id);

  if (accountUpdateError) {
    console.error('Update error details:', {
      errorMessage: accountUpdateError.message,
      errorCode: accountUpdateError.code,
      attemptedUsername: username,
      attemptedUserId: session.user.id
    });
    throw new Error(accountUpdateError.message);
  } else {
    console.log('Update successful for:', {
      userId: session.user.id,
      newUsername: username
    });
  }

  revalidatePath('/');

  redirect('/');
}

export { updatePassword, sendResetPasswordEmail };
