import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Edit2,
  Eye,
  Filter,
  Building,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  CheckCircle,
} from 'lucide-react';
import { profileService } from '../../services/profileService';
import { Profile, UserRole } from '../../types/database';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatDate, getInitials } from '../../utils/helpers';
import { DEPARTMENTS, JOB_TITLES } from '../../utils/constants';

export const Employees: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Edit Modal State
  const [editingEmployee, setEditingEmployee] = useState<Profile | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit Form Fields
  const [editFullName, setEditFullName] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('EMPLOYEE');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await profileService.getAllProfiles();
      setEmployees(data);
    } catch (err: any) {
      console.error('Error loading employees:', err);
      showError(err.message || 'Failed to load employee list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleOpenEdit = (emp: Profile) => {
    setEditingEmployee(emp);
    setEditFullName(emp.full_name || '');
    setEditJobTitle(emp.job_title || '');
    setEditDepartment(emp.department || 'General');
    setEditRole(emp.role);
    setEditPhone(emp.phone || '');
    setEditAddress(emp.address || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setSaving(true);
    try {
      await profileService.updateProfileByAdmin(editingEmployee.id, {
        full_name: editFullName.trim(),
        job_title: editJobTitle.trim(),
        department: editDepartment,
        role: editRole,
        phone: editPhone.trim() || null,
        address: editAddress.trim() || null,
      });

      showSuccess(`Employee ${editFullName} updated successfully.`);
      setEditingEmployee(null);
      loadEmployees();
    } catch (err: any) {
      console.error('Error updating employee:', err);
      showError(err.message || 'Failed to update employee details.');
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (emp.full_name?.toLowerCase() || '').includes(query) ||
      (emp.employee_id?.toLowerCase() || '').includes(query) ||
      (emp.email?.toLowerCase() || '').includes(query) ||
      (emp.department?.toLowerCase() || '').includes(query) ||
      (emp.job_title?.toLowerCase() || '').includes(query);

    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  if (loading) {
    return <LoadingSpinner fullPage label="Loading employee records..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Employee Directory
        </h2>
        <p className="text-sm text-slate-500">
          Manage staff profiles, department assignments, designations, and permissions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, department..."
            className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-700 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-900">Registered Staff</h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {filteredEmployees.length} of {employees.length} Employees
          </span>
        </div>

        {filteredEmployees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Employees Found"
            description="No employee records match your search or filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Joining Date</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {emp.profile_picture_url ? (
                          <img
                            src={emp.profile_picture_url}
                            alt={emp.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-xs flex items-center justify-center">
                            {getInitials(emp.full_name)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">{emp.full_name}</div>
                          <div className="text-xs text-slate-400 font-mono">
                            {emp.employee_id} • {emp.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{emp.job_title || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                        {emp.department || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {formatDate(emp.joining_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={emp.role} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingEmployee(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Employee Modal */}
      <Modal
        isOpen={Boolean(viewingEmployee)}
        onClose={() => setViewingEmployee(null)}
        title="Employee Profile Details"
      >
        {viewingEmployee && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              {viewingEmployee.profile_picture_url ? (
                <img
                  src={viewingEmployee.profile_picture_url}
                  alt={viewingEmployee.full_name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-xl flex items-center justify-center">
                  {getInitials(viewingEmployee.full_name)}
                </div>
              )}
              <div>
                <h4 className="text-lg font-bold text-slate-900">{viewingEmployee.full_name}</h4>
                <p className="text-xs font-mono text-slate-500">{viewingEmployee.employee_id}</p>
                <div className="mt-1">
                  <StatusBadge status={viewingEmployee.role} size="sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Email</span>
                <span className="font-medium text-slate-800">{viewingEmployee.email || '—'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Phone</span>
                <span className="font-medium text-slate-800">{viewingEmployee.phone || '—'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Department</span>
                <span className="font-medium text-slate-800">{viewingEmployee.department || '—'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Job Designation</span>
                <span className="font-medium text-slate-800">{viewingEmployee.job_title || '—'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl sm:col-span-2">
                <span className="text-slate-400 block mb-0.5">Address</span>
                <span className="font-medium text-slate-800">{viewingEmployee.address || '—'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="primary" size="sm" onClick={() => setViewingEmployee(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        title="Edit Employee Information"
        description="Update administrative settings, designation, and role assignment."
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Department
              </label>
              <select
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Role Permission
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Job Title
            </label>
            <input
              type="text"
              value={editJobTitle}
              onChange={(e) => setEditJobTitle(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Address
              </label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingEmployee(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
