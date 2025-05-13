'use client';

import { useEffect } from 'react';
import { createClient } from '@/app/utils/supabase/client'; // ✅ uses your existing export

export default function SessionRefresher() {
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const needsReload = localStorage.getItem('needsReload');
        if (needsReload) {
          localStorage.removeItem('needsReload');
          window.location.reload();
        }
      }
    });
  }, []);

  return null;
}
