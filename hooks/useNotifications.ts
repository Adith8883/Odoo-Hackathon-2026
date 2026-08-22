'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getMyNotifications,
  markNotificationAsRead as markReadService,
  markAllNotificationsAsRead as markAllReadService,
} from '@/services/notification.service';
import type { AppNotification } from '@/types/collaboration.types';
import { subscribeToTable, unsubscribe } from '@/lib/realtime';

export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const list = await getMyNotifications(userId);
      setNotifications(list);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription for incoming notifications
  useEffect(() => {
    if (!userId) return;

    const channel = subscribeToTable('notifications', `user_id=eq.${userId}`, () => {
      fetchNotifications();
    });

    return () => {
      unsubscribe(channel);
    };
  }, [userId, fetchNotifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await markReadService(id);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    if (userId) {
      await markAllReadService(userId);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };
}
