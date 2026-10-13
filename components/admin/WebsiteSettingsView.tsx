'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Sliders,
  Shield,
  Clock,
  Volume2,
  Radio,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { SiteSettings } from './types';
import { User } from '@/lib/auth';

interface WebsiteSettingsViewProps {
  siteSettings?: SiteSettings;
  currentUser: User;
  onRefresh: () => void;
}

export function WebsiteSettingsView({
  siteSettings,
  currentUser,
  onRefresh,
}: WebsiteSettingsViewProps) {
  const [formData, setFormData] = useState<SiteSettings>({
    platformTitle: 'CodeClash - Invertis Edition',
    collegeBranding: 'Invertis University Bareilly',
    maintenanceMode: false,
    defaultMatchTimeMinutes: 15,
    penaltyPerWrongSubmissionSeconds: 30,
    minEloForRanked: 1000,
    allowGuestSpectate: true,
    enableSoundEffects: true,
    announcementTicker: 'CodeClash Invertis Season 2 is live! Compete in 1v1 DSA battles to climb the university leaderboard.',
    announcementTickerActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (siteSettings) {
      setFormData(siteSettings);
    }
  }, [siteSettings]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          settings: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback('Website settings successfully updated & synced');
        onRefresh();
      } else {
        showFeedback('Failed to update website settings', 'error');
      }
    } catch {
      showFeedback('Network error while saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
              Website Settings &amp; Platform Configuration
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Configure site branding, match timing parameters, contest penalty rules, and operational mode.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 self-start rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          title="Refresh Settings"
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

      {/* Maintenance Mode Warning Banner if active */}
      {formData.maintenanceMode && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <div className="font-bold">Maintenance Mode Active</div>
            <div className="text-[11px] opacity-80">
              Ranked matchmaking is paused. Non-admin users will see an operational maintenance banner.
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Branding & Identity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
            <Globe className="w-4 h-4 text-zinc-500" />
            <span>Platform Branding &amp; Identity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Platform Title
              </label>
              <input
                type="text"
                required
                value={formData.platformTitle}
                onChange={(e) => setFormData({ ...formData, platformTitle: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Shown in browser title bar and arena headers
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Institutional Branding
              </label>
              <input
                type="text"
                required
                value={formData.collegeBranding}
                onChange={(e) => setFormData({ ...formData, collegeBranding: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Default campus affiliation for match certificates and scorecards
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Contest Rules & Match Parameters */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
            <Sliders className="w-4 h-4 text-zinc-500" />
            <span>1v1 Match Mechanics &amp; Scoring Rules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Default Match Timer (Minutes)
              </label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={formData.defaultMatchTimeMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultMatchTimeMinutes: Number(e.target.value) })
                  }
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                />
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Official countdown duration per 1v1 battle
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Wrong Submission Penalty (Seconds)
              </label>
              <input
                type="number"
                min={0}
                max={300}
                value={formData.penaltyPerWrongSubmissionSeconds}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    penaltyPerWrongSubmissionSeconds: Number(e.target.value),
                  })
                }
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Time added to solver clock for failed testcase runs
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Minimum ELO For Ranked Queue
              </label>
              <input
                type="number"
                min={0}
                max={3000}
                value={formData.minEloForRanked}
                onChange={(e) =>
                  setFormData({ ...formData, minEloForRanked: Number(e.target.value) })
                }
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Rating required to participate in official leaderboards
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Feature Toggles & Platform Conduct */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
            <Shield className="w-4 h-4 text-zinc-500" />
            <span>Platform Feature Flags &amp; Spectator Controls</span>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.maintenanceMode}
                onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                className="mt-0.5 rounded cursor-pointer"
              />
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                  Maintenance Mode
                </span>
                <span className="text-[11px] text-zinc-500 block">
                  Locks matchmaking queues for database upgrades or scheduled examinations.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowGuestSpectate}
                onChange={(e) =>
                  setFormData({ ...formData, allowGuestSpectate: e.target.checked })
                }
                className="mt-0.5 rounded cursor-pointer"
              />
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                  Allow Guest Spectator Mode
                </span>
                <span className="text-[11px] text-zinc-500 block">
                  Enables peers and students to observe ongoing 1v1 battles live in read-only mode.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableSoundEffects}
                onChange={(e) =>
                  setFormData({ ...formData, enableSoundEffects: e.target.checked })
                }
                className="mt-0.5 rounded cursor-pointer"
              />
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                  Audio &amp; Victory Sound Effects
                </span>
                <span className="text-[11px] text-zinc-500 block">
                  Plays battle countdown, accepted solution chimes, and victory fanfare.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Card 4: Global Broadcast Ticker */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <Radio className="w-4 h-4 text-emerald-500" />
              <span>Campus Live Announcement Ticker</span>
            </div>
            <label className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.announcementTickerActive ?? true}
                onChange={(e) =>
                  setFormData({ ...formData, announcementTickerActive: e.target.checked })
                }
              />
              <span>Enable Ticker</span>
            </label>
          </div>

          <div>
            <textarea
              rows={2}
              value={formData.announcementTicker || ''}
              onChange={(e) => setFormData({ ...formData, announcementTicker: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
              placeholder="Enter announcement text to broadcast at the top of the campus arena..."
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs flex items-center gap-2 shadow-sm hover:opacity-90 cursor-pointer transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save & Deploy Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
