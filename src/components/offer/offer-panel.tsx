'use client';
import Link from 'next/link';
import type { OfferVM } from '@/lib/present';
import { zh } from '@/lib/labels.mjs';
import { LifecycleBadge, StatusBadge } from '@/components/ui/badge';
import { AcquireButton } from '@/components/ui/button';
import { PlatformMark } from '@/components/ui/platform-mark';
import { GameArt } from '@/components/game/game-art';
import { healthStatus } from '@/lib/status';
import { shDateTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import { Countdown } from './countdown';
import { Tilt } from '@/components/fx/interact';
import { isUrgent, liveLifecycle } from './use-lifecycle';

const CTA: Record<string, string> = { limited: '领取', weekend: '获取', trial: '获取', permanent: '获取', opensource: '下载' };

/** 免费情报卡（免费页 / 搜索等列表使用）。首页的卡组版本见 home/free-deck.tsx */
export function OfferPanel({ o, now, className }: { o: OfferVM; now: number | null; className?: string }) {
  return (
    <Tilt max={4} className={cn('h-full', className)}>
      <IndexOfferPanel o={o} now={now} className="h-full" />
    </Tilt>
  );
}

/** 免费页 / 游戏库：索引卡。阅读顺序 = 什么游戏 → 怎么领 → 还剩多久 → 去领取 */
function IndexOfferPanel({ o, now, className }: { o: OfferVM; now: number | null; className?: string }) {
  const lc = liveLifecycle(o, now);
  const urgent = isUrgent(o, lc, now);
  const ended = lc === 'ended';
  const statusTitle = ended ? '活动已结束' : lc === 'uncertain' ? '等待核验' : lc === 'deadline_unknown' ? '截止待确认' : null;
  const health = healthStatus(o.linkHealth);
  return (
    <article className={cn('group relative flex h-full flex-col border border-border bg-card transition-colors hover:border-border-strong', ended && 'opacity-60', className)}>
      <div className="relative aspect-[616/353] overflow-hidden">
        <GameArt src={[o.art?.capsule, o.art?.header, o.art?.hero]} name={o.gameName ?? o.title} seed={o.id} variant="wide" className="absolute inset-0" imgClassName="transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <LifecycleBadge value={lc} pulse />
          {health && <StatusBadge value={health} className="bg-background/80" />}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="flex items-center gap-2 text-sm text-fg-3">
          <PlatformMark platform={o.platform} withLabel />
          <span aria-hidden>·</span>
          {zh('freeType', o.type)}
        </p>
        <h3 className="mt-3 font-serif text-2xl font-bold leading-snug tracking-[-0.02em]">
          {o.gameSlug ? <Link href={`/games/${o.gameSlug}/`} className="transition-colors hover:text-primary">{o.title}</Link> : o.title}
        </h3>
        {o.claimNote && <p className="mt-2 text-sm leading-[1.7] text-fg-2">{o.claimNote}</p>}

        <div className="mt-6 border-t border-border pt-4">
          {lc === 'active' && o.endMs ? (
            <>
              <p className="text-xs text-fg-3">剩余时间</p>
              <Countdown target={o.endMs} now={now} className={cn('mt-2 text-[clamp(26px,2.2vw,34px)] font-medium leading-none tracking-[-0.04em]', urgent ? 'text-primary' : 'text-foreground')} />
            </>
          ) : lc === 'upcoming' && o.startMs ? (
            <>
              <p className="text-xs text-fg-3">距离开始</p>
              <Countdown target={o.startMs} mode="start" now={now} className="mt-2 text-[clamp(26px,2.2vw,34px)] font-medium leading-none tracking-[-0.04em] text-info" />
            </>
          ) : (
            <p className="font-serif text-2xl font-bold leading-none tracking-[-0.03em] text-foreground">
              {statusTitle ?? (o.type === 'opensource' ? '开源免费' : o.type === 'trial' ? '先玩再买' : '长期免费')}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <span className="text-xs text-fg-3">
            {o.endMs ? `截止 ${shDateTime(o.endMs)}` : o.startMs ? `开始 ${shDateTime(o.startMs)}` : `核验于 ${o.checkedAt}`}
          </span>
          {!ended && <AcquireButton href={o.url} health={o.linkHealth} label={CTA[o.type] ?? '获取'} size="sm" />}
        </div>
      </div>
    </article>
  );
}
