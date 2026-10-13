import { NextRequest, NextResponse } from 'next/server';
import { db, toSafeUser } from '@/lib/database';
import { presenceManager } from '@/lib/presence-store';

export async function GET(req: NextRequest) {
  try {
    await db.ensureSynced();
    const stats = db.getStats();
    const onlineUsers = presenceManager.getOnlineUsers();
    const allUsers = db.getUsers().map(toSafeUser);
    const visits = db.getVisits(100);
    const activities = db.getRecentActivities();
    const matches = db.getMatches(50);
    const violations = db.getViolations();
    const announcements = db.getAnnouncements();
    const messages = db.getMessages();

    // Generate graph analytics: 100% genuine real data from actual visits and matches
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const daysTrend = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * dayMs);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + dayMs;

      const visitsCount = visits.filter((v) => v.timestamp >= dayStart && v.timestamp < dayEnd).length;
      const matchesCount = matches.filter((m) => m.timestamp >= dayStart && m.timestamp < dayEnd).length;
      const uniqueActive = new Set(
        visits
          .filter((v) => v.timestamp >= dayStart && v.timestamp < dayEnd && v.userId)
          .map((v) => v.userId)
      ).size;

      return {
        date: dayName,
        visits: visitsCount,
        matches: matchesCount,
        activeUsers: uniqueActive,
      };
    });

    // Device / Browser breakdown from genuine logged visits
    const browserCounts: Record<string, number> = {
      Chrome: 0,
      Edge: 0,
      Firefox: 0,
      Safari: 0,
      Other: 0,
    };
    visits.forEach((v) => {
      const ua = (v.userAgent || '').toLowerCase();
      if (ua.includes('edg')) browserCounts.Edge += 1;
      else if (ua.includes('chrome')) browserCounts.Chrome += 1;
      else if (ua.includes('firefox')) browserCounts.Firefox += 1;
      else if (ua.includes('safari')) browserCounts.Safari += 1;
      else browserCounts.Other += 1;
    });

    // Calculate percentage share
    const totalVisitCount = visits.length || 1;
    const browserStats: Record<string, number> = {};
    Object.entries(browserCounts).forEach(([browser, count]) => {
      browserStats[browser] = visits.length > 0 ? Math.round((count / totalVisitCount) * 100) : 0;
    });

    // Department breakdown of registered users
    const departmentBreakdown: Record<string, number> = {};
    allUsers.forEach((u) => {
      const course = u.course || (u.college?.includes('CSE') ? 'B.Tech CSE' : (u.college?.includes('BCA') ? 'BCA' : 'General'));
      departmentBreakdown[course] = (departmentBreakdown[course] || 0) + 1;
    });

    const userSessions = db.getUserSessions(100);
    const auditLogs = db.getUserAuditLogs({ limit: 200 });
    const submissions = db.getSubmissions(150);
    const userDurations = db.getUserOnlineDurationsSummary();

    // Calculate total study time
    const totalOnlineSeconds = userDurations.reduce((acc, u) => acc + (u.totalOnlineSeconds || 0), 0);
    const totalOnlineHours = Number((totalOnlineSeconds / 3600).toFixed(1));

    return NextResponse.json({
      status: 'ok',
      stats: {
        onlineCount: onlineUsers.length,
        totalUsers: allUsers.length,
        totalVisits: stats.totalVisits ?? visits.length,
        totalMatches: matches.length,
        totalSubmissions: stats.totalSubmissions || submissions.length || 0,
        totalCodeLinesCompiled: stats.totalCodeLinesCompiled || 0,
        pendingViolations: violations.filter((v) => v.status === 'pending').length,
        activeAnnouncements: announcements.filter((a) => a.active).length,
        messagesSent: messages.length,
        totalOnlineHours,
        totalAuditEvents: auditLogs.length,
      },
      onlineUsers,
      allUsers,
      visits,
      activities,
      matches,
      violations,
      announcements,
      messages,
      daysTrend,
      browserStats,
      departmentBreakdown,
      userSessions,
      auditLogs,
      submissions,
      userDurations,
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ status: 'error', message: 'Admin telemetry fetch failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await db.ensureSynced();
    const body = await req.json();
    const { action } = body;

    if (action === 'record_visit') {
      const { userId, userName, userHandle, path } = body;
      const visit = db.recordVisit({
        userId,
        userName,
        userHandle,
        path: path || '/',
        userAgent: req.headers.get('user-agent') || 'Browser',
        ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });
      await db.flushCloud();
      return NextResponse.json({ success: true, visit });
    }

    if (action === 'create_announcement') {
      const { title, message, type, author } = body;
      const ann = db.addAnnouncement({
        title,
        message,
        type: type || 'info',
        author: author || 'Admin',
        active: true,
      });
      await db.flushCloud();
      return NextResponse.json({ success: true, announcement: ann });
    }

    if (action === 'toggle_announcement') {
      const { id } = body;
      const ok = db.toggleAnnouncement(id);
      await db.flushCloud();
      return NextResponse.json({ success: ok });
    }

    if (action === 'update_violation') {
      const { id, status } = body;
      const ok = db.updateViolationStatus(id, status);
      await db.flushCloud();
      return NextResponse.json({ success: ok });
    }

    if (action === 'send_message') {
      const { toEmail, toName, subject, body: msgBody, category, sentBy } = body;
      const msg = db.sendMessage({
        toEmail,
        toName: toName || toEmail,
        subject,
        body: msgBody,
        category: category || 'custom',
        sentBy: sentBy || 'Admin System',
        status: 'sent',
      });
      await db.flushCloud();
      return NextResponse.json({ success: true, message: msg });
    }

    if (action === 'record_audit') {
      const { userId, userName, userHandle, action: act, actionCategory, details, metadata } = body;
      const log = db.recordUserAudit({
        userId,
        userName,
        userHandle,
        action: act || 'navigation',
        actionCategory: actionCategory || 'navigation',
        details: details || '',
        metadata,
      });
      return NextResponse.json({ success: true, log });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Admin API POST error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to execute admin action' }, { status: 500 });
  }
}
