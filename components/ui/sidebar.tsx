'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { PanelLeft, ChevronRight } from 'lucide-react';

interface SidebarContextType {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function SidebarProvider({
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  children,
  className,
}: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    else setInternalOpen(val);
  };

  const toggleSidebar = () => {
    if (isMobile) setOpenMobile(!openMobile);
    else setOpen(!open);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcut: Ctrl+B or Cmd+B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, openMobile, isMobile]);

  return (
    <SidebarContext.Provider
      value={{
        state: open ? 'expanded' : 'collapsed',
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }}
    >
      <div className={cn('flex h-full w-full overflow-hidden', className)}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  children,
  collapsible = 'icon',
  className,
}: {
  children: React.ReactNode;
  collapsible?: 'offcanvas' | 'icon' | 'none';
  className?: string;
}) {
  const { open } = useSidebar();

  return (
    <aside
      data-collapsible={open ? 'expanded' : collapsible}
      data-state={open ? 'expanded' : 'collapsed'}
      className={cn(
        'relative flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-200 ease-in-out shrink-0 select-none group',
        open ? 'w-64' : 'w-16',
        className
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarMenuText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = useSidebar();
  if (!open) return null;
  return <span className={cn('truncate', className)}>{children}</span>;
}

export function SidebarHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'p-3 border-b border-[#ece7dc] dark:border-[#282420] shrink-0',
        className
      )}
    >
      {children}
    </div>
  );
}

export function SidebarContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex-1 overflow-y-auto p-2 space-y-4', className)}>
      {children}
    </div>
  );
}

export function SidebarFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'p-3 border-t border-[#ece7dc] dark:border-[#282420] shrink-0',
        className
      )}
    >
      {children}
    </div>
  );
}

export function SidebarGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('space-y-1', className)}>{children}</div>;
}

export function SidebarGroupLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = useSidebar();
  if (!open) return null;

  return (
    <div
      className={cn(
        'px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-stone-400 dark:text-stone-500',
        className
      )}
    >
      {children}
    </div>
  );
}

export function SidebarMenu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('space-y-0.5', className)}>{children}</div>;
}

export function SidebarMenuItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('relative', className)}>{children}</div>;
}

export function SidebarMenuButton({
  isActive = false,
  onClick,
  children,
  className,
  tooltip,
}: {
  isActive?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  tooltip?: string;
}) {
  const { open } = useSidebar();

  return (
    <button
      type="button"
      onClick={onClick}
      title={!open ? tooltip : undefined}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer relative group/item',
        isActive
          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs'
          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60',
        !open && 'justify-center px-2',
        className
      )}
    >
      {children}
    </button>
  );
}

export function SidebarMenuBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = useSidebar();
  if (!open) return null;

  return (
    <span
      className={cn(
        'ml-auto px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
        className
      )}
    >
      {children}
    </span>
  );
}

export function SidebarTrigger({
  className,
}: {
  className?: string;
}) {
  const { toggleSidebar, open } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      title="Toggle Sidebar (Ctrl+B)"
      className={cn(
        'p-1.5 rounded-lg border border-[#e3ded4] dark:border-[#2d2925] hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer',
        className
      )}
    >
      <PanelLeft className="w-4 h-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
}

export function SidebarRail({
  className,
}: {
  className?: string;
}) {
  const { toggleSidebar } = useSidebar();

  return (
    <div
      onClick={toggleSidebar}
      title="Click rail to toggle sidebar"
      className={cn(
        'absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 bg-transparent hover:bg-amber-600/30 cursor-col-resize transition-all',
        className
      )}
    />
  );
}

export function SidebarInset({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn('flex-1 flex flex-col h-full overflow-hidden', className)}>
      {children}
    </main>
  );
}
