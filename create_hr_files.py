import os

project_dir = r"d:\AI TRAVEL PLANER\HR EMPLOYEE MANAGEMENT"

files = {
    r"components\hr\OrgOverview.tsx": """\"\"\"use client\"\"\";

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
""",

    r"components\hr\TodayAttendanceCard.tsx": """\"\"\"use client\"\"\";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TodayAttendanceCardProps {
  present: number;
  absent: number;
  onLeave: number;
  total: number;
}

export function TodayAttendanceCard({ present, absent, onLeave, total }: TodayAttendanceCardProps) {
  const presentPercent = total > 0 ? (present / total) * 100 : 0;
  const absentPercent = total > 0 ? (absent / total) * 100 : 0;
  const onLeavePercent = total > 0 ? (onLeave / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Attendance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Present ({present})</span>
            <span className="text-muted-foreground">{presentPercent.toFixed(0)}%</span>
          </div>
          <Progress value={presentPercent} className="h-2 bg-secondary" indicatorColor="bg-green-500" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Absent ({absent})</span>
            <span className="text-muted-foreground">{absentPercent.toFixed(0)}%</span>
          </div>
          <Progress value={absentPercent} className="h-2 bg-secondary" indicatorColor="bg-red-500" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">On Leave ({onLeave})</span>
            <span className="text-muted-foreground">{onLeavePercent.toFixed(0)}%</span>
          </div>
          <Progress value={onLeavePercent} className="h-2 bg-secondary" indicatorColor="bg-orange-500" />
        </div>
      </CardContent>
    </Card>
  );
}
""",

    r"components\hr\PendingLeaveList.tsx": """\"\"\"use client\"\"\";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { formatDate } from "@/utils/formatters";

interface LeaveRequest {
  id: string;
  employeeName: string;
  avatarUrl?: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface PendingLeaveListProps {
  requests: LeaveRequest[];
  onReview: (request: LeaveRequest, action: 'approve' | 'reject') => void;
}

export function PendingLeaveList({ requests, onReview }: PendingLeaveListProps) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No pending leave requests.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Leave Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={request.avatarUrl} />
                <AvatarFallback>{request.employeeName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-sm">{request.employeeName}</h4>
                <p className="text-xs text-muted-foreground">{request.department}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{request.leaveType}</Badge>
                  <span className="text-xs font-medium">
                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </span>
                </div>
                <p className="text-xs mt-2 text-muted-foreground line-clamp-1">{request.reason}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:text-green-700" onClick={() => onReview(request, 'approve')}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => onReview(request, 'reject')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
""",

    r"components\hr\LeaveReviewDialog.tsx": """\"\"\"use client\"\"\";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { formatDate } from "@/utils/formatters";

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
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!request || !action) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(request.id, action, comment);
    setLoading(false);
    onOpenChange(false);
    setComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action === 'approve' ? 'Approve' : 'Reject'} Leave Request</DialogTitle>
          <DialogDescription>
            Reviewing request for {request.employeeName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">{request.leaveType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Dates</p>
              <p className="font-medium">{formatDate(request.startDate)} - {formatDate(request.endDate)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Reason</p>
              <p className="font-medium">{request.reason}</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">HR Comment (Optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant={action === 'approve' ? 'default' : 'destructive'} 
            onClick={handleConfirm} 
            disabled={loading}
          >
            {loading ? 'Confirming...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
""",

    r"components\hr\EmployeeList.tsx": """\"\"\"use client\"\"\";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Eye, Edit } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  avatarUrl?: string;
}

interface EmployeeListProps {
  employees: Employee[];
}

export function EmployeeList({ employees }: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = department === "all" || emp.department === department;
    const matchesStatus = status === "all" || emp.status.toLowerCase() === status.toLowerCase();
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on leave">On Leave</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={emp.avatarUrl} />
                        <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{emp.name}</div>
                        <div className="text-xs text-muted-foreground">{emp.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.jobTitle}</TableCell>
                  <TableCell>
                    <Badge variant={emp.status === 'Active' ? 'default' : emp.status === 'On Leave' ? 'secondary' : 'destructive'}>
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/employees/${emp.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
""",

    r"components\hr\EmployeeDetail.tsx": """\"\"\"use client\"\"\";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  status: string;
  joinDate: string;
  phone: string;
  location: string;
  manager: string;
}

export function EmployeeDetail({ employee }: { employee: Employee }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">{employee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{employee.name}</h1>
                  <p className="text-muted-foreground">{employee.jobTitle} • {employee.department}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge>{employee.status}</Badge>
                <Badge variant="outline">ID: {employee.id}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="job">Job</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="docs">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{employee.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{employee.location}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="job" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Join Date</p>
                <p className="font-medium">{employee.joinDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Manager</p>
                <p className="font-medium">{employee.manager}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Placeholder for other tabs */}
        <TabsContent value="attendance" className="mt-6">
           <Card><CardContent className="p-6 text-muted-foreground">Attendance history will be displayed here.</CardContent></Card>
        </TabsContent>
        <TabsContent value="leave" className="mt-6">
           <Card><CardContent className="p-6 text-muted-foreground">Leave history will be displayed here.</CardContent></Card>
        </TabsContent>
        <TabsContent value="payroll" className="mt-6">
           <Card><CardContent className="p-6 text-muted-foreground">Payroll structure will be displayed here.</CardContent></Card>
        </TabsContent>
        <TabsContent value="docs" className="mt-6">
           <Card><CardContent className="p-6 text-muted-foreground">Employee documents will be displayed here.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
""",

    r"components\hr\PayrollEditor.tsx": """\"\"\"use client\"\"\";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatCurrency } from "@/utils/formatters";

export function PayrollEditor({ employeeId }: { employeeId: string }) {
  const [baseSalary, setBaseSalary] = useState(5000);
  const [allowances, setAllowances] = useState(1000);
  const [deductions, setDeductions] = useState(500);

  const grossSalary = baseSalary + allowances;
  const netSalary = grossSalary - deductions;
  const annualCtc = grossSalary * 12;

  const handleSave = () => {
    // Save logic
    console.log("Saved", { baseSalary, allowances, deductions });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Structure Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="base">Base Salary (Monthly)</Label>
          <Input 
            id="base" 
            type="number" 
            value={baseSalary} 
            onChange={(e) => setBaseSalary(Number(e.target.value))} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="allowances">Allowances (Monthly)</Label>
          <Input 
            id="allowances" 
            type="number" 
            value={allowances} 
            onChange={(e) => setAllowances(Number(e.target.value))} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deductions">Deductions (Monthly)</Label>
          <Input 
            id="deductions" 
            type="number" 
            value={deductions} 
            onChange={(e) => setDeductions(Number(e.target.value))} 
          />
        </div>

        <div className="mt-6 space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly Gross:</span>
            <span className="font-medium">{formatCurrency(grossSalary)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly Deductions:</span>
            <span className="font-medium text-red-500">-{formatCurrency(deductions)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Net Monthly Salary:</span>
            <span>{formatCurrency(netSalary)}</span>
          </div>
          <div className="flex justify-between text-sm mt-4 text-muted-foreground">
            <span>Annual CTC:</span>
            <span>{formatCurrency(annualCtc)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="w-full">Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
""",

    r"components\hr\AttendanceOverview.tsx": """\"\"\"use client\"\"\";

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
""",

    r"app\(hr)\layout.tsx": """import { AppShell } from "@/components/layout/AppShell";

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="hr">{children}</AppShell>;
}
""",

    r"app\(hr)\dashboard\page.tsx": """\"\"\"use client\"\"\";

import { OrgOverview } from "@/components/hr/OrgOverview";
import { TodayAttendanceCard } from "@/components/hr/TodayAttendanceCard";
import { PendingLeaveList } from "@/components/hr/PendingLeaveList";
import { LeaveReviewDialog } from "@/components/hr/LeaveReviewDialog";
import { useState } from "react";

export default function HRDashboard() {
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; request: any; action: 'approve' | 'reject' | null }>({
    open: false,
    request: null,
    action: null,
  });

  const mockPendingLeaves = [
    {
      id: "1",
      employeeName: "John Doe",
      department: "Engineering",
      leaveType: "Sick Leave",
      startDate: "2023-11-01",
      endDate: "2023-11-02",
      reason: "Flu",
    }
  ];

  const handleReview = (request: any, action: 'approve' | 'reject') => {
    setReviewDialog({ open: true, request, action });
  };

  const handleConfirmReview = async (id: string, action: 'approve' | 'reject', comment: string) => {
    console.log("Reviewed:", { id, action, comment });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">HR Dashboard</h1>
      
      <OrgOverview 
        totalEmployees={150} 
        presentToday={142} 
        onLeaveToday={5} 
        pendingRequests={12} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PendingLeaveList requests={mockPendingLeaves} onReview={handleReview} />
        </div>
        <div>
          <TodayAttendanceCard present={142} absent={3} onLeave={5} total={150} />
        </div>
      </div>

      <LeaveReviewDialog
        open={reviewDialog.open}
        request={reviewDialog.request}
        action={reviewDialog.action}
        onOpenChange={(open) => setReviewDialog(prev => ({ ...prev, open }))}
        onConfirm={handleConfirmReview}
      />
    </div>
  );
}
""",

    r"app\(hr)\employees\page.tsx": """\"\"\"use client\"\"\";

import { EmployeeList } from "@/components/hr/EmployeeList";

export default function EmployeesPage() {
  const mockEmployees = [
    {
      id: "1",
      name: "Alice Smith",
      email: "alice@dayflow.com",
      department: "Engineering",
      jobTitle: "Frontend Developer",
      status: "Active" as const,
    },
    {
      id: "2",
      name: "Bob Jones",
      email: "bob@dayflow.com",
      department: "Design",
      jobTitle: "UI/UX Designer",
      status: "On Leave" as const,
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employees</h1>
      </div>
      <EmployeeList employees={mockEmployees} />
    </div>
  );
}
""",

    r"app\(hr)\employees\[id]\page.tsx": """\"\"\"use client\"\"\";

import { EmployeeDetail } from "@/components/hr/EmployeeDetail";
import { useParams } from "next/navigation";

export default function EmployeeDetailPage() {
  const params = useParams();
  
  const mockEmployee = {
    id: params.id as string,
    name: "Alice Smith",
    email: "alice@dayflow.com",
    department: "Engineering",
    jobTitle: "Frontend Developer",
    status: "Active",
    joinDate: "2022-01-15",
    phone: "+1 234 567 890",
    location: "New York, USA",
    manager: "John TechLead",
  };

  return (
    <div className="space-y-6">
      <EmployeeDetail employee={mockEmployee} />
    </div>
  );
}
""",

    r"app\(hr)\attendance\page.tsx": """\"\"\"use client\"\"\";

import { AttendanceOverview } from "@/components/hr/AttendanceOverview";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendance</h1>
      <AttendanceOverview />
    </div>
  );
}
""",

    r"app\(hr)\leave\page.tsx": """\"\"\"use client\"\"\";

import { PendingLeaveList } from "@/components/hr/PendingLeaveList";

export default function LeavePage() {
  const mockPendingLeaves = [
    {
      id: "1",
      employeeName: "John Doe",
      department: "Engineering",
      leaveType: "Sick Leave",
      startDate: "2023-11-01",
      endDate: "2023-11-02",
      reason: "Flu",
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Leave Management</h1>
      <PendingLeaveList requests={mockPendingLeaves} onReview={() => {}} />
    </div>
  );
}
""",

    r"app\(hr)\payroll\page.tsx": """\"\"\"use client\"\"\";

import { PayrollEditor } from "@/components/hr/PayrollEditor";

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payroll Management</h1>
      <div className="max-w-xl">
        <PayrollEditor employeeId="1" />
      </div>
    </div>
  );
}
""",
    r"utils\formatters.ts": """export function formatDate(dateString: string): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
"""
}

for rel_path, content in files.items():
    # Fix the double quotes replacement for "use client"
    content = content.replace('\"\"\"use client\"\"\"', '"use client"')
    
    file_path = os.path.join(project_dir, rel_path)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created {file_path}")

print("Done")
