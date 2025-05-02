'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, MoreVertical, Trash } from 'lucide-react';
import { Notification } from './types';
import { getNotificationText, getNotificationLink, getTimeAgo } from './utils';

interface NotificationItemProps {
  notification: Notification;
  handleMarkAsRead: (notificationId: number) => Promise<void>;
  handleDeleteNotification?: (notificationId: number) => Promise<void>;
  compact?: boolean;
}

export default function NotificationItem({ notification, handleMarkAsRead, handleDeleteNotification, compact = true }: NotificationItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (handleDeleteNotification) {
      await handleDeleteNotification(notification.notification_id);
    }
    closeMenu();
  };

  return (
    <li className={`${!notification.is_read ? 'bg-blue-50' : ''} transition-colors duration-200`}>
      <div className="px-4 py-3 flex items-start space-x-3 hover:bg-gray-50">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">{notification.sender.account_avatar_url ? <img src={notification.sender.account_avatar_url} alt={`${notification.sender.account_username}'s avatar`} className="w-full h-full object-cover" /> : <span className="text-lg font-medium text-gray-600">{notification.sender.account_username?.charAt(0).toUpperCase() || '?'}</span>}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link
            href={getNotificationLink(notification)}
            className={`block focus:outline-none ${!notification.is_read ? 'font-medium' : ''}`}
            onClick={(e) => {
              if (!notification.is_read) {
                e.preventDefault();
                handleMarkAsRead(notification.notification_id)
                  .then(() => {
                    // Navigate programmatically after marking as read
                    window.location.href = getNotificationLink(notification);
                  })
                  .catch((err) => {
                    console.error('Error handling mark as read:', err);
                    // Navigate anyway if there's an error
                    window.location.href = getNotificationLink(notification);
                  });
              }
            }}>
            <p className="text-sm text-gray-800 line-clamp-2">{getNotificationText(notification)}</p>
            <p className="text-xs text-gray-500 mt-1">{getTimeAgo(notification.created_at)}</p>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-1">
          {/* Mark as read button */}
          {!notification.is_read && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                handleMarkAsRead(notification.notification_id).catch((err) => console.error('Error handling mark as read button:', err));
              }}
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Mark as read">
              <Check className="h-4 w-4" />
            </button>
          )}

          {/* Triple dot menu */}
          <div className="relative">
            <button onClick={toggleMenu} className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Notification options">
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={closeMenu} />
                <div className="absolute z-20 top-0 right-8 mt-0 w-10 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1">
                  {handleDeleteNotification && (
                    <button onClick={handleDelete} className="flex items-center justify-center w-full px-2 py-2 text-sm text-left text-red-600 hover:bg-gray-100 rounded-md" aria-label="Delete notification">
                      <Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
