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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getAllEmployees } from '@/services/employee.service';
import { getInitials } from '@/utils/formatters';
import { Plus, Search, MessageSquare, Users, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface NewChatDialogProps {
  currentUserId?: string;
  onStartDirect: (targetUserId: string) => Promise<any>;
  onCreateGroup: (name: string, description: string, memberIds: string[]) => Promise<any>;
}

export function NewChatDialog({
  currentUserId,
  onStartDirect,
  onCreateGroup,
}: NewChatDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Group creation state
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      getAllEmployees()
        .then((res) => {
          // Filter out self
          const list = (res || []).filter((e: any) => (e.profile_id || e.id) !== currentUserId);
          setEmployees(list);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [open, currentUserId]);

  const filteredEmployees = employees.filter((emp) => {
    const name = emp.profiles?.full_name || emp.profile?.full_name || emp.full_name || '';
    const email = emp.profiles?.email || emp.profile?.email || emp.email || '';
    const dept = emp.department || '';
    const term = search.toLowerCase();
    return (
      name.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      dept.toLowerCase().includes(term)
    );
  });

  const handleStartDirect = async (targetProfileId: string, name: string) => {
    setSubmitting(true);
    try {
      await onStartDirect(targetProfileId);
      toast.success(`Conversation started with ${name}`);
      setOpen(false);
    } catch (err: any) {
      toast.error('Failed to start chat', { description: err?.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    if (selectedMemberIds.length === 0) {
      toast.error('Please select at least one team member');
      return;
    }

    setSubmitting(true);
    try {
      await onCreateGroup(groupName.trim(), groupDesc.trim(), selectedMemberIds);
      toast.success(`Group "${groupName}" created successfully!`);
      setGroupName('');
      setGroupDesc('');
      setSelectedMemberIds([]);
      setOpen(false);
    } catch (err: any) {
      toast.error('Failed to create group', { description: err?.message });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMemberSelection = (profileId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(profileId) ? prev.filter((id) => id !== profileId) : [...prev, profileId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground font-semibold rounded-xl shadow-xs">
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">New Message</DialogTitle>
          <DialogDescription className="text-xs">
            Start a direct message or create a project collaboration group.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="direct" className="space-y-4 pt-2">
          <TabsList className="grid grid-cols-2 bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="direct" className="text-xs gap-1.5 rounded-lg">
              <MessageSquare className="w-3.5 h-3.5" />
              Direct Message
            </TabsTrigger>
            <TabsTrigger value="group" className="text-xs gap-1.5 rounded-lg">
              <Users className="w-3.5 h-3.5" />
              Project Group
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Direct Message */}
          <TabsContent value="direct" className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl text-xs"
              />
            </div>

            <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1">
              {isLoading ? (
                <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading colleagues...
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No colleagues found matching "{search}".
                </div>
              ) : (
                filteredEmployees.map((emp) => {
                  const profileId = emp.profile_id || emp.profiles?.id || emp.id;
                  const name = emp.profiles?.full_name || emp.profile?.full_name || emp.full_name || 'Colleague';
                  const email = emp.profiles?.email || emp.profile?.email || emp.email || '';
                  const dept = emp.department || 'Team';

                  return (
                    <button
                      key={emp.id}
                      onClick={() => handleStartDirect(profileId, name)}
                      disabled={submitting}
                      className="w-full p-2.5 rounded-xl border border-border/40 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-between text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-8 w-8 border border-border/40">
                          <AvatarImage src={emp.profiles?.avatar_url} alt={name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">{email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 ml-2">
                        {dept}
                      </Badge>
                    </button>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Tab 2: Project Group */}
          <TabsContent value="group">
            <form onSubmit={handleCreateGroup} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="groupName" className="text-xs font-semibold">Group Name</Label>
                <Input
                  id="groupName"
                  placeholder="e.g. Q3 Design Sprint / Engineering Sync"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="groupDesc" className="text-xs font-semibold">Purpose & Description (Optional)</Label>
                <Textarea
                  id="groupDesc"
                  placeholder="What is this project group for?"
                  rows={2}
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Add Team Members</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {selectedMemberIds.length} selected
                  </span>
                </div>

                <div className="max-h-[140px] overflow-y-auto space-y-1 pr-1 border border-border/40 rounded-xl p-1.5 bg-muted/20">
                  {employees.map((emp) => {
                    const profileId = emp.profile_id || emp.profiles?.id || emp.id;
                    const name = emp.profiles?.full_name || emp.profile?.full_name || emp.full_name || 'Member';
                    const isSelected = selectedMemberIds.includes(profileId);

                    return (
                      <button
                        type="button"
                        key={emp.id}
                        onClick={() => toggleMemberSelection(profileId)}
                        className={`w-full p-2 rounded-lg text-left flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/60 text-foreground'
                        }`}
                      >
                        <span className="text-xs truncate">{name} ({emp.department})</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground font-semibold rounded-xl text-xs">
                  {submitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  Create Group
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
