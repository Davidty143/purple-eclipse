'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';

export default function BannedPage() {
  const [banDetails, setBanDetails] = useState<{
    reason: string | null;
    notes: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchBanDetails = async () => {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase.from('Account').select('restriction_reason, restriction_notes').eq('account_id', user.id).single();

        if (data) {
          setBanDetails({
            reason: data.restriction_reason,
            notes: data.restriction_notes
          });
        }
      }
    };

    fetchBanDetails();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Account Banned</h1>

        <div className="space-y-4">
          <p className="text-gray-700">Your account has been banned. You no longer have access to this website.</p>

          {banDetails && (
            <div className="bg-red-50 p-4 rounded-md">
              <h2 className="font-semibold mb-2">Ban Details:</h2>
              <p>
                <strong>Reason:</strong> {banDetails.reason || 'Not specified'}
              </p>
              {banDetails.notes && (
                <p>
                  <strong>Notes:</strong> {banDetails.notes}
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-gray-500">If you believe this is a mistake, please contact the site administrators.</p>
        </div>
      </div>
    </div>
  );
}
