'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Umbrella, HeartPulse, Coffee } from 'lucide-react';
import type { LeaveBalance, LeaveType } from '@/types/leave.types';

interface LeaveBalanceCardProps {
  balances?: LeaveBalance[] | any[];
  leaveTypes?: LeaveType[] | any[];
}

export function LeaveBalanceCard({
  balances = [],
}: LeaveBalanceCardProps) {
  const totalAvailable = Array.isArray(balances) && balances.length > 0
    ? balances.reduce((acc, b) => acc + (b.remaining_days || b.remainingDays || 0), 0)
    : 40;

  const defaultCards = [
    { name: 'Paid Leave', remaining: 18, total: 18, icon: Umbrella },
    { name: 'Sick Leave', remaining: 12, total: 12, icon: HeartPulse },
    { name: 'Unpaid Leave', remaining: 10, total: 10, icon: Coffee },
  ];

  return (
    <Card className="relative overflow-hidden border border-border/60 shadow-sm hover:shadow-md transition-all rounded-2xl bg-card flex flex-col justify-between">
      <div>
        <div className="bg-gradient-to-r from-muted/50 via-muted/20 to-transparent px-5 py-4 border-b border-border/40 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
              Leave Balances & Quotas
            </span>
            <span className="text-[11px] text-muted-foreground">Annual Year 2026</span>
          </div>
        </div>

        <CardContent className="p-5 sm:p-6 space-y-5">
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {totalAvailable}
            </span>
            <span className="text-xs font-semibold text-muted-foreground ml-1.5">days available</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Across all active leave policies</p>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {balances && balances.length > 0 ? (
              balances.map((b: any, idx: number) => {
                const rem = b.remaining_days ?? b.remainingDays ?? 0;
                const tot = b.total_days ?? b.totalDays ?? 12;
                const pct = Math.min(100, Math.round((rem / tot) * 100));

                return (
                  <div key={b.leave_type_id || b.id || idx} className="p-3 rounded-xl bg-muted/30 border border-border/30 text-center flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-foreground truncate">
                        {b.leave_type_name || b.name || 'Leave'}
                      </p>
                      <p className="text-lg font-bold text-foreground mt-1">
                        {rem} <span className="text-[10px] font-normal text-muted-foreground">/ {tot}</span>
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              defaultCards.map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border/30 text-center flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-foreground truncate">{c.name}</p>
                    <p className="text-lg font-bold text-foreground mt-1">
                      {c.remaining} <span className="text-[10px] font-normal text-muted-foreground">/ {c.total}</span>
                    </p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full w-full" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
