'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeDate } from '@/utils/date';
import { createClient } from '@/lib/supabase';
import { Megaphone, ShieldCheck, Inbox } from 'lucide-react';

export function AnnouncementFeed() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(*)')
      .eq('is_announcement', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setAnnouncements(data.map((m: any) => ({ ...m, sender: m.profiles })));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed rounded-2xl bg-card">
        <Megaphone className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
        <p className="text-sm font-semibold text-foreground">No announcements yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Company-wide announcements from HR will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((ann) => (
        <Card
          key={ann.id}
          className="rounded-2xl border-l-4 border-l-amber-500 border border-amber-500/20 shadow-sm bg-amber-500/5 overflow-hidden"
        >
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/30 gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  HR Announcement
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {formatRelativeDate(ann.created_at)}
              </span>
            </div>

            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {ann.content}
            </div>

            {ann.file_url && (
              <a
                href={ann.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
              >
                📎 {ann.file_name || 'Attached File'}
              </a>
            )}

            <div className="text-[10px] text-muted-foreground pt-1 border-t border-amber-500/20">
              Posted by <span className="font-semibold text-foreground">{ann.sender?.full_name || 'HR Admin'}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
