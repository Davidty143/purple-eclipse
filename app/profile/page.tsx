'use client';

import { useEffect, useState } from 'react';
import { useUserRole } from '@/lib/useUserRole';
import UserProfile from './components/UserProfile';
import { createClient } from '@/app/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/login');
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 animate-pulse">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="w-full flex flex-col gap-8">
            <div className="grid gap-8">
              <div className="overflow-hidden border border-gray-300 rounded-lg">
                <div className="py-4 border-b border-gray-300 bg-slate-50">
                  <div className="flex justify-between items-center px-6">
                    <div className="h-6 w-32 bg-gray-200 rounded"></div>
                    <div className="h-9 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row items-start gap-8">
                    <div className="relative self-center md:self-start">
                      <div className="w-32 h-32 rounded-xl bg-gray-200"></div>
                    </div>
                    <div className="space-y-4 flex-1">
                      <div>
                        <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                        <div className="h-7 w-48 bg-gray-200 rounded"></div>
                      </div>
                      <div>
                        <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                        <div className="h-7 w-64 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-8 w-40 bg-gray-200 rounded"></div>

              <div className="overflow-hidden border border-gray-300 rounded-lg">
                <div className="bg-slate-50 border-b border-gray-300 rounded-t-md">
                  <div className="h-6 w-48 bg-gray-200 rounded mx-6 my-4"></div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between items-start p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-8">Your Profile</h1>
        <div className="w-full flex flex-col gap-8">
          <UserProfile user={user} />
        </div>
        <footer className="w-full mt-auto py-4" />
      </div>
    </div>
  );
}
