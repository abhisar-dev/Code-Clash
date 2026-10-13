import { User } from '@/lib/auth';
import { Problem } from '@/lib/problems';

export type AdminSection =
  | 'overview'
  | 'user_management'
  | 'content_management'
  | 'site_settings'
  | 'database_admin'
  | 'reports_export'
  | 'security_access'
  | 'online_users'
  | 'session_durations'
  | 'user_audit'
  | 'submissions_inspect'
  | 'all_users'
  | 'visits'
  | 'graphs'
  | 'activity'
  | 'violations'
  | 'announcements'
  | 'mail';

export interface SiteSettings {
  platformTitle: string;
  collegeBranding: string;
  maintenanceMode: boolean;
  defaultMatchTimeMinutes: number;
  penaltyPerWrongSubmissionSeconds: number;
  minEloForRanked: number;
  allowGuestSpectate: boolean;
  enableSoundEffects: boolean;
  announcementTicker?: string;
  announcementTickerActive?: boolean;
}

export interface AdminStats {
  onlineCount: number;
  totalUsers: number;
  totalVisits: number;
  totalMatches: number;
  totalSubmissions: number;
  totalCodeLinesCompiled: number;
  pendingViolations: number;
  activeAnnouncements: number;
  messagesSent: number;
  totalOnlineHours?: number;
  totalAuditEvents?: number;
  customProblemsCount?: number;
  blockedIpsCount?: number;
}

export interface SystemHealth {
  nodeVersion: string;
  platform: string;
  uptimeSeconds: number;
  heapUsedMb: number;
  heapTotalMb: number;
  rssMb: number;
  dbStats: {
    totalUsers: number;
    totalMatches: number;
    totalSubmissions: number;
    totalVisits: number;
    totalAuditLogs: number;
    totalSessions: number;
    totalCustomProblems: number;
    payloadSizeBytes: number;
  };
}

export interface AdminData {
  stats: AdminStats;
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
  userSessions?: any[];
  auditLogs?: any[];
  submissions?: any[];
  userDurations?: any[];
  siteSettings?: SiteSettings;
  customProblems?: Problem[];
  blockedIps?: string[];
  systemHealth?: SystemHealth;
}
