'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/lib/useUserRole';
import AdminUserManagement from '@/app/components/AdminUserManagement';

export default function UserManagementPage() {
  const router = useRouter();
  const { isAdmin, loading } = useUserRole();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/profile');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 animate-pulse">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <div className="min-w-full divide-y divide-gray-200">
                <div className="bg-gray-50">
                  <div className="grid grid-cols-4 gap-4 px-6 py-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-4 w-24 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
                <div className="bg-white divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 px-6 py-4">
                      <div className="h-5 w-32 bg-gray-200 rounded"></div>
                      <div className="h-5 w-48 bg-gray-200 rounded"></div>
                      <div className="h-5 w-24 bg-gray-200 rounded"></div>
                      <div className="flex space-x-2">
                        <div className="h-8 w-24 bg-gray-200 rounded"></div>
                        <div className="h-8 w-20 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-8">User Management</h1>
        <AdminUserManagement />
      </div>
    </div>
  );
}
