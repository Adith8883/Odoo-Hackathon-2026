'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getAllEmployees } from '@/services/employee.service';
import { Loader2, Plus, Check, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleMeetingDialogProps {
  onSchedule: (
    meetingData: {
      title: string;
      description?: string;
      date: string;
      start_time: string;
      end_time: string;
      location?: string;
      meeting_link?: string;
    },
    participantIds: string[]
  ) => Promise<any>;
}

export function ScheduleMeetingDialog({ onSchedule }: ScheduleMeetingDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      getAllEmployees()
        .then((res) => setEmployees(res || []))
        .catch(() => {});

      // Default date to today
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
    }
  }, [open]);

  const toggleParticipant = (profileId: string) => {
    setSelectedIds((prev) =>
      prev.includes(profileId) ? prev.filter((id) => id !== profileId) : [...prev, profileId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) { toast.error('Meeting title is required'); return; }
    if (!date) { toast.error('Please select a meeting date'); return; }
    if (!startTime || !endTime) { toast.error('Start and end times are required'); return; }
    if (startTime >= endTime) { toast.error('End time must be after start time'); return; }
    if (selectedIds.length === 0) { toast.error('Please invite at least one participant'); return; }

    setSubmitting(true);
    try {
      await onSchedule(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          date,
          start_time: startTime,
          end_time: endTime,
          location: location.trim() || undefined,
          meeting_link: meetingLink.trim() || undefined,
        },
        selectedIds
      );
      toast.success('Meeting Scheduled!', {
        description: `"${title}" on ${date} at ${startTime}`,
      });
      // Reset
      setTitle('');
      setDescription('');
      setStartTime('09:00');
      setEndTime('10:00');
      setLocation('');
      setMeetingLink('');
      setSelectedIds([]);
      setOpen(false);
    } catch (err: any) {
      toast.error('Failed to schedule meeting', { description: err?.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground font-semibold rounded-xl shadow-xs">
          <CalendarPlus className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Schedule a Meeting</DialogTitle>
          <DialogDescription className="text-xs">
            Set up time, location, and invite team members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">Meeting Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Sprint Planning / Design Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc" className="text-xs font-semibold">Description</Label>
            <Textarea
              id="desc"
              placeholder="Meeting agenda and notes..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-semibold">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-xs font-semibold">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endTime" className="text-xs font-semibold">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs font-semibold">Location</Label>
              <Input
                id="location"
                placeholder="Conference Room B"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link" className="text-xs font-semibold">Meeting Link</Label>
              <Input
                id="link"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Invite Participants *</Label>
              <span className="text-[10px] text-muted-foreground font-mono">
                {selectedIds.length} selected
              </span>
            </div>
            <div className="max-h-[140px] overflow-y-auto space-y-1 border border-border/40 rounded-xl p-1.5 bg-muted/20">
              {employees.map((emp) => {
                const profileId = emp.profile_id || emp.profiles?.id || emp.id;
                const name = emp.profiles?.full_name || emp.profile?.full_name || emp.full_name || 'Member';
                const dept = emp.department || '';
                const isSelected = selectedIds.includes(profileId);

                return (
                  <button
                    type="button"
                    key={emp.id}
                    onClick={() => toggleParticipant(profileId)}
                    className={`w-full p-2 rounded-lg text-left flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <span className="text-xs truncate">{name}{dept ? ` (${dept})` : ''}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground font-semibold rounded-xl text-xs">
              {submitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Schedule Meeting
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
