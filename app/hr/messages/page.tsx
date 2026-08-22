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

export default function HRMessagesPage() {
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
  } = useChat();

  const [showMobileChat, setShowMobileChat] = useState(false);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setShowMobileChat(true);
  };

  const handleBackToSidebar = () => {
    setShowMobileChat(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Messages</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Direct messages, team channels, and organization-wide conversations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NewChatDialog
            currentUserId={user?.id}
            onStartDirect={startDirectChat}
            onCreateGroup={createGroup}
          />
        </div>
      </div>

      {/* Main Messaging Interface */}
      {isLoading ? (
        <div className="h-[calc(100vh-220px)] min-h-[560px] rounded-2xl border border-border/50 bg-card overflow-hidden shadow-xs flex">
          <div className="w-full md:w-80 lg:w-96 border-r border-border/40 p-4 space-y-3 shrink-0">
            <Skeleton className="h-9 w-full rounded-xl" />
            <div className="space-y-2 pt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 bg-muted/10">
            <Skeleton className="w-16 h-16 rounded-2xl mb-4" />
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-3.5 w-64" />
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-220px)] min-h-[560px] rounded-2xl border border-border/50 bg-card overflow-hidden shadow-xs flex">
          {/* Left Sidebar */}
          <div
            className={cn(
              'w-full md:w-80 lg:w-96 shrink-0 h-full border-r border-border/40 flex flex-col',
              showMobileChat ? 'hidden md:flex' : 'flex'
            )}
          >
            <ChatSidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelect={handleSelectConversation}
              currentUserId={user?.id}
            />
          </div>

          {/* Right Chat Window */}
          <div
            className={cn(
              'flex-1 h-full flex flex-col',
              showMobileChat ? 'flex' : 'hidden md:flex'
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
      )}
    </div>
  );
}
