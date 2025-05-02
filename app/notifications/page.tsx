'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@/lib/AuthProvider';
import { Check, MoreVertical, Trash } from 'lucide-react';
import Link from 'next/link';
import { Notification } from '@/components/notifications/types';
import { getNotificationText, getNotificationLink, getTimeAgo } from '@/components/notifications/utils';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuOpen(null);
    };

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      const { data, error } = await supabase
        .from('notifications')
        .select(
          `
          *,
          sender:sender_id (
            account_username,
            account_avatar_url
          ),
          thread:thread_id (
            thread_title
          )
        `
        )
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data as Notification[]);
      }
    } catch (err) {
      console.error('Unexpected error in fetchNotifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    if (!user?.id) return;

    try {
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('notification_id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
      } else {
        setNotifications((prev) => prev.map((n) => (n.notification_id === notificationId ? { ...n, is_read: true } : n)));
      }
    } catch (err) {
      console.error('Error in handleMarkAsRead:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id || notifications.length === 0) return;

    setMarkingAll(true);
    try {
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', user.id).eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error('Error in handleMarkAllAsRead:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    if (!user?.id) return;

    try {
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      const { error } = await supabase.from('notifications').delete().eq('notification_id', notificationId).eq('recipient_id', user.id);

      if (error) {
        console.error('Error deleting notification:', error);
      } else {
        setNotifications((prev) => prev.filter((n) => n.notification_id !== notificationId));
        setMenuOpen(null);
      }
    } catch (err) {
      console.error('Error in handleDeleteNotification:', err);
    }
  };

  const toggleMenu = (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === notificationId ? null : notificationId);
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Notifications</h1>
          <p>Please sign in to view your notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {hasUnread && (
          <Button onClick={handleMarkAllAsRead} disabled={markingAll} variant="outline" size="sm">
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex p-4 border rounded-md">
              <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <p className="text-gray-500">You don't have any notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div key={notification.notification_id} className={`p-4 border rounded-md flex items-start ${!notification.is_read ? 'bg-blue-50' : ''}`}>
              {/* Avatar */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mr-4">{notification.sender.account_avatar_url ? <img src={notification.sender.account_avatar_url} alt={`${notification.sender.account_username}'s avatar`} className="w-full h-full object-cover" /> : <span className="text-lg font-medium text-gray-600">{notification.sender.account_username?.charAt(0).toUpperCase() || '?'}</span>}</div>

              {/* Content */}
              <div className="flex-1">
                <Link
                  href={getNotificationLink(notification)}
                  className={`block focus:outline-none ${!notification.is_read ? 'font-medium' : ''}`}
                  onClick={(e) => {
                    if (!notification.is_read) {
                      e.preventDefault();
                      handleMarkAsRead(notification.notification_id).then(() => {
                        window.location.href = getNotificationLink(notification);
                      });
                    }
                  }}>
                  <p className="text-sm text-gray-800">{getNotificationText(notification)}</p>
                  <p className="text-xs text-gray-500 mt-1">{getTimeAgo(notification.created_at)}</p>
                </Link>
              </div>

              {/* Actions */}
              <div className="flex flex-shrink-0 items-center gap-1">
                {/* Mark as read button */}
                {!notification.is_read && (
                  <button onClick={() => handleMarkAsRead(notification.notification_id)} className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Mark as read">
                    <Check className="h-4 w-4" />
                  </button>
                )}

                {/* Triple dot menu */}
                <div className="relative">
                  <button onClick={(e) => toggleMenu(e, notification.notification_id)} className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Notification options">
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {/* Dropdown menu */}
                  {menuOpen === notification.notification_id && (
                    <div className="absolute z-50 top-0 right-8 mt-0 w-10 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.notification_id);
                        }}
                        className="flex items-center justify-center w-full px-2 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md"
                        aria-label="Delete notification">
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
