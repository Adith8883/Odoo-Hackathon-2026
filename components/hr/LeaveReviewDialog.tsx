'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { formatDate } from '@/utils/formatters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface LeaveRequest {
  id: string;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface LeaveReviewDialogProps {
  request: LeaveRequest | null;
  action: 'approve' | 'reject' | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string, action: 'approve' | 'reject', comment: string) => Promise<void>;
}

export function LeaveReviewDialog({ request, action, open, onOpenChange, onConfirm }: LeaveReviewDialogProps) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!request || !action) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(request.id, action, comment);
      toast.success(
        action === 'approve'
          ? `Leave request approved for ${request.employeeName}`
          : `Leave request rejected for ${request.employeeName}`,
        {
          description: comment ? `Feedback: "${comment}"` : undefined,
        }
      );
      onOpenChange(false);
      setComment('');
    } catch (err: any) {
      toast.error('Failed to review request', {
        description: err?.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{action === 'approve' ? 'Approve' : 'Reject'} Leave Request</DialogTitle>
          <DialogDescription>
            Reviewing request for <span className="font-semibold text-foreground">{request.employeeName}</span> ({request.department})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 text-xs border border-border/40">
            <div>
              <p className="text-muted-foreground">Leave Type</p>
              <p className="font-semibold text-foreground text-sm mt-0.5">{request.leaveType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-semibold text-foreground text-sm mt-0.5">{formatDate(request.startDate)} – {formatDate(request.endDate)}</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-border/30">
              <p className="text-muted-foreground">Employee Reason</p>
              <p className="font-medium text-foreground mt-0.5">{request.reason || 'No details provided'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">HR Review Feedback / Comment</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Approved. Please ensure project handover is complete."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant={action === 'approve' ? 'default' : 'destructive'} 
            onClick={handleConfirm} 
            disabled={loading}
            className={action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
