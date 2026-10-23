'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Navbar, NavTab, MinimalBgStyle } from '@/components/Navbar';
import { ContestBar } from '@/components/ContestBar';
import { ArenaHeader } from '@/components/ArenaHeader';
import { ProblemPanel } from '@/components/ProblemPanel';
import { CodeEditor } from '@/components/CodeEditor';
import { TestResultPanel, TestCaseResult } from '@/components/TestResultPanel';
import { VictoryModal } from '@/components/VictoryModal';
import { LobbyModal } from '@/components/LobbyModal';
import { ProfileModal } from '@/components/ProfileModal';
import { PublicProfileModal } from '@/components/PublicProfileModal';
import { SolutionInspectorModal } from '@/components/SolutionInspectorModal';
import { ShareInviteModal } from '@/components/ShareInviteModal';
import { AuthView } from '@/components/AuthView';
import { DashboardView } from '@/components/DashboardView';
import { ProblemsView } from '@/components/ProblemsView';
import { LeaderboardView } from '@/components/LeaderboardView';
import { IncomingChallengeModal } from '@/components/IncomingChallengeModal';
import { OutgoingChallengeModal } from '@/components/OutgoingChallengeModal';
import { MatchmakingModal } from '@/components/MatchmakingModal';
import { SubmissionResultModal } from '@/components/SubmissionResultModal';
import { ViolationReportModal } from '@/components/ViolationReportModal';
import { SupportModals, SupportModalType } from '@/components/SupportModals';
import { CustomCursor } from '@/components/CustomCursor';
import { Spotlight } from '@/components/ui/spotlight';
import { LayoutTextFlip } from '@/components/ui/layout-text-flip';
import { LoaderOne } from '@/components/ui/loader';
import { PROBLEMS, Problem, Language, getRandomContestProblems } from '@/lib/problems';
import { User, getCurrentUser, getRegisteredUsers, clearUserSession, createAccount, saveUserSession, recordMatchResult, saveMatchRecord, SubmissionRecord, saveSubmission } from '@/lib/auth';
import { Player, ContestRoom } from '@/lib/room-store';
import { ChallengeInvite } from '@/lib/presence-store';
import { sounds } from '@/lib/sound';

