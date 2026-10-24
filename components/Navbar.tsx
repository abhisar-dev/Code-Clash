'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Swords,
  Trophy,
  Volume2,
  VolumeX,
  Share2,
  LayoutDashboard,
  Code2,
  Moon,
  Sun,
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Mail,
  Bug,
  HelpCircle,
  Info,
  Share2 as ShareIcon,
  ExternalLink,
} from 'lucide-react';
import { User } from '@/lib/auth';
import { Avatar } from '@/components/Avatar';
import { SupportModalType } from '@/components/SupportModals';

export type NavTab = 'dashboard' | 'arena' | 'problems' | 'leaderboard';
export type MinimalBgStyle = 'dots' | 'grid' | 'clean' | 'dark';

interface NavbarProps {
  user: User;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenLobby?: () => void;
  onOpenProfile?: () => void;
  onOpenShare?: () => void;
  roomId?: string;
  bgStyle?: MinimalBgStyle;
  onCycleBgStyle?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onFindMatch?: () => void;
  onlineCount?: number;
  onOpenSupportModal?: (type: SupportModalType) => void;
}

export function Navbar({
  user,
  activeTab,
  onTabChange,
  soundEnabled,
  onToggleSound,
  onOpenLobby,
  onOpenProfile,
  onOpenShare,
  roomId,
  bgStyle = 'dots',
  onCycleBgStyle,
  theme = 'light',
  onToggleTheme,
  onFindMatch,
  onlineCount = 1,
  onOpenSupportModal,
}: NavbarProps) {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const supportRef = useRef<HTMLDivElement>(null);

  // Close support dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (supportRef.current && !supportRef.current.contains(event.target as Node)) {
        setIsSupportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'arena', label: '1v1 Arena', icon: <Swords className="w-3.5 h-3.5" /> },
    { id: 'problems', label: 'Problems', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-3.5 h-3.5" /> },
  ];

  const isDark = theme === 'dark';

  const handleSupportSelect = (type: SupportModalType) => {
    setIsSupportOpen(false);
    onOpenSupportModal?.(type);
  };

  return (
    <>
      {/* Yellow Top Announcement Marquee - Highly Visible & Clear Continuous Right to Left */}
      <div className="bg-[#f59e0b] dark:bg-[#d97706] text-stone-950 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold overflow-hidden border-b border-amber-600/40 select-none flex items-center relative shadow-xs">
        {/* Fixed Badge on Left */}
        <div className="z-10 bg-[#f59e0b] dark:bg-[#d97706] pl-3 sm:pl-6 pr-3 flex items-center shrink-0 border-r border-stone-950/20">
          <span className="px-2.5 py-1 rounded-md bg-stone-950 text-amber-300 font-mono font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            LIVE UPDATES
          </span>
        </div>

        {/* Marquee Track */}
        <div className="flex-1 overflow-hidden relative flex">
          <div className="flex items-center gap-14 whitespace-nowrap animate-marquee hover:[animation-play-state:paused] cursor-default text-stone-950 tracking-tight">
            {/* Announcement List */}
            <span className="text-xs sm:text-[13px] font-medium">
              <strong className="font-bold underline decoration-stone-900/40 underline-offset-2">Announcement 1:</strong> New <strong>DSA Placement Series &amp; 1v1 Arena Duels</strong> are live across CSE, BCA, and MCA semester question banks!
            </span>
            <span className="text-stone-900 font-black text-sm">&bull;</span>

            <span className="text-xs sm:text-[13px] font-medium">
              <strong className="font-bold underline decoration-stone-900/40 underline-offset-2">Announcement 2:</strong> <strong>Daily Clash Challenge:</strong> Solve today&apos;s campus problem to climb the College ELO Leaderboard!
            </span>
            <span className="text-stone-900 font-black text-sm">&bull;</span>

            <span className="text-xs sm:text-[13px] font-medium">
              <strong className="font-bold underline decoration-stone-900/40 underline-offset-2">Announcement 3:</strong> Weekly University Coding Championship scheduled &bull; Compete 1v1 against top batchmates.
            </span>
            <span className="text-stone-900 font-black text-sm">&bull;</span>

            <span className="text-xs sm:text-[13px] font-medium">
              <strong className="font-bold underline decoration-stone-900/40 underline-offset-2">Announcement 4:</strong> FAANG &amp; MNC placement questions added: Amazon, Google, Microsoft, TCS, Infosys &amp; Wipro papers ready.
            </span>
            <span className="text-stone-900 font-black text-sm">&bull;</span>

            <span className="text-xs sm:text-[13px] font-medium">
              <strong className="font-bold underline decoration-stone-900/40 underline-offset-2">Announcement 5:</strong> Multi-language Monaco Compiler upgraded &bull; Run and test in Python, JavaScript, Java &amp; C++.
            </span>
            <span className="text-stone-900 font-black text-sm">&bull;</span>

            {/* Duplicate for Infinite Seamless Loop */}
            <span className="text-xs sm:text-[13px] font-medium">
              <strong className="font-bold underline decoration-stone-900/40 underline-offset-2">Announcement 1:</strong> New <strong>DSA Placement Series &amp; 1v1 Arena Duels</strong> are live across CSE, BCA, and MCA semester question banks!
            </span>
            <span className="text-stone-900 font-black text-sm">&bull;</span>

            <span className="text-xs sm:text-[13px] font-medium">
              <strong className="font-bold underline decoration-stone-900/40 underline-offset-2">Announcement 2:</strong> <strong>Daily Clash Challenge:</strong> Solve today&apos;s campus problem to climb the College ELO Leaderboard!
            </span>
            <span className="text-stone-900 font-black text-sm">&bull;</span>

            <span className="text-xs sm:text-[13px] font-medium">
              <strong className="font-bold underline decoration-stone-900/40 underline-offset-2">Announcement 3:</strong> Weekly University Coding Championship scheduled &bull; Compete 1v1 against top batchmates.
            </span>
            <span className="text-stone-900 font-black text-sm">&bull;</span>

            <span className="text-xs sm:text-[13px] font-medium">
              <strong className="font-bold underline decoration-stone-900/40 underline-offset-2">Announcement 4:</strong> FAANG &amp; MNC placement questions added: Amazon, Google, Microsoft, TCS, Infosys &amp; Wipro papers ready.
            </span>
            <span className="text-stone-900 font-black text-sm">&bull;</span>

            <span className="text-xs sm:text-[13px] font-medium">
              <strong className="font-bold underline decoration-stone-900/40 underline-offset-2">Announcement 5:</strong> Multi-language Monaco Compiler upgraded &bull; Run and test in Python, JavaScript, Java &amp; C++.
            </span>
            <span className="text-stone-900 font-black text-sm">&bull;</span>
          </div>
        </div>

        {/* Fixed Right Stats Badge */}
        <div className="hidden sm:flex z-10 bg-[#f59e0b] dark:bg-[#d97706] pr-4 sm:pr-6 pl-3 items-center gap-2 shrink-0 border-l border-stone-950/20 font-mono text-[11px] font-bold text-stone-950">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-800 animate-pulse"></span>
          <span>{onlineCount} STUDENTS ONLINE</span>
        </div>
      </div>

      {/* Main InvertisPrep-Style Header */}
      <header className="h-14 sm:h-16 border-b border-[#e5e0d8] dark:border-[#2d2925] bg-[#faf8f5] dark:bg-[#151311] px-2.5 sm:px-6 lg:px-8 flex items-center justify-between z-30 select-none transition-colors duration-200">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group"
            onClick={() => onTabChange('dashboard')}
          >
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#4f46e5] dark:text-[#818cf8] font-sans">
              CODE<span className="text-stone-900 dark:text-stone-100">CLASH</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20">
              INVERTIS
            </span>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 sm:gap-2 text-xs font-medium overflow-x-auto py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950 font-semibold shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                }`}
              >
                <span className="font-medium">{tab.label}</span>
                {tab.id === 'arena' && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    LIVE
                  </span>
                )}
                {tab.id === 'problems' && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400">
                    NEW
                  </span>
                )}
                {tab.id === 'leaderboard' && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    RANKS
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Support Menu, Socials, Night Mode & Profile Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Support Dropdown Trigger */}
          <div className="relative" ref={supportRef}>
            <button
              onClick={() => setIsSupportOpen(!isSupportOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isSupportOpen
                  ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100'
                  : 'bg-white dark:bg-stone-900/80 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <span>Support</span>
              {isSupportOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {/* InvertisPrep Style Floating Menu */}
            {isSupportOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#181614] border border-[#e5e0d8] dark:border-[#38332c] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* 1. Contact */}
                <button
                  onClick={() => handleSupportSelect('contact')}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/80 text-left transition-colors cursor-pointer group"
                >
                  <Mail className="w-4 h-4 text-stone-500 group-hover:text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-600">
                      Contact
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Reach out to the CodeClash team.
                    </div>
                  </div>
                </button>

                {/* 2. Report a Bug */}
                <button
                  onClick={() => handleSupportSelect('bug')}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/80 text-left transition-colors cursor-pointer group"
                >
                  <Bug className="w-4 h-4 text-stone-500 group-hover:text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-rose-600">
                      Report a Bug
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Found something broken? Tell us.
                    </div>
                  </div>
                </button>

                {/* 3. Support */}
                <button
                  onClick={() => handleSupportSelect('support')}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/80 text-left transition-colors cursor-pointer group"
                >
                  <HelpCircle className="w-4 h-4 text-stone-500 group-hover:text-sky-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-sky-600">
                      Support
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Help center &amp; FAQs.
                    </div>
                  </div>
                </button>

                {/* 4. About */}
                <button
                  onClick={() => handleSupportSelect('about')}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/80 text-left transition-colors cursor-pointer group"
                >
                  <Info className="w-4 h-4 text-stone-500 group-hover:text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600">
                      About
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      What CodeClash is all about.
                    </div>
                  </div>
                </button>

                {/* 5. Socials */}
                <button
                  onClick={() => handleSupportSelect('socials')}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/80 text-left transition-colors cursor-pointer group border-t border-stone-200/70 dark:border-stone-800/70 mt-1"
                >
                  <ShareIcon className="w-4 h-4 text-stone-500 group-hover:text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-600">
                      Socials
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Find us on LinkedIn, Instagram &amp; more.
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Social Icons Directly in Navbar (Desktop / Tablet) */}
          <div className="hidden sm:flex items-center gap-1">
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/abhisar-kumar-89a2872a0/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-500 hover:text-[#0077b5] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Abhisar Kumar on LinkedIn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/abhisar._.bhardwaj"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-500 hover:text-[#e4405f] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="अभिसार भारद्वाज on Instagram"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/abhisar-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="abhisar-dev on GitHub"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>

          {/* Quick 1v1 Matchmaking Button */}
          {onFindMatch && (
            <button
              onClick={onFindMatch}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-300/40 dark:border-sky-500/30 text-xs font-medium transition-colors cursor-pointer"
              title="Search for a live peer opponent in your ELO tier"
            >
              <Zap className="w-3 h-3 text-sky-500 fill-current animate-pulse" />
              <span className="font-semibold">Find Match</span>
            </button>
          )}

          {/* Night Mode Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title={isDark ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'}
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-zinc-600" />
              )}
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="w-7 h-7 rounded-lg hidden sm:flex items-center justify-center text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute' : 'Enable Sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>

          {/* User Profile Pill: [Avatar] [Name] [v] - opens quick profile modal */}
          <button
            onClick={() => onOpenProfile?.()}
            className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-2 sm:pr-2.5 py-1 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-amber-500 hover:shadow-xs transition-all cursor-pointer group"
            title="Open My Profile"
          >
            <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 max-w-[64px] sm:max-w-[100px] truncate">
              {user.name}
            </span>
            <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-transform" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (iOS / Android Native App Experience) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#faf8f5] dark:bg-[#151311] border-t border-[#e5e0d8] dark:border-[#2d2925] px-1.5 py-1 flex items-center justify-around select-none shadow-lg safe-area-bottom">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-[#4f46e5] dark:text-[#818cf8] font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.id === 'arena' && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
                {tab.id === 'problems' && (
                  <span className="absolute -top-1 -right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.id === 'arena' ? '1v1 Arena' : tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-[#4f46e5] dark:bg-[#818cf8]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
