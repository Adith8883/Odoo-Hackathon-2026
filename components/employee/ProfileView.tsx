'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getInitials, formatDate, formatCurrency } from '@/utils/formatters';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  Lock,
  Edit2,
  CheckCircle2,
  Loader2,
  Camera,
  ShieldCheck,
  Wallet,
  Sparkles,
  Award,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { toast } from 'sonner';

interface ProfileViewProps {
  employee?: any;
  isLoading?: boolean;
  onUpdateProfile?: (updates: { phone?: string; address?: string }) => Promise<void>;
  onUploadAvatar?: (file: File) => Promise<void>;
}

export function ProfileView({
  employee = null,
  isLoading = false,
  onUpdateProfile,
  onUploadAvatar,
}: ProfileViewProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [phone, setPhone] = useState(employee?.profile?.phone || '+91 98765 43210');
  const [address, setAddress] = useState(employee?.profile?.address || 'Indiranagar, Bengaluru, Karnataka');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const profile = employee?.profile || employee?.profiles || {};
  const fullName = profile.full_name || employee?.name || 'Abhilash Abhi';
  const email = profile.email || employee?.email || 'abhilash998575@gmail.com';
  const empId = employee?.employee_id || 'EMP-001';
  const dept = employee?.department || 'Engineering';
  const jobTitle = employee?.job_title || 'Software Engineer';
  const status = employee?.status || 'active';
  const joiningDate = employee?.joining_date ? formatDate(employee.joining_date) : '22 Aug 2026';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (onUpdateProfile) {
        await onUpdateProfile({ phone, address });
      }
      toast.success('Contact Details Updated', {
        description: 'Your personal phone number and address have been saved.',
      });
      setEditOpen(false);
    } catch (err: any) {
      toast.error('Update failed', { description: err?.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      if (onUploadAvatar) {
        await onUploadAvatar(file);
        toast.success('Profile picture updated successfully');
      }
    } catch (err: any) {
      toast.error('Upload failed', { description: err?.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Profile Banner Card */}
      <Card className="overflow-hidden border border-border/60 shadow-sm rounded-2xl bg-card">
        {/* Cover backdrop */}
        <div className="h-32 sm:h-36 bg-gradient-to-r from-primary/30 via-indigo-600/25 to-purple-600/30 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Badge className="bg-background/80 text-foreground backdrop-blur-md border border-border/60 font-mono text-xs">
              {empId}
            </Badge>
          </div>
        </div>

        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            {/* Avatar + Identity */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative group self-start">
                <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-background shadow-lg rounded-2xl">
                  <AvatarImage src={profile.avatar_url || ''} alt={fullName} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold rounded-2xl">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>

                {/* Upload overlay trigger */}
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 rounded-2xl bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-medium"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span>Change</span>
                    </>
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">{fullName}</h1>
                  <Badge
                    className={`text-xs px-2.5 py-0.5 capitalize ${
                      status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}
                    variant="outline"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                    {String(status).replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {jobTitle} • <span className="text-primary">{dept}</span>
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{email}</span>
                </p>
              </div>
            </div>

            {/* Edit Contact Button Modal */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 self-start sm:self-auto h-9 text-xs rounded-xl shadow-xs">
                  <Edit2 className="w-3.5 h-3.5 text-primary" />
                  <span>Edit Contact Info</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                  <DialogTitle className="text-lg">Edit Personal Contact</DialogTitle>
                  <DialogDescription className="text-xs">
                    Update your personal phone number and residential address. Organizational job fields are protected by HR.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-semibold">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs font-semibold">Residential Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Indiranagar, Bengaluru, Karnataka"
                    />
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

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/40">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-primary" /> Department
              </span>
              <p className="text-sm font-bold text-foreground mt-0.5">{dept}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Joined Date
              </span>
              <p className="text-sm font-bold text-foreground mt-0.5">{joiningDate}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" /> Work Hours
              </span>
              <p className="text-sm font-bold text-foreground mt-0.5">9:00 AM – 6:00 PM</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Location
              </span>
              <p className="text-sm font-bold text-foreground mt-0.5">Bengaluru HQ</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Bento Tabs Section */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="bg-muted/60 p-1 grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="personal" className="text-xs">Personal Info</TabsTrigger>
          <TabsTrigger value="organization" className="text-xs">Job & Role</TabsTrigger>
          <TabsTrigger value="compensation" className="text-xs">Compensation</TabsTrigger>
        </TabsList>

        {/* Tab 1: Personal Info */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-border/60 shadow-sm rounded-2xl">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Primary Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground">Official Email</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 flex items-center justify-between">
                    <span>{email}</span>
                    <Badge variant="secondary" className="text-[10px] text-emerald-600 bg-emerald-500/10">Verified</Badge>
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground">Contact Phone Number</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{phone}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-sm rounded-2xl">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Residential & Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground">Current Residence</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{address}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground">Country & Timezone</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">India (IST • UTC+05:30)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Organization Info */}
        <TabsContent value="organization" className="space-y-4">
          <Card className="border border-border/60 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Employment & Organizational Parameters
              </CardTitle>
              <Badge variant="secondary" className="text-[10px] gap-1 bg-muted/80">
                <Lock className="w-3 h-3 text-muted-foreground" />
                HR Locked
              </Badge>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground">Employee ID</p>
                <p className="text-sm font-bold text-foreground mt-0.5 font-mono">{empId}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{dept}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground">Designation</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{jobTitle}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground">Employment Type</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">Full-time Permanent</p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground">Date of Joining</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{joiningDate}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground">Reporting Location</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">Indiranagar HQ</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Compensation Quickview */}
        <TabsContent value="compensation" className="space-y-4">
          <Card className="border border-border/60 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                Salary & Compensation Structure
              </CardTitle>
              <Link href={ROUTES.EMPLOYEE.PAYROLL}>
                <Button size="sm" variant="ghost" className="text-xs text-primary gap-1 h-8">
                  <span>Full Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-xs font-medium text-primary">Monthly Base Pay</p>
                <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(45000)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Core fixed salary</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-xs font-medium text-emerald-600">Allowances & Perks</p>
                <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(16000)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">HRA & Special allowances</p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                <p className="text-xs font-medium text-indigo-600">Estimated Annual CTC</p>
                <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(732000)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Total cost to company</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
