'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, MoreVertical, Trash } from 'lucide-react';
import { Notification } from './types';
import { getNotificationText, getNotificationLink, getTimeAgo } from './utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NotificationItemProps {
  notification: Notification;
  handleMarkAsRead: (notificationId: number) => Promise<void>;
  handleDeleteNotification?: (notificationId: number) => Promise<void>;
  compact?: boolean;
}

export default function NotificationItem({ notification, handleMarkAsRead, handleDeleteNotification, compact = true }: NotificationItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

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

  const handleNotificationClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!notification.is_read) {
      await handleMarkAsRead(notification.notification_id);
    }

    // Try to fetch the thread/comment to check if it exists
    const response = await fetch(getNotificationLink(notification));

    if (!response.ok) {
      // If the content is not found (404) or any other error, redirect to not-found page
      router.push('/not-found');
      return;
    }

    // If content exists, navigate to it
    router.push(getNotificationLink(notification));
  };

  // Generate fallback text (first letter of username or '?')
  const fallbackText = notification.sender.account_username?.charAt(0).toUpperCase() || '?';

  return (
    <li className={`${!notification.is_read ? 'bg-blue-50' : ''} transition-colors duration-200`}>
      <div className="px-4 py-3 flex items-start space-x-3 hover:bg-gray-50">
        {/* Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0">{notification.sender.account_avatar_url ? <AvatarImage src={notification.sender.account_avatar_url} alt={`${notification.sender.account_username}'s avatar`} className="object-cover" /> : <AvatarFallback className="bg-gray-200 text-gray-700">{fallbackText}</AvatarFallback>}</Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <button onClick={handleNotificationClick} className={`block w-full text-left focus:outline-none ${!notification.is_read ? 'font-medium' : ''}`}>
            <p className="text-sm text-gray-800 line-clamp-2">{getNotificationText(notification)}</p>
            <p className="text-xs text-gray-500 mt-1">{getTimeAgo(notification.created_at)}</p>
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-1">
          {/* Mark as read button */}
          {!notification.is_read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
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
