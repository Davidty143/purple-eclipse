import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create a new cookies instance and await it
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current session
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's account status
    const { data: account, error: accountError } = await supabase.from('Account').select('account_status, restriction_end_date').eq('account_id', session.user.id).single();

    if (accountError) {
      console.error('Account error:', accountError);
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Only process if account is RESTRICTED and has an end date
    if (account.account_status === 'RESTRICTED' && account.restriction_end_date) {
      const endDate = new Date(account.restriction_end_date);
      const currentDate = new Date();
      // Set both dates to midnight UTC for date-only comparison
      const endDateUTC = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
      const currentDateUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));

      // If restriction has expired, update status to ACTIVE
      if (endDateUTC < currentDateUTC) {
        const { error: updateError } = await supabase
          .from('Account')
          .update({
            account_status: 'ACTIVE',
            restriction_reason: null,
            restriction_date: null,
            restriction_end_date: null,
            restriction_notes: null,
            restricted_by: null
          })
          .eq('account_id', session.user.id);

        if (updateError) {
          console.error('Update error:', updateError);
          return NextResponse.json({ error: 'Failed to update account status' }, { status: 500 });
        }

        return NextResponse.json({
          status: 'ACTIVE',
          message: 'Account restriction has been lifted'
        });
      }
    }

    // Return current status if no update was needed
    return NextResponse.json({
      status: account.account_status,
      message: 'Account status is current'
    });
  } catch (error) {
    console.error('Error in account status update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
