'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { User } from '@/app/types/user';
import { RestrictionReason } from '@/app/types/restriction';
import UserTable from './admin/UserTable';
import UserCard from './admin/UserCard';
import SearchBar from './admin/SearchBar';
import Pagination from './admin/Pagination';
import ActionModal from './admin/ActionModal';

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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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

      if (error) {
        throw new Error(error.message || 'Failed to fetch users');
      }

      setUsers(
        users.map((user) => ({
          ...user,
          Role: user.Role?.[0] || { role_type: 'USER' } // Provide default if Role is null/empty
        })) as User[]
      );
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <UserTable
        users={currentItems}
        onAction={(user, action) => {
          setSelectedUser(user);
          setAction(action);
        }}
      />

      <UserCard
        users={currentItems}
        onAction={(user, action) => {
          setSelectedUser(user);
          setAction(action);
        }}
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {selectedUser && action && <ActionModal user={selectedUser} action={action} reason={reason} endDate={endDate} notes={notes} onReasonChange={setReason} onEndDateChange={setEndDate} onNotesChange={setNotes} onConfirm={handleAction} onCancel={resetForm} />}
    </div>
  );
}
