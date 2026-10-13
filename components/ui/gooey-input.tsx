'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GooeyInputProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  className?: string;
  collapsedWidth?: number;
  expandedWidth?: number;
  gooeyBlur?: number;
  autoFocus?: boolean;
}

export function GooeyInput({
  placeholder = 'Search...',
  value,
  defaultValue = '',
  onChange,
  onValueChange,
  onClear,
  className,
  collapsedWidth = 44,
  expandedWidth = 360,
  gooeyBlur = 4,
  autoFocus = false,
}: GooeyInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const filterId = React.useId().replace(/:/g, '');

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
    onValueChange?.(e.target.value);
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    onValueChange?.('');
    onClear?.();
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  const handleToggle = () => {
    if (isOpen && currentValue === '') {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {/* SVG Gooey Filter Definition */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id={`gooey-filter-${filterId}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation={gooeyBlur} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Main Container with Gooey Filter Applied */}
      <div
        className="relative flex items-center"
        style={{ filter: `url(#gooey-filter-${filterId})` }}
      >
        <motion.div
          animate={{
            width: isOpen ? expandedWidth : collapsedWidth,
          }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 30,
            mass: 0.8,
          }}
          className={cn(
            'relative h-11 rounded-full flex items-center overflow-hidden cursor-pointer select-none',
            'bg-neutral-900 dark:bg-stone-100 text-neutral-100 dark:text-stone-900 shadow-md',
            isOpen ? 'px-3 cursor-text' : 'justify-center'
          )}
          onClick={() => {
            if (!isOpen) setIsOpen(true);
          }}
        >
          {/* Search Icon Trigger / Indicator */}
          <motion.div
            layout
            className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full"
            onClick={(e) => {
              if (isOpen && currentValue === '') {
                e.stopPropagation();
                setIsOpen(false);
              }
            }}
          >
            <Search className="w-4 h-4 text-neutral-300 dark:text-stone-700 hover:scale-110 transition-transform" />
          </motion.div>

          {/* Expanded Input Field */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex items-center flex-1 ml-2 pr-1"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={currentValue}
                  onChange={handleChange}
                  placeholder={placeholder}
                  autoFocus={autoFocus}
                  className="w-full bg-transparent border-none outline-hidden text-xs sm:text-sm font-sans placeholder:text-neutral-400 dark:placeholder:text-stone-500 text-neutral-100 dark:text-stone-900 focus:ring-0 focus:outline-hidden"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      if (currentValue) {
                        handleClear();
                      } else {
                        setIsOpen(false);
                      }
                    }
                  }}
                  onBlur={() => {
                    if (currentValue === '') {
                      setIsOpen(false);
                    }
                  }}
                />

                {/* Clear or Close Button */}
                {currentValue ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                    className="p-1 rounded-full hover:bg-white/10 dark:hover:bg-black/10 text-neutral-400 hover:text-white dark:hover:text-black transition-colors"
                    title="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="p-1 rounded-full hover:bg-white/10 dark:hover:bg-black/10 text-neutral-400 hover:text-white dark:hover:text-black transition-colors"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export function GooeyInputDemo() {
  return (
    <div className="flex h-40 w-full items-center justify-center">
      <GooeyInput placeholder="Search..." />
    </div>
  );
}
