'use client';

import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { NewChatDialog } from '@/components/collaboration/NewChatDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MessageSquare, ArrowRight, Inbox } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export default function EmployeeGroupsPage() {
  const { user } = useAuth();
  const {
    conversations,
    isLoading,
    startDirectChat,
    createGroup,
    setActiveConversationId,
  } = useChat();

  const groupConversations = conversations.filter((c) => c.type === 'group');

  if (isLoading && conversations.length === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Project & Team Groups
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Collaborate in focused group channels for your projects, departments, and cross-functional initiatives.
          </p>
        </div>

        <NewChatDialog
          currentUserId={user?.id}
          onStartDirect={startDirectChat}
          onCreateGroup={createGroup}
        />
      </div>

      {/* Groups List */}
      {groupConversations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupConversations.map((group) => {
            const memberCount = (group.participants || []).length;
            const groupName = group.name || 'Unnamed Project Group';

            return (
              <Card
                key={group.id}
                className="rounded-2xl border border-border/60 shadow-sm bg-card hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Header with Icon & Member Count Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <Badge variant="secondary" className="text-[11px] font-medium gap-1">
                        <Users className="w-3 h-3" />
                        {memberCount} {memberCount === 1 ? 'member' : 'members'}
                      </Badge>
                    </div>

                    {/* Group Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {groupName}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {group.description || 'No description provided for this group channel.'}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 border-t border-border/30 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                      Group Channel
                    </span>

                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      onClick={() => setActiveConversationId(group.id)}
                      className="text-xs font-semibold gap-1.5 text-primary hover:text-primary hover:bg-primary/10 rounded-xl"
                    >
                      <Link href={ROUTES.EMPLOYEE.MESSAGES}>
                        Open Chat
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center border border-dashed rounded-2xl bg-card">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-bold text-foreground">No project groups yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            You are not part of any project groups yet. Create a new group or get added to existing team initiatives.
          </p>
          <div className="mt-5">
            <NewChatDialog
              currentUserId={user?.id}
              onStartDirect={startDirectChat}
              onCreateGroup={createGroup}
            />
          </div>
        </div>
      )}
    </div>
  );
}
