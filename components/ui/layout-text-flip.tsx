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
