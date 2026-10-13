'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  Activity,
  AlertTriangle,
  Mail,
  BarChart3,
  ShieldAlert,
  Bell,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Send,
  Radio,
  Clock,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Database,
  Terminal,
  Globe,
  Award,
  Swords,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers as LayersIcon,
} from 'lucide-react';
import { User } from '@/lib/auth';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuText,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
} from '@/components/ui/sidebar';

type AdminSection =
  | 'overview'
  | 'online_users'
  | 'all_users'
  | 'visits'
  | 'graphs'
  | 'activity'
  | 'violations'
  | 'announcements'
  | 'mail';

interface AdminData {
  stats: {
    onlineCount: number;
    totalUsers: number;
    totalVisits: number;
    totalMatches: number;
    totalSubmissions: number;
    totalCodeLinesCompiled: number;
    pendingViolations: number;
    activeAnnouncements: number;
    messagesSent: number;
  };
  onlineUsers: any[];
  allUsers: User[];
  visits: any[];
  activities: any[];
  matches: any[];
  violations: any[];
  announcements: any[];
  messages: any[];
  daysTrend: { date: string; visits: number; matches: number; activeUsers: number }[];
  browserStats: Record<string, number>;
  departmentBreakdown: Record<string, number>;
}

interface AdminPanelProps {
  currentUser: User;
  onClose?: () => void;
  onSelectUserProfile?: (user: User) => void;
}

