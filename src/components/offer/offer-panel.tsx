'use client';
import Link from 'next/link';
import type { OfferVM } from '@/lib/present';
import { zh } from '@/lib/labels.mjs';
import { LifecycleBadge, StatusBadge } from '@/components/ui/badge';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { AcquireButton } from '@/components/ui/button';
import { PlatformMark } from '@/components/ui/platform-mark';
import { GameArt } from '@/components/game/game-art';
import { healthStatus } from '@/lib/status';
import { shDateTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import { Countdown } from './countdown';
import { Tilt } from '@/components/fx/interact';
import { isUrgent, liveLifecycle } from './use-lifecycle';

// 按钮自带「↗」图标，文字里不再重复
const CTA: Record<string, string> = { limited: '领取', weekend: '获取', trial: '试玩', permanent: '领取', opensource: '下载' };
/** 即将开始的活动还不能领：按钮改为去活动页看看 */
const ctaOf = (o: OfferVM, lc: string | null) => (lc === 'upcoming' ? '活动页' : CTA[o.type] ?? '领取');

/** 免费大卡（限时领取 / 即将开始） */
export function OfferHeroCard({ o, now, className }: { o: OfferVM; now: number | null; className?: string }) {
  const lc = liveLifecycle(o, now);
  const urgent = isUrgent(o, lc, now);
  const isUpcoming = lc === 'upcoming';
  const mainTitle = o.titleZh ?? o.title;
  const health = healthStatus(o.linkHealth);

  return (
    <Tilt max={4} className={cn('h-full', className)}>
      <SpotlightCard
        as="article"
        className="group relative flex h-full flex-col overflow-hidden rounded-xs border border-border bg-card transition-colors hover:border-border-strong"
      >

        {/* 横幅图 */}
        <div className="edge-light relative aspect-[16/9] w-full overflow-hidden bg-shell">
          <GameArt
            src={[o.art?.header, o.art?.capsule, o.art?.hero]}
            name={o.gameName ?? o.title}
            seed={o.id}
            variant="wide"
            className="absolute inset-0"
            imgClassName="transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]"
          />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <LifecycleBadge value={lc} pulse />
            {health && <StatusBadge value={health} className="bg-background/80" />}
          </div>
          <div className="absolute bottom-3 right-3 rounded-xs bg-background/80 px-2 py-0.5 backdrop-blur-xs">
            <PlatformMark platform={o.platform} withLabel className="text-xs" />
          </div>
        </div>

        {/* 主体信息 */}
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="flex min-w-0 items-center gap-2 text-sm text-fg-2">
            <span className="shrink-0">{zh('freeType', o.type)}</span>
            {o.claimNote && (
              <>
                <span aria-hidden className="text-fg-3">·</span>
                <span className="truncate">{o.claimNote}</span>
              </>
            )}
          </div>

          <h3 className="mt-2.5 text-xl font-semibold leading-snug text-foreground">
            {o.gameSlug ? (
              <Link href={`/games/${o.gameSlug}/`} className="transition-colors hover:text-primary">
                {mainTitle}
              </Link>
            ) : (
              mainTitle
            )}
          </h3>
          {o.titleOrig && (
            <p className="mt-1 truncate text-sm text-fg-2">{o.titleOrig}</p>
          )}

          <div aria-hidden className="h-5 shrink-0" />
          {/* 倒计时与按钮一起压到卡片底部：同一行的几张卡，分隔线、倒计时、按钮都在同一高度 */}
          <div className="mt-auto border-t border-border pt-4">
            {lc === 'active' && o.endMs ? (
              <>
                <p className="text-xs text-fg-3">剩余时间</p>
                <div className="mt-1.5 flex items-baseline">
                  <Countdown
                    target={o.endMs}
                    now={now}
                    className={cn(
                      'text-3xl font-mono font-bold leading-none tabular-nums',
                      urgent ? 'text-primary' : 'text-foreground',
                    )}
                  />
                </div>
              </>
            ) : isUpcoming && o.startMs ? (
              <>
                <p className="text-xs font-medium text-info">即将免费</p>
                <div className="mt-1.5 flex items-baseline">
                  <Countdown
                    target={o.startMs}
                    mode="start"
                    now={now}
                    className="text-3xl font-mono font-bold leading-none tabular-nums text-info"
                  />
                </div>
              </>
            ) : (
              <p className="font-mono text-2xs text-fg-3">活动进行中</p>
            )}
          </div>

          {/* 底部来源与操作 */}
          <div className="flex items-end justify-between gap-3 pt-6">
            <span className="font-mono text-2xs text-fg-3">
              {o.endMs ? `截止 ${shDateTime(o.endMs)}` : o.startMs ? `开始 ${shDateTime(o.startMs)}` : `核验于 ${o.checkedAt}`}
            </span>
            <AcquireButton
              href={o.url}
              health={o.linkHealth}
              label={ctaOf(o, lc)}
              size="md"
              className="h-11 px-5"
            />
          </div>
        </div>
      </SpotlightCard>
    </Tilt>
  );
}

/** 别名兼容 */
export const OfferPanel = OfferHeroCard;

/** 紧凑列表行（永久免费 / 试玩与周末 / 开源游戏 / 已结束归档） */
export function OfferRow({ o, now: _now }: { o: OfferVM; now?: number | null }) {
  const mainTitle = o.titleZh ?? o.title;
  const isEnded = o.lifecycle === 'ended';

  return (
    <li className={cn(
      'flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-border last:border-b-0 transition-colors hover:bg-card/40 px-2 rounded-xs',
      isEnded && 'opacity-60',
    )}>
      <div className="flex items-center gap-4 min-w-0">
        <div className="edge-light relative aspect-[16/9] w-20 sm:w-28 shrink-0 overflow-hidden rounded-xs bg-shell">
          <GameArt
            src={[o.art?.header, o.art?.capsule, o.art?.hero]}
            name={o.gameName ?? o.title}
            seed={o.id}
            variant="wide"
            className="size-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <span className="text-lg font-semibold text-foreground">
              {o.gameSlug ? (
                <Link href={`/games/${o.gameSlug}/`} className="transition-colors hover:text-primary">
                  {mainTitle}
                </Link>
              ) : (
                mainTitle
              )}
            </span>
            {o.titleOrig && (
              <span className="text-sm text-fg-2 truncate">{o.titleOrig}</span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-fg-2">
            <PlatformMark platform={o.platform} withLabel />
            <span aria-hidden className="text-fg-3">·</span>
            <span>{zh('freeType', o.type)}</span>
            {o.claimNote && (
              <>
                <span aria-hidden className="text-fg-3">·</span>
                <span className="truncate text-fg-2">{o.claimNote}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5 self-end sm:self-center">
        {isEnded ? (
          <span className="inline-flex h-11 items-center px-4 font-mono text-sm text-fg-3">已结束</span>
        ) : (
          <AcquireButton
            href={o.url}
            health={o.linkHealth}
            label={ctaOf(o, o.lifecycle)}
            size="md"
            className="h-11 px-5"
          />
        )}
        <span className="font-mono text-2xs text-fg-3">核验于 {o.checkedAt}</span>
      </div>
    </li>
  );
}
