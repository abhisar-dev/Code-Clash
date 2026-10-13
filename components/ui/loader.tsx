'use client';
import React from 'react';
import { motion } from 'framer-motion';

export function LoaderOne() {
  return (
    <div className="relative flex flex-col items-center justify-center gap-6">
      {/* Dynamic Animated Core */}
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Outer glowing pulsing orb */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.15, 0.45, 0.15],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 via-sky-500/20 to-emerald-500/20 blur-xl pointer-events-none"
        />

        {/* Outer rotating dashed ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-20 h-20 rounded-full border border-dashed border-neutral-600/60 dark:border-neutral-500/40"
        />

        {/* Mid rotating gradient arc ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-14 h-14 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-500/60 dark:border-t-amber-400 dark:border-r-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
        />

        {/* Inner reverse rotating glowing pill ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-8 h-8 rounded-full border-2 border-transparent border-b-neutral-200 border-l-neutral-400"
        />

        {/* Center glowing pearl dot */}
        <motion.div
          animate={{
            scale: [0.85, 1.2, 0.85],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]"
        />
      </div>

      {/* Modern Aceternity Style Typography - Code Clash */}
      <div className="flex flex-col items-center gap-1.5 z-10 text-center select-none">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-[0.22em] uppercase text-neutral-100">
            Code Clash
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-ping" />
        </div>
        <p className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
          Loading platform assets...
        </p>
      </div>
    </div>
  );
}

export function LoaderOneDemo() {
  return <LoaderOne />;
}
