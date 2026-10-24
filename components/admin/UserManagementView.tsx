'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Mail,
  GraduationCap,
  Award,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { User } from '@/lib/auth';

interface UserManagementViewProps {
  allUsers: User[];
  userDurations?: any[];
  currentUser: User;
  onRefresh: () => void;
  onSelectUserProfile?: (user: User) => void;
}

export function UserManagementView({
  allUsers,
  userDurations,
  currentUser,
  onRefresh,
  onSelectUserProfile,
}: UserManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'student' | 'proctor'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Suspended' | 'Banned'>('all');

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    college: 'Invertis University',
    role: 'student' as 'student' | 'admin' | 'proctor',
    elo: 1000,
    studentId: '',
    course: 'B.Tech CSE',
    phone: '',
  });

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // Delete User Confirmation State
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const filteredUsers = allUsers.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.handle?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      (u.studentId && u.studentId.toLowerCase().includes(q));

    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'admin' && (u.role === 'admin' || u.isAdmin)) ||
      (roleFilter === 'student' && u.role === 'student' && !u.isAdmin) ||
      (roleFilter === 'proctor' && u.role === 'proctor');

    const matchesStatus =
      statusFilter === 'all' || (u.accountStatus || 'Active') === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim()) {
      showFeedback('Name and Email are required', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_user',
          ...createForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`User account created for ${createForm.name}`);
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          email: '',
          password: '',
          college: 'Invertis University',
          role: 'student',
          elo: 1000,
          studentId: '',
          course: 'B.Tech CSE',
          phone: '',
        });
        onRefresh();
      } else {
        showFeedback(data.message || 'Failed to create user', 'error');
      }
    } catch {
      showFeedback('Server connection error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditForm({
      name: u.name || '',
      email: u.email || '',
      handle: u.handle || '',
      college: u.college || 'Invertis University',
      role: u.role || (u.isAdmin ? 'admin' : 'student'),
      elo: u.elo || 1000,
      studentId: u.studentId || '',
      course: u.course || 'B.Tech CSE',
      phone: u.phone || '',
      bio: u.bio || '',
      accountStatus: u.accountStatus || 'Active',
      password: '',
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_user',
          userId: editingUser.id,
          updates: editForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`Updated user profile for ${editForm.name}`);
        setEditingUser(null);
        onRefresh();
      } else {
        showFeedback('Failed to update user', 'error');
      }
    } catch {
      showFeedback('Server error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_user',
          userId: deletingUser.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`Deleted user account: ${deletingUser.name}`);
        setDeletingUser(null);
        onRefresh();
      } else {
        showFeedback('Failed to delete user', 'error');
      }
    } catch {
      showFeedback('Server error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (userId: string, newStatus: 'Active' | 'Suspended' | 'Banned') => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_user_status',
          userId,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`Account status changed to ${newStatus}`);
        onRefresh();
      }
    } catch {
      showFeedback('Failed to update status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
              User &amp; Permissions Management
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono text-xs">
              {filteredUsers.length} of {allUsers.length} Users
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Create, edit, suspend, or delete accounts. Designate roles (Admin, Proctor, Student) to maintain platform governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 cursor-pointer transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create User Account</span>
          </button>
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            title="Refresh Users"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search name, handle, email, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
          />
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
          <Shield className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] text-zinc-400 font-mono">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
          >
            <option value="all" className="dark:bg-zinc-900">All Roles</option>
            <option value="admin" className="dark:bg-zinc-900">Administrators</option>
            <option value="proctor" className="dark:bg-zinc-900">Contest Proctors</option>
            <option value="student" className="dark:bg-zinc-900">Students</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] text-zinc-400 font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
          >
            <option value="all" className="dark:bg-zinc-900">All Statuses</option>
            <option value="Active" className="dark:bg-zinc-900">Active</option>
            <option value="Suspended" className="dark:bg-zinc-900">Suspended</option>
            <option value="Banned" className="dark:bg-zinc-900">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 font-mono text-[11px] text-zinc-400">
                <th className="py-3 px-4 font-medium">User Profile</th>
                <th className="py-3 px-4 font-medium">Academic Info</th>
                <th className="py-3 px-4 font-medium">Role &amp; Security</th>
                <th className="py-3 px-4 font-medium">Rating &amp; Record</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-sans">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400 font-mono text-xs">
                    No users matching current filters
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isOnline = (userDurations || []).find((x) => x.userId === u.id)?.isOnline;
                  const role = u.role || (u.isAdmin ? 'admin' : 'student');
                  const status = u.accountStatus || 'Active';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* User Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-mono font-bold text-xs text-zinc-700 dark:text-zinc-200 shrink-0 relative">
                            {u.name?.slice(0, 2).toUpperCase() || 'U'}
                            {isOnline && (
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border-2 border-white dark:border-zinc-900"></span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {u.name}
                              </span>
                              {u.id === currentUser.id && (
                                <span className="px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700 text-[10px] font-mono">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                              <span>@{u.handle}</span>
                              <span>&bull;</span>
                              <span className="truncate max-w-[140px]">{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Academic Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                          {u.studentId || 'No ID'}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate max-w-[160px]">
                          {u.course || 'B.Tech CSE'} &bull; {u.college || 'Invertis University'}
                        </div>
                      </td>

                      {/* Role & Security */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            role === 'admin'
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                              : role === 'proctor'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                          }`}
                        >
                          <Shield className="w-2.5 h-2.5" />
                          <span className="capitalize">{role}</span>
                        </span>
                      </td>

                      {/* Rating & Record */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">
                          {u.elo || 1000} ELO
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {u.matchesWon || 0}W / {(u.matchesPlayed || 0) - (u.matchesWon || 0)}L
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <select
                          value={status}
                          onChange={(e) => handleQuickStatusChange(u.id, e.target.value as any)}
                          className={`font-mono text-[11px] font-bold rounded-lg px-2 py-1 border transition-colors cursor-pointer ${
                            status === 'Active'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                              : status === 'Suspended'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          <option value="Active" className="dark:bg-zinc-900">Active</option>
                          <option value="Suspended" className="dark:bg-zinc-900">Suspended</option>
                          <option value="Banned" className="dark:bg-zinc-900">Banned</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                            title="Edit User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectUserProfile?.(u)}
                            className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                            title="View Public Profile"
                          >
                            View
                          </button>
                          {u.id !== currentUser.id && (
                            <button
                              onClick={() => setDeletingUser(u)}
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE USER MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Create New User Account
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@invertis.org"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Temporary Password</label>
                  <input
                    type="text"
                    placeholder="Defaults to Invertis@2026"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Role Permission</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                  >
                    <option value="student">Student</option>
                    <option value="proctor">Contest Proctor</option>
                    <option value="admin">Platform Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Student ID</label>
                  <input
                    type="text"
                    placeholder="e.g. IU212044"
                    value={createForm.studentId}
                    onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Course / Dept</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech CSE"
                    value={createForm.course}
                    onChange={(e) => setCreateForm({ ...createForm, course: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Initial Elo</label>
                  <input
                    type="number"
                    value={createForm.elo}
                    onChange={(e) => setCreateForm({ ...createForm, elo: Number(e.target.value) })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">University / College</label>
                <input
                  type="text"
                  value={createForm.college}
                  onChange={(e) => setCreateForm({ ...createForm, college: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Edit User &amp; Permissions &bull; {editingUser.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Username / Handle</label>
                  <input
                    type="text"
                    required
                    value={editForm.handle || ''}
                    onChange={(e) => setEditForm({ ...editForm, handle: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Reset Password</label>
                  <input
                    type="text"
                    placeholder="Leave blank to keep unchanged"
                    value={editForm.password || ''}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Role Permission</label>
                  <select
                    value={editForm.role || 'student'}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                  >
                    <option value="student">Student</option>
                    <option value="proctor">Proctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Account Status</label>
                  <select
                    value={editForm.accountStatus || 'Active'}
                    onChange={(e) => setEditForm({ ...editForm, accountStatus: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Banned">Banned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Rating (Elo)</label>
                  <input
                    type="number"
                    value={editForm.elo ?? 1000}
                    onChange={(e) => setEditForm({ ...editForm, elo: Number(e.target.value) })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Student ID</label>
                  <input
                    type="text"
                    value={editForm.studentId || ''}
                    onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Course / Dept</label>
                  <input
                    type="text"
                    value={editForm.course || ''}
                    onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">College / University</label>
                <input
                  type="text"
                  value={editForm.college || ''}
                  onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE USER CONFIRMATION MODAL --- */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Delete User Account
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Irreversible administrative action
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Are you sure you want to permanently delete account{' '}
              <strong className="text-zinc-900 dark:text-zinc-100">{deletingUser.name}</strong> (@{deletingUser.handle})?
              All student profile details will be removed from the active roster.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs cursor-pointer shadow-sm disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
