'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPlus } from 'react-icons/fi'; // Add an icon
import { createClient } from '@/app/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Modal component for banned users
const BanModal = () => {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Banned</h2>
          <p className="text-gray-600 mb-6">Your account has been banned from Visconn. Please contact support if you believe this is a mistake.</p>
          <div className="space-y-3">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={() => router.push('/contact')}>
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BodyHeader = () => {
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        const supabase = createClient();

        // Get account status
        const { data: accountData, error: fetchError } = await supabase.from('Account').select('account_status').eq('account_id', user.id).single();

        if (fetchError) {
          console.error('Error fetching account:', fetchError);
          return;
        }

        if (accountData) {
          setUserStatus(accountData.account_status);
        }
      }
    };

    checkUserStatus();
  }, [user]);

  const isDisabled = userStatus === 'RESTRICTED' || userStatus === 'BANNED';

  return (
    <>
      {userStatus === 'BANNED' && <BanModal />}
      <div className="bg-gradient-to-r from-[#267858] to-[#3a9f7e] text-white p-5 rounded-md mb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title */}
          <h1 className="text-lg font-semibold">WELCOME TO VISCONN!</h1>

          {/* Button */}
          <Link href={isDisabled ? '#' : '/post-thread'} className="sm:ml-auto">
            <Button className={`flex items-center gap-2 px-4 text-sm border border-white ${isDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white text-[#267858] hover:bg-gray-100'} w-full sm:w-auto`} disabled={isDisabled}>
              Post Thread
              <FiPlus className={isDisabled ? 'text-gray-500' : 'text-[#267858]'} />
            </Button>
          </Link>
        </div>

        {/* Description */}
        <div className="mt-3 text-sm text-white w-full sm:w-3/5">Visconn is a place to connect, share ideas, and join discussions. Engage with others through threads, comments, and more.</div>
      </div>
    </>
  );
};

export default BodyHeader;
