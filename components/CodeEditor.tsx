'use client';

import React from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Loader2 } from 'lucide-react';
import { Language } from '@/lib/problems';

interface CodeEditorProps {
  language: Language;
  code: string;
  onChange: (value: string | undefined) => void;
  onResetCode: () => void;
  onRunCode: () => void;
  onSubmitCode?: () => void;
  isExecuting: boolean;
  isSubmitting?: boolean;
  theme?: 'light' | 'dark';
}

export function CodeEditor({
  language,
  code,
  onChange,
  onResetCode,
  onRunCode,
  onSubmitCode,
  isExecuting,
  isSubmitting = false,
  theme = 'light',
}: CodeEditorProps) {
  const monacoLanguage = language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language === 'python' ? 'python' : 'javascript';
  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isExecuting && !isSubmitting) {
        onRunCode();
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950 overflow-hidden" onKeyDown={handleKeyDown}>
      {/* Editor Toolbar */}
      <div className="h-9 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/90 px-3 flex items-center justify-between select-none transition-colors">
        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 dark:text-zinc-400">
          <span>solution.{language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'js'}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset Code */}
          <button
            onClick={onResetCode}
            disabled={isExecuting || isSubmitting}
            className="flex items-center gap-1 px-2 py-0.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
            title="Reset starter template"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          {/* LeetCode Run Button */}
          <button
            onClick={onRunCode}
            disabled={isExecuting || isSubmitting}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-md transition-all  disabled:opacity-50 cursor-pointer"
            title="Run on sample testcases"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-sky-500" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current text-zinc-600 dark:text-zinc-300" />
                <span>Run</span>
                <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">(↵)</span>
              </>
            )}
          </button>

          {/* LeetCode Submit Button (Official Green) */}
          {onSubmitCode && (
            <button
              onClick={onSubmitCode}
              disabled={isExecuting || isSubmitting}
              className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold text-white bg-[#00b8a3] hover:bg-[#009e8c]  rounded-md transition-all shadow-xs shadow-[#00b8a3]/20 disabled:opacity-50 cursor-pointer"
              title="Submit code against all comprehensive test cases"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 relative bg-white dark:bg-zinc-950">
        <Editor
          height="100%"
          language={monacoLanguage}
          value={code}
          theme={monacoTheme}
          onChange={onChange}
          options={{
            fontSize: 13.5,
            fontFamily: "var(--font-mono), 'JetBrains Mono', Consolas, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            lineNumbers: 'on',
            wordWrap: 'on',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
}
