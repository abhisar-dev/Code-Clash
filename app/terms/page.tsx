'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
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
            <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Last updated: October 10, 2026</p>
          </div>

          <section>
            <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
            <p className="text-zinc-700 dark:text-zinc-300">
              By accessing or using CodeClash, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Description of Service</h2>
            <p className="text-zinc-700 dark:text-zinc-300">
              CodeClash is a real-time competitive coding platform that allows users to compete against each other by solving programming challenges.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">User Accounts</h2>
            <ul className="list-disc pl-5 space-y-1 text-zinc-700 dark:text-zinc-300">
              <li><strong>Registration:</strong> You must create an account to participate in matches.</li>
              <li><strong>Accuracy:</strong> You agree to provide accurate, current, and complete information during registration.</li>
              <li><strong>One Account:</strong> Each user is permitted only one active account. Multiple accounts are prohibited and may result in a ban.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Code of Conduct</h2>
            <p className="mb-2">Users must maintain fair play and respect for others. The following behaviors are strictly prohibited:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-700 dark:text-zinc-300">
              <li><strong>Cheating:</strong> Using unauthorized third-party tools, communicating with others during matches, or exploiting bugs.</li>
              <li><strong>Automation:</strong> Submitting code via automated scripts or bots.</li>
              <li><strong>Harassment:</strong> Abusive language, harassment, or targeted attacks against other users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Intellectual Property</h2>
            <p className="text-zinc-700 dark:text-zinc-300">
              Users retain all ownership rights to the code they submit on the platform. CodeClash retains all intellectual property rights related to the platform infrastructure, design, branding, and provided coding challenges.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
            <p className="text-zinc-700 dark:text-zinc-300">
              CodeClash is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Termination</h2>
            <p className="text-zinc-700 dark:text-zinc-300">
              We reserve the right to suspend or terminate your account and access to the service immediately, without prior notice, for conduct that we determine violates these Terms and Conditions or is harmful to other users or the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Governing Law</h2>
            <p className="text-zinc-700 dark:text-zinc-300">
              These Terms shall be governed and construed in accordance with standard international business practices, without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p className="text-zinc-700 dark:text-zinc-300">
              For any legal inquiries regarding these Terms and Conditions, please contact <a href="mailto:legal@codeclash.dev" className="text-zinc-900 dark:text-zinc-100 underline hover:no-underline">legal@codeclash.dev</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
