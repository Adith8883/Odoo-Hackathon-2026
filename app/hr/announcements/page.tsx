'use client';

import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { AnnouncementFeed } from '@/components/collaboration/AnnouncementFeed';
import { CreateAnnouncementDialog } from '@/components/collaboration/CreateAnnouncementDialog';
import { Megaphone } from 'lucide-react';

export default function HRAnnouncementsPage() {
  const { user } = useAuth();
  const { postAnnouncement } = useChat();
  const [feedKey, setFeedKey] = useState(0);

  const handlePostAnnouncement = async (title: string, content: string, fileUrl?: string) => {
    const result = await postAnnouncement(title, content, fileUrl);
    // Refresh the feed view
    setFeedKey((prev) => prev + 1);
    return result;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Announcements</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Broadcast official company-wide updates, policy notices, and event news.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CreateAnnouncementDialog onPost={handlePostAnnouncement} />
        </div>
      </div>

      {/* Announcement Feed */}
      <AnnouncementFeed key={feedKey} />
    </div>
  );
}
