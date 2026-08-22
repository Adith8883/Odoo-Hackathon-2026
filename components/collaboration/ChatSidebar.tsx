'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getInitials } from '@/utils/formatters';
import { formatRelativeDate } from '@/utils/date';
import type { Conversation } from '@/types/collaboration.types';
import { Search, MessageSquare, Users, Megaphone } from 'lucide-react';
import { useState } from 'react';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  currentUserId?: string;
  filter?: 'all' | 'direct' | 'group' | 'announcement';
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelect,
  currentUserId,
  filter = 'all',
}: ChatSidebarProps) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) => {
    if (filter !== 'all' && c.type !== filter) return false;
    if (!search.trim()) return true;

    const term = search.toLowerCase();
    const displayName = getConversationName(c, currentUserId);
    return displayName.toLowerCase().includes(term);
  });

  return (
    <div className="flex flex-col h-full border-r border-border/40 bg-card">
      {/* Search */}
      <div className="p-3 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 rounded-xl text-xs bg-muted/30 border-border/40"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-12 px-4 text-center text-xs text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="font-semibold text-foreground">No conversations</p>
            <p className="mt-0.5">Start a new chat to begin messaging.</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const name = getConversationName(conv, currentUserId);
            const avatar = getConversationAvatar(conv, currentUserId);
            const lastMsg = conv.last_message;
            const unread = conv.unread_count || 0;

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  'w-full px-3 py-3 flex items-center gap-3 text-left border-b border-border/20 transition-all cursor-pointer',
                  isActive
                    ? 'bg-primary/5 border-l-2 border-l-primary'
                    : 'hover:bg-muted/30'
                )}
              >
                <Avatar className="h-9 w-9 shrink-0 border border-border/40">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className={cn(
                    'text-xs font-semibold',
                    conv.type === 'group' ? 'bg-indigo-500/10 text-indigo-600' :
                    conv.type === 'announcement' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-primary/10 text-primary'
                  )}>
                    {conv.type === 'group' ? (
                      <Users className="w-4 h-4" />
                    ) : conv.type === 'announcement' ? (
                      <Megaphone className="w-4 h-4" />
                    ) : (
                      getInitials(name)
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={cn(
                      'text-xs truncate',
                      unread > 0 ? 'font-bold text-foreground' : 'font-semibold text-foreground/90'
                    )}>
                      {name}
                    </span>
                    {lastMsg && (
                      <span className="text-[10px] text-muted-foreground/70 shrink-0 font-mono">
                        {formatRelativeDate(lastMsg.created_at)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p className="text-[11px] text-muted-foreground truncate leading-relaxed">
                      {lastMsg ? lastMsg.content.substring(0, 50) + (lastMsg.content.length > 50 ? '...' : '') : 'No messages yet'}
                    </p>
                    {unread > 0 && (
                      <Badge className="h-4.5 min-w-[18px] px-1.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full shrink-0">
                        {unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function getConversationName(conv: Conversation, currentUserId?: string): string {
  if (conv.type === 'announcement') return conv.name || 'Company Announcements';
  if (conv.type === 'group') return conv.name || 'Unnamed Group';

  // Direct: show other participant's name
  const other = (conv.participants || []).find(
    (p) => p.user_id !== currentUserId
  );
  return other?.profile?.full_name || 'Direct Message';
}

function getConversationAvatar(conv: Conversation, currentUserId?: string): string | undefined {
  if (conv.type === 'direct') {
    const other = (conv.participants || []).find(
      (p) => p.user_id !== currentUserId
    );
    return other?.profile?.avatar_url || undefined;
  }
  return undefined;
}
