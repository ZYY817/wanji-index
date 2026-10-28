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
        'inline-flex h-9 items-center gap-1 overflow-x-auto rounded-sm border border-border bg-surface-2/60 p-1 no-scrollbar',
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
              'relative z-10 inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xs px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              isActive ? 'text-foreground' : 'text-fg-3 hover:text-foreground',
            )}
          >
            {tab.icon && <span aria-hidden className="shrink-0 [&_svg]:size-3.5">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count != null && (
              <span className={cn('font-mono text-2xs tabular-nums', isActive ? 'text-primary' : 'text-fg-3')}>
                ({tab.count})
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId={reducedMotion ? undefined : 'nova-active-tab-pill'}
                className="absolute inset-0 -z-10 rounded-xs border border-border-strong bg-card shadow-xs"
                transition={{ type: 'spring', stiffness: 480, damping: 36 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
