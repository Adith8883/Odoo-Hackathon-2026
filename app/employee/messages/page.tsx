'use client';

import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { ChatSidebar } from '@/components/collaboration/ChatSidebar';
import { ChatWindow } from '@/components/collaboration/ChatWindow';
import { NewChatDialog } from '@/components/collaboration/NewChatDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmployeeMessagesPage() {
  const { user } = useAuth();
  const {
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
    refreshConversations,
  } = useChat();

  const [showMobileChat, setShowMobileChat] = useState(false);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setShowMobileChat(true);
  };

  const handleBackToSidebar = () => {
    setShowMobileChat(false);
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>

        {/* Split Panel Skeleton */}
        <div className="h-[650px] lg:h-[700px] rounded-2xl border border-border/40 bg-card overflow-hidden grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-4 lg:col-span-4 border-r border-border/40 p-3 space-y-3">
            <Skeleton className="h-9 rounded-xl" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>
          <div className="hidden md:flex md:col-span-8 lg:col-span-8 flex-col justify-between p-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border/40">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="space-y-4 py-8 max-w-md mx-auto w-full">
              <Skeleton className="h-12 w-3/4 rounded-2xl" />
              <Skeleton className="h-12 w-2/3 ml-auto rounded-2xl" />
              <Skeleton className="h-12 w-4/5 rounded-2xl" />
            </div>
            <Skeleton className="h-10 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Messages & Team Chat
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Collaborate in realtime with team members, project groups, and company channels.
          </p>
        </div>

        <NewChatDialog
          currentUserId={user?.id}
          onStartDirect={startDirectChat}
          onCreateGroup={createGroup}
        />
      </div>

      {/* Split Panel Layout */}
      <div className="h-[650px] lg:h-[700px] rounded-2xl border border-border/40 bg-card overflow-hidden shadow-xs flex">
        {/* Left Sidebar */}
        <div
          className={cn(
            'w-full md:w-80 lg:w-88 shrink-0 flex-col h-full bg-card',
            showMobileChat && activeConversationId ? 'hidden md:flex' : 'flex'
          )}
        >
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelect={handleSelectConversation}
            currentUserId={user?.id}
            filter="all"
          />
        </div>

        {/* Right Chat Window */}
        <div
          className={cn(
            'flex-1 flex-col h-full min-w-0 bg-background',
            !showMobileChat && !activeConversationId ? 'hidden md:flex' : 'flex'
          )}
        >
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            currentUserId={user?.id}
            currentUserName={user?.fullName}
            isLoading={isMessagesLoading}
            onSendMessage={sendMessage}
            onBack={handleBackToSidebar}
          />
        </div>
      </div>
    </div>
  );
}
