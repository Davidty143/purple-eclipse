'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { NoSymbolIcon as BanIcon, ShieldCheckIcon, ShieldExclamationIcon, XCircleIcon as ShieldXIcon, UserCircleIcon, EnvelopeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Define the restriction reasons enum
enum RestrictionReason {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  VIOLATION_OF_RULES = 'VIOLATION_OF_RULES',
  OTHER = 'OTHER'
}

interface User {
  account_id: string;
  account_username: string;
  account_email: string;
  account_status: string;
  restriction_reason: RestrictionReason | null;
  restriction_date: string | null;
  restriction_end_date: string | null;
  restriction_notes: string | null;
  banned_by: string | null;
  restricted_by: string | null;
  Role: { role_type: string };
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [action, setAction] = useState<'restrict' | 'ban' | 'unrestrict' | 'unban' | null>(null);
  const [reason, setReason] = useState<RestrictionReason>(RestrictionReason.OTHER);
  const [endDate, setEndDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Starting to fetch users...');

      const { data: users, error } = await supabase
        .from('Account')
        .select(
          `
          account_id,
          account_username,
          account_email,
          account_status,
          restriction_reason,
          restriction_date,
          restriction_end_date,
          restriction_notes,
          banned_by,
          restricted_by,
          Role (
            role_type
          )
        `
        )
        .eq('Role.role_type', 'USER');

      console.log('Supabase response:', { users, error });

      if (error) {
        throw new Error(error.message || 'Failed to fetch users');
      }

      setUsers(
        users.map((user) => ({
          ...user,
          Role: user.Role
        })) as unknown as User[]
      );
    } catch (err: any) {
      console.error('Detailed error:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const username = user.account_username?.toLowerCase() || '';
    const email = user.account_email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return username.includes(query) || email.includes(query);
  });

  // Calculate pagination for filtered users
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleAction = async () => {
    if (!selectedUser || !action) return;

    try {
      setError(null);
      setMessage(null);

      const response = await fetch('/api/admin/user-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          userId: selectedUser.account_id,
          reason: action === 'restrict' || action === 'ban' ? reason : undefined,
          endDate: action === 'restrict' ? endDate : undefined,
          notes: notes || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform action');
      }

      setMessage('Action completed successfully');
      await fetchUsers();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to perform action');
      console.error('Error performing action:', err);
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setAction(null);
    setReason(RestrictionReason.OTHER);
    setEndDate('');
    setNotes('');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
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
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
        <button onClick={fetchUsers} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by username or email..." className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm" />
      </div>

      {/* Desktop table view - hidden on mobile */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <div className="min-w-full divide-y divide-gray-200">
          <div className="bg-gray-50">
            <div className="grid grid-cols-4 gap-4 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div>Username</div>
              <div>Email</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
          </div>
          <div className="bg-white divide-y divide-gray-200">
            {currentItems.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">{searchQuery ? 'No users found matching your search' : 'No users found'}</div>
            ) : (
              currentItems.map((user) => (
                <div key={user.account_id} className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="text-sm text-gray-900 truncate">{user.account_username}</div>
                  <div className="text-sm text-gray-900 truncate">{user.account_email}</div>
                  <div>
                    <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${user.account_status === 'BANNED' ? 'bg-red-100 text-red-800' : user.account_status === 'RESTRICTED' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{user.account_status}</span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setAction(user.account_status === 'RESTRICTED' ? 'unrestrict' : 'restrict');
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                      title={user.account_status === 'RESTRICTED' ? 'Unrestrict User' : 'Restrict User'}>
                      {user.account_status === 'RESTRICTED' ? <ShieldCheckIcon className="h-5 w-5" /> : <ShieldExclamationIcon className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setAction(user.account_status === 'BANNED' ? 'unban' : 'ban');
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      title={user.account_status === 'BANNED' ? 'Unban User' : 'Ban User'}>
                      {user.account_status === 'BANNED' ? <ShieldXIcon className="h-5 w-5" /> : <BanIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile card view - hidden on desktop */}
      <div className="md:hidden">
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200 max-h-[70vh] overflow-y-auto shadow-sm">
          {currentItems.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">{searchQuery ? 'No users found matching your search' : 'No users found'}</div>
          ) : (
            currentItems.map((user) => (
              <div key={user.account_id} className="p-4">
                <div className="flex items-center space-x-3">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-medium text-gray-900 truncate">{user.account_username}</div>
                    <div className="flex items-center text-sm text-gray-500">
                      <EnvelopeIcon className="h-4 w-4 mr-1.5" />
                      <span className="truncate">{user.account_email}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap ${user.account_status === 'BANNED' ? 'bg-red-100 text-red-800' : user.account_status === 'RESTRICTED' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{user.account_status}</span>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setAction(user.account_status === 'RESTRICTED' ? 'unrestrict' : 'restrict');
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 p-2.5 text-gray-600 hover:text-blue-600 transition-colors border border-gray-200 rounded-lg hover:bg-blue-50"
                    title={user.account_status === 'RESTRICTED' ? 'Unrestrict User' : 'Restrict User'}>
                    {user.account_status === 'RESTRICTED' ? (
                      <>
                        <ShieldCheckIcon className="h-5 w-5" />
                        <span className="text-sm font-medium">Unrestrict</span>
                      </>
                    ) : (
                      <>
                        <ShieldExclamationIcon className="h-5 w-5" />
                        <span className="text-sm font-medium">Restrict</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setAction(user.account_status === 'BANNED' ? 'unban' : 'ban');
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 p-2.5 text-gray-600 hover:text-red-600 transition-colors border border-gray-200 rounded-lg hover:bg-red-50"
                    title={user.account_status === 'BANNED' ? 'Unban User' : 'Ban User'}>
                    {user.account_status === 'BANNED' ? (
                      <>
                        <ShieldXIcon className="h-5 w-5" />
                        <span className="text-sm font-medium">Unban</span>
                      </>
                    ) : (
                      <>
                        <BanIcon className="h-5 w-5" />
                        <span className="text-sm font-medium">Ban</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`px-4 py-2 rounded-lg text-sm font-medium ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button key={page} onClick={() => handlePageChange(page)} className={`px-4 py-2 rounded-lg text-sm font-medium ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {page}
            </button>
          ))}
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-lg text-sm font-medium ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedUser && action && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-6">{action === 'restrict' ? 'Restrict User' : action === 'ban' ? 'Ban User' : action === 'unrestrict' ? 'Unrestrict User' : 'Unban User'}</h3>

            {(action === 'restrict' || action === 'ban') && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <select value={reason} onChange={(e) => setReason(e.target.value as RestrictionReason)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base">
                    {Object.values(RestrictionReason).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {action === 'restrict' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">End Date (optional)</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base" />
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base" rows={3} />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3">
              <button onClick={resetForm} className="px-4 py-2.5 border rounded-lg hover:bg-gray-50 transition-colors text-base font-medium">
                Cancel
              </button>
              <button onClick={handleAction} className={`px-4 py-2.5 text-white rounded-lg transition-colors text-base font-medium ${action === 'ban' ? 'bg-red-500 hover:bg-red-600' : action === 'restrict' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
