'use client';

import React, { useState } from 'react';
import { User, saveUserSession, saveRegisteredUser, getTier } from '@/lib/auth';
import {
  User as UserIcon,
  Mail,
  GraduationCap,
  BookOpen,
  Phone,
  Edit3,
  Check,
  X,
  Upload,
  Trash2,
  Calendar,
  Building,
  Sparkles,
  ShieldCheck,
  Globe,
  LogOut,
  ArrowLeft,
  FileText,
  Award,
} from 'lucide-react';

const GithubIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface ProfileViewProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  onBackToDashboard?: () => void;
  onSignOut?: () => void;
}

export function ProfileView({
  user,
  onUpdateUser,
  onBackToDashboard,
  onSignOut,
}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState(user.name || '');
  const [studentId, setStudentId] = useState(user.studentId || '');
  const [course, setCourse] = useState(user.course || 'B.Tech CSE');
  const [phone, setPhone] = useState(user.phone || '');
  const [college, setCollege] = useState(user.college || 'Invertis University');
  const [yearSemester, setYearSemester] = useState(user.yearSemester || '3rd Year • Semester 6');
  const [bio, setBio] = useState(
    user.bio || 'Competitive Programmer & DSA Duelist at Invertis University'
  );
  const [githubUrl, setGithubUrl] = useState(user.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl || '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user.avatarUrl);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(undefined);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const updatedUser: User = {
      ...user,
      name: name.trim() || user.name,
      college: college.trim() || 'Invertis University',
      avatarUrl,
      studentId: studentId.trim(),
      course: course.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      yearSemester: yearSemester.trim(),
      githubUrl: githubUrl.trim(),
      linkedinUrl: linkedinUrl.trim(),
      accountStatus: 'Active',
      followersCount: user.followersCount || 0,
      followingCount: user.followingCount || 0,
    };

    // 1. Save to Client State & LocalStorage
    saveUserSession(updatedUser);
    saveRegisteredUser(updatedUser);
    onUpdateUser(updatedUser);

    // 2. Persist to Server Database
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          userId: user.id,
          updates: {
            name: updatedUser.name,
            college: updatedUser.college,
            avatarUrl: updatedUser.avatarUrl,
            studentId: updatedUser.studentId,
            course: updatedUser.course,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
            yearSemester: updatedUser.yearSemester,
            githubUrl: updatedUser.githubUrl,
            linkedinUrl: updatedUser.linkedinUrl,
          },
        }),
      });
    } catch (err) {
      console.warn('Could not sync with server DB, stored locally:', err);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleCancel = () => {
    setName(user.name || '');
    setStudentId(user.studentId || '');
    setCourse(user.course || 'B.Tech CSE');
    setPhone(user.phone || '');
    setCollege(user.college || 'Invertis University');
    setYearSemester(user.yearSemester || '3rd Year • Semester 6');
    setBio(user.bio || 'Competitive Programmer & DSA Duelist at Invertis University');
    setGithubUrl(user.githubUrl || '');
    setLinkedinUrl(user.linkedinUrl || '');
    setAvatarUrl(user.avatarUrl);
    setIsEditing(false);
  };
  return (
    <div className="min-h-screen bg-[#f2f1ef] text-zinc-900">
      <div className="flex items-center justify-between gap-3 overflow-hidden border-b border-[#e0d7c7] bg-[#f5d600] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1f1d1a] sm:text-xs">
        <div className="flex flex-1 items-center justify-center gap-3 overflow-hidden">
          <span className="shrink-0 rounded-md bg-[#0f172a] px-2 py-1 text-[10px] font-black text-[#facc15]">
            ANNOUNCEMENT
          </span>
          <span className="truncate text-center font-medium">
            New mid-term papers are being added by our team across departments — thank you for your patience while they go live.
          </span>
        </div>
        <span className="hidden shrink-0 cursor-default rounded-md bg-[#ff5c5c] px-2 py-1 text-[10px] font-black text-white sm:inline-flex">
          ANNOUNCEMENT
        </span>
      </div>

      <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <div className="text-[29px] font-black tracking-[-0.08em]">
              <span className="bg-gradient-to-r from-[#f3278b] via-[#c53dff] to-[#4f46e5] bg-clip-text text-transparent">
                INVERTISPREP
              </span>
            </div>

            <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex">
              <button type="button" className="flex items-center gap-1.5 rounded-full px-2 py-1 transition hover:text-zinc-900">
                <span>Academics</span>
                <span className="text-[10px] text-zinc-500">▾</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 rounded-full px-2 py-1 transition hover:text-zinc-900">
                <span>Career</span>
                <span className="text-[10px] text-zinc-500">▾</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 rounded-full px-2 py-1 transition hover:text-zinc-900">
                <span>Community</span>
                <span className="text-[10px] text-zinc-500">▾</span>
              </button>
              <button type="button" className="rounded-full px-2 py-1 transition hover:text-zinc-900">
                Support
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" aria-label="Notifications" className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                <path d="M10 20a2 2 0 0 0 4 0" />
              </svg>
            </button>
            <button type="button" aria-label="Profile quick actions" className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#dfe6ff] to-[#f0d5ff] text-[11px] font-bold text-zinc-700">
                {name ? name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() : 'AB'}
              </div>
              <span className="hidden sm:inline">{name || 'Abhisar'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        {saveSuccess && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-800">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Profile details updated successfully.</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveSuccess(false)}
              className="text-emerald-700 transition hover:text-emerald-900"
              aria-label="Dismiss success message"
            >
              &times;
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-zinc-400">
              ACCOUNT
            </div>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-zinc-900">
              My Profile
            </h1>
            <p className="mt-2 text-base text-zinc-500">Manage your personal and academic details.</p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-[10px] font-bold text-zinc-700">
              ▢
            </span>
            Browse PYQs
          </button>
        </div>

        <div className="grid gap-7 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-zinc-200 bg-[#f6f5f4] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-[6px] border-white bg-gradient-to-br from-[#d8e6ff] to-[#f8d7f8] shadow-lg">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name || 'Profile'} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-zinc-700">
                      {name
                        ?.split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'IU'}
                    </span>
                  )}
                </div>

                <label className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#111827] text-white shadow-lg transition hover:bg-[#0f172a]">
                  <Upload className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="mt-5 space-y-2">
                <h2 className="text-[2rem] font-black tracking-[-0.06em] text-zinc-900">
                  {name || 'Student Account'}
                </h2>
                <span className="inline-flex rounded-full bg-[#eef1f4] px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-700">
                  STUDENT
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <div className="border-r border-zinc-200 px-4 py-3 text-center">
                <div className="text-3xl font-black tracking-[-0.08em] text-zinc-900">{user.followersCount || 0}</div>
                <div className="mt-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-400">
                  Followers
                </div>
              </div>
              <div className="px-4 py-3 text-center">
                <div className="text-3xl font-black tracking-[-0.08em] text-zinc-900">{user.followingCount || 0}</div>
                <div className="mt-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-400">
                  Following
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ebff] text-[#5f56d8]">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Email Address
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold text-zinc-700">
                    {user.email || `${user.handle}@invertis.ac.in`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#0c9b6d]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Account Status
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Active
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                  <Building className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Campus &amp; Batch
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold text-zinc-700">{college}</div>
                </div>
              </div>
            </div>

            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out Session
              </button>
            )}
          </aside>

          <section className="rounded-[28px] border border-zinc-200 bg-[#f8f7f5] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono font-bold uppercase tracking-[0.23em] text-zinc-400">
                  PROFILE DETAILS
                </div>
                <h2 className="mt-2 text-[2rem] font-black tracking-[-0.06em] text-zinc-900">
                  Profile Details
                </h2>
                <p className="mt-1 text-sm text-zinc-500">Verify and update your contact and university details.</p>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                    <UserIcon className="h-4 w-4 text-zinc-400" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-3 text-sm text-zinc-900 ${
                      isEditing
                        ? 'border-zinc-300 bg-white focus:border-zinc-500'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email || `${user.handle}@invertis.ac.in`}
                    disabled
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-sm text-zinc-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700">
                <input type="checkbox" checked readOnly className="h-4 w-4 rounded border-zinc-300 accent-emerald-500" />
                Email Address (Managed via Google)
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                    <Award className="h-4 w-4 text-zinc-400" />
                    Student ID
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-3 text-sm text-zinc-900 ${
                      isEditing
                        ? 'border-zinc-300 bg-white focus:border-zinc-500'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                    <GraduationCap className="h-4 w-4 text-zinc-400" />
                    Course / Branch
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-3 text-sm text-zinc-900 ${
                      isEditing
                        ? 'border-zinc-300 bg-white focus:border-zinc-500'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                    <Phone className="h-4 w-4 text-zinc-400" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-3 text-sm text-zinc-900 ${
                      isEditing
                        ? 'border-zinc-300 bg-white focus:border-zinc-500'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    Academic Year / Semester
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={yearSemester}
                    onChange={(e) => setYearSemester(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-3 text-sm text-zinc-900 ${
                      isEditing
                        ? 'border-zinc-300 bg-white focus:border-zinc-500'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                    <Building className="h-4 w-4 text-zinc-400" />
                    University Campus
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-3 text-sm text-zinc-900 ${
                      isEditing
                        ? 'border-zinc-300 bg-white focus:border-zinc-500'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                  <FileText className="h-4 w-4 text-zinc-400" />
                  Personal Headline & Bio
                </label>
                <textarea
                  rows={3}
                  disabled={!isEditing}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-3 text-sm text-zinc-900 ${
                    isEditing
                      ? 'border-zinc-300 bg-white focus:border-zinc-500'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                  }`}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                    <GithubIcon className="h-4 w-4 text-zinc-400" />
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    disabled={!isEditing}
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-3 text-sm text-zinc-900 ${
                      isEditing
                        ? 'border-zinc-300 bg-white focus:border-zinc-500'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                    <LinkedinIcon className="h-4 w-4 text-zinc-400" />
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    disabled={!isEditing}
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-3 text-sm text-zinc-900 ${
                      isEditing
                        ? 'border-zinc-300 bg-white focus:border-zinc-500'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? 'Saving...' : 'Save Profile Details'}
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}