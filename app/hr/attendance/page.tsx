"use client";

import { AttendanceOverview } from "@/components/hr/AttendanceOverview";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendance</h1>
      <AttendanceOverview />
    </div>
  );
}
