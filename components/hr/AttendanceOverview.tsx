"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function AttendanceOverview() {
  const mockData = [
    { id: 1, name: "Alice Johnson", department: "Engineering", status: "Present", checkIn: "09:00 AM", checkOut: "05:00 PM" },
    { id: 2, name: "Bob Smith", department: "Design", status: "Absent", checkIn: "-", checkOut: "-" },
    { id: 3, name: "Charlie Brown", department: "Sales", status: "On Leave", checkIn: "-", checkOut: "-" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Attendance Overview</CardTitle>
        <Input type="date" className="w-[200px]" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.name}</TableCell>
                <TableCell>{record.department}</TableCell>
                <TableCell>
                  <Badge variant={record.status === 'Present' ? 'default' : record.status === 'On Leave' ? 'secondary' : 'destructive'}>
                    {record.status}
                  </Badge>
                </TableCell>
                <TableCell>{record.checkIn}</TableCell>
                <TableCell>{record.checkOut}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
