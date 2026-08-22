'use client';

import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { NewChatDialog } from '@/components/collaboration/NewChatDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MessageSquare, ArrowRight, Inbox, Shield } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getInitials } from '@/utils/formatters';

export default function HRGroupsPage() {
  const { user } = useAuth();
  const { conversations, isLoading, startDirectChat, createGroup } = useChat();

  const groups = conversations.filter((c) => c.type === 'group');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Project Groups</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Create, oversee, and participate in department and cross-functional team channels.
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

      {/* Group List / Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="rounded-2xl border border-border/40 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="py-16 text-center border border-dashed rounded-2xl bg-card">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-base font-bold text-foreground">No Groups Created Yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Create collaborative spaces for projects, departments, and cross-functional teams to communicate.
          </p>
          <div className="mt-5 flex justify-center">
            <NewChatDialog
              currentUserId={user?.id}
              onStartDirect={startDirectChat}
              onCreateGroup={createGroup}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const memberCount = group.participants?.length || 0;
            const isCreator = group.created_by === user?.id;

            return (
              <Card
                key={group.id}
                className="rounded-2xl border border-border/50 bg-card hover:border-indigo-500/40 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Card Top */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-500/20">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-foreground truncate">
                            {group.name || 'Unnamed Group'}
                          </h3>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
                          </span>
                        </div>
                      </div>

                      {isCreator && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20 shrink-0 gap-1"
                        >
                          <Shield className="w-2.5 h-2.5" />
                          Lead
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed min-h-[36px]">
                      {group.description || 'No description provided for this group channel.'}
                    </p>
                  </div>

                  {/* Card Bottom */}
                  <div className="pt-3 border-t border-border/30 space-y-3">
                    <div className="flex items-center justify-between">
                      {/* Member avatars */}
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {(group.participants || []).slice(0, 4).map((p) => (
                          <Avatar key={p.id} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={p.profile?.avatar_url} />
                            <AvatarFallback className="text-[9px] bg-muted font-bold">
                              {getInitials(p.profile?.full_name || '?')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {memberCount > 4 && (
                          <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                            +{memberCount - 4}
                          </div>
                        )}
                      </div>

                      <Link href={ROUTES.HR.MESSAGES}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs font-semibold gap-1 text-primary hover:text-primary hover:bg-primary/10 rounded-xl"
                        >
                          <span>Open Chat</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
