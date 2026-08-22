'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/utils/date';
import { getInitials } from '@/utils/formatters';
import type { Meeting, RsvpStatus } from '@/types/collaboration.types';
import { sendMeetingReminderEmail } from '@/services/email.service';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  MapPin,
  Link as LinkIcon,
  Users,
  Check,
  X,
  HelpCircle,
  Inbox,
  ExternalLink,
  Ban,
  Mail,
  Loader2,
} from 'lucide-react';

interface MeetingListProps {
  meetings: Meeting[];
  isLoading?: boolean;
  onRsvp: (meetingId: string, status: RsvpStatus) => Promise<void>;
  onCancel?: (meetingId: string) => Promise<void>;
  currentUserId?: string;
}

export function MeetingList({
  meetings,
  isLoading,
  onRsvp,
  onCancel,
  currentUserId,
}: MeetingListProps) {
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const upcoming = meetings.filter(
    (m) => m.status === 'scheduled' && m.date >= today
  );
  const past = meetings.filter(
    (m) => m.status !== 'scheduled' || m.date < today
  );

  const handleSendReminder = async (meeting: Meeting) => {
    setRemindingId(meeting.id);
    try {
      const res = await sendMeetingReminderEmail(meeting);
      toast.success('Email Reminder Sent!', {
        description: `Meeting reminder email dispatched to invited participants for "${meeting.title}".`,
      });
    } catch (err: any) {
      toast.error('Failed to send reminder email', { description: err?.message });
    } finally {
      setRemindingId(null);
    }
  };

  const getRsvpBadge = (status: RsvpStatus) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"><Check className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'declined':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]"><X className="w-3 h-3 mr-1" />Declined</Badge>;
      case 'tentative':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]"><HelpCircle className="w-3 h-3 mr-1" />Tentative</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Pending</Badge>;
    }
  };

  const MeetingCard = ({ meeting }: { meeting: Meeting }) => {
    const isCreator = meeting.created_by === currentUserId;
    const rsvp = meeting.user_rsvp || 'pending';
    const participants = meeting.participants || [];
    const acceptedCount = participants.filter((p) => p.status === 'accepted').length;
    const isSendingThis = remindingId === meeting.id;

    return (
      <Card className="rounded-2xl border border-border/60 shadow-sm bg-card overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {meeting.status === 'cancelled' && (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                      <Ban className="w-3 h-3 mr-1" />Cancelled
                    </Badge>
                  )}
                  {isCreator && (
                    <Badge variant="secondary" className="text-[10px]">Organizer</Badge>
                  )}
                </div>
                <h3 className="text-sm font-bold text-foreground leading-tight">{meeting.title}</h3>
                {meeting.description && (
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {meeting.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {meeting.status === 'scheduled' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendReminder(meeting)}
                    disabled={isSendingThis}
                    className="h-7 text-[10px] px-2 rounded-lg border-primary/30 text-primary hover:bg-primary/10 gap-1 shadow-xs"
                    title="Send instant email reminder to all participants"
                  >
                    {isSendingThis ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Mail className="w-3 h-3" />
                    )}
                    <span>Email Reminder</span>
                  </Button>
                )}
                {meeting.status === 'scheduled' && getRsvpBadge(rsvp)}
              </div>
            </div>

            {/* Date / Time / Location */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">{formatDate(meeting.date, 'EEE, d MMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium font-mono">{meeting.start_time} — {meeting.end_time}</span>
              </div>
              {meeting.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium">{meeting.location}</span>
                </div>
              )}
              {meeting.meeting_link && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-3.5 h-3.5 text-primary" />
                  <a
                    href={meeting.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium flex items-center gap-1"
                  >
                    Join Meeting <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-medium">
                  {acceptedCount}/{participants.length} accepted
                </span>
                <div className="flex -space-x-1.5 ml-1.5">
                  {participants.slice(0, 5).map((p) => (
                    <Avatar key={p.id} className="h-5 w-5 border border-background">
                      <AvatarImage src={p.profile?.avatar_url} />
                      <AvatarFallback className="text-[8px] bg-muted font-bold">
                        {getInitials(p.profile?.full_name || '?')}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {participants.length > 5 && (
                    <span className="text-[9px] text-muted-foreground ml-1.5">+{participants.length - 5}</span>
                  )}
                </div>
              </div>

              {/* RSVP Actions */}
              {meeting.status === 'scheduled' && !isCreator && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant={rsvp === 'accepted' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onRsvp(meeting.id, 'accepted')}
                    className="h-7 text-[10px] px-2.5 rounded-lg gap-1"
                  >
                    <Check className="w-3 h-3" /> Accept
                  </Button>
                  <Button
                    variant={rsvp === 'tentative' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => onRsvp(meeting.id, 'tentative')}
                    className="h-7 text-[10px] px-2.5 rounded-lg gap-1"
                  >
                    <HelpCircle className="w-3 h-3" /> Maybe
                  </Button>
                  <Button
                    variant={rsvp === 'declined' ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => onRsvp(meeting.id, 'declined')}
                    className="h-7 text-[10px] px-2.5 rounded-lg gap-1"
                  >
                    <X className="w-3 h-3" /> Decline
                  </Button>
                </div>
              )}

              {meeting.status === 'scheduled' && isCreator && onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(meeting.id)}
                  className="h-7 text-[10px] px-2.5 rounded-lg gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <Ban className="w-3 h-3" /> Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Tabs defaultValue="upcoming" className="space-y-4">
      <TabsList className="bg-muted/60 p-1">
        <TabsTrigger value="upcoming" className="text-xs">
          Upcoming ({upcoming.length})
        </TabsTrigger>
        <TabsTrigger value="past" className="text-xs">
          Past & Cancelled ({past.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="space-y-3">
        {upcoming.length > 0 ? (
          upcoming.map((m) => <MeetingCard key={m.id} meeting={m} />)
        ) : (
          <div className="py-16 text-center border border-dashed rounded-2xl bg-card">
            <Calendar className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm font-semibold text-foreground">No upcoming meetings</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Scheduled meetings and invitations will appear here.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="past" className="space-y-3">
        {past.length > 0 ? (
          past.map((m) => <MeetingCard key={m.id} meeting={m} />)
        ) : (
          <div className="py-12 text-center border border-dashed rounded-2xl bg-card">
            <Inbox className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm font-semibold text-foreground">No past meetings</p>
            <p className="text-xs text-muted-foreground mt-1">
              Completed and cancelled meetings will be listed here.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
