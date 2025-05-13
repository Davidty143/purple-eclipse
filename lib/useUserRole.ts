'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';

interface Role {
  role_type: string;
}

interface AccountWithRole {
  account_role_id: number;
  Role: Role;
}

export function useUserRole() {
  const [adminStatus, setAdminStatus] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUserRole() {
    try {
      const {
        data: { session },
        error: sessionError
      } = await createClient().auth.getSession();
      console.log('Session:', session);
      console.log('Session error:', sessionError);

      if (!session || sessionError) {
        setLoading(false);
        return;
      }

      const {
        data: { user },
        error: userError
      } = await createClient().auth.getUser();
      console.log('User:', user);
      console.log('User error:', userError);

      if (!user || userError) {
        setLoading(false);
        return;
      }

      const { data: accountData, error: accountError } = (await createClient()
        .from('Account')
        .select(
          `
          account_role_id,
          Role (
            role_type
          )
        `
        )
        .eq('account_id', user.id)
        .single()) as { data: AccountWithRole | null; error: any };

      console.log('Account data:', accountData);
      console.log('Account error:', accountError);

      if (!accountData || accountError) {
        setLoading(false);
        return;
      }

      const roleType = accountData.Role?.role_type ?? null;
      console.log('Role type:', roleType);

      setUserRole(roleType);
      setAdminStatus(roleType === 'ADMIN');
    } catch (err) {
      console.error('Error in useUserRole:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUserRole();

    const {
      data: { subscription }
    } = createClient().auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session);
      if (session) {
        fetchUserRole(); // Refresh role info on login
      } else {
        // Clear state on logout
        setUserRole(null);
        setAdminStatus(false);
      }
    });

    return () => subscription.unsubscribe(); // Cleanup on unmount
  }, []);

  return { isAdmin: adminStatus, userRole, loading };
}
