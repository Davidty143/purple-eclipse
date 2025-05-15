import { User } from '@/app/types/user';
import { NoSymbolIcon, ShieldCheckIcon, ShieldExclamationIcon, XCircleIcon as ShieldXIcon } from '@heroicons/react/24/outline';

interface UserTableProps {
  users: User[];
  onAction: (user: User, action: 'restrict' | 'ban' | 'unrestrict' | 'unban') => void;
}

export default function UserTable({ users, onAction }: UserTableProps) {
  if (users.length === 0) {
    return <div className="px-6 py-8 text-center text-gray-500">No users found</div>;
  }

  return (
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
          {users.map((user) => (
            <div key={user.account_id} className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="text-sm text-gray-900 truncate">{user.account_username}</div>
              <div className="text-sm text-gray-900 truncate">{user.account_email}</div>
              <div>
                <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${user.account_status === 'BANNED' ? 'bg-red-100 text-red-800' : user.account_status === 'RESTRICTED' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{user.account_status}</span>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => onAction(user, user.account_status === 'RESTRICTED' ? 'unrestrict' : 'restrict')} className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" title={user.account_status === 'RESTRICTED' ? 'Unrestrict User' : 'Restrict User'}>
                  {user.account_status === 'RESTRICTED' ? <ShieldCheckIcon className="h-5 w-5" /> : <ShieldExclamationIcon className="h-5 w-5" />}
                </button>
                <button onClick={() => onAction(user, user.account_status === 'BANNED' ? 'unban' : 'ban')} className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title={user.account_status === 'BANNED' ? 'Unban User' : 'Ban User'}>
                  {user.account_status === 'BANNED' ? <ShieldXIcon className="h-5 w-5" /> : <NoSymbolIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
