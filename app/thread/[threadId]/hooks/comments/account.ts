import { createBrowserClient } from '@supabase/ssr';

export const ensureAccountExists = async (user: any): Promise<void> => {
  if (!user?.id) {
    throw new Error('User ID is missing');
  }

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  // Check if the account exists
  const { data: accountData, error: accountError } = await supabase.from('Account').select('account_id').eq('account_id', user.id).single();

  // If the account doesn't exist, create one
  if (accountError || !accountData) {
    console.log('Account not found, creating new account');
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

    const { error: createAccountError } = await supabase.from('Account').insert({
      account_id: user.id,
      account_username: user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
      account_email: user.email,
      account_is_deleted: false,
      account_avatar_url: avatarUrl
    });

    if (createAccountError) {
      console.error('Error creating account:', createAccountError);
      throw new Error(`Account creation failed: ${createAccountError.message}`);
    }
  }
};