export function AdminPanel({ currentUser, onClose, onSelectUserProfile }: AdminPanelProps) {
  const [section, setSection] = useState<AdminSection>('overview');
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);

  // New Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annType, setAnnType] = useState<'info' | 'warning' | 'alert'>('info');

  // New Email / Message Form State
  const [mailTo, setMailTo] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [mailCategory, setMailCategory] = useState<'newsletter' | 'contest_invite' | 'security_alert' | 'custom'>('contest_invite');
  const [mailSending, setMailSending] = useState(false);
  const [mailSuccess, setMailSuccess] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin');
      const json = await res.json();
      if (json.status === 'ok') {
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 8000); // 8-second auto refresh
    return () => clearInterval(interval);
  }, []);

  const handleResolveViolation = async (id: string, status: 'resolved' | 'dismissed') => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_violation', id, status }),
      });
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_announcement',
          title: annTitle,
          message: annMessage,
          type: annType,
          author: currentUser.name || 'System Admin',
        }),
      });
      setAnnTitle('');
      setAnnMessage('');
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAnnouncement = async (id: string) => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_announcement', id }),
      });
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailTo.trim() || !mailSubject.trim() || !mailBody.trim()) return;
    setMailSending(true);
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          toEmail: mailTo,
          subject: mailSubject,
          body: mailBody,
          category: mailCategory,
          sentBy: currentUser.name || 'Admin Ops',
        }),
      });
      setMailSuccess(true);
      setMailSubject('');
      setMailBody('');
      fetchAdminData();
      setTimeout(() => setMailSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setMailSending(false);
    }
  };

  const navItems = [
    { id: 'overview', label: '1. Executive Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'online_users', label: '2. Live Online Students', icon: <Radio className="w-4 h-4 text-emerald-500" />, badge: data?.stats.onlineCount },
    { id: 'all_users', label: '3. Student Profiles & Work', icon: <Users className="w-4 h-4" />, count: data?.stats.totalUsers },
    { id: 'graphs', label: '4. Visual Growth Graphs', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'visits', label: '5. Campus Web Visits', icon: <Eye className="w-4 h-4" />, count: data?.stats.totalVisits },
    { id: 'activity', label: '6. Real-Time DSA Feed', icon: <Terminal className="w-4 h-4" /> },
    { id: 'violations', label: '7. Conduct & Bot Alerts', icon: <ShieldAlert className="w-4 h-4 text-rose-500" />, badge: data?.stats.pendingViolations },
    { id: 'announcements', label: '8. Campus Notices', icon: <Bell className="w-4 h-4" /> },
    { id: 'mail', label: '9. Dispatcher & Mail Hub', icon: <Mail className="w-4 h-4" /> },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="h-full w-full flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 select-none overflow-hidden font-sans">
        {/* Collapsible shadcn/ui Sidebar */}
        <Sidebar collapsible="icon" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          {/* Sidebar Header: Branding & Toggle */}
          <SidebarHeader className="border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 shrink-0"></span>
                <SidebarMenuText className="font-mono font-bold text-xs tracking-tight uppercase text-zinc-900 dark:text-zinc-100">
                  Invertis Admin OS
                </SidebarMenuText>
              </div>
              <SidebarTrigger />
            </div>
          </SidebarHeader>

          {/* Sidebar Scrollable Content */}
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-zinc-400 dark:text-zinc-500 font-mono">Control Centers</SidebarGroupLabel>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = section === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => {
                          setSection(item.id as AdminSection);
                          setSelectedUserDetail(null);
                        }}
                        tooltip={item.label}
                        className={isActive ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}
                      >
                        {item.icon}
                        <SidebarMenuText className="font-medium text-xs">
                          {item.label}
                        </SidebarMenuText>
                        {item.badge !== undefined && item.badge > 0 && (
                          <SidebarMenuBadge className="bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">{item.badge}</SidebarMenuBadge>
                        )}
                        {item.count !== undefined && (
                          <SidebarMenuText className="ml-auto font-mono text-[10px] opacity-60">
                            {item.count}
                          </SidebarMenuText>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>

            {/* Quick System Health Box */}
            <div className="pt-2 px-1">
              <SidebarMenuText className="block w-full">
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-zinc-500 font-mono">
                    <span>TELEMETRY</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">GENUINE LIVE</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                    <div className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full w-full"></div>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    Real Database &bull; Zero Mock Data
                  </div>
                </div>
              </SidebarMenuText>
            </div>
          </SidebarContent>

          {/* Sidebar Footer */}
          <SidebarFooter className="border-zinc-200 dark:border-zinc-800">
            <div
              onClick={() => onSelectUserProfile?.(currentUser)}
              className="flex items-center justify-between text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Click to manage personal and admin profile"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold flex items-center justify-center text-[10px] shrink-0">
                  AD
                </div>
                <SidebarMenuText className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {currentUser.name}
                </SidebarMenuText>
              </div>
              <SidebarMenuText className="text-[10px] opacity-60">
                Edit &rarr;
              </SidebarMenuText>
            </div>
          </SidebarFooter>

          {/* Interactive Resize Rail */}
          <SidebarRail />
        </Sidebar>

        {/* SidebarInset: Clean White & Grey Executive View */}
        <SidebarInset>
          {/* Top Command Bar */}
          <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                  ADMINISTRATIVE ROOT VIEW
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchAdminData}
                disabled={loading}
                className="p-1.5 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs flex items-center gap-1.5 cursor-pointer"
                title="Refresh Real-Time Feeds"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-[11px] font-mono font-medium hidden sm:inline">Refresh</span>
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 cursor-pointer"
                >
                  Exit Console
                </button>
              )}
            </div>
          </div>

          {/* Active Viewport Container */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-zinc-50 dark:bg-zinc-950">
          {/* Telemetry Loading State */}
          {!data && loading && (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
              <RefreshCw className="w-6 h-6 animate-spin mb-3 text-zinc-400" />
              <span className="text-xs font-mono">Loading telemetry and campus pulse...</span>
            </div>
          )}

          {/* Telemetry Error State */}
          {!data && !loading && (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
              <AlertTriangle className="w-6 h-6 mb-3 text-zinc-400" />
              <span className="text-xs font-mono mb-3">Unable to retrieve telemetry stream.</span>
              <button
                onClick={fetchAdminData}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold cursor-pointer"
              >
                Retry Telemetry
              </button>
            </div>
          )}

          {/* ================= SECTION 1: EXECUTIVE OVERVIEW ================= */}
          {section === 'overview' && data && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                  Executive Telemetry &amp; Campus Pulse
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Comprehensive live analytics of student visits, problem submissions, and 1v1 matchmaking duels.
                </p>
              </div>

              {/* 4 Primary Top Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] font-mono uppercase font-semibold">Active Online Now</span>
                    <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {data.stats.onlineCount}
                  </div>
                  <div className="text-[11px] text-zinc-500">Live sockets responding</div>
                </div>

                <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] font-mono uppercase font-semibold">Total Campus Visits</span>
                    <Eye className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {data.stats.totalVisits}
                  </div>
                  <div className="text-[11px] text-zinc-500">Unique route navigations</div>
                </div>

                <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] font-mono uppercase font-semibold">Registered Coders</span>
                    <Users className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {data.stats.totalUsers}
                  </div>
                  <div className="text-[11px] text-zinc-500">Invertis verified accounts</div>
                </div>

                <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] font-mono uppercase font-semibold">DSA Matches Fought</span>
                    <Swords className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {data.stats.totalMatches}
                  </div>
                  <div className="text-[11px] text-zinc-500">Head-to-head timed duels</div>
                </div>
              </div>

              {/* Secondary Metrics Bar */}
              <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <div className="text-zinc-400 text-[10px] uppercase font-semibold">Evaluated Submissions</div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {data.stats.totalSubmissions}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400 text-[10px] uppercase font-semibold">Lines of Code Compiled</div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {data.stats.totalCodeLinesCompiled.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400 text-[10px] uppercase font-semibold">Security Conduct Flags</div>
                  <div className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mt-0.5">
                    {data.stats.pendingViolations} Pending
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400 text-[10px] uppercase font-semibold">Live Campus Notices</div>
                  <div className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mt-0.5">
                    {data.stats.activeAnnouncements} Active
                  </div>
                </div>
              </div>

              {/* Quick Jump Grid into Other 8 Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setSection('online_users')}
                  className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      Who is on the site right now?
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300" />
                  </div>
                  <p className="text-xs text-zinc-500">
                    Inspect {data.stats.onlineCount} currently active student sessions with live ping rates.
                  </p>
                </div>

                <div
                  onClick={() => setSection('all_users')}
                  className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      What did each student solve?
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300" />
                  </div>
                  <p className="text-xs text-zinc-500">
                    Drill down into individual profiles, win rates, matches played, and ELO growth.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 2: LIVE ONLINE USERS ================= */}
          {section === 'online_users' && data && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                    Live Online Students ({data.onlineUsers.length})
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Real-time presence tracking via synchronized 15-second heartbeat pings.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  POLLING ACTIVE
                </span>
              </div>

              {data.onlineUsers.length === 0 ? (
                <div className="p-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                  No other active browser sessions connected at this precise moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.onlineUsers.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => setSelectedUserDetail(u)}
                      className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold flex items-center justify-center text-xs border border-zinc-200 dark:border-zinc-700">
                            {u.name?.slice(0, 2).toUpperCase() || 'ST'}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{u.name}</div>
                            <div className="text-[11px] font-mono text-zinc-400">@{u.handle}</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold">
                          Online
                        </span>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span>{u.college || 'Invertis University'}</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{u.elo || 1000} ELO</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= SECTION 3: ALL STUDENT PROFILES & WHAT THEY WORKED ON ================= */}
          {section === 'all_users' && data && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                    Registered Students &amp; Work Records ({data.allUsers.length})
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Click any student to view their match history, solved challenges, and profile details.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name or handle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              {/* Selected User Detailed Drawer / Card */}
              {selectedUserDetail && (
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 shadow-xs space-y-4 animate-in fade-in">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-mono font-bold text-base flex items-center justify-center">
                        {selectedUserDetail.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                          {selectedUserDetail.name}
                        </h3>
                        <p className="text-xs font-mono text-zinc-400">
                          @{selectedUserDetail.handle} &bull; {selectedUserDetail.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUserDetail(null)}
                      className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs font-mono cursor-pointer"
                    >
                      Close &times;
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <div className="text-zinc-400 text-[10px]">CURRENT ELO</div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {selectedUserDetail.elo}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <div className="text-zinc-400 text-[10px]">MATCHES WON</div>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedUserDetail.matchesWon}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <div className="text-zinc-400 text-[10px]">TOTAL PLAYED</div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {selectedUserDetail.matchesPlayed}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <div className="text-zinc-400 text-[10px]">WIN RATIO</div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {selectedUserDetail.matchesPlayed > 0
                          ? `${Math.round((selectedUserDetail.matchesWon / selectedUserDetail.matchesPlayed) * 100)}%`
                          : '0%'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono pt-1">
                    <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <span className="text-[10px] text-zinc-400 block uppercase">Student ID</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedUserDetail.studentId || 'Not assigned'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <span className="text-[10px] text-zinc-400 block uppercase">Course / Branch</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedUserDetail.course || 'Not specified'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <span className="text-[10px] text-zinc-400 block uppercase">Phone Number</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedUserDetail.phone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span>Campus: <strong>{selectedUserDetail.college}</strong></span>
                    <span>Joined: <strong>{new Date(selectedUserDetail.joinedAt).toLocaleDateString()}</strong></span>
                  </div>
                </div>
              )}

              {/* All Students Table */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 font-mono uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Duels Record</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {data.allUsers
                      .filter(
                        (u) =>
                          u &&
                          ((u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (u.handle || '').toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                          onClick={() => setSelectedUserDetail(u)}
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">{u.name}</div>
                            <div className="text-[11px] font-mono text-zinc-400">@{u.handle}</div>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">{u.college}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                            {u.elo}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-300">
                            {u.matchesWon}W / {u.matchesPlayed}P
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                            {new Date(u.joinedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-colors">
                              View Profile &rarr;
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= SECTION 4: VISUAL GRAPH CHARTS ================= */}
          {section === 'graphs' && data && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                  Visual Growth &amp; Engagement Charts
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  7-Day trends of campus student visits, matchmaking duels fought, and browser breakdowns.
                </p>
              </div>

              {/* Professional Grey & White Executive Analytical Chart */}
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
                      GENUINE 7-DAY TELEMETRY TRAFFIC
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Exact aggregated campus page requests &amp; real-time 1v1 match sessions.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-zinc-900 dark:bg-zinc-100"></span> Verified Visits
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-zinc-400 dark:bg-zinc-600"></span> 1v1 Duels
                    </span>
                  </div>
                </div>

                {/* Professional Analytical SVG Area & Column Chart */}
                <div className="h-64 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 700 220" preserveAspectRatio="none">
                    {/* Horizontal Reference Gridlines */}
                    <line x1="0" y1="20" x2="700" y2="20" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="3 3" />
                    <line x1="0" y1="75" x2="700" y2="75" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="3 3" />
                    <line x1="0" y1="130" x2="700" y2="130" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="3 3" />
                    <line x1="0" y1="185" x2="700" y2="185" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />

                    {/* Columns Rendered per Day */}
                    {data.daysTrend.map((day, idx) => {
                      const maxVal = Math.max(...data.daysTrend.map((d) => Math.max(d.visits, d.matches)), 10);
                      const colWidth = 28;
                      const xCenter = 50 + idx * 95;
                      const visitH = Math.max(4, (day.visits / maxVal) * 150);
                      const matchH = Math.max(4, (day.matches / maxVal) * 150);

                      return (
                        <g key={idx}>
                          {/* Visit Bar */}
                          <rect
                            x={xCenter - 16}
                            y={185 - visitH}
                            width={colWidth / 2}
                            height={visitH}
                            rx={2}
                            className="fill-zinc-900 dark:fill-zinc-100 hover:opacity-80 transition-opacity"
                          />
                          {/* Match Bar */}
                          <rect
                            x={xCenter + 2}
                            y={185 - matchH}
                            width={colWidth / 2}
                            height={matchH}
                            rx={2}
                            className="fill-zinc-400 dark:fill-zinc-600 hover:opacity-80 transition-opacity"
                          />

                          {/* Data Value Pill on top if > 0 */}
                          {day.visits > 0 && (
                            <text
                              x={xCenter - 8}
                              y={175 - visitH}
                              textAnchor="middle"
                              className="fill-zinc-600 dark:fill-zinc-400 font-mono text-[9px] font-bold"
                            >
                              {day.visits}
                            </text>
                          )}

                          {/* X-Axis Date Label */}
                          <text
                            x={xCenter}
                            y={205}
                            textAnchor="middle"
                            className="fill-zinc-400 font-mono text-[10px] uppercase font-bold"
                          >
                            {day.date}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Tabular Exact Breakdown Under Graph */}
                <div className="grid grid-cols-7 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center font-mono text-xs">
                  {data.daysTrend.map((day, i) => (
                    <div key={i} className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60">
                      <div className="text-[10px] text-zinc-400 font-semibold">{day.date}</div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-1">{day.visits} visits</div>
                      <div className="text-[10px] text-zinc-500">{day.matches} duels</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department & Browser Distribution Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Department Share */}
                <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500">
                    Department Participation
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(data.departmentBreakdown).map(([dept, count]) => {
                      const pct = data.allUsers.length > 0 ? Math.round((count / data.allUsers.length) * 100) : 0;
                      return (
                        <div key={dept} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-zinc-800 dark:text-zinc-200">{dept}</span>
                            <span className="font-mono text-zinc-500">{count} coders ({pct}%)</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div style={{ width: `${pct}%` }} className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Browser Share */}
                <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500">
                    Browsers Used by Invertis Students
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(data.browserStats).map(([browser, pct]) => (
                      <div key={browser} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">{browser}</span>
                          <span className="font-mono text-zinc-500">{pct}% share</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div style={{ width: `${pct}%` }} className="h-full bg-zinc-600 dark:bg-zinc-400 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 5: CAMPUS WEB VISITS AUDIT ================= */}
          {section === 'visits' && data && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                    Campus Web Visits &amp; Route Telemetry
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Audited access logs with timestamp, route URL, and client user-agent details.
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-500 font-semibold">
                  {data.visits.length} Logged Entries
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 font-mono uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Visitor / Student</th>
                      <th className="py-3 px-4">Route Path</th>
                      <th className="py-3 px-4">Client Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono text-[11px]">
                    {data.visits.map((v) => (
                      <tr key={v.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="py-3 px-4 text-zinc-500">
                          {new Date(v.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4 font-sans font-semibold text-zinc-900 dark:text-zinc-100">
                          {v.userName || 'Anonymous Invertis Visitor'}
                          {v.userHandle && <span className="text-zinc-400 font-mono text-xs block">@{v.userHandle}</span>}
                        </td>
                        <td className="py-3 px-4 text-zinc-900 dark:text-zinc-100 font-semibold">
                          {v.path}
                        </td>
                        <td className="py-3 px-4 text-zinc-400 text-[10px] max-w-xs truncate">
                          {v.userAgent || 'Desktop Browser'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= SECTION 6: REAL-TIME ACTIVITY & DUELS FEED ================= */}
          {section === 'activity' && data && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                  Real-Time DSA Feed &amp; Match Records
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Live match finishes, score cards, and solved algorithm challenges.
                </p>
              </div>

              <div className="space-y-3">
                {data.activities.length === 0 ? (
                  <div className="p-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                    No recent activity recorded yet.
                  </div>
                ) : (
                  data.activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold border border-zinc-200 dark:border-zinc-700">
                          <Swords className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{act.user1Name}</span>
                          {act.user2Name && (
                            <span className="text-zinc-500"> defeated <strong className="text-zinc-900 dark:text-zinc-100">{act.user2Name}</strong> in 1v1 match</span>
                          )}
                          {act.problemTitle && (
                            <span className="text-zinc-500"> solved <strong className="text-zinc-900 dark:text-zinc-100">{act.problemTitle}</strong></span>
                          )}
                        </div>
                      </div>
                      <span className="text-zinc-400 font-mono text-[11px]">{act.timeAgo}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= SECTION 7: CONDUCT & BOT VIOLATIONS ================= */}
          {section === 'violations' && data && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                    Academic Integrity &amp; Anti-Cheating Alerts
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Automated anomalous submission detection and student peer violation reports.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs font-semibold border border-zinc-200 dark:border-zinc-700">
                  {data.stats.pendingViolations} Pending Review
                </span>
              </div>

              <div className="space-y-3">
                {data.violations.length === 0 ? (
                  <div className="p-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                    Zero violations logged. Fair play standards maintained across campus.
                  </div>
                ) : (
                  data.violations.map((v) => (
                    <div
                      key={v.id}
                      className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[10px] font-bold uppercase">
                            {v.category}
                          </span>
                          <span className="text-xs text-zinc-500">
                            Reported Subject: <strong className="text-zinc-900 dark:text-zinc-100">{v.reportedUser}</strong>
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            v.status === 'pending'
                              ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
                              : v.status === 'resolved'
                              ? 'bg-emerald-500/10 text-emerald-700'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        {v.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
                        <span>Reported by: {v.reporterName}</span>
                        {v.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleResolveViolation(v.id, 'dismissed')}
                              className="px-3 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                            >
                              Dismiss
                            </button>
                            <button
                              onClick={() => handleResolveViolation(v.id, 'resolved')}
                              className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold cursor-pointer shadow-xs"
                            >
                              Enforce Penalty
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= SECTION 8: CAMPUS NOTICES & ANNOUNCEMENTS ================= */}
          {section === 'announcements' && data && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                  Campus Announcement Broadcast Center
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Publish real-time banners visible to all students on the website header and dashboard.
                </p>
              </div>

              {/* Create Notice Form */}
              <form onSubmit={handleCreateAnnouncement} className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="font-semibold text-xs uppercase font-mono tracking-wider text-zinc-500">
                  Publish New Campus Notice
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Announcement Headline (e.g. TCS Pool Drive Practice Duel Live)..."
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <select
                      value={annType}
                      onChange={(e) => setAnnType(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
                    >
                      <option value="info">Info Notice</option>
                      <option value="warning">Important Alert</option>
                      <option value="alert">Urgent Placement Broadcast</option>
                    </select>
                  </div>
                </div>

                <textarea
                  placeholder="Detailed announcement copy visible across student dashboards..."
                  rows={2}
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Notice to All Students</span>
                  </button>
                </div>
              </form>

              {/* Active Notices List */}
              <div className="space-y-3">
                {data.announcements.length === 0 ? (
                  <div className="p-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                    No campus notices broadcasted yet.
                  </div>
                ) : (
                  data.announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                            ann.active ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            {ann.active ? 'Active' : 'Disabled'}
                          </span>
                          <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{ann.title}</h4>
                        </div>
                        <p className="text-xs text-zinc-500">{ann.message}</p>
                      </div>

                      <button
                        onClick={() => handleToggleAnnouncement(ann.id)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-mono font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer shrink-0"
                      >
                        {ann.active ? 'Turn Off' : 'Reactivate'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= SECTION 9: MAIL & DISPATCHER HUB ================= */}
          {section === 'mail' && data && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                  Mail Hub &amp; Student Direct Dispatcher
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Send placement updates, contest invites, or individual performance memos directly to students.
                </p>
              </div>

              {mailSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Dispatch logged and sent to student queue!</span>
                </div>
              )}

              {/* Mail Dispatch Form */}
              <form onSubmit={handleSendMessage} className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-500 mb-1">
                      Recipient Student Email or Handle
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. aman@invertis.ac.in or All Invertis Coders"
                      value={mailTo}
                      onChange={(e) => setMailTo(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-500 mb-1">
                      Dispatch Category
                    </label>
                    <select
                      value={mailCategory}
                      onChange={(e) => setMailCategory(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
                    >
                      <option value="contest_invite">Contest &amp; Duel Invitation</option>
                      <option value="newsletter">Weekly DSA Performance Digest</option>
                      <option value="security_alert">Academic Security Warning</option>
                      <option value="custom">Custom Administrative Memo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-500 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    placeholder="Subject: Invitation to Inter-Department 1v1 DSA Arena Round..."
                    value={mailSubject}
                    onChange={(e) => setMailSubject(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-500 mb-1">
                    Message Body
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter message body..."
                    value={mailBody}
                    onChange={(e) => setMailBody(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={mailSending}
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{mailSending ? 'Dispatching...' : 'Dispatch Email to Student'}</span>
                  </button>
                </div>
              </form>

              {/* Sent Messages Log */}
              <div className="space-y-3">
                <h3 className="font-semibold text-xs uppercase font-mono tracking-wider text-zinc-500">
                  Recent Dispatches Log ({data.messages.length})
                </h3>
                {data.messages.length === 0 ? (
                  <div className="p-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                    No dispatches recorded yet. Use the form above to send an email memo.
                  </div>
                ) : (
                  data.messages.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{m.subject}</span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {new Date(m.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        To: {m.toEmail} &bull; Category: {m.category} &bull; By: {m.sentBy}
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 pt-1 text-xs">{m.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
