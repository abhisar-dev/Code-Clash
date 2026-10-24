'use client';

import React, { useState } from 'react';
import {
  FolderKanban,
  FilePlus,
  Edit,
  Trash2,
  Search,
  Filter,
  Code,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ExternalLink,
  Plus,
  X,
  FileCode,
  Tag,
  RefreshCw,
} from 'lucide-react';
import { Problem, PROBLEMS } from '@/lib/problems';
import { User } from '@/lib/auth';

interface ContentManagementViewProps {
  customProblems?: Problem[];
  currentUser: User;
  onRefresh: () => void;
}

export function ContentManagementView({
  customProblems = [],
  currentUser,
  onRefresh,
}: ContentManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [originFilter, setOriginFilter] = useState<'all' | 'custom' | 'standard'>('all');

  // Create / Edit Problem Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Arrays & Hashing');
  const [formDifficulty, setFormDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [formPoints, setFormPoints] = useState(100);
  const [formAcceptanceRate, setFormAcceptanceRate] = useState('65.0%');
  const [formFunctionName, setFormFunctionName] = useState('solve');
  const [formDescription, setFormDescription] = useState('');
  const [formConstraints, setFormConstraints] = useState('1 <= n <= 10^5\n-10^9 <= nums[i] <= 10^9');
  const [formTags, setFormTags] = useState('Array, Hash Table');

  const [testCases, setTestCases] = useState<Array<{ id: number; input: string; expectedOutput: string; isHidden: boolean }>>([
    { id: 1, input: '[1, 2, 3]', expectedOutput: '6', isHidden: false },
    { id: 2, input: '[4, 5, 6]', expectedOutput: '15', isHidden: false },
    { id: 3, input: '[10, -5, 20]', expectedOutput: '25', isHidden: true },
  ]);

  const [starterPython, setStarterPython] = useState('class Solution:\n    def solve(self, nums: list[int]) -> int:\n        pass\n');
  const [starterCpp, setStarterCpp] = useState('class Solution {\npublic:\n    int solve(vector<int>& nums) {\n        return 0;\n    }\n};\n');
  const [starterJava, setStarterJava] = useState('class Solution {\n    public int solve(int[] nums) {\n        return 0;\n    }\n}\n');
  const [starterJs, setStarterJs] = useState('function solve(nums) {\n    return 0;\n}\n');

  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'cpp' | 'java' | 'javascript'>('python');
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Combine standard library problems with campus custom problems
  const allProblemsList: (Problem & { isCustom?: boolean })[] = [
    ...customProblems.map((p) => ({ ...p, isCustom: true })),
    ...PROBLEMS.map((p) => ({ ...p, isCustom: false })),
  ];

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const filteredProblems = allProblemsList.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)));

    const matchesDiff = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
    const matchesOrigin =
      originFilter === 'all' ||
      (originFilter === 'custom' && p.isCustom) ||
      (originFilter === 'standard' && !p.isCustom);

    return matchesSearch && matchesDiff && matchesOrigin;
  });

  const handleAddTestCase = () => {
    setTestCases([
      ...testCases,
      {
        id: testCases.length + 1,
        input: '',
        expectedOutput: '',
        isHidden: false,
      },
    ]);
  };

  const handleRemoveTestCase = (idx: number) => {
    setTestCases(testCases.filter((_, i) => i !== idx));
  };

  const handleUpdateTestCase = (idx: number, field: string, value: any) => {
    const updated = [...testCases];
    (updated[idx] as any)[field] = value;
    setTestCases(updated);
  };

  const openCreateModal = () => {
    setEditingProblem(null);
    setFormTitle('');
    setFormCategory('Arrays & Hashing');
    setFormDifficulty('Easy');
    setFormPoints(100);
    setFormAcceptanceRate('60.0%');
    setFormFunctionName('solve');
    setFormDescription('Given an array of integers, compute the solution following the problem rules.\n\nInput:\nA list of integers.\n\nOutput:\nA single integer result.');
    setFormConstraints('1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9');
    setFormTags('Arrays, Invertis Campus Cup');
    setTestCases([
      { id: 1, input: '[1, 2, 3]', expectedOutput: '6', isHidden: false },
      { id: 2, input: '[4, 5, 6]', expectedOutput: '15', isHidden: false },
      { id: 3, input: '[10, -5, 20]', expectedOutput: '25', isHidden: true },
    ]);
    setShowCreateModal(true);
  };

  const openEditModal = (prob: Problem) => {
    setEditingProblem(prob);
    setFormTitle(prob.title);
    setFormCategory(prob.category || 'General');
    setFormDifficulty(prob.difficulty || 'Easy');
    setFormPoints(prob.points || 100);
    setFormAcceptanceRate(prob.acceptanceRate || '50.0%');
    setFormFunctionName(prob.functionName || 'solve');
    setFormDescription(prob.description || '');
    setFormConstraints((prob.constraints || []).join('\n'));
    setFormTags((prob.tags || []).join(', '));
    setTestCases(
      prob.testCases && prob.testCases.length > 0
        ? prob.testCases
        : [{ id: 1, input: '[1, 2]', expectedOutput: '3', isHidden: false }]
    );
    if (prob.starterCode) {
      setStarterPython(prob.starterCode.python || '');
      setStarterCpp(prob.starterCode.cpp || '');
      setStarterJava(prob.starterCode.java || '');
      setStarterJs(prob.starterCode.javascript || '');
    }
    setShowCreateModal(true);
  };

  const handleSaveProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showFeedback('Problem title is required', 'error');
      return;
    }

    const payload: Problem = {
      id: editingProblem ? editingProblem.id : `campus-${Date.now()}`,
      slug: formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: formTitle.trim(),
      category: formCategory.trim(),
      difficulty: formDifficulty,
      points: Number(formPoints),
      acceptanceRate: formAcceptanceRate.trim(),
      functionName: formFunctionName.trim(),
      description: formDescription.trim(),
      examples: [
        {
          input: testCases[0]?.input || '',
          output: testCases[0]?.expectedOutput || '',
        },
      ],
      constraints: formConstraints.split('\n').filter(Boolean),
      tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
      starterCode: {
        python: starterPython,
        cpp: starterCpp,
        java: starterJava,
        javascript: starterJs,
      },
      testCases: testCases.map((tc, idx) => ({
        id: idx + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
      })),
    };

    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingProblem ? 'update_problem' : 'create_problem',
          ...(editingProblem ? { id: editingProblem.id, updates: payload } : { problem: payload }),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(editingProblem ? `Updated "${formTitle}"` : `Created "${formTitle}"`);
        setShowCreateModal(false);
        setEditingProblem(null);
        onRefresh();
      } else {
        showFeedback('Failed to save problem', 'error');
      }
    } catch {
      showFeedback('Network error while saving problem', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProblem = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete custom problem "${title}"?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_problem', id }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`Deleted "${title}"`);
        onRefresh();
      } else {
        showFeedback('Failed to delete problem', 'error');
      }
    } catch {
      showFeedback('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
              DSA Problem Bank &amp; Content Manager
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono text-xs">
              {filteredProblems.length} Problems ({customProblems.length} Custom Campus)
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Author university contest questions, manage test cases, customize starter templates, and publish to the live 1v1 arena.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 cursor-pointer transition-all"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Create DSA Problem</span>
          </button>
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            title="Refresh Problems"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
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

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search title, category, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
          />
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] text-zinc-400 font-mono">Difficulty:</span>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
          >
            <option value="all" className="dark:bg-zinc-900">All Difficulties</option>
            <option value="Easy" className="dark:bg-zinc-900">Easy</option>
            <option value="Medium" className="dark:bg-zinc-900">Medium</option>
            <option value="Hard" className="dark:bg-zinc-900">Hard</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
          <FolderKanban className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] text-zinc-400 font-mono">Origin:</span>
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value as any)}
            className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
          >
            <option value="all" className="dark:bg-zinc-900">All Problems</option>
            <option value="custom" className="dark:bg-zinc-900">Campus Custom ({customProblems.length})</option>
            <option value="standard" className="dark:bg-zinc-900">Standard LeetCode ({PROBLEMS.length})</option>
          </select>
        </div>
      </div>

      {/* Problems Data Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 font-mono text-[11px] text-zinc-400">
                <th className="py-3 px-4 font-medium">Problem Title &amp; Slug</th>
                <th className="py-3 px-4 font-medium">Difficulty</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Test Cases</th>
                <th className="py-3 px-4 font-medium">Origin</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-sans">
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400 font-mono text-xs">
                    No problems match current filters
                  </td>
                </tr>
              ) : (
                filteredProblems.slice(0, 50).map((prob) => {
                  return (
                    <tr
                      key={prob.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Title & Slug */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {prob.title}
                        </div>
                        <div className="font-mono text-[11px] text-zinc-400">
                          /{prob.slug || prob.id} &bull; {prob.points || 100} pts
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prob.difficulty === 'Easy'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              : prob.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                          {prob.category}
                        </span>
                      </td>

                      {/* Test Cases Count */}
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                        {prob.testCases?.length || 0} Cases{' '}
                        <span className="text-[10px] text-zinc-400">
                          ({prob.testCases?.filter((tc) => tc.isHidden).length || 0} hidden)
                        </span>
                      </td>

                      {/* Origin */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {prob.isCustom ? (
                          <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-[10px]">
                            Campus Custom
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-[10px]">Standard</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(prob)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                            title="Edit Problem"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {prob.isCustom && (
                            <button
                              onClick={() => handleDeleteProblem(prob.id, prob.title)}
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                              title="Delete Custom Problem"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE / EDIT PROBLEM MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {editingProblem ? `Edit Problem: ${editingProblem.title}` : 'Author New DSA Contest Problem'}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProblem} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Problem Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Invertis Campus Subarray Sum"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arrays & Hashing"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Points</label>
                  <input
                    type="number"
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Acceptance Rate</label>
                  <input
                    type="text"
                    value={formAcceptanceRate}
                    onChange={(e) => setFormAcceptanceRate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Function Name</label>
                  <input
                    type="text"
                    value={formFunctionName}
                    onChange={(e) => setFormFunctionName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Problem Description</label>
                <textarea
                  rows={4}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Constraints (1 per line)</label>
                  <textarea
                    rows={2}
                    value={formConstraints}
                    onChange={(e) => setFormConstraints(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Test Cases Editor */}
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[11px] text-zinc-700 dark:text-zinc-300">
                    Test Cases ({testCases.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Test Case</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {testCases.map((tc, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700/60 font-mono text-[11px]">
                      <span className="text-zinc-400 w-6">#{idx + 1}</span>
                      <input
                        type="text"
                        placeholder="Input: [1, 2, 3]"
                        value={tc.input}
                        onChange={(e) => handleUpdateTestCase(idx, 'input', e.target.value)}
                        className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-zinc-900 dark:text-zinc-100"
                      />
                      <input
                        type="text"
                        placeholder="Expected: 6"
                        value={tc.expectedOutput}
                        onChange={(e) => handleUpdateTestCase(idx, 'expectedOutput', e.target.value)}
                        className="w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-zinc-900 dark:text-zinc-100"
                      />
                      <label className="flex items-center gap-1 text-[10px] text-zinc-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={(e) => handleUpdateTestCase(idx, 'isHidden', e.target.checked)}
                        />
                        <span>Hidden</span>
                      </label>
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCase(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Starter Code Tabs */}
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[11px] text-zinc-700 dark:text-zinc-300">
                    Starter Code Templates
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    {(['python', 'cpp', 'java', 'javascript'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveCodeTab(lang)}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          activeCodeTab === lang
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold'
                            : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {activeCodeTab === 'python' && (
                  <textarea
                    rows={4}
                    value={starterPython}
                    onChange={(e) => setStarterPython(e.target.value)}
                    className="w-full bg-zinc-950 text-emerald-400 font-mono text-[11px] p-2.5 rounded-lg border border-zinc-800 focus:outline-none"
                  />
                )}
                {activeCodeTab === 'cpp' && (
                  <textarea
                    rows={4}
                    value={starterCpp}
                    onChange={(e) => setStarterCpp(e.target.value)}
                    className="w-full bg-zinc-950 text-sky-400 font-mono text-[11px] p-2.5 rounded-lg border border-zinc-800 focus:outline-none"
                  />
                )}
                {activeCodeTab === 'java' && (
                  <textarea
                    rows={4}
                    value={starterJava}
                    onChange={(e) => setStarterJava(e.target.value)}
                    className="w-full bg-zinc-950 text-amber-400 font-mono text-[11px] p-2.5 rounded-lg border border-zinc-800 focus:outline-none"
                  />
                )}
                {activeCodeTab === 'javascript' && (
                  <textarea
                    rows={4}
                    value={starterJs}
                    onChange={(e) => setStarterJs(e.target.value)}
                    className="w-full bg-zinc-950 text-yellow-400 font-mono text-[11px] p-2.5 rounded-lg border border-zinc-800 focus:outline-none"
                  />
                )}
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
