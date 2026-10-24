'use client';
import { motion, useTransform, type MotionValue } from 'motion/react';
import type { OfferVM } from '@/lib/present';
import { shDateTime, pad2 } from '@/lib/time';
import { cn } from '@/lib/utils';
import { isUrgent, liveLifecycle } from './use-lifecycle';

function tickDate(o: OfferVM) {
  const ms = o.endMs ?? o.startMs;
  return ms != null ? shDateTime(ms).split(' ')[0] : '∞';
}

function shortWhen(o: OfferVM | null) {
  if (!o) return '';
  if (o.endMs != null) return `截止 ${shDateTime(o.endMs)}`;
  if (o.startMs != null) return `开始 ${shDateTime(o.startMs)}`;
  return '无截止';
}

/**
 * 全宽时间轴：每个 offer 一枚刻度与日期，橙色 playhead 随横向进度移动。
 * 静态 / reduced-motion 版保留同样的刻度与当前项，只是不显示滚动 playhead。
 */
export function RadarTimeline({
  items, now, progress, activeIndex, moving = true, className,
}: {
  items: OfferVM[];
  now: number | null;
  progress: MotionValue<number>;
  activeIndex: number;
  moving?: boolean;
  className?: string;
}) {
  const playhead = useTransform(progress, [0, 1], ['0%', '100%']);
  const active = items[activeIndex] ?? items[0] ?? null;
  const activeLc = active ? liveLifecycle(active, now) : null;
  const activeUrgent = active ? isUrgent(active, activeLc, now) : false;
  const activeWhen = shortWhen(active);

  return (
    <div className={cn('relative w-full shrink-0 select-none', className)}>
      <div className="meta mb-2 flex items-center justify-between gap-4 text-2xs leading-none text-fg-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="whitespace-nowrap text-fg-2">时间轴 / TIMELINE</span>
          <span aria-hidden className="hidden h-px w-6 bg-border-strong sm:block" />
          <span className="hidden truncate sm:inline">{moving ? '纵向滚动 · 横向检索' : '横向滑动 · 查看全部'}</span>
        </span>
        <span className="flex shrink-0 items-center gap-4">
          {active && (
            <span className={cn('whitespace-nowrap', activeUrgent ? 'text-primary' : 'text-fg-2')}>
              T{pad2(activeIndex + 1)} <span className="hidden sm:inline">· {activeWhen}</span>
              <span className="sm:hidden">· {tickDate(active)}</span>
            </span>
          )}
          <span className="hidden text-fg-3 sm:inline">{pad2(items.length)} FRAMES</span>
        </span>
      </div>

      <div className="relative h-9">
        <span aria-hidden className="absolute inset-x-0 top-[7px] h-px bg-border-strong" />

        {moving && (
          <>
            <motion.span aria-hidden className="absolute left-0 top-[7px] h-px w-full origin-left bg-primary" style={{ scaleX: progress }} />
            <motion.span
              aria-hidden
              className="absolute top-0 z-10 flex -translate-x-1/2 flex-col items-center"
              style={{ left: playhead }}
            >
              <span className="h-0 w-0 border-x-[5px] border-t-[8px] border-x-transparent border-t-primary" />
              <span className="h-[15px] w-0.5 bg-primary shadow-[0_0_10px_rgba(255,107,44,0.65)]" />
              <span className="size-[5px] rotate-45 border border-primary bg-background" />
            </motion.span>
          </>
        )}

        <div
          className="absolute inset-x-0 top-0 grid h-9"
          style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}
        >
          {items.map((o, i) => {
            const lc = liveLifecycle(o, now);
            const urgent = isUrgent(o, lc, now);
            const isCurrent = i === activeIndex;
            return (
              <div key={o.id} className="relative h-9">
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-0 top-[4px] h-[7px] w-px',
                    isCurrent ? 'bg-primary' : urgent ? 'bg-primary/70' : 'bg-border-strong',
                  )}
                />
                {isCurrent && <span aria-hidden className="absolute left-0 top-[7px] h-px w-5 bg-primary/60" />}
                <span
                  className={cn(
                    'meta absolute left-1.5 top-[17px] hidden whitespace-nowrap text-2xs tracking-[0.08em] sm:block',
                    isCurrent ? (urgent ? 'text-primary' : 'text-foreground') : urgent ? 'text-primary' : 'text-fg-3',
                  )}
                >
                  {tickDate(o)}
                </span>
                <span
                  className={cn(
                    'meta absolute left-1.5 top-[17px] whitespace-nowrap text-2xs tracking-[0.08em] sm:hidden',
                    isCurrent ? 'text-foreground' : 'text-fg-3',
                  )}
                >
                  {pad2(i + 1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
