'use client';

import React, { useState } from 'react';
import { Clock, Lock, CheckCircle2, XCircle, Code2, Play } from 'lucide-react';
import { TestCase } from '@/lib/problems';

export interface TestCaseResult {
  id: number;
  passed: boolean;
  actualOutput: string | null;
  expectedOutput: string;
  runtimeMs: number;
  error?: string | null;
  isHidden?: boolean;
}

interface TestResultPanelProps {
  results: TestCaseResult[] | null;
  compileError: string | null;
  isExecuting: boolean;
  problemTestCases?: TestCase[];
}

export function TestResultPanel({
  results,
  compileError,
  isExecuting,
  problemTestCases = [],
}: TestResultPanelProps) {
  const [consoleMode, setConsoleMode] = useState<'result' | 'testcase'>(
    results && results.length > 0 ? 'result' : 'testcase'
  );
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);

  // If executing, show loading animation
  if (isExecuting) {
    return (
      <div className="h-44 bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800 p-4 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs font-mono transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></div>
          <span>Executing test cases on isolated multi-language sandbox...</span>
        </div>
      </div>
    );
  }

  // If compiler error, show LeetCode-style error console
  if (compileError) {
    return (
      <div className="h-48 bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800 p-4 flex flex-col font-mono text-xs overflow-y-auto transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
            <span>Compile / Runtime Error</span>
          </div>
          <span className="text-[11px] text-zinc-400">Exit Code 1</span>
        </div>
        <pre className="text-rose-700 dark:text-rose-300 whitespace-pre-wrap bg-rose-50/70 dark:bg-rose-950/40 p-3.5 rounded-lg border border-rose-200/60 dark:border-rose-900/60 leading-relaxed font-mono text-xs select-text">
          {compileError}
        </pre>
      </div>
    );
  }

  const sampleCases = problemTestCases.filter((c) => !c.isHidden);
  const casesToDisplay = sampleCases.length > 0 ? sampleCases : problemTestCases.slice(0, 3);

  const passedCount = results ? results.filter((r) => r.passed).length : 0;
  const allPassed = results ? passedCount === results.length : false;
  const currentResult = results ? results[activeCaseIndex] || results[0] : null;
  const currentSampleCase = casesToDisplay[activeCaseIndex] || casesToDisplay[0];

  return (
    <div className="h-52 bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800 flex flex-col text-xs font-mono overflow-hidden transition-colors select-none">
      {/* 1. LeetCode Console Mode Tabs (Testcase vs Test Result) */}
      <div className="h-8 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200/70 dark:border-zinc-800 px-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setConsoleMode('testcase')}
            className={`px-2.5 py-0.5 rounded text-xs transition-colors cursor-pointer font-medium ${
              consoleMode === 'testcase'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs border border-zinc-200/80 dark:border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <span>Testcase</span>
          </button>

          <button
            onClick={() => setConsoleMode('result')}
            className={`px-2.5 py-0.5 rounded text-xs transition-colors cursor-pointer font-medium flex items-center gap-1.5 ${
              consoleMode === 'result'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs border border-zinc-200/80 dark:border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <span>Test Result</span>
            {results && results.length > 0 && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${allPassed ? 'bg-[#00b8a3]' : 'bg-[#ff375f]'}`}
              ></span>
            )}
          </button>
        </div>

        {/* Status indicator on the right if results available */}
        {results && results.length > 0 && consoleMode === 'result' && (
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold ${
                allPassed ? 'text-[#00b8a3]' : 'text-[#ff375f]'
              }`}
            >
              {allPassed ? 'Accepted' : 'Wrong Answer'}
            </span>
            <span className="text-zinc-400 text-[11px]">
              {passedCount}/{results.length} passed
            </span>
          </div>
        )}
      </div>

      {/* 2. Case Selector Tabs */}
      <div className="h-7 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-850 px-3 flex items-center gap-1.5 overflow-x-auto">
        {consoleMode === 'result' && results && results.length > 0
          ? results.map((res, idx) => (
              <button
                key={res.id}
                onClick={() => setActiveCaseIndex(idx)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                  activeCaseIndex === idx
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium border border-zinc-200/70 dark:border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    res.passed ? 'bg-[#00b8a3]' : 'bg-[#ff375f]'
                  }`}
                ></span>
                {res.isHidden && <Lock className="w-2.5 h-2.5 text-zinc-400" />}
                <span>Case {idx + 1}</span>
              </button>
            ))
          : casesToDisplay.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setActiveCaseIndex(idx)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  activeCaseIndex === idx
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium border border-zinc-200/70 dark:border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <span>Case {idx + 1}</span>
              </button>
            ))}
      </div>

      {/* 3. Tab Detail Content */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-white dark:bg-zinc-950 select-text">
        {/* Mode A: Testcase input view */}
        {consoleMode === 'testcase' && (
          <div className="space-y-2">
            {currentSampleCase ? (
              <div className="space-y-1.5">
                <div className="text-[10px] text-zinc-400 uppercase font-mono">
                  Input:
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all select-all">
                  {currentSampleCase.input}
                </div>
                <div className="text-[10px] text-zinc-400 uppercase font-mono pt-1">
                  Expected Output:
                </div>
                <div className="p-2 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  {currentSampleCase.expectedOutput}
                </div>
              </div>
            ) : (
              <div className="text-zinc-400 text-xs py-4 text-center">
                No sample testcases available.
              </div>
            )}
          </div>
        )}

        {/* Mode B: Test Result execution output */}
        {consoleMode === 'result' && (
          <>
            {!results || results.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-xs py-6 space-y-1">
                <Play className="w-4 h-4 text-zinc-300 dark:text-zinc-600 mb-1" />
                <span>You must run your code first</span>
                <span className="text-[10px] text-zinc-400">
                  Press <strong>Run</strong> (Ctrl+Enter) or <strong>Submit</strong>
                </span>
              </div>
            ) : currentResult ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {currentResult.isHidden
                        ? `Hidden Case #${currentResult.id}`
                        : `Case #${currentResult.id}`}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                        currentResult.passed
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#00b8a3]'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-[#ff375f]'
                      }`}
                    >
                      {currentResult.passed ? 'PASSED' : 'WRONG ANSWER'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-zinc-400 text-[10px]">
                    <Clock className="w-3 h-3" />
                    <span>{currentResult.runtimeMs} ms</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-zinc-50/70 dark:bg-zinc-900/60 rounded-lg border border-zinc-200/60 dark:border-zinc-800 font-mono">
                    <div className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase font-semibold mb-1">
                      Expected Output
                    </div>
                    <div className="text-zinc-800 dark:text-zinc-200 break-all">
                      {currentResult.expectedOutput}
                    </div>
                  </div>

                  <div className="p-2.5 bg-zinc-50/70 dark:bg-zinc-900/60 rounded-lg border border-zinc-200/60 dark:border-zinc-800 font-mono">
                    <div className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase font-semibold mb-1">
                      Your Output
                    </div>
                    <div
                      className={`break-all ${
                        currentResult.passed
                          ? 'text-[#00b8a3] font-medium'
                          : 'text-[#ff375f] font-medium'
                      }`}
                    >
                      {currentResult.actualOutput !== null
                        ? currentResult.actualOutput
                        : currentResult.error || 'No output'}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
