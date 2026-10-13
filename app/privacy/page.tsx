'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-[#151311] text-stone-900 dark:text-stone-100 font-sans p-6 sm:p-10">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/"
          className="inline-flex items-center text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 mb-8 transition-colors text-xs font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Last updated: October 10, 2026</p>
          </div>

          <section>
            <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
            <p className="mb-2">We collect the following types of information when you use CodeClash:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-700 dark:text-zinc-300">
              <li><strong>Account Data:</strong> Your chosen name, handle, and college affiliation.</li>
              <li><strong>Usage Data:</strong> Problems solved, match history, and code submissions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
            <p className="mb-2">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-700 dark:text-zinc-300">
              <li>To provide, maintain, and improve the CodeClash service.</li>
              <li>To match you with opponents for competitive coding sessions.</li>
              <li>To calculate rankings and display leaderboards.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Data Storage</h2>
            <p className="text-zinc-700 dark:text-zinc-300">
              Data is stored locally on your device via browser localStorage for immediate access and preferences, and on our server-side JSON database for persistent account and match records.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Third Party Services</h2>
            <p className="mb-2">We integrate the following third-party services to enhance platform functionality:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-700 dark:text-zinc-300">
              <li><strong>Monaco Editor:</strong> Provided by Microsoft for the in-browser coding environment.</li>
              <li><strong>Google Fonts:</strong> For typography rendering.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
            <p className="text-zinc-700 dark:text-zinc-300">
              We retain your personal data for as long as your account exists. If you choose to delete your account, your associated personal data will be permanently removed from our active databases.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
            <p className="mb-2">You have the right to control your personal data. At any time, you can:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-700 dark:text-zinc-300">
              <li>Delete your account and associated data.</li>
              <li>Export a copy of your data, including code submissions and match history.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p className="text-zinc-700 dark:text-zinc-300">
              If you have any questions about this Privacy Policy or your data, please contact us at <a href="mailto:support@codeclash.dev" className="text-zinc-900 dark:text-zinc-100 underline hover:no-underline">support@codeclash.dev</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Changes to Policy</h2>
            <p className="text-zinc-700 dark:text-zinc-300">
              We may update this Privacy Policy periodically. We will notify users of any material changes by updating the "Last updated" date at the top of this page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
