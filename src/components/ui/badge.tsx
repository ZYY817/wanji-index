import * as React from 'react';
import { cn } from '@/lib/utils';
import { LIFECYCLE, STATUS, type LifecycleKey, type StatusKey } from '@/lib/status';
import { T } from '@/lib/i18n';

// 两套徽标形制分离（V10）：生命周期 = 深色半透明胶囊 + 彩色圆点（压在图片上也清楚）；状态 = 彩色圆点 + 文字（无框）

export function LifecycleBadge({ value, className, pulse }: { value: string | null | undefined; className?: string; pulse?: boolean }) {
  const def = value ? LIFECYCLE[value as LifecycleKey] : null;
  if (!def) return null;
  return (
    <span
      data-slot="lifecycle-badge"
      className={cn('meta inline-flex h-6 items-center gap-1.5 rounded-full bg-black/55 px-2.5 font-medium text-foreground ring-1 ring-inset ring-white/10 [-webkit-backdrop-filter:blur(12px)] [backdrop-filter:blur(12px)]', className)}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', pulse && value === 'active' && 'animate-[neon_2s_ease-in-out_infinite]')} style={{ background: def.tone, boxShadow: `0 0 8px ${def.tone}` }} />
      <T zh={def.label} en={def.en} />
    </span>
  );
}

export function StatusBadge({ value, className }: { value: string | null | undefined; className?: string }) {
  const def = value ? STATUS[value as StatusKey] : null;
  if (!def) return null;
  return (
    <span data-slot="status-badge" className={cn('meta inline-flex items-center gap-1.5 text-fg-2', className)}>
      <span aria-hidden className={cn('size-1.5 rounded-full', def.dashed && 'ring-1 ring-current bg-transparent')} style={def.dashed ? { color: def.tone } : { background: def.tone }} />
      <T zh={def.label} en={def.en} />
    </span>
  );
}

export function Tag({ children, className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('inline-flex items-center text-xs text-fg-2', className)} {...rest}>
      {children}
    </span>
  );
}
