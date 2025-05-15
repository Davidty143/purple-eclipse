import { User } from '@/app/types/user';
import { NoSymbolIcon, ShieldCheckIcon, ShieldExclamationIcon, XCircleIcon as ShieldXIcon, UserCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface UserCardProps {
  users: User[];
  onAction: (user: User, action: 'restrict' | 'ban' | 'unrestrict' | 'unban') => void;
}

export default function UserCard({ users, onAction }: UserCardProps) {
  if (users.length === 0) {
    return <div className="px-6 py-8 text-center text-gray-500">No users found</div>;
  }

  return (
    <div className="md:hidden">
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200 max-h-[70vh] overflow-y-auto shadow-sm">
        {users.map((user) => (
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
              <button onClick={() => onAction(user, user.account_status === 'RESTRICTED' ? 'unrestrict' : 'restrict')} className="flex-1 flex items-center justify-center space-x-2 p-2.5 text-gray-600 hover:text-blue-600 transition-colors border border-gray-200 rounded-lg hover:bg-blue-50" title={user.account_status === 'RESTRICTED' ? 'Unrestrict User' : 'Restrict User'}>
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
              <button onClick={() => onAction(user, user.account_status === 'BANNED' ? 'unban' : 'ban')} className="flex-1 flex items-center justify-center space-x-2 p-2.5 text-gray-600 hover:text-red-600 transition-colors border border-gray-200 rounded-lg hover:bg-red-50" title={user.account_status === 'BANNED' ? 'Unban User' : 'Ban User'}>
                {user.account_status === 'BANNED' ? (
                  <>
                    <ShieldXIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Unban</span>
                  </>
                ) : (
                  <>
                    <NoSymbolIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Ban</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
