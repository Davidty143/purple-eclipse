'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { RealtimeChannel, SupabaseClient, REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { Notification } from './types';

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const [channelStatus, setChannelStatus] = useState<REALTIME_SUBSCRIBE_STATES | null>(null);
  const [newNotification, setNewNotification] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 seconds

  // Trigger notification animation effect
  const triggerNewNotificationEffect = useCallback(() => {
    setNewNotification(true);
    // Play notification sound if available
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(() => {
        // Ignore errors if sound can't be played
      });
    } catch (e) {
      // Ignore errors if Audio API is not available
    }
    setTimeout(() => setNewNotification(false), 1000);
  }, []);

  // Function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase environment variables are not set');
      }

      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      supabaseRef.current = supabase;

      const { data, error: fetchError } = await supabase
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
        .limit(50); // Increased limit for better user experience

      if (fetchError) throw fetchError;

      if (data) {
        setNotifications(data as Notification[]);
        const unread = data.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Function to setup real-time subscription
  const setupRealtimeSubscription = useCallback(async () => {
    if (!userId || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;

    try {
      // Cleanup any existing subscription
      if (channelRef.current) {
        await channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      supabaseRef.current = supabase;

      // console.log('Setting up real-time subscription for user:', userId);

      const channel = supabase
        .channel(`notifications-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${userId}`
          },
          (payload) => {
            // console.log('Notification change received:', payload);

            // Handle different types of changes
            switch (payload.eventType) {
              case 'INSERT':
                triggerNewNotificationEffect();
                fetchNotifications(); // Refresh the list
                break;
              case 'UPDATE':
                // Update local state for the specific notification
                setNotifications((prev) => prev.map((n) => (n.notification_id === payload.new.notification_id ? { ...n, ...payload.new } : n)));
                // Recalculate unread count
                setNotifications((prev) => {
                  const unread = prev.filter((n) => !n.is_read).length;
                  setUnreadCount(unread);
                  return prev;
                });
                break;
              case 'DELETE':
                // Remove the deleted notification
                setNotifications((prev) => prev.filter((n) => n.notification_id !== payload.old.notification_id));
                // Recalculate unread count
                setNotifications((prev) => {
                  const unread = prev.filter((n) => !n.is_read).length;
                  setUnreadCount(unread);
                  return prev;
                });
                break;
            }
          }
        )
        .subscribe((status) => {
          // console.log('Subscription status:', status);
          setChannelStatus(status);

          if (status === 'SUBSCRIBED') {
            reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful subscription
          } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            // Attempt to reconnect
            if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
              reconnectAttemptsRef.current += 1;
              // console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
              reconnectTimeoutRef.current = setTimeout(setupRealtimeSubscription, RECONNECT_DELAY);
            } else {
              // console.error('Max reconnection attempts reached');
              setError('Lost connection to notifications. Please refresh the page.');
            }
          }
        });

      channelRef.current = channel;
    } catch (err) {
      // console.error('Error setting up real-time subscription:', err);
      setError('Failed to setup real-time notifications');
    }
  }, [userId, fetchNotifications, triggerNewNotificationEffect]);

  // Set up real-time subscription
  useEffect(() => {
    if (userId) {
      setupRealtimeSubscription();
    }

    // Cleanup function
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userId, setupRealtimeSubscription]);

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
        // console.error('Supabase environment variables are not set for marking as read');
        return;
      }

      // Create a fresh client with the authenticated session
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('notification_id', notificationId);

      if (error) {
        // console.error('Error marking notification as read:', error.message || JSON.stringify(error));
      } else {
        // Update local state
        setNotifications((prev) => prev.map((n) => (n.notification_id === notificationId ? { ...n, is_read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      // console.error('Unexpected error marking notification as read:', err);
      throw err; // Re-throw the error to be caught by the caller
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId || notifications.length === 0) return;

    try {
      // Validate environment variables
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // console.error('Supabase environment variables are not set for marking all as read');
        return;
      }

      // Create a fresh client with the authenticated session
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', userId).eq('is_read', false);

      if (error) {
        // console.error('Error marking all notifications as read:', error.message || JSON.stringify(error));
      } else {
        // Update local state
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      // console.error('Unexpected error marking all notifications as read:', err);
      throw err; // Re-throw the error to be caught by the caller
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    if (!userId) return;

    try {
      // Validate environment variables
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // console.error('Supabase environment variables are not set for deleting notification');
        return;
      }

      // Create a fresh client with the authenticated session
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      const { error } = await supabase.from('notifications').delete().eq('notification_id', notificationId).eq('recipient_id', userId);

      if (error) {
        // console.error('Error deleting notification:', error.message || JSON.stringify(error));
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
      // console.error('Unexpected error deleting notification:', err);
      throw err; // Re-throw the error to be caught by the caller
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    newNotification,
    channelStatus,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    fetchNotifications,
    retryConnection: setupRealtimeSubscription
  };
}
