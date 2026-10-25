'use client';
import Link from 'next/link';
import type { OfferVM } from '@/lib/present';
import { Countdown, useNow } from '@/components/offer/countdown';
import { liveLifecycle } from '@/components/offer/use-lifecycle';

/** 速答条「现在免不免费」：按北京时间实时判定，严格输出 一行答案 + 一个动作（≥ 44px） */
export function OfferFact({ offers }: { offers: OfferVM[] }) {
  const now = useNow();
  const live = offers.find((o) => ['active', 'upcoming'].includes(liveLifecycle(o, now) ?? ''));

  if (!live) {
    return (
      <>
        <p className="truncate text-base font-medium text-fg-2">暂无免费活动</p>
        <Link
          href="/free/"
          className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm text-fg-2 underline decoration-border-strong underline-offset-4 hover:text-foreground"
        >
          查看免费雷达 ↗
        </Link>
      </>
    );
  }

  const lc = liveLifecycle(live, now);
  const isUpcoming = lc === 'upcoming';
  const target = isUpcoming ? live.startMs : live.endMs;

  return (
    <>
      <p className="flex items-center gap-2 truncate text-base font-medium text-foreground">
        <span className={isUpcoming ? 'text-info' : 'text-primary'}>
          {isUpcoming ? '即将免费' : '限时免费中'}
        </span>
        {target != null && (
          <span className="font-mono text-sm text-fg-2">
            <Countdown target={target} mode={isUpcoming ? 'start' : 'end'} size="sm" />
          </span>
        )}
      </p>
      <a
        href={live.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
      >
        {isUpcoming ? '查看活动 ↗' : '立即领取 ↗'}
      </a>
    </>
  );
}
