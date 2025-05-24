'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, RefreshCw } from 'lucide-react';
import { useNotifications } from './useNotifications';
import NotificationItem from './NotificationItem';

export default function NotificationDropdown({ userId }: { userId: string | undefined }) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, loading, error, newNotification, channelStatus, handleMarkAsRead, handleMarkAllAsRead, handleDeleteNotification, retryConnection } = useNotifications(userId);

  // Don't render if no user ID
  if (!userId) return null;

  return (
    <div className="relative lg:z-40 flex justify-end">
      {/* Notification bell icon */}
      <button className={`relative p-2 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#308b6a] ${newNotification ? 'animate-wiggle' : ''} ${error ? 'text-red-500' : channelStatus === 'CHANNEL_ERROR' ? 'text-yellow-500' : ''}`} onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-label="Notifications">
        <Bell className={`h-5 w-5 ${error ? 'text-red-500' : channelStatus === 'CHANNEL_ERROR' ? 'text-yellow-500' : 'text-[#374151]'}`} />
        {unreadCount > 0 && <span className={`absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[1.25rem] min-h-[1.25rem] ${newNotification ? 'animate-pulse' : ''}`}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
              {error && (
                <button onClick={() => retryConnection()} className="p-1 text-red-500 hover:text-red-600 transition-colors focus:outline-none" title="Retry connection">
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="text-xs text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:underline">
                Mark all as read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {error ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-red-500 mb-2">{error}</p>
                <button onClick={() => retryConnection()} className="text-sm text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:underline">
                  Retry connection
                </button>
              </div>
            ) : loading ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                <div className="animate-pulse flex flex-col space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">No notifications yet</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <NotificationItem key={notification.notification_id} notification={notification} handleMarkAsRead={handleMarkAsRead} handleDeleteNotification={handleDeleteNotification} />
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200">
            <Link href="/notifications" className="block w-full text-center px-4 py-2 text-sm text-[#308b6a] hover:font-semibold hover:bg-gray-100 transition-colors" onClick={() => setIsOpen(false)}>
              View all notifications
            </Link>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
