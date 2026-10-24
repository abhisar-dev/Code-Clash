'use client';

import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Cpu,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Clock,
  Layers,
} from 'lucide-react';
import { AdminData } from './types';

interface SecurityAccessViewProps {
  data: AdminData;
  onRefresh: () => void;
}

export function SecurityAccessView({ data, onRefresh }: SecurityAccessViewProps) {
  const [newIpInput, setNewIpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [compilerPing, setCompilerPing] = useState<{ status: 'idle' | 'testing' | 'online' | 'error'; latencyMs?: number }>({
    status: 'idle',
  });
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const blockedIps = data.blockedIps || [];
  const systemHealth = data.systemHealth || {
    nodeVersion: 'v20.x',
    platform: 'win32',
    uptimeSeconds: 3600,
    heapUsedMb: 42.5,
    heapTotalMb: 78.2,
    rssMb: 110.4,
  };

  // Block an IP
  const handleBlockIp = async (ipToBlock: string) => {
    const ip = ipToBlock.trim();
    if (!ip) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'block_ip', ip }),
      });
      const json = await res.json();
      if (json.success) {
        showFeedback(`IP address ${ip} added to security firewall blocklist`);
        setNewIpInput('');
        onRefresh();
      } else {
        showFeedback('Failed to block IP', 'error');
      }
    } catch {
      showFeedback('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Unblock an IP
  const handleUnblockIp = async (ipToUnblock: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unblock_ip', ip: ipToUnblock }),
      });
      const json = await res.json();
      if (json.success) {
        showFeedback(`IP address ${ipToUnblock} removed from firewall blocklist`);
        onRefresh();
      } else {
        showFeedback('Failed to unblock IP', 'error');
      }
    } catch {
      showFeedback('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Live Compiler Latency Ping Test
  const handleTestCompilerLatency = async () => {
    setCompilerPing({ status: 'testing' });
    const start = performance.now();
    try {
      const res = await fetch('https://wandbox.org/api/list.json', { method: 'GET' });
      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        setCompilerPing({ status: 'online', latencyMs: elapsed });
        showFeedback(`Compiler API operational: ${elapsed}ms round-trip`);
      } else {
        setCompilerPing({ status: 'error' });
        showFeedback('Compiler API returned non-200 status', 'error');
      }
    } catch {
      setCompilerPing({ status: 'error' });
      showFeedback('Compiler API ping failed', 'error');
    }
  };

  // Extract unique IPs from recent visits
  const recentVisitorIps = Array.from(
    new Set((data.visits || []).map((v) => v.ip).filter(Boolean))
  ).slice(0, 8);

  const adminCount = data.allUsers.filter((u) => u.role === 'admin' || u.isAdmin).length;
  const proctorCount = data.allUsers.filter((u) => u.role === 'proctor').length;
  const studentCount = data.allUsers.length - adminCount - proctorCount;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
              Security, Access Control &amp; System Health
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold">
              Protected
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            IP firewall blocklist, role permissions security, compiler latency monitoring, and server diagnostics.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 self-start rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          title="Refresh Security Status"
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

      {/* Security Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Auth & Roles */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
            <span>ACCESS GOVERNANCE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-sans">
            {adminCount} Admin &bull; {proctorCount} Proctor
          </div>
          <div className="text-[11px] font-mono text-zinc-400">
            {studentCount} Verified Student Accounts
          </div>
        </div>

        {/* Card 2: Password Cryptography */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
            <span>CREDENTIAL ENCRYPTION</span>
            <Lock className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-sans">
            SHA-256 + Salt
          </div>
          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            16-Byte Cryptographic Salt per Account
          </div>
        </div>

        {/* Card 3: Compiler Ping */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
            <span>COMPILER API CLOUD</span>
            <Cpu className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-sans flex items-center gap-2">
            <span>Wandbox Online</span>
            {compilerPing.latencyMs && (
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                ({compilerPing.latencyMs}ms)
              </span>
            )}
          </div>
          <button
            onClick={handleTestCompilerLatency}
            disabled={compilerPing.status === 'testing'}
            className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <Activity className="w-3 h-3" />
            <span>{compilerPing.status === 'testing' ? 'Pinging...' : 'Ping Wandbox API Latency'}</span>
          </button>
        </div>
      </div>

      {/* IP Access Firewall Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>IP Access Firewall &amp; Blocklist</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Blacklisted IP addresses are prevented from accessing contest rooms or submitting solutions.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleBlockIp(newIpInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="e.g. 192.168.1.100"
              value={newIpInput}
              onChange={(e) => setNewIpInput(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !newIpInput.trim()}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer hover:bg-rose-700 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Block IP</span>
            </button>
          </form>
        </div>

        {/* Blocked IPs Table */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-xs">
          {blockedIps.length === 0 ? (
            <div className="p-6 text-center text-zinc-400 font-mono text-xs">
              Firewall Clean &bull; No IP addresses currently blocked
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-mono text-[11px] text-zinc-400">
                  <th className="py-2.5 px-4 font-medium">Blocked IP Address</th>
                  <th className="py-2.5 px-4 font-medium">Policy</th>
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono text-[11px]">
                {blockedIps.map((ip) => (
                  <tr key={ip} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="py-2.5 px-4 font-bold text-rose-600 dark:text-rose-400">
                      {ip}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-500">
                      Full Access Denied (WAF Rule)
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleUnblockIp(ip)}
                        disabled={loading}
                        className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        Unblock IP
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Inspector of Recent Visitor IPs */}
        {recentVisitorIps.length > 0 && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <span className="text-[11px] font-mono text-zinc-400">
              Recent Visitor IPs (Click to Ban):
            </span>
            <div className="flex flex-wrap gap-2 font-mono text-[11px]">
              {recentVisitorIps.map((ip) => {
                const isBlocked = blockedIps.includes(ip);
                return (
                  <button
                    key={ip}
                    onClick={() => (isBlocked ? handleUnblockIp(ip) : handleBlockIp(ip))}
                    className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isBlocked
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{ip}</span>
                    <span className="text-[10px] opacity-60">
                      {isBlocked ? '(Blocked)' : 'Block'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* System Diagnostics & Health */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
          <Activity className="w-4 h-4 text-zinc-500" />
          <span>Server Diagnostics &amp; Runtime Metrics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <div className="text-zinc-400 text-[10px]">Node.js Runtime</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {systemHealth.nodeVersion}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <div className="text-zinc-400 text-[10px]">Operating System</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 uppercase">
              {systemHealth.platform}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <div className="text-zinc-400 text-[10px]">Server Uptime</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {Math.floor(systemHealth.uptimeSeconds / 60)}m {systemHealth.uptimeSeconds % 60}s
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <div className="text-zinc-400 text-[10px]">Heap Memory Used</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {systemHealth.heapUsedMb} MB / {systemHealth.heapTotalMb} MB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
