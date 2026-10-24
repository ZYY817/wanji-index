'use client';
import type { OfferVM } from '@/lib/present';
import { Countdown, useNow } from '@/components/offer/countdown';
import { liveLifecycle } from '@/components/offer/use-lifecycle';
import { ExtLink } from '@/components/ui/ext-link';

/** 速答条「现在免费吗」：按北京时间实时判定（构建时的状态可能已过期，所以放在客户端） */
export function OfferFact({ offers }: { offers: OfferVM[] }) {
  const now = useNow();
  const live = offers.find((o) => ['active', 'upcoming'].includes(liveLifecycle(o, now) ?? ''));
  if (!live) {
    return (
      <>
        <p className="text-lg leading-snug text-foreground">暂无免费活动</p>
        <p className="mt-1 text-sm text-fg-3">有新的限免会出现在这里</p>
      </>
    );
  }
  const lc = liveLifecycle(live, now);
  const target = lc === 'upcoming' ? live.startMs : live.endMs;
  return (
    <>
      <p className="text-lg leading-snug text-primary">{lc === 'upcoming' ? '即将免费' : '正在免费'}</p>
      <p className="mt-1 text-sm text-fg-2">
        {target != null ? <Countdown target={target} mode={lc === 'upcoming' ? 'start' : 'end'} size="sm" /> : live.title}
      </p>
      <ExtLink href={live.url} health={live.linkHealth} className="mt-2 inline-flex text-sm text-foreground underline decoration-primary underline-offset-4">
        去领取
      </ExtLink>
    </>
  );
}
