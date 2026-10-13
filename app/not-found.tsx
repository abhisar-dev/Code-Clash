import Link from 'next/link';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-[#181614] text-stone-900 dark:text-stone-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#fcfbf9] dark:bg-[#201d1a] border border-[#e8e4dc] dark:border-[#2d2925] p-8 rounded-2xl shadow-sm text-center">
        <div className="w-14 h-14 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="text-4xl font-extrabold font-mono tracking-tight text-amber-700 dark:text-amber-400 mb-2">
          404
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2 text-stone-900 dark:text-stone-100">
          Problem Not Found
        </h1>
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
          The requested duel or page does not exist or may have expired. Head back to the main platform.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
