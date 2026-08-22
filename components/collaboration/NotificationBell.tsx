'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { sendEmailNotification } from '@/services/email.service';
import { formatRelativeDate } from '@/utils/date';
import {
  Bell,
  MessageSquare,
  Calendar,
  Users,
  Megaphone,
  CheckCheck,
  Inbox,
  Mail,
  Settings,
  Sparkles,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [testSending, setTestSending] = useState(false);

  // Email Reminder toggles state
  const [emailReminders, setEmailReminders] = useState({
    meetings: true,
    leave: true,
    announcements: true,
    attendance: true,
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-3.5 h-3.5 text-primary" />;
      case 'meeting':
        return <Calendar className="w-3.5 h-3.5 text-blue-500" />;
      case 'group':
        return <Users className="w-3.5 h-3.5 text-indigo-500" />;
      case 'announcement':
        return <Megaphone className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const handleSendTestEmail = async () => {
    setTestSending(true);
    try {
      const email = user?.email || 'abhilash998575@gmail.com';
      await sendEmailNotification({
        to: email,
        subject: '⏰ Test Email Reminder: Dayflow HRMS Notification Active',
        template: 'meeting_reminder',
        recipientName: user?.fullName || 'Member',
        data: {
          title: 'Quarterly Strategy & Workday Sync',
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          location: 'Conference Room Alpha',
          meetingLink: 'https://meet.google.com/dayflow-sync',
        },
      });
      toast.success('Test Email Reminder Sent!', {
        description: `Dispatched sample reminder to ${email}.`,
      });
    } catch (err: any) {
      toast.error('Failed to send test email', { description: err?.message });
    } finally {
      setTestSending(false);
    }
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button className="relative p-2 rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 sm:w-96 rounded-2xl p-0 shadow-lg border border-border/60">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsRead()}
                  className="text-[11px] h-7 px-2 text-muted-foreground hover:text-primary gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  setSettingsOpen(true);
                }}
                className="text-[11px] h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                title="Email Reminder Preferences"
              >
                <Settings className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-border/30">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  asChild
                  className={`p-3.5 cursor-pointer outline-none transition-colors ${
                    !n.is_read ? 'bg-primary/5' : 'hover:bg-muted/30'
                  }`}
                  onClick={() => {
                    if (!n.is_read) markAsRead(n.id);
                    setOpen(false);
                  }}
                >
                  <Link href={n.link || '#'} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 border border-border/40 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs truncate ${!n.is_read ? 'font-bold text-foreground' : 'font-medium text-foreground/90'}`}>
                          {n.title}
                        </p>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {n.content}
                      </p>
                      <span className="text-[10px] text-muted-foreground/70 font-mono mt-1 block">
                        {formatRelativeDate(n.created_at)}
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-xs font-semibold text-foreground">No notifications yet</p>
                <p className="text-[11px] mt-0.5">You're all caught up!</p>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-border/40 bg-muted/20 text-center">
            <button
              onClick={() => {
                setOpen(false);
                setSettingsOpen(true);
              }}
              className="text-[11px] text-primary hover:underline font-medium flex items-center justify-center gap-1.5 w-full py-1 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Reminder Settings</span>
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Email Notification & Reminder Preferences Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Email Notification & Reminders
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure which workplace events trigger email notifications and reminders to{' '}
              <span className="font-semibold text-foreground">{user?.email || 'your account'}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Toggles */}
            <div className="space-y-3 divide-y divide-border/40">
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5 pr-2">
                  <Label className="text-xs font-semibold text-foreground">Meeting Reminders & Invites</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Get email invites and 15-minute alerts before scheduled meetings.
                  </p>
                </div>
                <Switch
                  checked={emailReminders.meetings}
                  onCheckedChange={(v) => setEmailReminders((p) => ({ ...p, meetings: v }))}
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5 pr-2">
                  <Label className="text-xs font-semibold text-foreground">Leave Status Updates</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Receive instant emails when HR approves or declines your time off requests.
                  </p>
                </div>
                <Switch
                  checked={emailReminders.leave}
                  onCheckedChange={(v) => setEmailReminders((p) => ({ ...p, leave: v }))}
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5 pr-2">
                  <Label className="text-xs font-semibold text-foreground">Company Announcements</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Receive priority email broadcasts for official HR news and company bulletins.
                  </p>
                </div>
                <Switch
                  checked={emailReminders.announcements}
                  onCheckedChange={(v) => setEmailReminders((p) => ({ ...p, announcements: v }))}
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5 pr-2">
                  <Label className="text-xs font-semibold text-foreground">Workday Check-In Alerts</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Morning attendance arrival reminders on workdays.
                  </p>
                </div>
                <Switch
                  checked={emailReminders.attendance}
                  onCheckedChange={(v) => setEmailReminders((p) => ({ ...p, attendance: v }))}
                />
              </div>
            </div>

            {/* Test Email Dispatch Button */}
            <div className="pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={handleSendTestEmail}
                disabled={testSending}
                className="w-full text-xs h-9 rounded-xl border-primary/30 text-primary hover:bg-primary/5 gap-1.5 shadow-xs"
              >
                {testSending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Send Sample Email Reminder to My Inbox</span>
              </Button>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                onClick={() => {
                  toast.success('Email Notification Preferences Saved!');
                  setSettingsOpen(false);
                }}
                className="w-full bg-primary text-primary-foreground font-semibold rounded-xl text-xs h-9"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
