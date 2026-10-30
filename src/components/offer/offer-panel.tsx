'use client';
import { L } from '@/lib/labels-i18n';
import { T } from '@/lib/i18n';
import Link from 'next/link';
import type { OfferVM } from '@/lib/present';
import { LifecycleBadge, StatusBadge } from '@/components/ui/badge';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { AcquireButton } from '@/components/ui/button';
import { PlatformMark } from '@/components/ui/platform-mark';
import { GameArt } from '@/components/game/game-art';
import { healthStatus } from '@/lib/status';
import { shDateTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import { genreZh } from '@/lib/genre';
import { Countdown } from './countdown';
import { Tilt } from '@/components/fx/interact';
import { isUrgent, liveLifecycle } from './use-lifecycle';

// 按钮自带「↗」图标，文字里不再重复
const CTA: Record<string, [string, string]> = { limited: ['领取', 'Claim'], weekend: ['获取', 'Get'], trial: ['试玩', 'Try'], permanent: ['开玩', 'Play'], opensource: ['下载', 'Download'] };
/** 即将开始的活动还不能领：按钮改为去活动页看看 */
const ctaOf = (o: OfferVM, lc: string | null) => { const [zhL, enL] = lc === 'upcoming' ? ['活动页', 'Details'] : CTA[o.type] ?? ['领取', 'Claim']; return <T zh={zhL} en={enL} />; };

/**
 * 中文模式下标题下方的副标题（英文模式不显示）：
 *   有中文名 → 英文原名；没有通行中文名 → 中文类型（「动作 · 冒险」），保证每张卡都有一行中文信息。
 */
export function offerAltZh(o: OfferVM): string | null {
  if (o.titleZh) return o.titleOrig ?? null;
  return o.genres.length ? o.genres.map(genreZh).join(' · ') : null;
}

/** 免费大卡（限时领取 / 即将开始） */
export function OfferHeroCard({ o, now, className }: { o: OfferVM; now: number | null; className?: string }) {
  const lc = liveLifecycle(o, now);
  const urgent = isUrgent(o, lc, now);
  const isUpcoming = lc === 'upcoming';
  const mainTitle = <T zh={o.titleZh ?? o.title} en={o.titleOrig ?? o.title} />;
  const health = healthStatus(o.linkHealth);

  return (
    <Tilt max={4} className={cn('h-full', className)}>
      <SpotlightCard
        as="article"
        className="group relative isolate flex h-full flex-col overflow-hidden rounded-lg bg-[#0B0B0D] shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_24px_60px_-28px_rgba(0,0,0,0.9)] ring-1 ring-inset ring-white/[0.07] transition-shadow duration-500 hover:ring-white/[0.14]"
      >
        {/* 卡片底色取自这款游戏的美术：模糊放大后压暗，每张卡带着自己的颜色 */}
        {(o.art?.header ?? o.art?.capsule) && (
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <img src={o.art?.header ?? o.art?.capsule} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full scale-150 object-cover opacity-60" style={{ filter: 'blur(48px) saturate(1.5)' }} />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,13,0.35)_0%,rgba(11,11,13,0.82)_55%,rgba(11,11,13,0.9)_100%)]" />
          </div>
        )}

        {/* 横幅图 */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-shell [mask-image:linear-gradient(180deg,#000_70%,transparent_100%)]">
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

        </div>

        {/* 主体信息 */}
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="flex min-w-0 items-center gap-2 text-sm text-foreground/60">
            <PlatformMark platform={o.platform} withLabel className="shrink-0 text-foreground/85" />
            <span aria-hidden>·</span>
            <span className="shrink-0">{L('freeType', o.type)}</span>
            {o.claimNote && (
              <>
                <span aria-hidden className="text-fg-3">·</span>
                <span className="truncate"><T zh={o.claimNote} en={o.claimNoteEn} /></span>
              </>
            )}
          </div>

          <h3 className="mt-2 font-display text-[22px] font-semibold leading-snug tracking-[-0.01em] text-foreground">
            {o.gameSlug ? (
              <Link href={`/games/${o.gameSlug}/`} className="transition-colors hover:text-foreground/80">
                {mainTitle}
              </Link>
            ) : (
              mainTitle
            )}
          </h3>
          {offerAltZh(o) && (
            <p className="mt-1 truncate text-sm text-fg-2"><T zh={offerAltZh(o)} en="" /></p>
          )}

          <div aria-hidden className="h-5 shrink-0" />
          {/* 倒计时与按钮一起压到卡片底部：同一行的几张卡，分隔线、倒计时、按钮都在同一高度 */}
          <div className="mt-auto border-t border-white/[0.08] pt-4">
            {lc === 'active' && o.endMs ? (
              <>
                <p className="flex items-center gap-2 text-xs text-fg-3"><T zh="剩余时间" en="Time left" />{urgent && <span className="inline-flex items-center gap-1.5 text-warn"><span aria-hidden className="size-1.5 rounded-full bg-warn" /><T zh="即将截止" en="Ending soon" /></span>}</p>
                <div className="mt-1.5 flex items-baseline">
                  <Countdown
                    target={o.endMs}
                    now={now}
                    className={cn(
                      'text-[32px] tabular font-semibold leading-none tracking-[-0.02em] tabular-nums',
                      'text-foreground',
                    )}
                  />
                </div>
              </>
            ) : isUpcoming && o.startMs ? (
              <>
                <p className="flex items-center gap-1.5 text-xs text-fg-3"><span aria-hidden className="size-1.5 rounded-full bg-info" /><T zh="距离免费开始" en="Free in" /></p>
                <div className="mt-1.5 flex items-baseline">
                  <Countdown
                    target={o.startMs}
                    mode="start"
                    now={now}
                    className="text-[32px] tabular font-semibold leading-none tracking-[-0.02em] tabular-nums text-foreground"
                  />
                </div>
              </>
            ) : (
              <p className="tabular text-2xs text-fg-3"><T zh="活动进行中" en="Ongoing" /></p>
            )}
          </div>

          {/* 底部来源与操作 */}
          <div className="flex items-end justify-between gap-3 pt-6">
            <span className="tabular text-2xs text-fg-3">
              {o.endMs ? <><T zh="截止" en="Ends" /> {shDateTime(o.endMs)}</> : o.startMs ? <><T zh="开始" en="Starts" /> {shDateTime(o.startMs)}</> : <><T zh="核验于" en="Checked" /> {o.checkedAt}</>}
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
  const mainTitle = <T zh={o.titleZh ?? o.title} en={o.titleOrig ?? o.title} />;
  const isEnded = o.lifecycle === 'ended';

  return (
    <li className={cn(
      'flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 px-3 -mx-3 rounded-md transition-colors hover:bg-white/[0.04]',
      isEnded && 'opacity-60',
    )}>
      <div className="flex items-center gap-4 min-w-0">
        <div className="edge-light relative aspect-[16/9] w-24 sm:w-32 shrink-0 overflow-hidden rounded-sm bg-shell">
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
            <span className="text-[17px] font-semibold tracking-[-0.01em] text-foreground">
              {o.gameSlug ? (
                <Link href={`/games/${o.gameSlug}/`} className="transition-colors hover:text-foreground/80">
                  {mainTitle}
                </Link>
              ) : (
                mainTitle
              )}
            </span>
            {offerAltZh(o) && (
              <span className="truncate text-sm text-fg-2"><T zh={offerAltZh(o)} en="" /></span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-fg-2">
            <PlatformMark platform={o.platform} withLabel />
            <span aria-hidden className="text-fg-3">·</span>
            <span>{L('freeType', o.type)}</span>
            {o.claimNote && (
              <>
                <span aria-hidden className="text-fg-3">·</span>
                <span className="truncate text-fg-2"><T zh={o.claimNote} en={o.claimNoteEn} /></span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1 self-end sm:self-center">
        {isEnded ? (
          <span className="inline-flex h-8 items-center px-4 text-sm text-fg-3"><T zh="已结束" en="Ended" /></span>
        ) : (
          <AcquireButton
            href={o.url}
            health={o.linkHealth}
            label={ctaOf(o, o.lifecycle)}
            size="sm"
            variant="get"
            className="min-w-[76px]"
          />
        )}
        <span className="tabular text-2xs text-fg-3"><T zh="核验于" en="Checked" /> {o.checkedAt}</span>
      </div>
    </li>
  );
}
