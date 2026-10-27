import { cn } from '@/lib/utils';
import { zh } from '@/lib/labels.mjs';

// 平台标识：同一形制的方形 mono 字标（不使用商店品牌 logo，保持中立与统一）
const GLYPH: Record<string, string> = { steam: 'ST', epic: 'EP', gog: 'GO', itch: 'IO', indiegala: 'IG', official: '官', 'xbox-pc': 'XB', other: '··' };

export function PlatformMark({ platform, className, withLabel }: { platform: string; className?: string; withLabel?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} title={zh('platform', platform)}>
      <span
        aria-hidden
        className="inline-grid h-[18px] min-w-[22px] place-items-center rounded-xs border border-current px-[3px] font-mono text-2xs font-semibold leading-none tracking-[0.04em]"
      >
        {GLYPH[platform] ?? platform.slice(0, 2).toUpperCase()}
      </span>
      {withLabel ? <span>{zh('platform', platform)}</span> : <span className="sr-only">{zh('platform', platform)}</span>}
    </span>
  );
}