export default function Home() {
  // Navigation State
  const [activeNavTab, setActiveNavTab] = useState<NavTab>('dashboard');

  // Minimalist Background Texture State ('dots' | 'grid' | 'clean' | 'dark')
  const [bgStyle, setBgStyle] = useState<MinimalBgStyle>('dots');

  // Dark / Night Mode Theme State ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBg = localStorage.getItem('codeclash_bg_style') as MinimalBgStyle;
      if (savedBg && ['dots', 'grid', 'clean', 'dark'].includes(savedBg)) {
        setBgStyle(savedBg);
      }

      const savedTheme = localStorage.getItem('codeclash_theme') as 'light' | 'dark' | null;
      const initialTheme = savedTheme || 'light';
      setTheme(initialTheme);
      document.documentElement.classList.toggle('dark', initialTheme === 'dark');

      // Telemetry: record visit for admin audit
      try {
        const user = getCurrentUser();
        fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'record_visit',
            userId: user?.id,
            userName: user?.name,
            userHandle: user?.handle,
            path: window.location.pathname || '/',
          }),
        }).catch(() => {});
      } catch {}
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('codeclash_theme', next);
        document.documentElement.classList.toggle('dark', next === 'dark');
      }
      return next;
    });
  };

  const handleCycleBgStyle = () => {
    const order: MinimalBgStyle[] = ['dots', 'grid', 'clean', 'dark'];
    const nextIdx = (order.indexOf(bgStyle) + 1) % order.length;
    const nextStyle = order[nextIdx];
    setBgStyle(nextStyle);
    if (typeof window !== 'undefined') {
      localStorage.setItem('codeclash_bg_style', nextStyle);
    }
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [urlInviteCode, setUrlInviteCode] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [publicProfileTarget, setPublicProfileTarget] = useState<User | null>(null);
  const [isPublicProfileModalOpen, setIsPublicProfileModalOpen] = useState(false);

  const handleOpenPublicProfile = (target: User | string) => {
    if (typeof target === 'string') {
      const reg = getRegisteredUsers();
      const cleanTarget = target.trim();
      const found = reg.find(
        (u) =>
          u.name.toLowerCase() === cleanTarget.toLowerCase() ||
          u.handle.toLowerCase() === cleanTarget.toLowerCase().replace('@', '')
      );
      if (found) {
        setPublicProfileTarget(found);
      } else {
        setPublicProfileTarget({
          id: `lookup-${cleanTarget}`,
          name: cleanTarget,
          handle: cleanTarget.toLowerCase().replace(/[^a-z0-9]/g, ''),
          college: 'Invertis University',
          elo: 1000,
        } as User);
      }
    } else {
      setPublicProfileTarget(target);
    }
    setIsPublicProfileModalOpen(true);
  };

  // Contest Problem Set (Dynamic Randomized 5 Problems)
  const [contestProblems, setContestProblems] = useState<Problem[]>(PROBLEMS.slice(0, 5));
  const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(0);
  const currentProblem = contestProblems[currentProblemIndex] || contestProblems[0];
  const [solvedProblemIds, setSolvedProblemIds] = useState<string[]>([]);

  // Editor State
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('python');
  const [codes, setCodes] = useState<Record<string, string>>({});
  const currentCode = codes[currentProblem.id] || currentProblem.starterCode[selectedLanguage];
  const [mobileArenaTab, setMobileArenaTab] = useState<'problem' | 'code' | 'results'>('problem');

  // Match & Presence State
  const [roomId, setRoomId] = useState<string>('CLASH-1001');
  const [isMatchActive, setIsMatchActive] = useState<boolean>(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(2700); // 45 mins
  const [startTime, setStartTime] = useState<number>(0);
  const [matchDuration, setMatchDuration] = useState<number>(0);

  // Player & Opponent State
  const [player, setPlayer] = useState<Player>({
    id: 'user-temp',
    name: 'You',
    avatar: '',
    elo: 1000,
    isTyping: false,
    currentQuestionIndex: 0,
    scores: {},
    passedCount: {},
    totalTests: {},
    code: {},
    language: selectedLanguage,
    lastActive: 0,
  });

  const [opponent, setOpponent] = useState<Player>({
    id: 'opp-waiting',
    name: 'Friend (Invite to Join)',
    avatar: '',
    elo: 1000,
    isTyping: false,
    currentQuestionIndex: 0,
    scores: {},
    passedCount: {},
    totalTests: {},
    code: {},
    language: 'python',
    lastActive: 0,
  });

  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [rematchRequestedBy, setRematchRequestedBy] = useState<string | null>(null);

  // Execution State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [results, setResults] = useState<TestCaseResult[] | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);

  // Modals
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState<boolean>(false);
  const [isLobbyModalOpen, setIsLobbyModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isMatchmakingModalOpen, setIsMatchmakingModalOpen] = useState<boolean>(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState<boolean>(false);
  const [currentSubmission, setCurrentSubmission] = useState<SubmissionRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isViolationModalOpen, setIsViolationModalOpen] = useState<boolean>(false);
  const [activeSupportModal, setActiveSupportModal] = useState<SupportModalType | null>(null);

  // Presence & Consent Challenge States
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [incomingInvite, setIncomingInvite] = useState<ChallengeInvite | null>(null);
  const [outgoingInvite, setOutgoingInvite] = useState<ChallengeInvite | null>(null);
  const [outgoingStatusMsg, setOutgoingStatusMsg] = useState<string>('Waiting for opponent consent...');

  // Typing debounce ref
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize on mount
  useEffect(() => {
    setStartTime(Date.now());
    const initialCodes: Record<string, string> = {};
    PROBLEMS.forEach((p) => {
      initialCodes[p.id] = p.starterCode.python;
    });
    setCodes(initialCodes);

    // Load persisted solved problems
    if (typeof window !== 'undefined') {
      const savedSolved = localStorage.getItem('codeclash_solved_ids');
      if (savedSolved) {
        try {
          setSolvedProblemIds(JSON.parse(savedSolved));
        } catch {}
      }
    }

    // Check user session - restore if genuine logged-in session exists
    if (typeof window !== 'undefined' && window.location.hash.includes('sso_success=')) {
      try {
        const raw = decodeURIComponent(window.location.hash.split('sso_success=')[1].split('&')[0]);
        const ssoUser = JSON.parse(raw);
        if (ssoUser && ssoUser.id) {
          saveUserSession(ssoUser);
          window.location.hash = '';
        }
      } catch (e) {
        console.error('SSO payload error:', e);
      }
    }

    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setPlayer((prev) => ({
        ...prev,
        id: user.id,
        name: user.name,
        avatar: user.avatarUrl || '',
        elo: user.elo,
      }));
    }

    // Give user a graceful full welcome animation experience with Spotlight + LayoutTextFlip (~4.5s)
    const splashDuration = 4500;
    const welcomeTimer = setTimeout(() => {
      setIsAuthLoaded(true);
    }, splashDuration);

    // Check URL invite param
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const invite = params.get('invite') || params.get('room');
      if (invite) {
        const cleanCode = invite.toUpperCase();
        setUrlInviteCode(cleanCode);
        setRoomId(cleanCode);
        setActiveNavTab('arena');
        if (user) {
          joinExistingRoom(cleanCode, user);
        }
      }
    }

    return () => {
      if (welcomeTimer) clearTimeout(welcomeTimer);
    };
  }, []);

  // Handle post-auth initialization
  const handleAuthenticated = (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('codeclash_signed_out');
    }
    // Reliably persist the user session so refreshing keeps the user logged in
    saveUserSession(user);
    setCurrentUser(user);
    setPlayer((prev) => ({
      ...prev,
      id: user.id,
      name: user.name,
      avatar: user.avatarUrl || '',
      elo: user.elo,
    }));

    if (urlInviteCode) {
      joinExistingRoom(urlInviteCode, user);
      setActiveNavTab('arena');
    } else {
      createInitialRoom(undefined, user);
      setActiveNavTab('dashboard');
    }
  };

  // Sign out
  const handleSignOut = () => {
    clearUserSession();
    if (typeof window !== 'undefined') {
      localStorage.setItem('codeclash_signed_out', 'true');
    }
    setCurrentUser(null);
    setIsProfileModalOpen(false);
  };

  // Create room with randomized contest problems
  const createInitialRoom = async (
    customRoomId?: string,
    authUser?: User,
    difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Mixed'
  ) => {
    const usr = authUser || currentUser;
    if (!usr) return;

    const rid = customRoomId || `CLASH-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomId(rid);

    const freshProblems = getRandomContestProblems(difficulty);
    setContestProblems(freshProblems);
    setCurrentProblemIndex(0);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          roomId: rid,
          difficulty,
          player: {
            ...player,
            id: usr.id,
            name: usr.name,
            avatar: usr.avatarUrl || '',
            elo: usr.elo,
          },
        }),
      });
      const data = await res.json();
      if (data.room?.problems) {
        setContestProblems(data.room.problems);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Join room API call
  const joinExistingRoom = async (rid: string, authUser?: User) => {
    const usr = authUser || currentUser;
    if (!usr) return;

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          roomId: rid,
          player: {
            ...player,
            id: usr.id,
            name: usr.name,
            avatar: usr.avatarUrl || '',
            elo: usr.elo,
          },
        }),
      });
      const data = await res.json();
      if (data.room) {
        setContestProblems(data.room.problems);
        if (data.room.host && data.room.host.id !== usr.id) {
          setOpponent(data.room.host);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Room presence & sync polling (every 2 seconds in arena)
  useEffect(() => {
    if (!roomId || !currentUser || activeNavTab !== 'arena') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sync',
            roomId,
            player: { id: currentUser.id },
            updates: {
              isTyping: player.isTyping,
              currentQuestionIndex: currentProblemIndex,
              language: selectedLanguage,
            },
          }),
        });
        const data = await res.json();
        if (data.room) {
          const room: ContestRoom = data.room;
          const opp = room.host.id === currentUser.id ? room.guest : room.host;
          if (opp) {
            setOpponent(opp);
          }

          if (room.rematchRequestedBy) {
            setRematchRequestedBy(room.rematchRequestedBy);
          }

          if (room.status === 'ended' && isMatchActive) {
            handleMatchEnd(room.winnerId);
          }
        }
      } catch {
        // Silently continue
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [roomId, currentUser, player.isTyping, currentProblemIndex, selectedLanguage, isMatchActive, activeNavTab]);

  // Presence & 1v1 Challenge Heartbeat Polling
  useEffect(() => {
    if (!currentUser) return;

    const pollPresence = async () => {
      try {
        const currentActionDesc = isMatchActive
          ? `In 1v1 Battle (${roomId || 'Arena'})`
          : activeNavTab === 'problems'
          ? `Coding: ${currentProblem?.title || 'Problem'} (${selectedLanguage.toUpperCase()})`
          : activeNavTab === 'leaderboard'
          ? 'Viewing Campus Leaderboard'
          : activeNavTab === 'dashboard'
          ? 'Reviewing DSA Progress & Stats'
          : `Browsing ${activeNavTab}`;

        const currentPathStr = isMatchActive
          ? `/arena/${roomId || 'active'}`
          : activeNavTab === 'problems'
          ? `/problems/${currentProblem?.id || '1'}`
          : `/${activeNavTab}`;

        const res = await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'heartbeat',
            user: currentUser,
            telemetry: {
              currentPath: currentPathStr,
              currentAction: currentActionDesc,
              device: typeof window !== 'undefined' && window.innerWidth < 768 ? 'Mobile' : 'Desktop',
            },
          }),
        });
        const data = await res.json();
        if (data.onlineUserIds) {
          setOnlineUserIds(data.onlineUserIds);
        }

        // Check incoming challenge invitation
        if (data.incomingInvite) {
          setIncomingInvite((prev) => {
            if (!prev || prev.id !== data.incomingInvite.id) {
              if (soundEnabled) sounds.playMatchFound();
            }
            return data.incomingInvite;
          });
        } else {
          setIncomingInvite(null);
        }

        // Check status of outgoing challenge
        if (outgoingInvite) {
          if (data.outgoingInvite) {
            const out: ChallengeInvite = data.outgoingInvite;
            if (out.status === 'accepted') {
              setOutgoingStatusMsg(`${out.toUserName} accepted! Launching 1v1 arena...`);
              setTimeout(() => {
                setOutgoingInvite(null);
                setRoomId(out.roomId);
                setOpponent({
                  id: out.toUserId,
                  name: out.toUserName,
                  avatar: '',
                  elo: 1000,
                  isTyping: false,
                  currentQuestionIndex: 0,
                  scores: {},
                  passedCount: {},
                  totalTests: {},
                  code: {},
                  language: 'python',
                  lastActive: Date.now(),
                });
                setTimeRemaining(2700);
                setIsMatchActive(true);
                setActiveNavTab('arena');
                if (soundEnabled) sounds.playMatchFound();
              }, 1200);
            } else if (out.status === 'declined') {
              setOutgoingStatusMsg(`${out.toUserName} declined the challenge.`);
              setTimeout(() => {
                setOutgoingInvite(null);
              }, 2500);
            } else if (out.status === 'expired') {
              setOutgoingStatusMsg('Challenge timed out with no response.');
              setTimeout(() => {
                setOutgoingInvite(null);
              }, 2500);
            }
          }
        }
      } catch {
        // Silently continue
      }
    };

    pollPresence();
    const presenceInterval = setInterval(pollPresence, 3500);
    return () => clearInterval(presenceInterval);
  }, [currentUser, outgoingInvite, soundEnabled]);

  // Match Timer
  useEffect(() => {
    if (!isMatchActive || activeNavTab !== 'arena') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleMatchEnd(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMatchActive, activeNavTab]);

  // Opponent contest activity simulation (when sparring against a challenged contestant)
  useEffect(() => {
    if (!isMatchActive || activeNavTab !== 'arena' || !opponent.id || opponent.id === 'opp-waiting') return;

    // Periodic opponent typing indicator
    const typingInterval = setInterval(() => {
      setOpponent((prev) => ({
        ...prev,
        isTyping: Math.random() > 0.45,
      }));
    }, 4500);

    // Opponent problem solving pace
    const solveTimers: NodeJS.Timeout[] = [];
    if (contestProblems.length > 0) {
      // Problem 1 solved after 40s
      solveTimers.push(
        setTimeout(() => {
          const p = contestProblems[0];
          setOpponent((prev) => ({
            ...prev,
            scores: { ...prev.scores, [p.id]: p.points },
            passedCount: { ...prev.passedCount, [p.id]: p.testCases.length },
            code: {
              ...prev.code,
              [p.id]: `# Solution submitted by rival (${prev.name})\n${p.starterCode.python}\n        # Optimal algorithmic approach\n        # Verified: Passed ${p.testCases.length}/${p.testCases.length} test cases`,
            },
            currentQuestionIndex: Math.min(1, contestProblems.length - 1),
          }));
        }, 40000)
      );

      // Problem 2 solved after 95s
      if (contestProblems.length > 1) {
        solveTimers.push(
          setTimeout(() => {
            const p = contestProblems[1];
            setOpponent((prev) => ({
              ...prev,
              scores: { ...prev.scores, [p.id]: p.points },
              passedCount: { ...prev.passedCount, [p.id]: p.testCases.length },
              code: {
                ...prev.code,
                [p.id]: `# Solution submitted by rival (${prev.name})\n${p.starterCode.python}\n        # Optimal algorithmic approach\n        # Verified: Passed ${p.testCases.length}/${p.testCases.length} test cases`,
              },
              currentQuestionIndex: Math.min(2, contestProblems.length - 1),
            }));
          }, 95000)
        );
      }

      // Problem 3 solved after 180s
      if (contestProblems.length > 2) {
        solveTimers.push(
          setTimeout(() => {
            const p = contestProblems[2];
            setOpponent((prev) => ({
              ...prev,
              scores: { ...prev.scores, [p.id]: p.points },
              passedCount: { ...prev.passedCount, [p.id]: p.testCases.length },
              code: {
                ...prev.code,
                [p.id]: `# Solution submitted by rival (${prev.name})\n${p.starterCode.python}\n        # Optimal algorithmic approach\n        # Verified: Passed ${p.testCases.length}/${p.testCases.length} test cases`,
              },
              currentQuestionIndex: Math.min(3, contestProblems.length - 1),
            }));
          }, 180000)
        );
      }
    }

    return () => {
      clearInterval(typingInterval);
      solveTimers.forEach((t) => clearTimeout(t));
    };
  }, [isMatchActive, activeNavTab, opponent.id, contestProblems]);

  // Typing indicator
  const handleCodeChange = (newCode: string | undefined) => {
    const val = newCode || '';
    setCodes((prev) => ({ ...prev, [currentProblem.id]: val }));

    if (!player.isTyping) {
      setPlayer((prev) => ({ ...prev, isTyping: true }));
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setPlayer((prev) => ({ ...prev, isTyping: false }));
    }, 1500);
  };

  // Language switch
  const handleLanguageChange = (newLang: Language) => {
    setSelectedLanguage(newLang);
    setCodes((prev) => ({
      ...prev,
      [currentProblem.id]: currentProblem.starterCode[newLang],
    }));
    setResults(null);
    setCompileError(null);
  };

  // Reset current question code
  const handleResetCode = () => {
    setCodes((prev) => ({
      ...prev,
      [currentProblem.id]: currentProblem.starterCode[selectedLanguage],
    }));
    setResults(null);
    setCompileError(null);
  };

  // Run Code
  const handleRunCode = async () => {
    if (isExecuting || !currentUser) return;
    setIsExecuting(true);
    setCompileError(null);

    try {
      const res = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          code: currentCode,
          problemId: currentProblem.id,
          user: { id: currentUser.id, name: currentUser.name, handle: currentUser.handle },
          isSubmission: false,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setCompileError(data.details || data.error || 'Execution failed');
        sounds.playFail();
        return;
      }

      if (data.compileError) {
        setCompileError(data.compileError);
        sounds.playFail();
        return;
      }

      setResults(data.results);

      const updatedPassed = {
        ...player.passedCount,
        [currentProblem.id]: data.passedCount,
      };

      const updatedScores = { ...player.scores };
      if (data.allPassed) {
        sounds.playPass();
        updatedScores[currentProblem.id] = currentProblem.points;
        if (!solvedProblemIds.includes(currentProblem.id)) {
          setSolvedProblemIds((prev) => [...prev, currentProblem.id]);
        }
      } else if (data.passedCount > 0) {
        sounds.playPass();
      } else {
        sounds.playFail();
      }

      const updatedCodeMap = {
        ...player.code,
        [currentProblem.id]: currentCode,
      };

      setPlayer((prev) => ({
        ...prev,
        passedCount: updatedPassed,
        scores: updatedScores,
        code: updatedCodeMap,
      }));

      // Sync submission to Room API
      await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          roomId,
          player: { id: currentUser.id },
          problemId: currentProblem.id,
          code: currentCode,
          score: data.allPassed ? currentProblem.points : 0,
          passedCount: data.passedCount,
          totalTests: currentProblem.testCases.length,
        }),
      });

      // Check if all problems solved
      const allSolved = contestProblems.every((p) => (updatedScores[p.id] || 0) > 0);
      if (allSolved) {
        handleMatchEnd(currentUser.id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown network error';
      setCompileError(msg);
      sounds.playFail();
    } finally {
      setIsExecuting(false);
    }
  };

  // LeetCode Submit Code
  const handleSubmitCode = async () => {
    if (isSubmitting || isExecuting || !currentUser) return;
    setIsSubmitting(true);
    setCompileError(null);

    try {
      const res = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          code: currentCode,
          problemId: currentProblem.id,
          user: { id: currentUser.id, name: currentUser.name, handle: currentUser.handle },
          isSubmission: true,
        }),
      });

      const data = await res.json();

      let status: 'Accepted' | 'Wrong Answer' | 'Compile Error' = 'Wrong Answer';
      if (!res.ok || data.error || data.compileError) {
        status = 'Compile Error';
        setCompileError(data.compileError || data.details || data.error || 'Execution failed');
        sounds.playFail();
      } else if (data.allPassed) {
        status = 'Accepted';
        sounds.playPass();
        setResults(data.results);
      } else {
        status = 'Wrong Answer';
        sounds.playFail();
        setResults(data.results);
      }

      const totalMs = data.totalRuntimeMs || Math.floor(25 + Math.random() * 25);
      const subRecord: SubmissionRecord = {
        id: `sub-${Date.now()}`,
        problemId: currentProblem.id,
        problemTitle: currentProblem.title,
        language: selectedLanguage,
        status,
        runtimeMs: Math.max(1, Math.round(totalMs)),
        memoryMb: Number((15.4 + Math.random() * 2.1).toFixed(1)),
        runtimePercentile: Math.floor(86 + Math.random() * 12),
        memoryPercentile: Math.floor(78 + Math.random() * 18),
        passedCount: data.passedCount || 0,
        totalCount: data.totalCount || currentProblem.testCases.length,
        timestamp: Date.now(),
        code: currentCode,
      };

      saveSubmission(subRecord);
      setCurrentSubmission(subRecord);
      setIsSubmissionModalOpen(true);

      if (data.allPassed) {
        if (!solvedProblemIds.includes(currentProblem.id)) {
          const nextSolved = [...solvedProblemIds, currentProblem.id];
          setSolvedProblemIds(nextSolved);
          if (typeof window !== 'undefined') {
            localStorage.setItem('codeclash_solved_ids', JSON.stringify(nextSolved));
          }
        }

        const updatedPassed = {
          ...player.passedCount,
          [currentProblem.id]: data.passedCount,
        };
        const updatedScores = {
          ...player.scores,
          [currentProblem.id]: currentProblem.points,
        };
        const updatedCodeMap = {
          ...player.code,
          [currentProblem.id]: currentCode,
        };

        const updatedPlayer = {
          ...player,
          passedCount: updatedPassed,
          scores: updatedScores,
          code: updatedCodeMap,
        };
        setPlayer(updatedPlayer);

        try {
          await fetch('/api/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'submit',
              roomId,
              player: { id: currentUser.id },
              problemId: currentProblem.id,
              code: currentCode,
              score: currentProblem.points,
              passedCount: data.passedCount,
              totalTests: currentProblem.testCases.length,
            }),
          });
        } catch {}

        const allSolved = contestProblems.every((p) => (updatedScores[p.id] || 0) > 0);
        if (allSolved) {
          handleMatchEnd(currentUser.id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown network error';
      setCompileError(msg);
      sounds.playFail();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Match end
  const handleMatchEnd = async (winId: string | null) => {
    setIsMatchActive(false);
    setWinnerId(winId);

    const elapsed = startTime > 0 ? Math.max(1, Math.round((Date.now() - startTime) / 1000)) : 1;
    setMatchDuration(elapsed);

    const isWin = winId === currentUser?.id;
    if (isWin) {
      sounds.playVictory();
    } else {
      sounds.playFail();
    }

    setIsVictoryModalOpen(true);

    if (currentUser) {
      const pScore = Object.values(player.scores).reduce((a, b) => a + b, 0);
      const oScore = Object.values(opponent.scores).reduce((a, b) => a + b, 0);
      const outcome = isWin ? 'Won' : (winId ? 'Lost' : (pScore > oScore ? 'Won' : (pScore < oScore ? 'Lost' : 'Draw')));
      const delta = outcome === 'Won' ? '+25 ELO' : (outcome === 'Lost' ? '-12 ELO' : '+0 ELO');
      
      recordMatchResult(currentUser.id, outcome === 'Won', 25);
      saveMatchRecord({
        id: `match_${Date.now()}`,
        opponent: opponent.name || 'Opponent',
        opponentHandle: (opponent.name || 'rival').toLowerCase().replace(/\s+/g, '_'),
        outcome,
        delta,
        playerScore: pScore,
        opponentScore: oScore,
        time: 'Just now',
      });

      // Update local state copy of currentUser
      const updatedUser = getCurrentUser();
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    }

    try {
      await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end',
          roomId,
          winnerId: winId,
        }),
      });
    } catch {
      // Ignore
    }
  };

  // Rematch request
  const handleRequestRematch = async () => {
    if (!currentUser) return;
    try {
      await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: rematchRequestedBy === opponent.id ? 'rematch-accept' : 'rematch-request',
          roomId,
          player: { id: currentUser.id },
        }),
      });

      if (rematchRequestedBy === opponent.id) {
        resetContestState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetContestState = () => {
    setTimeRemaining(2700);
    setIsMatchActive(true);
    setWinnerId(null);
    setRematchRequestedBy(null);
    setStartTime(Date.now());
    setIsVictoryModalOpen(false);
    setIsInspectorModalOpen(false);
    setResults(null);
    setCompileError(null);
    setPlayer((prev) => ({
      ...prev,
      scores: {},
      passedCount: {},
      code: {},
    }));
  };

  // Initiate consent-based 1v1 challenge from Leaderboard
  const handleInitiateLeaderboardChallenge = async (targetUser: User) => {
    if (!currentUser) return;

    // Fresh 5 randomized contest problems
    const freshProblems = getRandomContestProblems();
    setContestProblems(freshProblems);
    setCurrentProblemIndex(0);

    const initialCodes: Record<string, string> = {};
    freshProblems.forEach((p) => {
      initialCodes[p.id] = p.starterCode[selectedLanguage] || p.starterCode.python;
    });
    setCodes(initialCodes);

    const rid = `CLASH-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomId(rid);

    // Register room in API
    try {
      await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          roomId: rid,
          player: {
            ...player,
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatarUrl || '',
            elo: currentUser.elo || 1000,
          },
          problems: freshProblems,
        }),
      });
    } catch {}

    // Send challenge request via Presence API
    try {
      const res = await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_challenge',
          fromUser: currentUser,
          toUser: targetUser,
          roomId: rid,
        }),
      });
      const data = await res.json();
      if (data.challenge) {
        setOutgoingInvite(data.challenge);
        setOutgoingStatusMsg(`Waiting for ${targetUser.name} to accept...`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // User B accepts incoming challenge
  const handleAcceptIncomingChallenge = async (inv: ChallengeInvite) => {
    if (!currentUser) return;
    try {
      await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond_challenge',
          challengeId: inv.id,
          response: 'accept',
        }),
      });

      // Join the room
      await joinExistingRoom(inv.roomId, currentUser);

      // Set opponent as challenger
      setOpponent({
        id: inv.fromUser.id,
        name: inv.fromUser.name,
        avatar: inv.fromUser.avatarUrl || '',
        elo: inv.fromUser.elo || 1000,
        isTyping: false,
        currentQuestionIndex: 0,
        scores: {},
        passedCount: {},
        totalTests: {},
        code: {},
        language: 'python',
        lastActive: Date.now(),
      });

      setRoomId(inv.roomId);
      setIncomingInvite(null);
      setTimeRemaining(2700);
      setIsMatchActive(true);
      setActiveNavTab('arena');
      if (soundEnabled) sounds.playMatchFound();
    } catch (e) {
      console.error(e);
    }
  };

  // User B declines incoming challenge
  const handleDeclineIncomingChallenge = async (inv: ChallengeInvite) => {
    try {
      await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond_challenge',
          challengeId: inv.id,
          response: 'decline',
        }),
      });
    } catch {}
    setIncomingInvite(null);
  };

  // User A cancels outgoing challenge
  const handleCancelOutgoingChallenge = async () => {
    if (outgoingInvite) {
      try {
        await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'cancel_challenge',
            challengeId: outgoingInvite.id,
          }),
        });
      } catch {}
    }
    setOutgoingInvite(null);
  };

  // Solve a specific problem from Problems directory
  const handleSolveProblemFromDirectory = (prob: Problem) => {
    setContestProblems([prob, ...PROBLEMS.filter((p) => p.id !== prob.id).slice(0, 4)]);
    setCurrentProblemIndex(0);
    setActiveNavTab('arena');
    setResults(null);
    setCompileError(null);
  };

  // 1v1 Matchmaking Queue Handler
  const handleMatchFound = (
    matchedRoomId: string,
    opp: { name: string; handle: string; elo: number; avatarUrl?: string },
    problems?: Problem[]
  ) => {
    setRoomId(matchedRoomId);
    setOpponent({
      id: `peer-${opp.handle}`,
      name: opp.name,
      avatar: opp.avatarUrl || '',
      elo: opp.elo,
      isTyping: false,
      currentQuestionIndex: 0,
      scores: {},
      passedCount: {},
      totalTests: {},
      code: {},
      language: 'python',
      lastActive: Date.now(),
    });
    if (problems && problems.length > 0) {
      setContestProblems(problems);
      setCurrentProblemIndex(0);
    }
    setTimeRemaining(2700);
    setIsMatchActive(true);
    setActiveNavTab('arena');
    setIsMatchmakingModalOpen(false);
    if (soundEnabled) sounds.playMatchFound();
  };

  // If Auth check still running on client mount - Aceternity Spotlight + LayoutTextFlip
  if (!isAuthLoaded) {
    return (
      <div className="relative h-screen w-screen flex flex-col items-center justify-center bg-black overflow-hidden antialiased px-4">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-2xl space-y-5">
          <div className="relative mx-4 flex flex-col items-center justify-center gap-4 text-center sm:mx-0 sm:flex-row">
            <LayoutTextFlip
              text="Welcome to "
              words={["Code Clash", "The Arena", "1v1 Duels", "DSA Mastery"]}
              duration={1400}
            />
          </div>
          <p className="text-center text-sm sm:text-base text-neutral-400 font-sans tracking-wide max-w-lg leading-relaxed">
            Experience the power of modern UI components that bring your ideas to life.
          </p>

          {/* Elegant Loading Progress & Skip */}
          <div className="pt-6 flex flex-col items-center gap-2.5">
            <div className="w-48 h-1 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/80">
              <div className="h-full bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
            <button
              onClick={() => {
                setIsAuthLoaded(true);
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('codeclash_welcome_seen', 'true');
                }
              }}
              className="text-[11px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer pt-1"
            >
              Skip &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If User is not signed in, show Auth View
  if (!currentUser) {
    return <AuthView onAuthenticated={handleAuthenticated} initialInviteCode={urlInviteCode} />;
  }

  const playerTotalScore = Object.values(player.scores).reduce((a, b) => a + b, 0);
  const opponentTotalScore = Object.values(opponent.scores).reduce((a, b) => a + b, 0);

  const bgClassMap: Record<MinimalBgStyle, string> = {
    dots: 'bg-minimal-dots',
    grid: 'bg-minimal-grid',
    clean: 'bg-minimal-clean',
    dark: 'bg-minimal-dark text-zinc-100',
  };

  return (
    <div
      className={`h-screen w-screen flex flex-col ${
        bgClassMap[bgStyle] || 'bg-minimal-dots'
      } ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'} overflow-hidden select-none transition-colors duration-300`}
    >
      {/* Top Navbar with Navigation Tabs */}
      <Navbar
        user={currentUser}
        activeTab={activeNavTab}
        onTabChange={(tab) => setActiveNavTab(tab)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          sounds.enabled = !soundEnabled;
          setSoundEnabled(!soundEnabled);
        }}
        onOpenLobby={() => setIsLobbyModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        roomId={roomId}
        bgStyle={bgStyle}
        onCycleBgStyle={handleCycleBgStyle}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onFindMatch={() => setIsMatchmakingModalOpen(true)}
        onlineCount={onlineUserIds.length || 1}
        onOpenSupportModal={(type) => setActiveSupportModal(type)}
      />

      {/* Main Tab View Routing */}
      {activeNavTab === 'dashboard' && (
        <DashboardView
          user={currentUser}
          onStart1v1={() => {
            setIsLobbyModalOpen(true);
          }}
          onOpenProblems={() => setActiveNavTab('problems')}
          onOpenLeaderboard={() => setActiveNavTab('leaderboard')}
          onDirectShare={() => setIsShareModalOpen(true)}
          onFindMatch={() => setIsMatchmakingModalOpen(true)}
          solvedProblemIds={solvedProblemIds}
          onSelectProblemToSolve={handleSolveProblemFromDirectory}
          onReportViolation={() => setIsViolationModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onSelectUserName={handleOpenPublicProfile}
        />
      )}

      {activeNavTab === 'problems' && (
        <ProblemsView
          onSelectProblemToSolve={handleSolveProblemFromDirectory}
          solvedProblemIds={solvedProblemIds}
        />
      )}

      {activeNavTab === 'leaderboard' && (
        <LeaderboardView
          currentUser={currentUser}
          onChallengeUser={handleInitiateLeaderboardChallenge}
          onSelectUser={handleOpenPublicProfile}
          onOpenShareInvite={() => setIsShareModalOpen(true)}
          onlineUserIds={onlineUserIds}
          solvedProblemIds={solvedProblemIds}
          onNavigateToDaily={() => setActiveNavTab('arena')}
        />
      )}

      {activeNavTab === 'arena' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 5-Question Contest Switcher & Live Scoreboard */}
          <ContestBar
            problems={contestProblems}
            currentIndex={currentProblemIndex}
            onSelectProblem={(idx) => {
              setCurrentProblemIndex(idx);
              setResults(null);
              setCompileError(null);
            }}
            playerScores={player.scores}
            opponentScores={opponent.scores}
            playerTotalScore={playerTotalScore}
            opponentTotalScore={opponentTotalScore}
            opponentName={opponent.name}
            opponentIsTyping={opponent.isTyping}
            opponentCurrentIndex={opponent.currentQuestionIndex}
          />

          {/* Arena Subheader: Problem Title, Timer & Contestants */}
          <ArenaHeader
            problem={currentProblem}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            timeRemainingSeconds={timeRemaining}
            player={player}
            opponent={opponent}
            onInviteFriend={() => setIsShareModalOpen(true)}
          />

          {/* Mobile Arena Tab Switcher (Visible on mobile/small screens) */}
          <div className="md:hidden flex items-center border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 gap-1 shrink-0">
            <button
              onClick={() => setMobileArenaTab('problem')}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mobileArenaTab === 'problem'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <span>Problem</span>
            </button>
            <button
              onClick={() => setMobileArenaTab('code')}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mobileArenaTab === 'code'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <span>Code Editor</span>
            </button>
            <button
              onClick={() => setMobileArenaTab('results')}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all relative ${
                mobileArenaTab === 'results'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <span>Test Results</span>
              {results && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00b8a3]" />
              )}
            </button>
          </div>

          {/* Mobile Single Tab View (< md) */}
          <div className="md:hidden flex-1 overflow-hidden">
            {mobileArenaTab === 'problem' && (
              <div className="h-full overflow-y-auto pb-24 bg-white dark:bg-zinc-950">
                <ProblemPanel problem={currentProblem} />
              </div>
            )}
            {mobileArenaTab === 'code' && (
              <div className="h-full flex flex-col overflow-hidden pb-16 bg-white dark:bg-zinc-950">
                <CodeEditor
                  language={selectedLanguage}
                  code={currentCode}
                  onChange={handleCodeChange}
                  onResetCode={handleResetCode}
                  onRunCode={handleRunCode}
                  onSubmitCode={handleSubmitCode}
                  isExecuting={isExecuting}
                  isSubmitting={isSubmitting}
                  theme={theme}
                />
              </div>
            )}
            {mobileArenaTab === 'results' && (
              <div className="h-full overflow-y-auto pb-24 bg-white dark:bg-zinc-950">
                <TestResultPanel
                  results={results}
                  compileError={compileError}
                  isExecuting={isExecuting || isSubmitting}
                  problemTestCases={currentProblem.testCases}
                />
              </div>
            )}
          </div>

          {/* Desktop Dual-Pane Split Screen (>= md) */}
          <main className="hidden md:grid flex-1 grid-cols-2 overflow-hidden">
            {/* Left: Problem Panel */}
            <div className="h-full overflow-hidden border-r border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <ProblemPanel problem={currentProblem} />
            </div>

            {/* Right: Monaco Editor & Test Results */}
            <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-zinc-950">
              <div className="flex-1 min-h-[50%] overflow-hidden">
                <CodeEditor
                  language={selectedLanguage}
                  code={currentCode}
                  onChange={handleCodeChange}
                  onResetCode={handleResetCode}
                  onRunCode={handleRunCode}
                  onSubmitCode={handleSubmitCode}
                  isExecuting={isExecuting}
                  isSubmitting={isSubmitting}
                  theme={theme}
                />
              </div>

              <div className="shrink-0 border-t border-zinc-200/80 dark:border-zinc-800">
                <TestResultPanel
                  results={results}
                  compileError={compileError}
                  isExecuting={isExecuting || isSubmitting}
                  problemTestCases={currentProblem.testCases}
                />
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Modals */}
      <VictoryModal
        isOpen={isVictoryModalOpen}
        isWinner={winnerId === currentUser.id || playerTotalScore > opponentTotalScore}
        timeTakenSeconds={matchDuration}
        eloChange={playerTotalScore >= opponentTotalScore ? 28 : -14}
        newElo={currentUser.elo + (playerTotalScore >= opponentTotalScore ? 28 : -14)}
        onOpenInspector={() => {
          setIsVictoryModalOpen(false);
          setIsInspectorModalOpen(true);
        }}
        onRematch={handleRequestRematch}
        onClose={() => setIsVictoryModalOpen(false)}
      />

      <SolutionInspectorModal
        isOpen={isInspectorModalOpen}
        onClose={() => setIsInspectorModalOpen(false)}
        problems={contestProblems}
        player={player}
        opponent={opponent}
        winnerId={winnerId}
        onRequestRematch={handleRequestRematch}
        rematchRequestedBy={rematchRequestedBy}
        theme={theme}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        user={currentUser}
        onClose={() => setIsProfileModalOpen(false)}
        onUpdate={(updated) => {
          setCurrentUser(updated);
          setPlayer((prev) => ({
            ...prev,
            name: updated.name,
            avatar: updated.avatarUrl || '',
          }));
        }}
        onSignOut={handleSignOut}
      />

      <PublicProfileModal
        isOpen={isPublicProfileModalOpen}
        onClose={() => setIsPublicProfileModalOpen(false)}
        targetUser={publicProfileTarget}
        currentUser={currentUser}
        onChallengeUser={handleInitiateLeaderboardChallenge}
      />

      <LobbyModal
        isOpen={isLobbyModalOpen}
        user={currentUser}
        onClose={() => setIsLobbyModalOpen(false)}
        onStartContest={(rid, diff) => {
          setRoomId(rid);
          createInitialRoom(rid, currentUser, diff);
          resetContestState();
          setActiveNavTab('arena');
        }}
      />

      <ShareInviteModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomId={roomId}
      />

      {/* Instant 1v1 Matchmaking Queue Radar Modal */}
      <MatchmakingModal
        isOpen={isMatchmakingModalOpen}
        user={currentUser}
        onClose={() => setIsMatchmakingModalOpen(false)}
        onMatchFound={handleMatchFound}
      />

      {/* LeetCode Official Submission Evaluation & Beats Percentile Modal */}
      <SubmissionResultModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        submission={currentSubmission}
        onNextProblem={() => {
          if (currentProblemIndex < contestProblems.length - 1) {
            setCurrentProblemIndex(currentProblemIndex + 1);
            setResults(null);
            setCompileError(null);
          }
        }}
      />

      {/* 1v1 Peer Challenge Consent Modals */}
      <IncomingChallengeModal
        invite={incomingInvite}
        onAccept={handleAcceptIncomingChallenge}
        onDecline={handleDeclineIncomingChallenge}
      />

      <OutgoingChallengeModal
        invite={outgoingInvite}
        statusMessage={outgoingStatusMsg}
        onCancel={handleCancelOutgoingChallenge}
      />

      <ViolationReportModal
        isOpen={isViolationModalOpen}
        onClose={() => setIsViolationModalOpen(false)}
        reportedUser={opponent?.name !== 'Friend (Invite to Join)' ? opponent?.name : undefined}
      />

      {/* InvertisPrep Support Modals (Contact, Bug Report, FAQs, About, Socials) */}
      <SupportModals
        type={activeSupportModal}
        onClose={() => setActiveSupportModal(null)}
        userEmail={currentUser?.email}
      />

      <CustomCursor />
    </div>
  );
}
