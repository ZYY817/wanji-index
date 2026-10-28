import * as React from 'react';
import { cn } from '@/lib/utils';
import { LIFECYCLE, STATUS, type LifecycleKey, type StatusKey } from '@/lib/status';
import { T } from '@/lib/i18n';

// 两套徽标形制严格分离：生命周期 = 实心色块（方角）；状态 = 描边（待核验为虚线描边）

export function LifecycleBadge({ value, className, pulse }: { value: string | null | undefined; className?: string; pulse?: boolean }) {
  const def = value ? LIFECYCLE[value as LifecycleKey] : null;
  if (!def) return null;
  return (
    <span
      data-slot="lifecycle-badge"
      className={cn('meta inline-flex h-[22px] items-center gap-1.5 rounded-xs px-2 font-semibold !tracking-[0.04em] text-on-solid', className)}
      style={{ background: def.tone }}
    >
      {pulse && value === 'active' && <span aria-hidden className="size-1.5 animate-blink rounded-full bg-on-solid" />}
      <T zh={def.label} en={def.en} />
    </span>
  );
}

export function StatusBadge({ value, className }: { value: string | null | undefined; className?: string }) {
  const def = value ? STATUS[value as StatusKey] : null;
  if (!def) return null;
  return (
    <span
      data-slot="status-badge"
      className={cn('meta inline-flex h-[22px] items-center rounded-xs border px-2 !tracking-[0.04em]', def.dashed && 'border-dashed', className)}
      style={{ color: def.tone, borderColor: def.tone }}
    >
      <T zh={def.label} en={def.en} />
    </span>
  );
}

export function Tag({ children, className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('inline-flex h-6 items-center rounded-xs bg-surface-2 px-2 text-xs text-fg-2', className)} {...rest}>
      {children}
    </span>
  );
}
