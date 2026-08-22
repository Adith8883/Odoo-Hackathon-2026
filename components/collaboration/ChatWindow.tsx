'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getInitials } from '@/utils/formatters';
import { formatTime, formatDate } from '@/utils/date';
import type { Conversation, Message } from '@/types/collaboration.types';
import { Send, Paperclip, Loader2, Users, Megaphone, ArrowLeft, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';

interface ChatWindowProps {
  conversation: Conversation | undefined;
  messages: Message[];
  currentUserId?: string;
  currentUserName?: string;
  isLoading?: boolean;
  onSendMessage: (content: string, fileData?: { url: string; name: string; type: string; size: number }) => Promise<void>;
  onBack?: () => void;
}

export function ChatWindow({
  conversation,
  messages,
  currentUserId,
  currentUserName,
  isLoading,
  onSendMessage,
  onBack,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const msgContent = inputValue.trim();
    setInputValue('');
    setIsSending(true);
    try {
      await onSendMessage(msgContent);
    } catch (err: any) {
      toast.error('Failed to send message', { description: err?.message });
      setInputValue(msgContent); // Restore on failure
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum file size is 10MB.' });
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage.from('chat-files').getPublicUrl(fileName);

      await onSendMessage(`📎 Shared: ${file.name}`, {
        url: publicUrl.publicUrl,
        name: file.name,
        type: file.type,
        size: file.size,
      });

      toast.success('File shared successfully');
    } catch (err: any) {
      toast.error('File upload failed', { description: err?.message || 'Please try again.' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/10">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Send className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Select a Conversation</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Choose a chat from the sidebar or start a new conversation with a colleague.
        </p>
      </div>
    );
  }

  // Header info
  const convName =
    conversation.type === 'announcement'
      ? conversation.name || 'Company Announcements'
      : conversation.type === 'group'
      ? conversation.name || 'Project Group'
      : (conversation.participants || []).find((p) => p.user_id !== currentUserId)?.profile?.full_name || 'Direct Message';

  const memberCount = (conversation.participants || []).length;

  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = [];
  let currentDate = '';
  messages.forEach((msg) => {
    const d = formatDate(msg.created_at, 'EEEE, d MMMM yyyy');
    if (d !== currentDate) {
      currentDate = d;
      groupedMessages.push({ date: d, msgs: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].msgs.push(msg);
    }
  });

  return (
    <div className="flex-1 flex flex-col bg-background h-full">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-border/40 bg-card flex items-center gap-3 shrink-0">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0 lg:hidden">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}

        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-border/40"
          style={{
            background: conversation.type === 'group' ? 'rgb(99 102 241 / 0.1)' :
              conversation.type === 'announcement' ? 'rgb(245 158 11 / 0.1)' : 'rgb(79 70 229 / 0.1)'
          }}
        >
          {conversation.type === 'group' ? (
            <Users className="w-4 h-4 text-indigo-600" />
          ) : conversation.type === 'announcement' ? (
            <Megaphone className="w-4 h-4 text-amber-600" />
          ) : (
            <span className="text-xs font-bold text-primary">
              {getInitials(convName)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate">{convName}</h3>
          <p className="text-[10px] text-muted-foreground">
            {conversation.type === 'direct'
              ? 'Private message'
              : conversation.type === 'announcement'
              ? 'Company-wide broadcast'
              : `${memberCount} members`}
          </p>
        </div>

        {conversation.type !== 'direct' && (
          <Badge variant="outline" className="text-[10px] capitalize shrink-0">
            {conversation.type}
          </Badge>
        )}
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-5">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">No messages yet</p>
            <p className="mt-0.5">Send the first message to start the conversation!</p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date Separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-border/30" />
                <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                  {group.date}
                </span>
                <div className="flex-1 border-t border-border/30" />
              </div>

              {/* Messages */}
              <div className="space-y-2">
                {group.msgs.map((msg) => {
                  const isMe = msg.sender_id === currentUserId;
                  const senderName = isMe
                    ? (currentUserName || 'Me')
                    : (msg.sender?.full_name || 'User');
                  const isAnnouncement = msg.is_announcement;

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-2.5 max-w-[85%]',
                        isMe ? 'ml-auto flex-row-reverse' : '',
                        isAnnouncement ? 'max-w-full' : ''
                      )}
                    >
                      {!isMe && (
                        <Avatar className="h-7 w-7 shrink-0 mt-1 border border-border/40">
                          <AvatarImage src={msg.sender?.avatar_url} />
                          <AvatarFallback className="text-[10px] font-semibold bg-muted">
                            {getInitials(senderName)}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={cn(
                        'rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed',
                        isAnnouncement
                          ? 'bg-amber-500/10 border border-amber-500/30 text-foreground w-full'
                          : isMe
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-muted/60 text-foreground rounded-tl-sm border border-border/40'
                      )}>
                        {!isMe && !isAnnouncement && (
                          <p className="text-[10px] font-bold text-primary mb-1">{senderName}</p>
                        )}
                        {isAnnouncement && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                              HR Announcement
                            </span>
                          </div>
                        )}

                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                        {msg.file_url && (
                          <a
                            href={msg.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              'mt-2 flex items-center gap-1.5 text-[11px] underline underline-offset-2',
                              isMe ? 'text-primary-foreground/80' : 'text-primary'
                            )}
                          >
                            <FileText className="w-3 h-3" />
                            {msg.file_name || 'Download File'}
                          </a>
                        )}

                        <p className={cn(
                          'text-[9px] mt-1.5 font-mono',
                          isMe ? 'text-primary-foreground/60 text-right' : 'text-muted-foreground/60'
                        )}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-border/40 bg-card shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.txt,.zip"
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-9 w-9 p-0 text-muted-foreground hover:text-primary shrink-0"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </Button>

          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-xl text-xs h-9 bg-muted/30 border-border/40"
            disabled={isSending}
          />

          <Button
            type="submit"
            size="sm"
            disabled={!inputValue.trim() || isSending}
            className="h-9 w-9 p-0 bg-primary text-primary-foreground rounded-xl shrink-0 shadow-xs"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
