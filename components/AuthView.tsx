'use client';

import React, { useState, useEffect } from 'react';
import { User, signUp, signIn, saveUserSession } from '@/lib/auth';
import { PROBLEMS } from '@/lib/problems';
import {
  Swords,
  ArrowRight,
  ShieldCheck,
  Zap,
  Code,
  AlertCircle,
  KeyRound,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AuthViewProps {
  onAuthenticated: (user: User) => void;
  initialInviteCode?: string | null;
}

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function AuthView({ onAuthenticated, initialInviteCode }: AuthViewProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('Invertis University');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const oauthErr = params.get('oauth_error');
      if (oauthErr) {
        if (oauthErr === 'access_denied') {
          setError('Google sign-in was cancelled.');
        } else {
          setError(`Google Sign-In Error: ${oauthErr}`);
        }
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // 1. SIGN UP Flow
    if (tab === 'signup') {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (!fullName) {
        setError('Please enter first name and last name.');
        return;
      }
      if (!identifier.trim() || !identifier.includes('@')) {
        setError('Please enter a valid university email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      setLoading(true);

      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'signup',
            name: fullName,
            identifier: identifier.trim(),
            password,
            college: college.trim(),
            websiteHoneypot: honeypot,
          }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          saveUserSession(data.user);
          onAuthenticated(data.user);
          setLoading(false);
          return;
        } else if (data.error && res.status !== 500) {
          setError(data.error);
          setLoading(false);
          return;
        }
      } catch {
        // Local fallback
      }

      const localRes = signUp(fullName, identifier, password, college);
      setLoading(false);
      if (!localRes.success) {
        setError(localRes.error || 'Failed to create account.');
        return;
      }
      if (localRes.user) {
        saveUserSession(localRes.user);
        onAuthenticated(localRes.user);
      }
      return;
    }

    // 2. STUDENT SIGN IN
    if (!identifier.trim()) {
      setError('Please enter your email or handle.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signin',
          identifier: identifier.trim(),
          password,
          websiteHoneypot: honeypot,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        saveUserSession(data.user);
        onAuthenticated(data.user);
        setLoading(false);
        return;
      }
      const localFallback = signIn(identifier, password);
      if (localFallback.success && localFallback.user) {
        saveUserSession(localFallback.user);
        onAuthenticated(localFallback.user);
        setLoading(false);
        return;
      }
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
    } catch {
      // Local fallback
    }

    const localRes = signIn(identifier, password);
    setLoading(false);
    if (!localRes.success) {
      setError(localRes.error || 'Failed to sign in.');
      return;
    }
    if (localRes.user) {
      saveUserSession(localRes.user);
      onAuthenticated(localRes.user);
    }
  };

  return (
    <div
      className="min-h-screen w-screen flex flex-col items-center justify-center p-4 relative select-none bg-cover bg-center bg-no-repeat transition-all"
      style={{
        backgroundImage: "url('/invertis-campus.jpg')",
      }}
    >
      {/* Cinematic Invertis Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-black/85 backdrop-blur-[3px] pointer-events-none" />

      {/* Campus Academic Ticker */}
      <div className="mb-4 relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white/90 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        <span className="font-semibold tracking-wide flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
          <span>INVERTIS UNIVERSITY &bull; PEER CODING ARENA</span>
        </span>
      </div>

      {/* Invite Notice banner if joined via link */}
      {initialInviteCode && (
        <div className="mb-4 relative z-10 px-4 py-2 rounded-xl bg-amber-950/80 backdrop-blur-md border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2 animate-in fade-in shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>
            Invited to match room:{' '}
            <strong className="font-mono text-white">{initialInviteCode}</strong>
          </span>
        </div>
      )}

      {/* Card Container with Invertis Campus Backdrop */}
      <div className="shadow-2xl mx-auto w-full max-w-md rounded-3xl bg-white/95 p-5 md:p-8 dark:bg-[#121110]/95 backdrop-blur-xl border border-white/20 dark:border-white/10 relative z-10 transition-all">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ece7dc] dark:border-[#2d2925]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-[#4f46e5] dark:text-[#818cf8] font-sans">
              CODE<span className="text-stone-900 dark:text-stone-100">CLASH</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20">
              INVERTIS
            </span>
          </div>

          <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 font-medium">
            Academic Portal
          </span>
        </div>

        {/* Title and subtitle */}
        <div className="pt-4">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">
            {tab === 'signup' ? 'Join the Invertis Arena' : 'Welcome Back, Coder'}
          </h2>
          <p className="mt-1.5 max-w-sm text-xs text-neutral-600 dark:text-neutral-400">
            {tab === 'signup'
              ? 'Create your university competitive account to solve placement PYQs and challenge classmates in 1v1 duels.'
              : 'Sign in to access real-time 1v1 multiplayer matchmaking and track your placement ELO rating.'}
          </p>
        </div>

        {/* 2-Way Tab Switcher (Sign In vs Create Account) */}
        <div className="grid grid-cols-2 p-1 mt-4 bg-stone-100 dark:bg-[#1a1715] rounded-xl border border-stone-200 dark:border-stone-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setError('');
            }}
            className={cn(
              'py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              tab === 'signin'
                ? 'bg-white dark:bg-[#282420] text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setError('');
            }}
            className={cn(
              'py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              tab === 'signup'
                ? 'bg-white dark:bg-[#282420] text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            )}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form className="my-5 space-y-4" onSubmit={handleSubmit}>
          {/* Honeypot Bot Trap */}
          <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
            <label htmlFor="website_url">Leave empty</label>
            <input
              id="website_url"
              type="text"
              name="website_url"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* SIGN UP: First Name & Last Name Split */}
          {tab === 'signup' && (
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <LabelInputContainer>
                <Label htmlFor="firstname">First name</Label>
                <Input
                  id="firstname"
                  placeholder="Aman"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="lastname">Last name</Label>
                <Input
                  id="lastname"
                  placeholder="Sharma"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </LabelInputContainer>
            </div>
          )}

          {/* Email / Handle Input */}
          <LabelInputContainer>
            <Label htmlFor="email">
              {tab === 'signup' ? 'University Email Address' : 'Email Address or Handle'}
            </Label>
            <Input
              id="email"
              placeholder={
                tab === 'signup' ? 'aman@invertis.ac.in' : 'aman@invertis.ac.in or amancodes'
              }
              type={tab === 'signup' ? 'email' : 'text'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </LabelInputContainer>

          {/* Password Input */}
          <LabelInputContainer>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="text"
              autoComplete="off"
              spellCheck={false}
              style={password ? ({ WebkitTextSecurity: 'disc' } as React.CSSProperties) : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </LabelInputContainer>

          {/* Extra field for Sign Up: College / Department */}
          {tab === 'signup' && (
            <LabelInputContainer>
              <Label htmlFor="college">College / University</Label>
              <Input
                id="college"
                placeholder="Invertis University"
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
            </LabelInputContainer>
          )}

          {/* Submit Button */}
          <button
            className="group/btn relative block h-10 w-full rounded-xl bg-gradient-to-br from-stone-900 to-stone-700 font-semibold text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-stone-800 dark:from-stone-900 dark:to-stone-800 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] cursor-pointer transition-all active:scale-98 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            <span className="flex items-center justify-center gap-1.5 text-xs">
              {loading
                ? 'Authenticating...'
                : tab === 'signup'
                ? 'Sign up for CodeClash →'
                : 'Sign in to Arena →'}
            </span>
            <BottomGradient />
          </button>

          {/* Social Auth Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-800" />
            </div>
            <div className="relative px-3 bg-white/95 dark:bg-[#121110]/95 text-[10px] font-mono uppercase tracking-wider text-stone-400">
              Or continue with
            </div>
          </div>

          {/* Social Auth Grid (Google & GitHub) */}
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href="/api/auth/oauth/google"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-[#fbfaf7] dark:bg-[#1a1715] hover:bg-stone-100 dark:hover:bg-[#25211e] hover:border-stone-300 dark:hover:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-98"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>Google</span>
            </a>

            <a
              href="/api/auth/oauth/github"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-[#fbfaf7] dark:bg-[#1a1715] hover:bg-stone-100 dark:hover:bg-[#25211e] hover:border-stone-300 dark:hover:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-98"
            >
              <GithubIcon className="w-4 h-4 shrink-0" />
              <span>GitHub</span>
            </a>
          </div>
        </form>
      </div>

      {/* Feature Badges */}
      <div className="mt-5 relative z-10 flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white/90">
          <Code className="w-3.5 h-3.5 text-amber-400" />
          <span>{PROBLEMS.length} DSA Problems</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white/90">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>1v1 Peer Sockets</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white/90">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Multi-Lang Sandbox</span>
        </div>
      </div>

      {/* Legal Footer */}
      <div className="mt-3 relative z-10 flex items-center justify-center gap-3 text-[11px] text-white/60">
        <Link href="/privacy" className="hover:text-white transition-colors">
          Privacy Policy
        </Link>
        <span className="text-white/30">&bull;</span>
        <Link href="/terms" className="hover:text-white transition-colors">
          Terms of Service
        </Link>
        <span className="text-white/30">&bull;</span>
        <span className="font-mono text-[10px] text-amber-400/90 font-medium">Invertis Bareilly</span>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn('flex w-full flex-col space-y-1.5', className)}>{children}</div>;
};

const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider font-mono"
    >
      {children}
    </label>
  );
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      {...props}
      className={cn(
        'w-full bg-[#fbfaf7] dark:bg-[#1a1715] border border-[#dcd6cc] dark:border-[#38332c] rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white dark:focus:bg-[#1f1c19] transition-all shadow-2xs',
        props.className
      )}
    />
  );
};
