'use client';

import { useState } from 'react';
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
import { Megaphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateAnnouncementDialogProps {
  onPost: (title: string, content: string, fileUrl?: string) => Promise<any>;
}

export function CreateAnnouncementDialog({ onPost }: CreateAnnouncementDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Announcement title is required'); return; }
    if (!content.trim()) { toast.error('Announcement content is required'); return; }

    setSubmitting(true);
    try {
      await onPost(title.trim(), content.trim());
      toast.success('Announcement Published!', {
        description: `"${title}" has been broadcast to all employees.`,
      });
      setTitle('');
      setContent('');
      setOpen(false);
    } catch (err: any) {
      toast.error('Failed to publish announcement', { description: err?.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-xs">
          <Megaphone className="w-4 h-4" />
          <span>New Announcement</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-600" />
            Company Announcement
          </DialogTitle>
          <DialogDescription className="text-xs">
            This will be broadcast to all employees organization-wide.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="annTitle" className="text-xs font-semibold">Title *</Label>
            <Input
              id="annTitle"
              placeholder="e.g. Office Closure / Policy Update / Event Announcement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="annContent" className="text-xs font-semibold">Message *</Label>
            <Textarea
              id="annContent"
              placeholder="Write the full announcement message here..."
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-[11px] text-amber-800 dark:text-amber-300">
            ⚠️ This announcement will be visible to <strong>all employees</strong> and will trigger a notification for every user.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs">
              {submitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Publish Announcement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
