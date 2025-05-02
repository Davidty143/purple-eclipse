'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { RealtimeChannel, SupabaseClient, REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { Notification } from './types';

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const [channelStatus, setChannelStatus] = useState<REALTIME_SUBSCRIBE_STATES | null>(null);
  const [newNotification, setNewNotification] = useState(false);
  const channelEstablished = useRef(false);

  // Trigger notification animation effect
  const triggerNewNotificationEffect = useCallback(() => {
    // Trigger animation
    setNewNotification(true);
    setTimeout(() => setNewNotification(false), 1000);
  }, []);

  // Function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Validate that environment variables are set
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabase environment variables are not set');
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      // Always create a fresh client with authenticated user session
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      // Store the client for reuse
      supabaseRef.current = supabase;

      // Get notifications using the authenticated session
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
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error.message || JSON.stringify(error));
        setNotifications([]);
      } else if (data) {
        try {
          setNotifications(data as Notification[]);
          const unread = data.filter((n) => !n.is_read).length;
          setUnreadCount(unread);
        } catch (err) {
          console.error('Error processing notification data:', err);
          setNotifications([]);
          setUnreadCount(0);
        }
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Unexpected error in fetchNotifications:', err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    console.log('Setting up real-time subscription');

    try {
      // Create a fresh client with the authenticated session
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      // Store for future use
      supabaseRef.current = supabase;

      const channel = supabase
        .channel('custom-insert-channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` }, (payload) => {
          console.log('New notification:', payload);
          fetchNotifications();
          triggerNewNotificationEffect();
        })
        .subscribe();

      // Store the channel reference
      channelRef.current = channel;

      // Return cleanup function
      return () => {
        channel.unsubscribe();
      };
    } catch (err) {
      console.error('Error setting up real-time subscription:', err);
    }
  }, [userId, fetchNotifications, triggerNewNotificationEffect]);

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: number) => {
    if (!userId) return;

    try {
      // Validate environment variables
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabase environment variables are not set for marking as read');
        return;
      }

      // Create a fresh client with the authenticated session
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('notification_id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error.message || JSON.stringify(error));
      } else {
        // Update local state
        setNotifications((prev) => prev.map((n) => (n.notification_id === notificationId ? { ...n, is_read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Unexpected error marking notification as read:', err);
      throw err; // Re-throw the error to be caught by the caller
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId || notifications.length === 0) return;

    try {
      // Validate environment variables
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabase environment variables are not set for marking all as read');
        return;
      }

      // Create a fresh client with the authenticated session
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', userId).eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error.message || JSON.stringify(error));
      } else {
        // Update local state
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Unexpected error marking all notifications as read:', err);
      throw err; // Re-throw the error to be caught by the caller
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    if (!userId) return;

    try {
      // Validate environment variables
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabase environment variables are not set for deleting notification');
        return;
      }

      // Create a fresh client with the authenticated session
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      const { error } = await supabase.from('notifications').delete().eq('notification_id', notificationId).eq('recipient_id', userId);

      if (error) {
        console.error('Error deleting notification:', error.message || JSON.stringify(error));
      } else {
        // Update local state
        const deletedNotification = notifications.find((n) => n.notification_id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.notification_id !== notificationId));

        // Update unread count if the deleted notification was unread
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Unexpected error deleting notification:', err);
      throw err; // Re-throw the error to be caught by the caller
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    newNotification,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    fetchNotifications
  };
}
