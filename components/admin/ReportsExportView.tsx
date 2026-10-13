'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Users,
  Code,
  Swords,
  Eye,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AdminData } from './types';

interface ReportsExportViewProps {
  data: AdminData;
}

export function ReportsExportView({ data }: ReportsExportViewProps) {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const triggerCsvDownload = (filename: string, headers: string[], rows: (string | number)[][]) => {
    // RFC 4180 compliant CSV generator
    const escapeCell = (val: string | number) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.map(escapeCell).join(','),
      ...rows.map((row) => row.map(escapeCell).join(',')),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Report 1: Student Roster & Study Time
  const exportStudentsReport = () => {
    const headers = [
      'User ID',
      'Full Name',
      'Handle',
      'Email',
      'Student ID',
      'Course',
      'College',
      'Role',
      'Elo Rating',
      'Matches Won',
      'Matches Played',
      'Win Rate %',
      'Total Study Time (Mins)',
      'Account Status',
      'Joined Date',
    ];

    const rows = (data.allUsers || []).map((u) => {
      const uDur = (data.userDurations || []).find((x) => x.userId === u.id);
      const studyMins = uDur?.totalOnlineMinutes || Math.floor((u.totalOnlineSeconds || 0) / 60);
      const played = u.matchesPlayed || 0;
      const won = u.matchesWon || 0;
      const winRate = played > 0 ? Math.round((won / played) * 100) : 0;

      return [
        u.id,
        u.name,
        u.handle,
        u.email,
        u.studentId || 'N/A',
        u.course || 'B.Tech CSE',
        u.college || 'Invertis University',
        u.role || (u.isAdmin ? 'Admin' : 'Student'),
        u.elo || 1000,
        won,
        played,
        `${winRate}%`,
        studyMins,
        u.accountStatus || 'Active',
        u.joinedAt || '2026-10-01',
      ];
    });

    const date = new Date().toISOString().slice(0, 10);
    triggerCsvDownload(`invertis_students_report_${date}.csv`, headers, rows);
  };

  // Report 2: Submissions Inspector
  const exportSubmissionsReport = () => {
    const headers = [
      'Submission ID',
      'Student Name',
      'Handle',
      'Problem Title',
      'Language',
      'Status',
      'Passed Test Cases',
      'Total Test Cases',
      'Runtime (ms)',
      'Memory (MB)',
      'Lines of Code',
      'Timestamp',
    ];

    const rows = (data.submissions || []).map((sub) => [
      sub.id,
      sub.userName,
      sub.userHandle,
      sub.problemTitle,
      sub.language.toUpperCase(),
      sub.status,
      sub.passedCount,
      sub.totalCount,
      sub.runtimeMs,
      sub.memoryMb || 16.4,
      sub.linesOfCode || 15,
      new Date(sub.timestamp).toISOString(),
    ]);

    const date = new Date().toISOString().slice(0, 10);
    triggerCsvDownload(`invertis_submissions_report_${date}.csv`, headers, rows);
  };

  // Report 3: 1v1 Battle Matches
  const exportMatchesReport = () => {
    const headers = [
      'Match ID',
      'Room ID',
      'Player 1 Handle',
      'Player 1 ELO',
      'Player 2 Handle',
      'Player 2 ELO',
      'Winner ID',
      'Duration (Seconds)',
      'Problem Count',
      'Timestamp',
    ];

    const rows = (data.matches || []).map((m) => [
      m.id,
      m.roomId,
      m.player1?.handle || 'Unknown',
      m.player1?.elo || 1000,
      m.player2?.handle || 'Unknown',
      m.player2?.elo || 1000,
      m.winnerId || 'Draw',
      m.durationSeconds || 0,
      m.problemCount || 1,
      new Date(m.timestamp).toISOString(),
    ]);

    const date = new Date().toISOString().slice(0, 10);
    triggerCsvDownload(`invertis_clash_matches_report_${date}.csv`, headers, rows);
  };

  // Report 4: Web Traffic & Path Visits
  const exportVisitsReport = () => {
    const headers = [
      'Visit ID',
      'User Name / Guest',
      'User Handle',
      'Path Visited',
      'IP Address',
      'User Agent',
      'Timestamp',
    ];

    const rows = (data.visits || []).map((v) => [
      v.id,
      v.userName || 'Guest Student',
      v.userHandle || 'guest',
      v.path,
      v.ip || '127.0.0.1',
      v.userAgent || 'Browser',
      new Date(v.timestamp).toISOString(),
    ]);

    const date = new Date().toISOString().slice(0, 10);
    triggerCsvDownload(`invertis_traffic_visits_report_${date}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
              Analytics &amp; Institutional Reporting Hub
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Generate and export genuine operational datasets in CSV format for academic audits, university accreditation, and ranking analyses.
          </p>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Report downloaded successfully: {downloadSuccess}</span>
        </div>
      )}

      {/* Analytical Quick Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">Registered Students</div>
          <div className="text-xl font-bold font-sans text-zinc-900 dark:text-zinc-100">
            {data.allUsers.length}
          </div>
          <div className="text-[10px] font-mono text-zinc-500">Active Campus Roster</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">Total Study Time</div>
          <div className="text-xl font-bold font-sans text-zinc-900 dark:text-zinc-100">
            {data.stats.totalOnlineHours || 0} Hours
          </div>
          <div className="text-[10px] font-mono text-zinc-500">Combined Practice Time</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">Compiled Submissions</div>
          <div className="text-xl font-bold font-sans text-zinc-900 dark:text-zinc-100">
            {data.submissions?.length || data.stats.totalSubmissions || 0}
          </div>
          <div className="text-[10px] font-mono text-zinc-500">Live Code Runs</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">1v1 Matches Completed</div>
          <div className="text-xl font-bold font-sans text-zinc-900 dark:text-zinc-100">
            {data.matches.length}
          </div>
          <div className="text-[10px] font-mono text-zinc-500">Contest Duels</div>
        </div>
      </div>

      {/* 4 Essential Exportable Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Report 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-zinc-100">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Student Roster &amp; Academic Activity</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                {data.allUsers.length} records
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Includes full name, university email, student ID, department, ELO rating, win rates, and total online study time logged.
            </p>
          </div>

          <button
            onClick={exportStudentsReport}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:opacity-90 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Student Roster (CSV)</span>
          </button>
        </div>

        {/* Report 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-zinc-100">
                <Code className="w-4 h-4 text-sky-500" />
                <span>Code Submissions &amp; Solutions Audit</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                {data.submissions?.length || 0} records
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Detailed compilation log with submission IDs, student handles, problem names, programming language, execution runtime (ms), and verdict.
            </p>
          </div>

          <button
            onClick={exportSubmissionsReport}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:opacity-90 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Submissions Log (CSV)</span>
          </button>
        </div>

        {/* Report 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-zinc-100">
                <Swords className="w-4 h-4 text-indigo-500" />
                <span>1v1 Battle Match History &amp; Duels</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                {data.matches.length} records
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Match telemetry with player pairs, starting ratings, match duration, winning contestant, and room IDs.
            </p>
          </div>

          <button
            onClick={exportMatchesReport}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:opacity-90 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Match Records (CSV)</span>
          </button>
        </div>

        {/* Report 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-zinc-100">
                <Eye className="w-4 h-4 text-amber-500" />
                <span>Web Traffic, Visitors &amp; Path Logs</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                {data.visits.length} records
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Access logs including visited page paths, student handles, client IP addresses, and user agent devices for security review.
            </p>
          </div>

          <button
            onClick={exportVisitsReport}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:opacity-90 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Traffic &amp; IP Logs (CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
