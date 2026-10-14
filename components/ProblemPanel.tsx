'use client';

import React, { useState, useEffect } from 'react';
import {
  Problem,
  getProblemCompanies,
  getProblemTags,
  getProblemHints,
  getProblemEditorial,
  getProblemSolutions,
} from '@/lib/problems';
import { getSubmissions, SubmissionRecord } from '@/lib/auth';
import {
  FileText,
  Lightbulb,
  MessageSquare,
  History,
  ThumbsUp,
  ThumbsDown,
  Star,
  Building2,
  Tag,
  Clock,
  Cpu,
  ChevronDown,
  ChevronRight,
  Check,
  Copy,
  ExternalLink,
  Lock,
} from 'lucide-react';

export type ProblemTab = 'description' | 'editorial' | 'solutions' | 'submissions';

interface ProblemPanelProps {
  problem: Problem;
}

export function ProblemPanel({ problem }: ProblemPanelProps) {
  const [activeTab, setActiveTab] = useState<ProblemTab>('description');
  const [liked, setLiked] = useState<boolean>(false);
  const [disliked, setDisliked] = useState<boolean>(false);
  const [starred, setStarred] = useState<boolean>(false);
  const [showTags, setShowTags] = useState<boolean>(false);
  const [showCompanies, setShowCompanies] = useState<boolean>(false);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const tags = getProblemTags(problem);
  const companies = getProblemCompanies(problem);
  const hints = getProblemHints(problem);
  const editorial = getProblemEditorial(problem);
  const solutions = getProblemSolutions(problem);

  // Sync submissions for current problem
  useEffect(() => {
    setSubmissions(getSubmissions(problem.id));
    setRevealedHints({});
  }, [problem.id]);

  const toggleHint = (idx: number) => {
    setRevealedHints((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const diffColorClass =
    problem.difficulty === 'Easy'
      ? 'text-[#00b8a3] bg-[#00b8a3]/10 border-[#00b8a3]/30'
      : problem.difficulty === 'Medium'
      ? 'text-[#ffc01e] bg-[#ffc01e]/10 border-[#ffc01e]/30'
      : 'text-[#ff375f] bg-[#ff375f]/10 border-[#ff375f]/30';

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-sm select-text transition-colors overflow-hidden">
      {/* 1. LeetCode-Style Top Tab Navigation */}
      <div className="h-10 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 px-2 sm:px-3 flex items-center justify-between select-none shrink-0 overflow-hidden">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'description'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs border border-zinc-200/60 dark:border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-sky-500" />
            <span>Description</span>
          </button>

          <button
            onClick={() => setActiveTab('editorial')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'editorial'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs border border-zinc-200/60 dark:border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Editorial &amp; Hints</span>
          </button>

          <button
            onClick={() => setActiveTab('solutions')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'solutions'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs border border-zinc-200/60 dark:border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>Solutions ({solutions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'submissions'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs border border-zinc-200/60 dark:border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5 text-emerald-500" />
            <span>Submissions</span>
            {submissions.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] flex items-center justify-center font-mono">
                {submissions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
        {/* ================= TAB 1: DESCRIPTION ================= */}
        {activeTab === 'description' && (
          <>
            {/* Header: Title, Difficulty, Actions */}
            <div className="space-y-3 pb-3 border-b border-zinc-100 dark:border-zinc-850">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  {problem.title}
                </h1>

                {/* Like, Dislike & Star Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setLiked(!liked);
                      if (disliked) setDisliked(false);
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors cursor-pointer border ${
                      liked
                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400'
                        : 'border-zinc-200/80 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                    title="Like problem"
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                    <span className="text-[11px] font-mono">{liked ? (problem.likes || 0) + 1 : problem.likes || 0}</span>
                  </button>

                  <button
                    onClick={() => {
                      setDisliked(!disliked);
                      if (liked) setLiked(false);
                    }}
                    className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer border ${
                      disliked
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-600'
                        : 'border-zinc-200/80 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                    title="Dislike"
                  >
                    <ThumbsDown className={`w-3.5 h-3.5 ${disliked ? 'fill-current' : ''}`} />
                    <span className="text-[11px] font-mono">{disliked ? (problem.dislikes || 0) + 1 : problem.dislikes || 0}</span>
                  </button>

                  <button
                    onClick={() => setStarred(!starred)}
                    className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer border ${
                      starred
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-500'
                        : 'border-zinc-200/80 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                    title="Star to favorites"
                  >
                    <Star className={`w-3.5 h-3.5 ${starred ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Badges: Difficulty, Category, Acceptance */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${diffColorClass}`}>
                  {problem.difficulty}
                </span>

                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700">
                  {problem.category}
                </span>

                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  Acceptance: <strong className="text-zinc-800 dark:text-zinc-200">{problem.acceptanceRate}</strong>
                </span>

                <span className="px-2 py-0.5 rounded-md text-xs font-mono text-zinc-400">
                  {problem.points} pts
                </span>
              </div>
            </div>

            {/* Tags & Companies Accordion */}
            <div className="flex flex-wrap gap-2 text-xs">
              {/* Topics Tag Button */}
              <button
                onClick={() => setShowTags(!showTags)}
                className="px-2.5 py-1 rounded-md bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Tag className="w-3 h-3 text-sky-500" />
                <span>Related Topics ({tags.length})</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showTags ? 'rotate-180' : ''}`} />
              </button>

              {/* Companies Button */}
              <button
                onClick={() => setShowCompanies(!showCompanies)}
                className="px-2.5 py-1 rounded-md bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Building2 className="w-3 h-3 text-amber-500" />
                <span>Companies ({companies.length})</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showCompanies ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Revealed Tags Pills */}
            {showTags && (
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-wrap gap-1.5 animate-in fade-in">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-[11px] font-mono text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Revealed Companies Pills */}
            {showCompanies && (
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-wrap gap-1.5 animate-in fade-in">
                {companies.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-800"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

            {/* Problem Statement Body */}
            <div className="space-y-3 leading-relaxed text-zinc-800 dark:text-zinc-200 text-sm font-sans">
              {problem.description.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Examples */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
                Examples
              </h3>
              {problem.examples.map((example, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-zinc-50/80 dark:bg-zinc-900/70 border border-zinc-200/70 dark:border-zinc-800 p-3.5 space-y-1.5 text-xs font-mono shadow-2xs"
                >
                  <div className="text-zinc-400 dark:text-zinc-500 font-medium text-[10px] uppercase">
                    Example {idx + 1}
                  </div>
                  <div>
                    <span className="text-zinc-400 select-none">Input: </span>
                    <span className="text-zinc-900 dark:text-zinc-100 font-medium">{example.input}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 select-none">Output: </span>
                    <span className="text-sky-600 dark:text-sky-400 font-semibold">{example.output}</span>
                  </div>
                  {example.explanation && (
                    <div className="pt-1 text-zinc-600 dark:text-zinc-400 font-sans text-xs">
                      <span className="text-zinc-400 select-none">Explanation: </span>
                      {example.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
                Constraints
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                {problem.constraints.map((constraint, idx) => (
                  <li key={idx}>
                    <code className="text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded font-mono text-xs">
                      {constraint}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* ================= TAB 2: EDITORIAL & HINTS ================= */}
        {activeTab === 'editorial' && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Official Editorial &amp; Solution Guide
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Algorithmic intuition, complexity analysis, and progressive hints.
              </p>
            </div>

            {/* Progressive Hints Accordion */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
                Progressive Hints
              </h3>

              {hints.map((hintText, idx) => {
                const isRevealed = !!revealedHints[idx];
                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/50 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleHint(idx)}
                      className="w-full p-3 flex items-center justify-between text-left text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-850 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Hint {idx + 1}</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {isRevealed ? 'Hide' : 'Click to Reveal'}
                      </span>
                    </button>

                    {isRevealed && (
                      <div className="p-3.5 pt-1 text-xs text-zinc-600 dark:text-zinc-300 font-sans border-t border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 leading-relaxed">
                        {hintText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Algorithm Approach */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-white">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>Approach: {editorial.approach}</span>
              </div>

              <div className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
                <strong>Intuition:</strong> {editorial.intuition}
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                {editorial.algorithm}
              </div>

              {/* Complexity Badges */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-mono mb-1">
                    <Clock className="w-3 h-3 text-sky-500" />
                    <span>Time Complexity</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
                    {editorial.timeComplexity}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-mono mb-1">
                    <Cpu className="w-3 h-3 text-emerald-500" />
                    <span>Space Complexity</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
                    {editorial.spaceComplexity}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: COMMUNITY SOLUTIONS ================= */}
        {activeTab === 'solutions' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Top-Voted Community Solutions
                </h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Solutions in Python, C++, and Java.
                </p>
              </div>
            </div>

            {solutions.map((sol, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs"
              >
                {/* Solution Header */}
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                      {sol.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400 font-mono">
                      <span>{sol.author}</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                        {sol.language}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyCode(sol.code, idx)}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-800 dark:hover:text-white bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 transition-colors cursor-pointer"
                    title="Copy solution code"
                  >
                    {copiedCodeIdx === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Explanation */}
                <div className="p-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans border-b border-zinc-100 dark:border-zinc-800/80">
                  {sol.explanation}
                </div>

                {/* Code Preview */}
                <pre className="p-3.5 bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed">
                  <code>{sol.code}</code>
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* ================= TAB 4: SUBMISSIONS HISTORY ================= */}
        {activeTab === 'submissions' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Submission History
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Past evaluations on the isolated LeetCode test suite.
              </p>
            </div>

            {submissions.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-400 text-xs">
                <History className="w-6 h-6 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                <p>No recorded submissions for this problem yet.</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Click <strong>Submit</strong> in the code editor to benchmark your code.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200/70 dark:border-zinc-800 text-[10px] text-zinc-400 font-mono uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Runtime</th>
                      <th className="py-2.5 px-3">Memory</th>
                      <th className="py-2.5 px-3">Language</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs font-mono">
                    {submissions.map((sub) => {
                      const isAcc = sub.status === 'Accepted';
                      const dateStr = new Date(sub.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <tr key={sub.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40">
                          <td className="py-3 px-3">
                            <span
                              className={`font-semibold ${
                                isAcc ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {sub.status}
                            </span>
                            <div className="text-[10px] text-zinc-400">
                              {sub.passedCount}/{sub.totalCount} testcases
                            </div>
                          </td>

                          <td className="py-3 px-3 text-zinc-800 dark:text-zinc-200">
                            <span>{sub.runtimeMs} ms</span>
                            {isAcc && (
                              <div className="text-[10px] text-zinc-400">
                                Beats {sub.runtimePercentile}%
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-zinc-800 dark:text-zinc-200">
                            <span>{sub.memoryMb} MB</span>
                            {isAcc && (
                              <div className="text-[10px] text-zinc-400">
                                Beats {sub.memoryPercentile}%
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 capitalize text-zinc-500">
                            {sub.language}
                          </td>

                          <td className="py-3 px-3 text-zinc-400 text-[11px]">
                            {dateStr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
