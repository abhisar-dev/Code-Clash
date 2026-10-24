'use client';

import { useState } from 'react';
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';

interface ViolationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUser?: string;
}

export function ViolationReportModal({ isOpen, onClose, reportedUser }: ViolationReportModalProps) {
  const [category, setCategory] = useState<'cheating' | 'harassment' | 'bot' | 'other'>('cheating');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60  animate-in fade-in">
      <div className="w-full max-w-md bg-[#fdfcf9] dark:bg-[#1f1c19] border border-[#e3ded4] dark:border-[#38332c] rounded-2xl shadow-xl overflow-hidden p-6 text-stone-900 dark:text-stone-100">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Report Conduct Violation</span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <div className="font-semibold text-sm">Report Logged for Review</div>
            <p className="text-xs text-stone-500">Thank you for keeping competitive matchmaking fair.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            {reportedUser && (
              <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800/60 font-mono text-stone-700 dark:text-stone-300">
                Subject: <strong className="text-stone-900 dark:text-stone-100">{reportedUser}</strong>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5 font-mono">
                Violation Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
              >
                <option value="cheating">Unfair Assistance / External Scripting</option>
                <option value="bot">Automated Bot / Socket Emulation</option>
                <option value="harassment">Unsportsmanlike Conduct / Chat Abuse</option>
                <option value="other">Other Terms of Service Breach</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5 font-mono">
                Evidence Details (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe aberrant code submission timing or conduct..."
                rows={3}
                className="w-full p-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all cursor-pointer shadow-xs"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
