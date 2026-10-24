'use client';

import React, { useState } from 'react';
import { Mail, Bug, HelpCircle, Info, Share2, Send, CheckCircle2 } from 'lucide-react';

export type SupportModalType = 'contact' | 'bug' | 'support' | 'about' | 'socials';

interface SupportModalsProps {
  type: SupportModalType | null;
  onClose: () => void;
  userEmail?: string;
}

export function SupportModals({ type, onClose, userEmail }: SupportModalsProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general',
  });

  if (!type) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60  animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#181614] border border-[#e5e0d8] dark:border-[#38332c] rounded-2xl shadow-2xl overflow-hidden text-stone-900 dark:text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eee8df] dark:border-[#2d2925] bg-[#faf8f5] dark:bg-[#1f1c19]">
          <div className="flex items-center gap-2.5">
            {type === 'contact' && <Mail className="w-5 h-5 text-amber-600" />}
            {type === 'bug' && <Bug className="w-5 h-5 text-rose-600" />}
            {type === 'support' && <HelpCircle className="w-5 h-5 text-sky-600" />}
            {type === 'about' && <Info className="w-5 h-5 text-emerald-600" />}
            {type === 'socials' && <Share2 className="w-5 h-5 text-amber-600" />}

            <h3 className="font-bold text-base tracking-tight capitalize">
              {type === 'contact' && 'Contact CodeClash Team'}
              {type === 'bug' && 'Report a Bug'}
              {type === 'support' && 'Help Center & Support FAQs'}
              {type === 'about' && 'About CodeClash'}
              {type === 'socials' && 'Connect on Socials'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm p-1 rounded-md"
          >
            x
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 text-sm">
          {submitted ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
              <h4 className="font-bold text-lg">Thank you! Message Received</h4>
              <p className="text-xs text-stone-500 max-w-xs">
                Your report has been logged. Abhisar and the CodeClash team will review it shortly.
              </p>
            </div>
          ) : (
            <>
              {/* CONTACT VIEW */}
              {type === 'contact' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Need assistance, partnership inquiries, or guidance with DSA contests? Leave a message below or mail directly to{' '}
                    <a href="mailto:abhisarkumar.dev@gmail.com" className="text-amber-600 underline font-semibold">
                      abhisarkumar.dev@gmail.com
                    </a>.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Question regarding Semester PYQ or Arena Duel"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                      Your Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Type your message here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </form>
              )}

              {/* BUG REPORT VIEW */}
              {type === 'bug' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Found an issue with Monaco editor, testcases, match verification, or layout? Let us know so we can deploy a patch immediately.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                      Issue Area
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs focus:outline-none focus:border-rose-600"
                    >
                      <option value="code_editor">Code Editor &amp; Compilation</option>
                      <option value="matchmaking">1v1 Matchmaking &amp; Duels</option>
                      <option value="problem_testcase">Problem PYQ / Test Case</option>
                      <option value="profile_auth">Profile &amp; Account</option>
                      <option value="other">Other UI Bug</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                      Bug Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please explain what happened and steps to reproduce..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs focus:outline-none focus:border-rose-600"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
                    >
                      <Bug className="w-3.5 h-3.5" />
                      <span>Submit Bug Report</span>
                    </button>
                  </div>
                </form>
              )}

              {/* SUPPORT / FAQ VIEW */}
              {type === 'support' && (
                <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800">
                    <h5 className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                      How do 1v1 Arena Duels work?
                    </h5>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      Both players receive identical random coding challenges with a 45-minute countdown timer. The first student to pass all hidden unit test cases wins ELO rating points!
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800">
                    <h5 className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                      Where are the PYQ Placement questions sourced?
                    </h5>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      Curated from Invertis University on-campus drive records, past technical interviews (Google, Amazon, TCS, Infosys, Wipro, Microsoft) and semester exams for CSE, BCA, and MCA.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800">
                    <h5 className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                      Can I customize my student profile?
                    </h5>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      Yes! Click on your profile pill to update your student details (Batch, Roll No, Branch, Target Roles, Bio, and Avatar).
                    </p>
                  </div>
                </div>
              )}

              {/* ABOUT VIEW */}
              {type === 'about' && (
                <div className="space-y-3 text-stone-600 dark:text-stone-400 text-xs leading-relaxed">
                  <p>
                    <strong className="text-stone-900 dark:text-stone-100 font-semibold">CodeClash</strong> is an all-in-one competitive programming platform and placement preparation ecosystem tailored for Invertis University students.
                  </p>
                  <p>
                    Engineered by <strong>Abhisar Kumar</strong> to empower classmates with realistic 1v1 real-time live coding duels, department-wise previous year question banks, and placement analytics.
                  </p>
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500">
                    <span>Platform Version: 2.4.0</span>
                    <span>Built with Next.js, Tailwind v4 &amp; Aceternity</span>
                  </div>
                </div>
              )}

              {/* SOCIALS VIEW */}
              {type === 'socials' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Follow and connect with <strong>Abhisar Kumar</strong> across official social profiles:
                  </p>
                  <div className="grid grid-cols-1 gap-2.5">
                    <a
                      href="https://www.linkedin.com/in/abhisar-kumar-89a2872a0/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 hover:border-sky-500 hover:bg-sky-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0077b5]/10 text-[#0077b5] flex items-center justify-center font-bold text-sm">
                          in
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-stone-900 dark:text-stone-100 group-hover:text-sky-600">
                            LinkedIn
                          </div>
                          <div className="text-[11px] text-stone-500">abhisar-kumar-89a2872a0</div>
                        </div>
                      </div>
                      <span className="text-xs text-sky-600 font-medium">&rarr;</span>
                    </a>

                    <a
                      href="https://www.instagram.com/abhisar._.bhardwaj"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 hover:border-pink-500 hover:bg-pink-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center font-bold text-sm">
                          IG
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-stone-900 dark:text-stone-100 group-hover:text-pink-600">
                            Instagram
                          </div>
                          <div className="text-[11px] text-stone-500">@abhisar._.bhardwaj</div>
                        </div>
                      </div>
                      <span className="text-xs text-pink-600 font-medium">&rarr;</span>
                    </a>

                    <a
                      href="https://github.com/abhisar-dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 hover:border-stone-500 hover:bg-stone-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 flex items-center justify-center font-bold text-xs">
                          GH
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-stone-900 dark:text-stone-100 group-hover:text-stone-900 dark:group-hover:text-white">
                            GitHub
                          </div>
                          <div className="text-[11px] text-stone-500">@abhisar-dev</div>
                        </div>
                      </div>
                      <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">&rarr;</span>
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
