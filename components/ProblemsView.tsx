'use client';

import React, { useState } from 'react';
import { PROBLEMS, Problem, getProblemCompanies, getProblemTags } from '@/lib/problems';
import { GooeyInput } from '@/components/ui/gooey-input';
import {
  Search,
  ArrowUpRight,
  Shuffle,
  Building2,
  Tag,
  CheckCircle2,
  Circle,
  Filter,
  Flame,
  Award,
} from 'lucide-react';

interface ProblemsViewProps {
  onSelectProblemToSolve: (problem: Problem) => void;
  solvedProblemIds: string[];
}

const POPULAR_COMPANIES = ['All', 'Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Uber'];

export function ProblemsView({ onSelectProblemToSolve, solvedProblemIds }: ProblemsViewProps) {
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Solved' | 'Unsolved'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'acceptance' | 'difficulty'>('default');

  const categories = ['All', ...Array.from(new Set(PROBLEMS.map((p) => p.category)))];

  // LeetCode Solved stats
  const totalSolved = solvedProblemIds.length;
  const easySolved = solvedProblemIds.filter((id) => PROBLEMS.find((p) => p.id === id)?.difficulty === 'Easy').length;
  const medSolved = solvedProblemIds.filter((id) => PROBLEMS.find((p) => p.id === id)?.difficulty === 'Medium').length;
  const hardSolved = solvedProblemIds.filter((id) => PROBLEMS.find((p) => p.id === id)?.difficulty === 'Hard').length;

  const totalEasy = PROBLEMS.filter((p) => p.difficulty === 'Easy').length;
  const totalMed = PROBLEMS.filter((p) => p.difficulty === 'Medium').length;
  const totalHard = PROBLEMS.filter((p) => p.difficulty === 'Hard').length;

  const handlePickRandom = () => {
    const pool = PROBLEMS.filter((p) => (selectedStatus === 'Unsolved' ? !solvedProblemIds.includes(p.id) : true));
    const random = pool[Math.floor(Math.random() * pool.length)] || PROBLEMS[0];
    onSelectProblemToSolve(random);
  };

  const filtered = PROBLEMS.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      getProblemTags(p).some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
    const matchesCat =
      selectedCategory === 'All' ||
      p.category === selectedCategory ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      getProblemTags(p).some((t) => t.toLowerCase() === selectedCategory.toLowerCase()) ||
      (selectedCategory.toLowerCase() === 'string' &&
        (p.category.toLowerCase().includes('hash') ||
          p.title.toLowerCase().includes('string') ||
          p.title.toLowerCase().includes('anagram') ||
          p.title.toLowerCase().includes('palindrome')));

    const matchesComp =
      selectedCompany === 'All' ||
      getProblemCompanies(p).some((c) => c.toLowerCase() === selectedCompany.toLowerCase());

    const isSolved = solvedProblemIds.includes(p.id);
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Solved' && isSolved) ||
      (selectedStatus === 'Unsolved' && !isSolved);

    return matchesSearch && matchesDiff && matchesCat && matchesComp && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'acceptance') {
      const aVal = parseFloat(a.acceptanceRate.replace('%', '')) || 0;
      const bVal = parseFloat(b.acceptanceRate.replace('%', '')) || 0;
      return bVal - aVal;
    }
    if (sortBy === 'difficulty') {
      const rank: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
      return rank[a.difficulty] - rank[b.difficulty];
    }
    return 0;
  });

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  return (
    <div className="h-full overflow-y-auto bg-[#faf8f5] dark:bg-[#151311] transition-colors">
      <div className="p-3 sm:p-8 lg:p-12 pb-24 lg:pb-12 max-w-6xl mx-auto space-y-8 sm:space-y-10">
        {/* InvertisPrep Exact Format Editorial Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-400 font-mono text-[11px] font-semibold border border-amber-500/20">
            <span>INVERTIS UNIVERSITY</span>
            <span>&bull;</span>
            <span>ACADEMIC QUESTION ARCHIVE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-[1.15]">
            Invertis University DSA &amp; Placement Question Bank (PYQ)
          </h1>

          <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm leading-relaxed">
            Free department-wise previous year placement coding papers for B.Tech, BCA, MCA and more &bull; select your technical domain to view company-wise, semester-wise and algorithm-wise practice questions.
          </p>

          {/* Centered GooeyInput Search Bar (Aceternity Liquid Control) */}
          <div className="pt-4 flex items-center justify-center">
            <GooeyInput
              placeholder="Search departments, algorithms (DP, Two Sum, Graphs)..."
              value={search}
              onValueChange={(val) => setSearch(val)}
              onClear={() => setSearch('')}
              expandedWidth={460}
              collapsedWidth={46}
              gooeyBlur={4}
            />
          </div>
        </div>

        {/* Filters and View Mode Controls */}
        <div className="space-y-4 border-b border-[#e5e0d8] dark:border-[#2d2925] pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* View Mode Toggle (Cards vs Table) */}
            <div className="flex items-center gap-1 bg-[#ede8df] dark:bg-[#23201c] p-1 rounded-xl text-xs shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-[#2d2925] text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                Category Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-[#2d2925] text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                All Questions ({filtered.length})
              </button>
            </div>

            {/* Quick Pick Random CTA */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePickRandom}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Random Question</span>
              </button>

              {/* Status Segmented Control */}
              <div className="flex items-center gap-0.5 bg-[#ede8df] dark:bg-[#23201c] p-1 rounded-xl text-xs">
                {(['All', 'Solved', 'Unsolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                      selectedStatus === st
                        ? 'bg-white dark:bg-[#2d2925] text-stone-900 dark:text-stone-100 font-semibold shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Difficulty Control */}
              <div className="flex items-center gap-0.5 bg-[#ede8df] dark:bg-[#23201c] p-1 rounded-xl text-xs">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                      selectedDifficulty === diff
                        ? 'bg-white dark:bg-[#2d2925] text-stone-900 dark:text-stone-100 font-semibold shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category / Topic Filters Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <div className="flex items-center gap-1.5 text-stone-500 font-mono text-[11px] shrink-0 mr-1">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>Topics:</span>
            </div>
            {categories.map((cat) => {
              const count = cat === 'All' ? PROBLEMS.length : PROBLEMS.filter((p) => p.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950 border-stone-900 dark:border-stone-100 shadow-xs'
                      : 'bg-white dark:bg-[#1f1c19] text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white border-[#ded8ce] dark:border-[#38332c]'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-white/20 dark:bg-black/20 text-current' : 'text-stone-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Company Filters Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <div className="flex items-center gap-1.5 text-stone-500 font-mono text-[11px] shrink-0">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Campus Recruiter:</span>
            </div>
            {POPULAR_COMPANIES.map((comp) => (
              <button
                key={comp}
                onClick={() => setSelectedCompany(comp)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer border ${
                  selectedCompany === comp
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white dark:bg-[#1f1c19] text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white border-[#ded8ce] dark:border-[#38332c]'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>
        </div>

        {/* INVERTISPREP-STYLE DEPARTMENT / PATTERN CARDS GRID */}
        {viewMode === 'cards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-stone-500 dark:text-stone-400">
                Department &amp; Pattern Modules
              </h2>
              <span className="text-xs text-stone-500 font-mono">
                Click any domain to filter questions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  title: 'Arrays & Two-Pointer',
                  subtitle: 'B.Tech CSE &bull; Core Data Structures',
                  desc: 'High frequency array manipulation, two sum, prefix sums, and sliding window.',
                  category: 'Array',
                  accent: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border-emerald-500/30',
                  badge: 'CSE Core',
                },
                {
                  title: 'Dynamic Programming & Memo',
                  subtitle: 'Advanced Placement Rounds',
                  desc: '0/1 knapsack, longest increasing subsequence, memoization and state matrices.',
                  category: 'Dynamic Programming',
                  accent: 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30',
                  badge: 'High Difficulty',
                },
                {
                  title: 'Trees & Graph Traversal',
                  subtitle: 'MCA &bull; Algorithms &amp; Networks',
                  desc: 'Binary search trees, BFS, DFS, Dijkstra, cycle detection, and topological sort.',
                  category: 'Graph',
                  accent: 'bg-sky-500/15 text-sky-800 dark:text-sky-400 border-sky-500/30',
                  badge: 'MCA Special',
                },
                {
                  title: 'Strings & Parsing Algorithms',
                  subtitle: 'BCA &bull; Foundations of Code',
                  desc: 'Palindrome verification, anagram checking, regular expressions and pattern matching.',
                  category: 'String',
                  accent: 'bg-purple-500/15 text-purple-800 dark:text-purple-400 border-purple-500/30',
                  badge: 'BCA Core',
                },
                {
                  title: 'Linked Lists & Pointers',
                  subtitle: 'B.Tech IT &bull; Memory Models',
                  desc: 'Fast/slow pointer cycle detection, reversing lists, merging sorted nodes.',
                  category: 'Linked List',
                  accent: 'bg-rose-500/15 text-rose-800 dark:text-rose-400 border-rose-500/30',
                  badge: 'IT Syllabus',
                },
                {
                  title: 'Math & Bit Manipulation',
                  subtitle: 'Applied Science & Humanities',
                  desc: 'Bitwise XOR tricks, prime number sieves, combinations and modulo arithmetic.',
                  category: 'Math',
                  accent: 'bg-stone-500/15 text-stone-800 dark:text-stone-300 border-stone-500/30',
                  badge: 'Applied Sci',
                },
              ].map((domain) => {
                const count = PROBLEMS.filter((p) => p.category.toLowerCase().includes(domain.category.toLowerCase())).length;
                const isSelected = selectedCategory.toLowerCase() === domain.category.toLowerCase();

                return (
                  <div
                    key={domain.title}
                    onClick={() => {
                      setSelectedCategory(isSelected ? 'All' : domain.category);
                      setViewMode('table');
                    }}
                    className={`p-6 rounded-3xl bg-white dark:bg-[#1f1c19] border transition-all cursor-pointer group hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected
                        ? 'border-amber-600 ring-2 ring-amber-600/20'
                        : 'border-[#ded8ce] dark:border-[#38332c] hover:border-amber-600/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-sm border ${domain.accent}`}>
                        {domain.category.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f3efe6] dark:bg-[#282420] text-stone-700 dark:text-stone-300 border border-[#e0dad0] dark:border-[#38332c]">
                        {domain.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      {domain.title}
                    </h3>

                    <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-0.5">
                      {domain.subtitle}
                    </p>

                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-2.5 leading-relaxed line-clamp-2">
                      {domain.desc}
                    </p>

                    <div className="mt-4 pt-4 border-t border-[#f0ebe3] dark:border-[#2d2925] flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-800 dark:text-amber-400 font-semibold">
                        {count} Problems
                      </span>
                      <span className="text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors flex items-center gap-1">
                        View List &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Questions Table */}
        <div className="bg-white dark:bg-[#1f1c19] border border-[#ded8ce] dark:border-[#38332c] rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-[#ded8ce] dark:border-[#38332c] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                Placement &amp; Exam Questions
              </h3>
              <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                Showing {filtered.length} curated problems across selected filters
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20">
              {filtered.length} / {PROBLEMS.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf8f5] dark:bg-[#151311] border-b border-[#ded8ce] dark:border-[#38332c] text-[10px] text-stone-500 font-mono font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Category &amp; Companies</th>
                <th
                  onClick={() => setSortBy(sortBy === 'acceptance' ? 'default' : 'acceptance')}
                  className="py-3 px-4 cursor-pointer hover:text-zinc-800 dark:hover:text-white transition-colors"
                >
                  Acceptance {sortBy === 'acceptance' ? '▼' : ''}
                </th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
              {filtered.map((prob) => {
                const isSolved = solvedProblemIds.includes(prob.id);
                const comps = getProblemCompanies(prob).slice(0, 2);

                const diffColor =
                  prob.difficulty === 'Easy'
                    ? 'text-[#00b8a3] bg-[#00b8a3]/10 border-[#00b8a3]/30'
                    : prob.difficulty === 'Medium'
                    ? 'text-[#ffc01e] bg-[#ffc01e]/10 border-[#ffc01e]/30'
                    : 'text-[#ff375f] bg-[#ff375f]/10 border-[#ff375f]/30';

                return (
                  <tr key={prob.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {isSolved ? (
                        <CheckCircle2 className="w-4 h-4 text-[#00b8a3] mx-auto" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 mx-auto" />
                      )}
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-white">
                      <span
                        onClick={() => onSelectProblemToSolve(prob)}
                        className="hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
                      >
                        {prob.title}
                      </span>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${diffColor}`}>
                        {prob.difficulty}
                      </span>
                    </td>

                    {/* Category & Companies */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="text-zinc-600 dark:text-zinc-400">{prob.category}</div>
                      <div className="flex items-center gap-1">
                        {comps.map((c) => (
                          <span
                            key={c}
                            className="px-1.5 py-0.2 rounded text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Acceptance */}
                    <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 font-mono font-medium">
                      {prob.acceptanceRate}
                    </td>

                    {/* Points */}
                    <td className="py-3.5 px-4 text-zinc-900 dark:text-white font-medium font-mono">
                      {prob.points} pts
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectProblemToSolve(prob)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-sky-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-sky-600 dark:hover:text-sky-400 text-xs font-medium inline-flex items-center gap-1 border border-zinc-200/80 dark:border-zinc-700 hover:border-sky-300 dark:hover:border-sky-500 transition-colors cursor-pointer"
                      >
                        <span>Solve</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
