'use client';
import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  count?: number;
  icon?: React.ReactNode;
}

export function NovaTabs({
  items,
  activeId,
  onChange,
  className,
}: {
  items: readonly TabItem[] | TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <nav
      role="tablist"
      aria-label="Categories"
      className={cn(
        'inline-flex h-9 items-center gap-0.5 overflow-x-auto rounded-full bg-white/[0.07] p-[3px] no-scrollbar',
        className,
      )}
    >
      {items.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative z-10 inline-flex h-[30px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              isActive ? 'text-foreground' : 'text-fg-2 hover:text-foreground',
            )}
          >
            {tab.icon && <span aria-hidden className="shrink-0 [&_svg]:size-3.5">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count != null && (
              <span className={cn('tabular text-2xs tabular-nums', isActive ? 'text-fg-2' : 'text-fg-3')}>
                {tab.count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId={reducedMotion ? undefined : 'nova-active-tab-pill'}
                className="absolute inset-0 -z-10 rounded-full bg-white/[0.14] shadow-[0_1px_3px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]"
                transition={{ type: 'spring', stiffness: 480, damping: 36 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
