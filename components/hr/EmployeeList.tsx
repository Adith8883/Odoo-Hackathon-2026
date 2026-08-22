'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Eye, Users } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/utils/formatters';
import { ROUTES } from '@/constants/routes';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  status: string;
  avatarUrl?: string;
  employeeId?: string;
}

interface EmployeeListProps {
  employees: Employee[];
  isLoading?: boolean;
}

export function EmployeeList({ employees, isLoading = false }: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');

  const filteredEmployees = employees.filter((emp) => {
    const nameMatch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const idMatch = emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || emailMatch || idMatch;
    const matchesDept = department === 'all' || emp.department === department;
    const matchesStatus = status === 'all' || emp.status?.toLowerCase().replace(' ', '_') === status;
    return matchesSearch && matchesDept && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or employee ID..."
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
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Human Resources">Human Resources</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filteredEmployees.length}</span> of{' '}
        <span className="font-semibold text-foreground">{employees.length}</span> employees
      </p>

      {/* Table */}
      <div className="rounded-lg border border-border/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-semibold">Employee</TableHead>
              <TableHead className="text-xs font-semibold hidden md:table-cell">Dept.</TableHead>
              <TableHead className="text-xs font-semibold hidden lg:table-cell">Job Title</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
              <TableHead className="text-right text-xs font-semibold">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Users className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    {searchTerm || department !== 'all' || status !== 'all'
                      ? 'No employees match your filters'
                      : 'No employees in directory yet'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {searchTerm ? `Try a different search term` : 'Employees appear here when they sign up.'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border/40">
                        <AvatarImage src={emp.avatarUrl} alt={emp.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {getInitials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{emp.name}</div>
                        <div className="text-xs text-muted-foreground">{emp.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className="text-xs font-normal">
                      {emp.department}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {emp.jobTitle}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${
                        emp.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : emp.status === 'on_leave'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {String(emp.status || 'active').replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild className="h-8 text-xs gap-1.5">
                      <Link href={`${ROUTES.HR.EMPLOYEES}/${emp.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </Link>
                    </Button>
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
