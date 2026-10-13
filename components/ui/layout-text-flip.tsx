'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface LayoutTextFlipProps {
  text?: string;
  words: string[];
  duration?: number;
  className?: string;
  textClassName?: string;
  wordClassName?: string;
}

export function LayoutTextFlip({
  text = '',
  words = [],
  duration = 2000,
  className,
  textClassName,
  wordClassName,
}: LayoutTextFlipProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    if (!words || words.length === 0) return;
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words, duration]);

  const currentWord = words[currentWordIndex] || '';

  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-center justify-center font-bold text-3xl sm:text-5xl md:text-6xl tracking-tight text-neutral-100',
        className
      )}
    >
      {text && (
        <span className={cn('mr-2.5 text-neutral-300 dark:text-neutral-300', textClassName)}>
          {text}
        </span>
      )}

      <div className="relative inline-block overflow-hidden py-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord}
            initial={{
              opacity: 0,
              y: 28,
              filter: 'blur(8px)',
              rotateX: 90,
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              rotateX: 0,
            }}
            exit={{
              opacity: 0,
              y: -28,
              filter: 'blur(8px)',
              rotateX: -90,
            }}
            transition={{
              type: 'spring',
              stiffness: 280,
              damping: 24,
              mass: 0.8,
            }}
            className={cn(
              'inline-block bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-sm',
              wordClassName
            )}
          >
            {currentWord}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function LayoutTextFlipDemo() {
  return (
    <div>
      <motion.div className="relative mx-4 my-4 flex flex-col items-center justify-center gap-4 text-center sm:mx-0 sm:mb-0 sm:flex-row">
        <LayoutTextFlip
          text="Welcome to "
          words={["Aceternity UI", "Fight Club", "The Matrix", "The Jungle"]}
        />
      </motion.div>
      <p className="mt-4 text-center text-base text-neutral-600 dark:text-neutral-400">
        Experience the power of modern UI components that bring your ideas to life.
      </p>
    </div>
  );
}
