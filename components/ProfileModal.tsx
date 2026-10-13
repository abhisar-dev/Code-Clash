'use client';

import React, { useState } from 'react';
import { User, saveUserSession } from '@/lib/auth';
import {
  User as UserIcon,
  Mail,
  GraduationCap,
  Phone,
  Edit3,
  X,
  Upload,
  LogOut,
  Calendar,
  Building,
  ShieldCheck,
  FileText,
  Award,
  Trophy,
} from 'lucide-react';

const GithubIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const LinkedinIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
  </svg>
);

interface ProfileModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onUpdate: (updated: User) => void;
  onSignOut: () => void;
}

export function ProfileModal({ isOpen, user, onClose, onUpdate, onSignOut }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [studentId, setStudentId] = useState(user.studentId || '');
  const [course, setCourse] = useState(user.course || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [college, setCollege] = useState(user.college || 'Invertis University');
  const [yearSemester, setYearSemester] = useState(user.yearSemester || '');
  const [bio, setBio] = useState(user.bio || '');
  const [githubUrl, setGithubUrl] = useState(user.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl || '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user.avatarUrl);

  // Sync state whenever user or modal open state updates
  React.useEffect(() => {
    setName(user.name || '');
    setStudentId(user.studentId || '');
    setCourse(user.course || '');
    setPhone(user.phone || '');
    setCollege(user.college || 'Invertis University');
    setYearSemester(user.yearSemester || '');
    setBio(user.bio || '');
    setGithubUrl(user.githubUrl || '');
    setLinkedinUrl(user.linkedinUrl || '');
    setAvatarUrl(user.avatarUrl);
    setIsEditing(false);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const updated: User = {
      ...user,
      name: name.trim() || user.name || 'Player',
      avatarUrl,
      studentId: studentId.trim(),
      course: course.trim(),
      phone: phone.trim(),
      college: college.trim() || 'Invertis University',
      yearSemester: yearSemester.trim(),
      bio: bio.trim(),
      githubUrl: githubUrl.trim(),
      linkedinUrl: linkedinUrl.trim(),
      accountStatus: 'Active',
    };
    saveUserSession(updated);
    onUpdate(updated);

    // Also persist permanently to backend database so re-logging in keeps all details
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          userId: user.id,
          updates: {
            name: updated.name,
            avatarUrl: updated.avatarUrl,
            studentId: updated.studentId,
            course: updated.course,
            phone: updated.phone,
            college: updated.college,
            yearSemester: updated.yearSemester,
            bio: updated.bio,
            githubUrl: updated.githubUrl,
            linkedinUrl: updated.linkedinUrl,
          },
        }),
      });
    } catch (err) {
      console.warn('Backend profile sync warning:', err);
    }

    setIsEditing(false);
    onClose();
  };

  const handleCancel = () => {
    setName(user.name || '');
    setStudentId(user.studentId || '');
    setCourse(user.course || '');
    setPhone(user.phone || '');
    setCollege(user.college || 'Invertis University');
    setYearSemester(user.yearSemester || '');
    setBio(user.bio || '');
    setGithubUrl(user.githubUrl || '');
    setLinkedinUrl(user.linkedinUrl || '');
    setAvatarUrl(user.avatarUrl);
    setIsEditing(false);
  };

  const fieldClasses = (editable: boolean) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition-colors ${
      editable
        ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:border-zinc-500 dark:focus:border-zinc-500'
        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-zinc-700 dark:text-zinc-300 cursor-default'
    }`;

  const fieldLabel = (icon: React.ReactNode, label: string) => (
    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
      <span className="text-zinc-400">{icon}</span>
      {label}
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-3 sm:p-6 backdrop-blur-sm select-none">
      <div className="w-full max-w-[1100px] max-h-[94vh] overflow-y-auto rounded-[24px] border border-zinc-200 dark:border-zinc-800 bg-[#f6f3f0] dark:bg-zinc-950 shadow-[0_35px_90px_rgba(15,23,42,0.25)]">
        {/* Header Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#e5dfd8] dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-5 py-3.5 sm:px-7">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-black tracking-tight text-[#4f46e5] dark:text-indigo-400 font-sans">
              CODE<span className="text-zinc-900 dark:text-zinc-100">CLASH</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              INVERTIS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              {user.accountStatus || 'Active'}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close profile"
              className="w-8 h-8 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-[1060px] px-4 py-7 sm:px-6 lg:px-8">
          {/* Page Heading */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-zinc-400">
                Account
              </div>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-[-0.06em] text-zinc-900 dark:text-zinc-50">
                My Profile
              </h1>
              <p className="mt-2 text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
                Manage your personal and academic details.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              <Trophy className="w-4 h-4 text-amber-500" />
              {user.elo} ELO &bull; {user.matchesWon}W / {Math.max(user.matchesPlayed - user.matchesWon, 0)}L duels
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            {/* Left: Identity & Stats Card */}
            <aside className="rounded-[24px] border border-zinc-200 dark:border-zinc-800 bg-[#f6f5f4] dark:bg-zinc-900 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[5px] border-white dark:border-zinc-800 bg-gradient-to-br from-[#d8e6ff] to-[#f8d7f8] shadow-lg">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name || 'Profile'} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-zinc-700">
                        {name
                          ?.split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase() || 'CC'}
                      </span>
                    )}
                  </div>

                  <label className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg transition hover:bg-zinc-700 dark:hover:bg-white" title="Upload photo">
                    <Upload className="h-4 w-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                <div className="mt-5 space-y-2">
                  <h2 className="text-xl font-black tracking-[-0.04em] text-zinc-900 dark:text-zinc-50 truncate max-w-[220px]">
                    {name || 'Student Account'}
                  </h2>
                  <span className="inline-flex rounded-full bg-[#eef1f4] dark:bg-zinc-800 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-700 dark:text-zinc-300">
                    Student
                  </span>
                </div>
              </div>

              {/* Followers / Following */}
              <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60">
                <div className="border-r border-zinc-200 dark:border-zinc-800 px-4 py-3 text-center">
                  <div className="text-2xl font-black tracking-[-0.06em] text-zinc-900 dark:text-zinc-50">
                    {user.followersCount ?? 0}
                  </div>
                  <div className="mt-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Followers
                  </div>
                </div>
                <div className="px-4 py-3 text-center">
                  <div className="text-2xl font-black tracking-[-0.06em] text-zinc-900 dark:text-zinc-50">
                    {user.followingCount ?? 0}
                  </div>
                  <div className="mt-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Following
                  </div>
                </div>
              </div>

              {/* Info Rows */}
              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0ebff] text-[#5f56d8]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Email Address
                    </div>
                    <div className="mt-1 truncate text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#0c9b6d]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Account Status
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      {user.accountStatus || 'Active'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Member Since
                    </div>
                    <div className="mt-1 truncate text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                      {new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onSignOut}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-3 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out Session
              </button>
            </aside>

            {/* Right: Profile Details Form */}
            <section className="rounded-[24px] border border-zinc-200 dark:border-zinc-800 bg-[#f8f7f5] dark:bg-zinc-900 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-mono font-bold uppercase tracking-[0.23em] text-zinc-400">
                    Profile Details
                  </div>
                  <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    Verify and update your contact and university details.
                  </p>
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 transition hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="space-y-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    {fieldLabel(<UserIcon className="h-4 w-4" />, 'Full Name')}
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={fieldClasses(isEditing)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    {fieldLabel(<Mail className="h-4 w-4" />, 'Email Address')}
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className={`${fieldClasses(false)} opacity-70`}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    {fieldLabel(<Award className="h-4 w-4" />, 'Student ID')}
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. IU212234"
                      className={fieldClasses(isEditing)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    {fieldLabel(<GraduationCap className="h-4 w-4" />, 'Course / Branch')}
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. B.Tech CSE"
                      className={fieldClasses(isEditing)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    {fieldLabel(<Phone className="h-4 w-4" />, 'Phone Number')}
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className={fieldClasses(isEditing)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    {fieldLabel(<Calendar className="h-4 w-4" />, 'Academic Year / Semester')}
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={yearSemester}
                      onChange={(e) => setYearSemester(e.target.value)}
                      placeholder="e.g. 3rd Year • Semester 6"
                      className={fieldClasses(isEditing)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    {fieldLabel(<Building className="h-4 w-4" />, 'University Campus')}
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className={fieldClasses(isEditing)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  {fieldLabel(<FileText className="h-4 w-4" />, 'Personal Headline & Bio')}
                  <textarea
                    rows={2}
                    disabled={!isEditing}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. Competitive Programmer & DSA Duelist"
                    className={`${fieldClasses(isEditing)} resize-none`}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    {fieldLabel(<GithubIcon className="h-4 w-4" />, 'GitHub Profile URL')}
                    <input
                      type="url"
                      disabled={!isEditing}
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className={fieldClasses(isEditing)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    {fieldLabel(<LinkedinIcon className="h-4 w-4" />, 'LinkedIn Profile URL')}
                    <input
                      type="url"
                      disabled={!isEditing}
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className={fieldClasses(isEditing)}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 transition hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="rounded-xl bg-zinc-900 dark:bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:hover:bg-indigo-500 cursor-pointer"
                    >
                      Save Profile Details
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
