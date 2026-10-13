'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  ArrowRight,
  RotateCcw,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SubmissionRecord } from '@/lib/auth';

interface SubmissionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: SubmissionRecord | null;
  onNextProblem?: () => void;
}

export function SubmissionResultModal({
  isOpen,
  onClose,
  submission,
  onNextProblem,
}: SubmissionResultModalProps) {
  useEffect(() => {
    if (isOpen && submission?.status === 'Accepted') {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [isOpen, submission?.status]);

  if (!isOpen || !submission) return null;

  const isAccepted = submission.status === 'Accepted';

  // Mock histogram buckets for LeetCode Runtime Percentile graph
  const runtimeBuckets = [
    { ms: '20-30', height: 25 },
    { ms: '30-40', height: 85 }, // Most common peak
    { ms: '40-50', height: 60 },
    { ms: '50-60', height: 40 },
    { ms: '60-80', height: 20 },
    { ms: '80+', height: 10 },
  ];

  const memoryBuckets = [
    { mb: '15-16', height: 35 },
    { mb: '16-17', height: 90 }, // Peak
    { mb: '17-18', height: 50 },
    { mb: '18-19', height: 25 },
    { mb: '19+', height: 12 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors">
        {/* Modal Header */}
        <div className="p-4 px-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2">
            {isAccepted ? (
              <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            ) : (
              <span className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </span>
            )}
            <div>
              <span className="text-xs font-mono text-zinc-400">Submission Evaluation</span>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white leading-none">
                {submission.problemTitle}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Main Status Headline */}
          <div className="flex items-center justify-between">
            <div>
              <div
                className={`text-2xl font-extrabold tracking-tight font-sans ${
                  isAccepted
                    ? 'text-[#00b8a3]'
                    : 'text-[#ff375f]'
                }`}
              >
                {submission.status}
              </div>
              <div className="text-xs text-zinc-400 font-mono mt-0.5">
                {submission.passedCount}/{submission.totalCount} testcases passed
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-300 capitalize border border-zinc-200/60 dark:border-zinc-700">
              {submission.language}
            </span>
          </div>

          {/* Accepted Metrics: Runtime & Memory */}
          {isAccepted ? (
            <div className="space-y-4">
              {/* Runtime Card */}
              <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    <span>Runtime:</span>
                    <strong className="text-zinc-900 dark:text-white font-bold">{submission.runtimeMs} ms</strong>
                  </div>

                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    Beats {submission.runtimePercentile}%
                  </span>
                </div>

                {/* Histogram Bar Chart */}
                <div className="pt-2">
                  <div className="h-14 flex items-end gap-1.5 px-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/60 dark:border-zinc-800 pt-2 pb-1">
                    {runtimeBuckets.map((b, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        <div
                          className={`w-full rounded-t transition-all ${
                            i === 1
                              ? 'bg-sky-500 shadow-xs'
                              : 'bg-zinc-200 dark:bg-zinc-700 group-hover:bg-zinc-300'
                          }`}
                          style={{ height: `${b.height}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-1 px-1">
                    <span>20ms</span>
                    <span className="text-sky-600 dark:text-sky-400 font-semibold">▲ You ({submission.runtimeMs}ms)</span>
                    <span>100ms+</span>
                  </div>
                </div>
              </div>

              {/* Memory Card */}
              <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                    <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Memory:</span>
                    <strong className="text-zinc-900 dark:text-white font-bold">{submission.memoryMb} MB</strong>
                  </div>

                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    Beats {submission.memoryPercentile}%
                  </span>
                </div>

                {/* Histogram Bar Chart */}
                <div className="pt-2">
                  <div className="h-14 flex items-end gap-1.5 px-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/60 dark:border-zinc-800 pt-2 pb-1">
                    {memoryBuckets.map((b, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        <div
                          className={`w-full rounded-t transition-all ${
                            i === 1
                              ? 'bg-emerald-500 shadow-xs'
                              : 'bg-zinc-200 dark:bg-zinc-700 group-hover:bg-zinc-300'
                          }`}
                          style={{ height: `${b.height}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-1 px-1">
                    <span>15MB</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">▲ You ({submission.memoryMb}MB)</span>
                    <span>20MB+</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Failed test breakdown */
            <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Testcase Mismatch</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 font-sans text-xs">
                Your code produced an unexpected output or failed edge condition on testcase #{submission.passedCount + 1}. Review the problem constraints and test edge inputs.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {onNextProblem && (
              <button
                onClick={() => {
                  onClose();
                  onNextProblem();
                }}
                className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-sky-500/20"
              >
                <span>Next Problem</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
