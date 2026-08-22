"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserMinus, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface OrgOverviewProps {
  totalEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  pendingRequests: number;
}

export function OrgOverview({
  totalEmployees,
  presentToday,
  onLeaveToday,
  pendingRequests,
}: OrgOverviewProps) {
  const metrics = [
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: Users,
      trend: "+2 this month",
      trendColor: "text-green-500",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Present Today",
      value: presentToday,
      icon: UserCheck,
      trend: `${Math.round((presentToday / totalEmployees) * 100) || 0}% attendance`,
      trendColor: "text-gray-500",
      bgColor: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "On Leave Today",
      value: onLeaveToday,
      icon: UserMinus,
      trend: "3 planned tomorrow",
      trendColor: "text-gray-500",
      bgColor: "bg-orange-100 dark:bg-orange-900",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Pending Requests",
      value: pendingRequests,
      icon: Clock,
      trend: "Needs review",
      trendColor: pendingRequests > 0 ? "text-amber-500" : "text-gray-500",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs mt-1 ${metric.trendColor}`}>
                {metric.trend}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
