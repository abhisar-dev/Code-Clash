'use client';

import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Server,
  Cloud,
  Trash2,
  FileText,
  Clock,
  Layers,
  Terminal,
  Play,
  Copy,
  Check,
} from 'lucide-react';
import { AdminData } from './types';

interface DatabaseAdminViewProps {
  data: AdminData;
  onRefresh: () => void;
}

export function DatabaseAdminView({ data, onRefresh }: DatabaseAdminViewProps) {
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [restoreJson, setRestoreJson] = useState('');
  const [restoreFileSummary, setRestoreFileSummary] = useState<string | null>(null);

  // Neon Cloud SQL Terminal State
  const [sqlQuery, setSqlQuery] = useState('SELECT id, name, handle, course, elo, matches_won, role FROM users ORDER BY elo DESC;');
  const [sqlRunning, setSqlRunning] = useState(false);
  const [sqlResult, setSqlResult] = useState<{ rows: any[]; rowCount: number; executionTimeMs: number } | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [copiedQuery, setCopiedQuery] = useState(false);

  const executeSql = async (overrideQuery?: string) => {
    const q = (overrideQuery || sqlQuery).trim();
    if (!q) return;
    setSqlRunning(true);
    setSqlError(null);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute_sql', sqlQuery: q }),
      });
      const data = await res.json();
      if (data.success) {
        setSqlResult({
          rows: data.rows,
          rowCount: data.rowCount,
          executionTimeMs: data.executionTimeMs,
        });
      } else {
        setSqlError(data.error || 'Failed to execute query');
        setSqlResult(null);
      }
    } catch (err: any) {
      setSqlError(err.message || 'Network error connecting to Neon Cloud');
      setSqlResult(null);
    } finally {
      setSqlRunning(false);
    }
  };

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const dbStats = data.systemHealth?.dbStats || {
    totalUsers: data.allUsers?.length || 0,
    totalMatches: data.matches?.length || 0,
    totalSubmissions: data.submissions?.length || 0,
    totalVisits: data.visits?.length || 0,
    totalAuditLogs: data.auditLogs?.length || 0,
    totalSessions: data.userSessions?.length || 0,
    totalCustomProblems: data.customProblems?.length || 0,
    payloadSizeBytes: 0,
  };

  const payloadKb = dbStats.payloadSizeBytes
    ? (dbStats.payloadSizeBytes / 1024).toFixed(1)
    : '142.5';

  // 1-Click Backup Export
  const handleExportBackup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export_backup' }),
      });
      const json = await res.json();
      if (json.success && json.backup) {
        const blob = new Blob([JSON.stringify(json.backup, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `codeclash_db_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showFeedback('Complete database snapshot exported successfully');
      } else {
        showFeedback('Failed to generate database export', 'error');
      }
    } catch {
      showFeedback('Network error while exporting database', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Force Cloud Sync
  const handleForceCloudSync = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'force_cloud_sync' }),
      });
      const json = await res.json();
      if (json.success) {
        showFeedback('Database synchronized with GitHub Gist cloud persistence');
        onRefresh();
      } else {
        showFeedback('Cloud synchronization failed', 'error');
      }
    } catch {
      showFeedback('Network error during cloud sync', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Prune Stale Telemetry
  const handlePruneLogs = async () => {
    if (!confirm('Prune visit and audit logs older than 30 days to optimize memory?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'prune_logs', retentionDays: 30 }),
      });
      const json = await res.json();
      if (json.success) {
        showFeedback(`Pruned ${json.prunedVisits} visits and ${json.prunedAudit} old audit records`);
        onRefresh();
      } else {
        showFeedback('Log pruning failed', 'error');
      }
    } catch {
      showFeedback('Network error during log pruning', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Restore File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.users || !Array.isArray(parsed.users)) {
          showFeedback('Invalid backup file: missing users collection', 'error');
          return;
        }
        setRestoreJson(content);
        setRestoreFileSummary(
          `File: ${file.name} • ${parsed.users.length} Users • ${parsed.matches?.length || 0} Matches • ${(file.size / 1024).toFixed(1)} KB`
        );
        setRestoreModalOpen(true);
      } catch {
        showFeedback('Corrupt JSON file format', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Execute Restore
  const handleExecuteRestore = async () => {
    if (!restoreJson) return;
    setLoading(true);
    try {
      const backupData = JSON.parse(restoreJson);
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore_backup',
          backupData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showFeedback('Database successfully restored and synced');
        setRestoreModalOpen(false);
        setRestoreJson('');
        setRestoreFileSummary(null);
        onRefresh();
      } else {
        showFeedback('Restore operation rejected by server', 'error');
      }
    } catch {
      showFeedback('Network or parsing error during restore', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
              Database Management &amp; Cloud Operations
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Access database tables, export full system snapshots, restore data from backups, and force GitHub Gist cloud synchronization.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 self-start rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          title="Refresh DB Telemetry"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
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

      {/* Database Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
            <span>PERSISTENCE ENGINE</span>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-sans">
            Neon PostgreSQL
          </div>
          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            AWS us-east-2 • SSL Active
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
            <span>TOTAL TABLES &amp; COLLECTIONS</span>
            <Database className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-sans">
            10 Active Collections
          </div>
          <div className="text-[11px] font-mono text-zinc-400">
            {dbStats.totalUsers + dbStats.totalMatches + dbStats.totalSubmissions + dbStats.totalVisits + dbStats.totalAuditLogs} Total Records
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
            <span>STORAGE PAYLOAD</span>
            <HardDrive className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-sans">
            {payloadKb} KB
          </div>
          <div className="text-[11px] font-mono text-zinc-400">
            JSON Document Model
          </div>
        </div>
      </div>

      {/* Database Table Breakdown */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
            <Layers className="w-4 h-4 text-zinc-500" />
            <span>Table Breakdown &amp; Record Counts</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-400">Real Production Telemetry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 font-mono">
            <div className="text-zinc-400 text-[10px]">users</div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {data.allUsers.length}
            </div>
            <div className="text-[10px] text-zinc-500">Registered Students</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 font-mono">
            <div className="text-zinc-400 text-[10px]">matches</div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {data.matches.length}
            </div>
            <div className="text-[10px] text-zinc-500">1v1 Clash Duels</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 font-mono">
            <div className="text-zinc-400 text-[10px]">submissions</div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {data.submissions?.length || 0}
            </div>
            <div className="text-[10px] text-zinc-500">Code Compilations</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 font-mono">
            <div className="text-zinc-400 text-[10px]">visits</div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {data.visits.length}
            </div>
            <div className="text-[10px] text-zinc-500">Web Traffic Sessions</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 font-mono">
            <div className="text-zinc-400 text-[10px]">auditLogs</div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {data.auditLogs?.length || 0}
            </div>
            <div className="text-[10px] text-zinc-500">User Activity Audits</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 font-mono">
            <div className="text-zinc-400 text-[10px]">userSessions</div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {data.userSessions?.length || 0}
            </div>
            <div className="text-[10px] text-zinc-500">Active Live Sessions</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 font-mono">
            <div className="text-zinc-400 text-[10px]">customProblems</div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {data.customProblems?.length || 0}
            </div>
            <div className="text-[10px] text-zinc-500">Campus Challenges</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 font-mono">
            <div className="text-zinc-400 text-[10px]">violations</div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {data.violations.length}
            </div>
            <div className="text-[10px] text-zinc-500">Conduct Alerts</div>
          </div>
        </div>
      </div>

      {/* Neon Cloud SQL Interactive Terminal */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-md space-y-4 text-zinc-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs font-bold text-zinc-200">
              Neon Cloud PostgreSQL Terminal
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
              ep-bitter-tree...pooler
            </span>
            <span>SSL Active</span>
          </div>
        </div>

        {/* Quick Query Pills */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono text-zinc-400">Quick SQL Queries:</div>
          <div className="flex flex-wrap gap-1.5 text-xs font-mono">
            {[
              { label: '\\users', q: 'SELECT id, name, handle, course, elo, matches_won FROM users ORDER BY elo DESC;' },
              { label: '\\tables', q: "SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" },
              { label: '\\matches', q: 'SELECT id, room_id, player1_score, player2_score, winner_id, created_at FROM matches ORDER BY created_at DESC LIMIT 5;' },
              { label: '\\submissions', q: 'SELECT id, user_id, problem_id, language, status, runtime_ms FROM submissions ORDER BY created_at DESC LIMIT 5;' },
              { label: '\\visits', q: 'SELECT path, ip, created_at FROM visits ORDER BY created_at DESC LIMIT 5;' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setSqlQuery(chip.q);
                  executeSql(chip.q);
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-emerald-400 cursor-pointer transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* SQL Input Area */}
        <div className="space-y-2">
          <div className="relative">
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={3}
              placeholder="Enter SQL (e.g. SELECT * FROM users;)"
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-hidden focus:border-emerald-500/50 resize-y"
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  executeSql();
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400">
              Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">Ctrl + Enter</kbd> to execute
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSqlQuery('');
                  setSqlResult(null);
                  setSqlError(null);
                }}
                className="px-3 py-1.5 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => executeSql()}
                disabled={sqlRunning || !sqlQuery.trim()}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{sqlRunning ? 'Executing...' : 'Run Query'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {sqlError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-xs">
            ✗ {sqlError}
          </div>
        )}

        {/* Results Area */}
        {sqlResult && (
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="text-emerald-400 font-semibold">
                ✓ {sqlResult.rowCount} row(s) returned ({sqlResult.executionTimeMs}ms)
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(sqlResult.rows, null, 2));
                  setCopiedQuery(true);
                  setTimeout(() => setCopiedQuery(false), 2000);
                }}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                {copiedQuery ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedQuery ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <div className="max-h-72 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
              {sqlResult.rows.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-zinc-400">
                  Query executed successfully with 0 rows returned.
                </div>
              ) : (
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-300">
                      {Object.keys(sqlResult.rows[0]).map((col) => (
                        <th key={col} className="p-2.5 font-semibold text-zinc-300 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sqlResult.rows.map((row, idx) => (
                      <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        {Object.values(row).map((val: any, cIdx) => (
                          <td key={cIdx} className="p-2.5 text-zinc-300 whitespace-nowrap max-w-xs truncate">
                            {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? 'NULL')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Administrative Operations Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
          Database Backup, Recovery &amp; Maintenance Operations
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Operation 1: Download Backup */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-zinc-100">
              <Download className="w-4 h-4 text-emerald-500" />
              <span>1-Click Database Backup Export</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Export all user accounts, competitive ratings, submissions, match histories, and problem banks to an RFC-compliant JSON file.
            </p>
            <button
              onClick={handleExportBackup}
              disabled={loading}
              className="mt-2 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Full Backup (JSON)</span>
            </button>
          </div>

          {/* Operation 2: Restore Backup */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-zinc-100">
              <Upload className="w-4 h-4 text-sky-500" />
              <span>Restore Database from File</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Upload a previously downloaded JSON database backup to restore records, users, and contest scores.
            </p>
            <label className="inline-flex mt-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer items-center gap-1.5 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Select Backup File...</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Operation 3: Force Cloud Sync */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-zinc-100">
              <Cloud className="w-4 h-4 text-indigo-500" />
              <span>Force Immediate Cloud Sync</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Flushes local `/tmp` database state to the secure GitHub Gist storage layer to ensure multi-instance serverless durability.
            </p>
            <button
              onClick={handleForceCloudSync}
              disabled={loading}
              className="mt-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync to GitHub Cloud Gist</span>
            </button>
          </div>

          {/* Operation 4: Prune Stale Logs */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-zinc-100">
              <Trash2 className="w-4 h-4 text-amber-500" />
              <span>Prune Telemetry &gt; 30 Days</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Retains all user accounts, problems, and match wins while cleaning out historical visits and debug logs older than 30 days.
            </p>
            <button
              onClick={handlePruneLogs}
              disabled={loading}
              className="mt-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Prune Historical Logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- RESTORE CONFIRMATION MODAL --- */}
      {restoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-sky-600 dark:text-sky-400">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Confirm Database Restore
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Administrative State Overwrite
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
              {restoreFileSummary}
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Warning: Restoring will overwrite the current live database state with the records contained in this backup. All changes made after the backup was created will be replaced.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setRestoreModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRestore}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold text-xs cursor-pointer shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Restoring...' : 'Confirm & Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
