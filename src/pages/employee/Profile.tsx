import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  Camera,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  Save,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { profileService } from '../../services/profileService';
import { storageService } from '../../services/storageService';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { getInitials, formatDate } from '../../utils/helpers';

export const Profile: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
    }
  }, [profile]);

  const handleUpdateContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    try {
      await profileService.updateOwnProfile(user.id, {
        phone: phone.trim() || null,
        address: address.trim() || null,
      });
      await refreshProfile();
      showSuccess('Profile information updated successfully!');
    } catch (err: any) {
      showError(err.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      showError('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showError('Image size must be less than 2MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const publicUrl = await storageService.uploadAvatar(user.id, file);
      await profileService.updateOwnProfile(user.id, {
        profile_picture_url: publicUrl,
      });
      await refreshProfile();
      showSuccess('Profile picture updated successfully!');
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      showError(err.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Profile</h2>
        <p className="text-sm text-slate-500">
          Manage your personal details and view your organization assignment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-center">
            {/* Avatar Section */}
            <div className="relative inline-block mx-auto mb-4">
              {profile?.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt={profile.full_name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg mx-auto ring-2 ring-indigo-100"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-3xl flex items-center justify-center border-4 border-white shadow-lg mx-auto ring-2 ring-indigo-100">
                  {getInitials(profile?.full_name)}
                </div>
              )}

              {/* Upload Overlay Button */}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-md cursor-pointer transition ring-2 ring-white"
                title="Change Photo"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {uploadingImage && (
              <p className="text-xs text-indigo-600 font-medium animate-pulse mb-3">
                Uploading photo...
              </p>
            )}

            <h3 className="text-lg font-bold text-slate-900">{profile?.full_name}</h3>
            <p className="text-xs font-mono text-slate-500 mt-0.5">{profile?.employee_id}</p>
            
            <div className="mt-3 flex justify-center">
              <StatusBadge status={profile?.role || 'EMPLOYEE'} />
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{profile?.job_title || 'Not assigned'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{profile?.department || 'General'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Joined {formatDate(profile?.joining_date)}</span>
              </div>
            </div>
          </div>

          {/* Quick link to Payroll */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100 shadow-sm text-center">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-200">
              <DollarSign className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Salary & Compensation</h4>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              Your salary structure and deduction breakdowns are managed securely under Payroll.
            </p>
            <Link to="/employee/payroll">
              <Button variant="outline" size="sm" className="w-full bg-white hover:bg-slate-50">
                View My Payroll Breakdown
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Editable Personal Info & Read-only Organizational Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Editable Contact Details Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-base font-bold text-slate-900">Contact Information</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                You can update your phone number and residential address.
              </p>
            </div>

            <form onSubmit={handleUpdateContactInfo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Residential Address
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Street, City, State"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={saving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Read-Only Organizational Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Employment Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official organizational records (managed by HR / Admin).
                </p>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                Locked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Full Name
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {profile?.full_name || '—'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Employee ID
                </span>
                <span className="text-sm font-mono font-semibold text-slate-800">
                  {profile?.employee_id || '—'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Work Email
                </span>
                <span className="text-sm font-medium text-slate-800">
                  {profile?.email || '—'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Department
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {profile?.department || '—'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Job Designation
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {profile?.job_title || '—'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Joining Date
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {formatDate(profile?.joining_date)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
