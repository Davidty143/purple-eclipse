'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';

export default function RestrictedPage() {
  const [restrictionDetails, setRestrictionDetails] = useState<{
    reason: string | null;
    endDate: string | null;
    notes: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchRestrictionDetails = async () => {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase.from('Account').select('restriction_reason, restriction_end_date, restriction_notes').eq('account_id', user.id).single();

        if (data) {
          setRestrictionDetails({
            reason: data.restriction_reason,
            endDate: data.restriction_end_date,
            notes: data.restriction_notes
          });
        }
      }
    };

    fetchRestrictionDetails();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-yellow-600 mb-4">Account Restricted</h1>

        <div className="space-y-4">
          <p className="text-gray-700">Your account has been restricted. You cannot post or comment until the restriction is lifted.</p>

          {restrictionDetails && (
            <div className="bg-yellow-50 p-4 rounded-md">
              <h2 className="font-semibold mb-2">Restriction Details:</h2>
              <p>
                <strong>Reason:</strong> {restrictionDetails.reason || 'Not specified'}
              </p>
              {restrictionDetails.endDate && (
                <p>
                  <strong>End Date:</strong> {new Date(restrictionDetails.endDate).toLocaleDateString()}
                </p>
              )}
              {restrictionDetails.notes && (
                <p>
                  <strong>Notes:</strong> {restrictionDetails.notes}
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
