"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function LeaveRequestCard({ request }: { request: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-amber-500/10 text-amber-600 border-amber-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Badge variant="outline" className="mb-2">
                {request.leave_types?.name || "Leave"}
              </Badge>
              <h4 className="font-semibold text-lg">
                {format(new Date(request.start_date), "MMM d")} - {format(new Date(request.end_date), "MMM d, yyyy")}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {request.total_days} day{request.total_days > 1 ? 's' : ''} requested
              </p>
            </div>
            <Badge className={getStatusColor(request.status)} variant="outline">
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-md text-sm mb-3">
            <span className="font-medium">Reason: </span>
            <span className="text-muted-foreground">{request.reason}</span>
          </div>

          {request.reviewer_comment && (
            <div className="text-sm mt-3 border-t pt-3 border-border">
              <span className="font-medium text-foreground block mb-1">HR/Manager Comment:</span>
              <span className="text-muted-foreground italic">"{request.reviewer_comment}"</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
