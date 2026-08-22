'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Loader2, Calendar as CalendarIcon, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { LeaveType, LeaveBalance } from '@/types/leave.types';
import { calculateDaysBetween, formatDate } from '@/utils/date';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { isBefore, startOfDay } from 'date-fns';

const leaveSchema = z.object({
  leaveTypeId: z.string().min(1, 'Please select a leave type.'),
  startDate: z.string().min(1, 'Please choose a start date.'),
  endDate: z.string().min(1, 'Please choose an end date.'),
  reason: z.string().min(3, 'Please provide a reason (at least 3 characters).'),
});

type LeaveFormData = z.infer<typeof leaveSchema>;

interface LeaveApplicationFormProps {
  leaveTypes?: LeaveType[] | any[];
  balances?: LeaveBalance[] | any[];
  onSubmitLeave?: (data: {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }) => Promise<void>;
  onSuccess?: () => void;
}

export function LeaveApplicationForm({
  leaveTypes = [],
  balances = [],
  onSubmitLeave,
  onSuccess,
}: LeaveApplicationFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [startPickerOpen, setStartPickerOpen] = useState(false);
  const [endPickerOpen, setEndPickerOpen] = useState(false);

  // Today
  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => formatDate(new Date(), 'yyyy-MM-dd'), []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
  });

  const selectedTypeId = watch('leaveTypeId');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Fallback default leave types
  const defaultTypes = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Paid Leave', default_days: 18 },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Sick Leave', default_days: 12 },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Unpaid Leave', default_days: 10 },
  ];

  const typesList = leaveTypes && leaveTypes.length > 0 ? leaveTypes : defaultTypes;

  // Calculate duration
  let calculatedDays = 0;
  if (startDate && endDate) {
    calculatedDays = calculateDaysBetween(new Date(startDate), new Date(endDate));
  }

  // Find remaining days for currently selected leave type
  const selectedBalanceInfo = useMemo(() => {
    if (!selectedTypeId) return null;
    const match = (balances || []).find(
      (b: any) =>
        b.leave_type_id === selectedTypeId ||
        b.id === selectedTypeId ||
        b.leave_type_name?.toLowerCase() === typesList.find((t: any) => t.id === selectedTypeId)?.name?.toLowerCase()
    );

    const typeObj = typesList.find((t: any) => t.id === selectedTypeId);
    const totalDays = match?.total_days ?? match?.totalDays ?? typeObj?.default_days ?? 12;
    const remainingDays = match?.remaining_days ?? match?.remainingDays ?? totalDays;

    return {
      name: typeObj?.name || 'Leave',
      remainingDays,
      totalDays,
    };
  }, [selectedTypeId, balances, typesList]);

  // Quota Exceeded Flag
  const isQuotaExceeded = selectedBalanceInfo !== null && calculatedDays > selectedBalanceInfo.remainingDays;
  const isZeroBalance = selectedBalanceInfo !== null && selectedBalanceInfo.remainingDays <= 0;

  const onSubmit = async (values: LeaveFormData) => {
    // Strict Date Validation
    if (values.startDate < todayStr) {
      setErrorMsg('Leave cannot be applied for past dates. Please choose today or a future date.');
      return;
    }

    if (values.endDate < values.startDate) {
      setErrorMsg('End date must be on or after start date.');
      return;
    }

    if (calculatedDays <= 0) {
      setErrorMsg('Duration must be at least 1 day.');
      return;
    }

    // Strict Quota / Balance Validation
    if (selectedBalanceInfo) {
      if (selectedBalanceInfo.remainingDays <= 0) {
        setErrorMsg(`You have None remaining for ${selectedBalanceInfo.name}. Please choose another leave type.`);
        return;
      }

      if (calculatedDays > selectedBalanceInfo.remainingDays) {
        setErrorMsg(
          `You requested ${calculatedDays} days, but only have ${selectedBalanceInfo.remainingDays} days remaining for ${selectedBalanceInfo.name}.`
        );
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      if (onSubmitLeave) {
        await onSubmitLeave({
          leaveTypeId: values.leaveTypeId,
          startDate: values.startDate,
          endDate: values.endDate,
          totalDays: calculatedDays,
          reason: values.reason,
        });
      }
      toast.success('Leave Request Submitted!', {
        description: `${calculatedDays} day(s) requested for ${selectedBalanceInfo?.name || 'Leave'}. Awaiting HR review.`,
      });
      reset();
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.message || 'Failed to submit leave request.';
      setErrorMsg(msg);
      toast.error('Submission Failed', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (!v) {
        setErrorMsg(null);
        reset();
      }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-sm rounded-xl h-10 px-4">
          <Plus className="w-4 h-4 mr-1.5" />
          Apply for Leave
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Apply for Leave</DialogTitle>
          <DialogDescription className="text-xs">
            Submit a time off request. Leaves can only be applied from today onwards within your remaining balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Leave Type Select */}
          <div className="space-y-2">
            <Label htmlFor="leaveTypeId" className="text-xs font-semibold">
              Leave Type & Balance
            </Label>
            <Select onValueChange={(val) => {
              setValue('leaveTypeId', val);
              setErrorMsg(null);
            }}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select type of leave" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {typesList.map((type: any) => {
                  const bal = (balances || []).find(
                    (b: any) =>
                      b.leave_type_id === type.id ||
                      b.id === type.id ||
                      b.leave_type_name?.toLowerCase() === type.name?.toLowerCase()
                  );
                  const rem = bal?.remaining_days ?? bal?.remainingDays ?? type.default_days ?? 12;

                  return (
                    <SelectItem key={type.id} value={type.id} disabled={rem <= 0}>
                      {type.name} ({rem > 0 ? `${rem} days left / ${type.default_days ?? 12}` : 'None'})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.leaveTypeId && (
              <p className="text-xs text-destructive">{errors.leaveTypeId.message}</p>
            )}
          </div>

          {/* Quota / Balance Highlight Pill */}
          {selectedBalanceInfo && (
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              selectedBalanceInfo.remainingDays > 0
                ? 'bg-primary/5 border-primary/20 text-primary'
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}>
              <div className="flex items-center gap-2">
                {selectedBalanceInfo.remainingDays > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-destructive shrink-0" />
                )}
                <div>
                  <span className="font-semibold">{selectedBalanceInfo.name}: </span>
                  <span>
                    {selectedBalanceInfo.remainingDays > 0
                      ? `${selectedBalanceInfo.remainingDays} days available`
                      : 'None'}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[11px] bg-background/80 px-2 py-0.5 rounded-full border border-border/40">
                Max {selectedBalanceInfo.totalDays}d / yr
              </span>
            </div>
          )}

          {/* Scrollable Date Pickers */}
          <div className="grid grid-cols-2 gap-3">
            {/* From Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">From Date</Label>
              <Popover open={startPickerOpen} onOpenChange={setStartPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-xl h-10 text-xs px-3",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {startDate ? formatDate(new Date(startDate), 'EEE, d MMM yyyy') : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl shadow-lg border border-border/60" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate ? new Date(startDate) : undefined}
                    onSelect={(d) => {
                      if (d) {
                        const sStr = formatDate(d, 'yyyy-MM-dd');
                        setValue('startDate', sStr);
                        if (!endDate || new Date(endDate) < d) {
                          setValue('endDate', sStr);
                        }
                        setErrorMsg(null);
                        setStartPickerOpen(false);
                      }
                    }}
                    disabled={(date) => isBefore(startOfDay(date), today)}
                    captionLayout="dropdown"
                    className="rounded-2xl"
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            {/* To Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">To Date</Label>
              <Popover open={endPickerOpen} onOpenChange={setEndPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-xl h-10 text-xs px-3",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {endDate ? formatDate(new Date(endDate), 'EEE, d MMM yyyy') : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl shadow-lg border border-border/60" align="end">
                  <Calendar
                    mode="single"
                    selected={endDate ? new Date(endDate) : undefined}
                    onSelect={(d) => {
                      if (d) {
                        const eStr = formatDate(d, 'yyyy-MM-dd');
                        setValue('endDate', eStr);
                        setErrorMsg(null);
                        setEndPickerOpen(false);
                      }
                    }}
                    disabled={(date) =>
                      isBefore(startOfDay(date), startDate ? startOfDay(new Date(startDate)) : today)
                    }
                    captionLayout="dropdown"
                    className="rounded-2xl"
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-xs text-destructive">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Calculated Duration & Balance Check Warning */}
          {calculatedDays > 0 && (
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              isQuotaExceeded || isZeroBalance
                ? 'bg-destructive/10 border-destructive/30 text-destructive'
                : 'bg-muted/40 border-border/40 text-foreground'
            }`}>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 shrink-0" />
                <span className="font-semibold">
                  Requested Duration: {calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}
                </span>
              </div>
              {isQuotaExceeded && selectedBalanceInfo && (
                <span className="font-bold text-[11px]">
                  Exceeds balance by {calculatedDays - selectedBalanceInfo.remainingDays}d!
                </span>
              )}
            </div>
          )}

          {/* Reason Textarea */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-xs font-semibold">Reason / Remarks</Label>
            <Textarea
              id="reason"
              placeholder="e.g. Attending family function / Medical appointment"
              rows={3}
              className="rounded-xl text-xs"
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-xs text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isQuotaExceeded || isZeroBalance}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Leave Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
