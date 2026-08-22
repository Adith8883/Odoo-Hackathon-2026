'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import {
  getConversations,
  getMessages,
  sendMessage as sendMsgService,
  createDirectConversation as createDirectService,
  createGroupConversation as createGroupService,
  createAnnouncement as createAnnouncementService,
  markConversationAsRead,
} from '@/services/chat.service';
import type { Conversation, Message } from '@/types/collaboration.types';
import { subscribeToTable, unsubscribe } from '@/lib/realtime';

export function useChat() {
  const { user } = useAuth();
  const userId = user?.id;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  // Load user conversations
  const loadConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const convs = await getConversations(userId);
      setConversations(convs);
      if (!activeConversationId && convs.length > 0) {
        setActiveConversationId(convs[0].id);
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, activeConversationId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when active conversation changes
  const loadMessages = useCallback(async () => {
    if (!activeConversationId) return;
    setIsMessagesLoading(true);
    try {
      const msgs = await getMessages(activeConversationId);
      setMessages(msgs);
      if (userId) {
        await markConversationAsRead(activeConversationId, userId);
      }
    } catch (err) {
      console.warn('Failed to load messages:', err);
    } finally {
      setIsMessagesLoading(false);
    }
  }, [activeConversationId, userId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Realtime subscription for incoming messages
  useEffect(() => {
    if (!userId) return;

    const channel = subscribeToTable('messages', undefined, (payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        const newMsg = payload.new;

        // If message belongs to active chat, append to messages list
        if (newMsg.conversation_id === activeConversationId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (userId && activeConversationId) {
            markConversationAsRead(activeConversationId, userId);
          }
        }

        // Refresh conversation list to update latest snippet & ordering
        loadConversations();
      }
    });

    return () => {
      unsubscribe(channel);
    };
  }, [userId, activeConversationId, loadConversations]);

  const sendMessage = async (content: string, fileData?: { url: string; name: string; type: string; size: number }) => {
    if (!activeConversationId || !userId || !content.trim()) return;

    const optimisticId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      conversation_id: activeConversationId,
      sender_id: userId,
      content,
      file_url: fileData?.url || null,
      file_name: fileData?.name || null,
      file_type: fileData?.type || null,
      file_size: fileData?.size || null,
      created_at: new Date().toISOString(),
      sender: {
        id: userId,
        email: user?.email || '',
        full_name: user?.fullName || 'Me',
        role: user?.role || 'employee',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const savedMsg = await sendMsgService({
        conversationId: activeConversationId,
        senderId: userId,
        content,
        fileUrl: fileData?.url,
        fileName: fileData?.name,
        fileType: fileData?.type,
        fileSize: fileData?.size,
      });

      // Replace optimistic message with saved
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? savedMsg : m))
      );
      loadConversations();
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      throw err;
    }
  };

  const startDirectChat = async (targetUserId: string) => {
    if (!userId) return;
    const convId = await createDirectService(userId, targetUserId);
    await loadConversations();
    setActiveConversationId(convId);
    return convId;
  };

  const createGroup = async (name: string, description: string, memberIds: string[]) => {
    if (!userId) return;
    const group = await createGroupService(name, description, userId, memberIds);
    await loadConversations();
    setActiveConversationId(group.id);
    return group;
  };

  const postAnnouncement = async (title: string, content: string, fileUrl?: string) => {
    if (!userId) return;
    const ann = await createAnnouncementService(title, content, userId, fileUrl);
    await loadConversations();
    return ann;
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    messages,
    isLoading,
    isMessagesLoading,
    sendMessage,
    startDirectChat,
    createGroup,
    postAnnouncement,
    refreshConversations: loadConversations,
  };
}
