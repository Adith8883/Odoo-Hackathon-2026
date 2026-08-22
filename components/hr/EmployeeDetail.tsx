'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Edit2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  Wallet,
  Clock,
  CalendarDays,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { getInitials, formatDate, formatCurrency } from '@/utils/formatters';
import { PayrollEditor } from './PayrollEditor';
import { AttendanceTimeline } from '@/components/employee/AttendanceTimeline';
import { updateEmployee } from '@/services/employee.service';
import { toast } from 'sonner';

interface EmployeeDetailProps {
  employee: any;
  onRefresh?: () => void;
}

export function EmployeeDetail({ employee, onRefresh }: EmployeeDetailProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [department, setDepartment] = useState(employee?.department || 'Engineering');
  const [jobTitle, setJobTitle] = useState(employee?.job_title || employee?.jobTitle || 'Software Engineer');
  const [status, setStatus] = useState(employee?.status || 'active');
  const [isSaving, setIsSaving] = useState(false);

  const profile = employee?.profile || employee?.profiles || {};
  const fullName = profile.full_name || employee?.name || 'Employee Name';
  const email = profile.email || employee?.email || 'employee@dayflow.com';
  const phone = profile.phone || employee?.phone || '+91 98765 43210';
  const address = profile.address || employee?.location || 'Bengaluru, India';
  const empId = employee?.employee_id || employee?.employeeId || employee?.id || 'EMP-001';

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateEmployee(employee.id, {
        department,
        job_title: jobTitle,
        status: status as any,
      });
      toast.success('Employee Record Updated', {
        description: `${fullName} is now ${jobTitle} (${department})`,
      });
      setEditOpen(false);
      onRefresh?.();
    } catch (err: any) {
      toast.error('Update failed', { description: err?.message });
    } finally {
      setIsSaving(false);
    }
  };

  const sampleAttendance = employee?.attendance || [
    { id: '1', date: '2026-08-22', check_in: '2026-08-22T09:12:00Z', check_out: null, status: 'present' },
    { id: '2', date: '2026-08-21', check_in: '2026-08-21T09:05:00Z', check_out: '2026-08-21T18:02:00Z', status: 'present' },
    { id: '3', date: '2026-08-20', check_in: null, check_out: null, status: 'leave', notes: 'Sick Leave' },
    { id: '4', date: '2026-08-19', check_in: '2026-08-19T09:11:00Z', check_out: '2026-08-19T17:48:00Z', status: 'present' },
  ];

  const sampleLeaves = employee?.leave_requests || [
    { id: '1', start_date: '2026-08-20', end_date: '2026-08-20', total_days: 1, reason: 'Health recovery', status: 'approved', leave_type: { name: 'Sick Leave' } },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <Card className="border border-border/60 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-indigo-500/20 to-purple-500/20" />
        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-2">
            <div className="flex items-end gap-4">
              <Avatar className="w-20 h-20 border-4 border-background shadow-md">
                <AvatarImage src={profile.avatar_url} alt={fullName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{fullName}</h1>
                <p className="text-sm text-muted-foreground">{jobTitle} • {department}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {empId}
                  </Badge>
                  <Badge
                    className={`text-xs capitalize ${
                      status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}
                    variant="outline"
                  >
                    {String(status).replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 self-start sm:self-auto">
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Job & Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Employee Parameters</DialogTitle>
                  <DialogDescription>
                    Update organizational department, job title, and employment status.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="dept">Department</Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Human Resources">Human Resources</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Employment Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving} className="bg-primary">
                      {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Updates
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="bg-muted/60 p-1 grid grid-cols-3 lg:grid-cols-5 w-full">
          <TabsTrigger value="personal" className="text-xs">Personal Info</TabsTrigger>
          <TabsTrigger value="job" className="text-xs">Job Details</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs">Attendance</TabsTrigger>
          <TabsTrigger value="leave" className="text-xs">Leave Logs</TabsTrigger>
          <TabsTrigger value="payroll" className="text-xs">Payroll Editor</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Contact & Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground">Official Email</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{email}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground">Contact Phone</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{phone}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-muted/30 border border-border/30 md:col-span-2">
                <p className="text-xs text-muted-foreground">Residential Address</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{address}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Details Tab */}
        <TabsContent value="job">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Employment & Role Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{department}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground">Job Title</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{jobTitle}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground">Joining Date</p>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  {employee?.joining_date ? formatDate(employee.joining_date) : '22 Aug 2026'}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground">Contract Type</p>
                <p className="text-sm font-medium text-foreground mt-0.5">Full-time Permanent</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <AttendanceTimeline records={sampleAttendance} />
        </TabsContent>

        {/* Leave Logs Tab */}
        <TabsContent value="leave">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                Leave Request History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {sampleLeaves.length > 0 ? (
                <div className="space-y-3">
                  {sampleLeaves.map((leave: any) => (
                    <div key={leave.id} className="p-3.5 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{leave.leave_type?.name || 'Leave'}</p>
                        <p className="text-muted-foreground mt-0.5">{formatDate(leave.start_date)} – {formatDate(leave.end_date)} ({leave.total_days} days)</p>
                        <p className="text-muted-foreground italic mt-0.5">"{leave.reason}"</p>
                      </div>
                      <Badge className="capitalize bg-emerald-50 text-emerald-700 border-emerald-200">
                        {leave.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No leave records logged for this employee.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll">
          <PayrollEditor employeeId={employee?.id} onSaved={onRefresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
