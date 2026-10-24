'use client';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react';
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
import { isUrgent, liveLifecycle } from './use-lifecycle';

const CTA: Record<string, string> = { limited: '领取', weekend: '获取', trial: '获取', permanent: '获取', opensource: '下载' };

// 免费雷达面板：剩余时间是主角（巨型 mono 倒计时），生命周期为实心徽标
export function OfferPanel({
  o, now, className, variant = 'panel', progress, index = 0, current = false,
}: {
  o: OfferVM;
  now: number | null;
  className?: string;
  /** radar = 第 4 章的全出血电影面板；panel = 目录页的索引卡 */
  variant?: 'panel' | 'radar';
  progress?: MotionValue<number>;
  index?: number;
  current?: boolean;
}) {
  if (variant === 'radar') return <RadarOfferPanel o={o} now={now} className={className} progress={progress} index={index} current={current} />;
  return <IndexOfferPanel o={o} now={now} className={className} />;
}

/** 目录页 / 免费页：安静的索引卡，保持原形制 */
function IndexOfferPanel({ o, now, className }: { o: OfferVM; now: number | null; className?: string }) {
  const lc = liveLifecycle(o, now);
  const urgent = isUrgent(o, lc, now);
  const ended = lc === 'ended';
  const statusTitle = ended ? '活动已结束' : lc === 'uncertain' ? '等待核验' : lc === 'deadline_unknown' ? '截止待确认' : null;
  return (
    <article className={cn('group relative flex h-full flex-col border border-border bg-card', ended && 'opacity-60', className)}>
      <div className="relative aspect-[616/353] overflow-hidden border-b border-border">
        <GameArt src={o.art?.capsule} name={o.gameName ?? o.title} seed={o.id} variant="wide" className="absolute inset-0" imgClassName="transition-transform duration-700 group-hover:scale-[1.03]" />
        <div className="meta absolute left-3 top-3 flex items-center gap-2 bg-background/85 px-2 py-1 text-2xs text-foreground">
          <PlatformMark platform={o.platform} withLabel />
          <span className="text-fg-3">/</span>
          {zh('freeType', o.type)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <LifecycleBadge value={lc} pulse />
          {healthStatus(o.linkHealth) && <StatusBadge value={healthStatus(o.linkHealth)} />}
        </div>

        <div className={cn('mt-5 min-h-[76px]', urgent ? 'text-primary' : 'text-foreground')}>
          {lc === 'active' && o.endMs ? (
            <>
              <p className="meta mb-2 text-fg-3">剩余时间</p>
              <Countdown target={o.endMs} now={now} className="text-[clamp(28px,2.6vw,40px)] font-medium leading-none tracking-[-0.04em]" />
            </>
          ) : lc === 'upcoming' && o.startMs ? (
            <>
              <p className="meta mb-2 text-fg-3">距离开始</p>
              <Countdown target={o.startMs} mode="start" now={now} className="text-[clamp(28px,2.6vw,40px)] font-medium leading-none tracking-[-0.04em] text-info" />
            </>
          ) : (
            <>
              <p className="meta mb-2 text-fg-3">{statusTitle ? '活动状态' : o.type === 'opensource' ? '开源 · 永久' : o.type === 'trial' ? '试玩' : '长期'}</p>
              <p className="font-serif text-[clamp(30px,2.8vw,44px)] font-black leading-none tracking-[-0.04em]">
                {statusTitle ?? (o.type === 'opensource' ? '开源免费' : o.type === 'trial' ? '先玩再买' : '免费游玩')}
              </p>
            </>
          )}
        </div>

        <h3 className="mt-6 font-serif text-xl font-bold leading-snug tracking-[-0.01em]">
          {o.gameSlug ? <Link href={`/games/${o.gameSlug}/`} className="hover:text-primary">{o.title}</Link> : o.title}
        </h3>
        {o.claimNote && <p className="mt-1.5 text-sm leading-[1.7] text-fg-2">{o.claimNote}</p>}

        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <span className="meta text-2xs text-fg-3">
            {o.endMs ? `截止 ${shDateTime(o.endMs)}` : o.startMs ? `开始 ${shDateTime(o.startMs)}` : `核验 ${o.checkedAt}`}
          </span>
          {!ended && <AcquireButton href={o.url} health={o.linkHealth} label={CTA[o.type] ?? '获取'} size="sm" />}
        </div>
      </div>
    </article>
  );
}

/**
 * 雷达章：整块游戏美术出血，信息全部压在暗部。
 * 美术层随横向轨道做 ±14px 的轻微反向位移（不是晕人的大视差）。
 */
function RadarOfferPanel({
  o, now, className, progress, index, current,
}: {
  o: OfferVM;
  now: number | null;
  className?: string;
  progress?: MotionValue<number>;
  index: number;
  current: boolean;
}) {
  const lc = liveLifecycle(o, now);
  const urgent = isUrgent(o, lc, now);
  const ended = lc === 'ended';
  const health = healthStatus(o.linkHealth);
  const statusTitle = ended ? '活动已结束' : lc === 'uncertain' ? '等待核验' : lc === 'deadline_unknown' ? '长期进行' : null;
  const target = lc === 'active' ? o.endMs : lc === 'upcoming' ? o.startMs : null;
  const longStatus = statusTitle ?? (o.type === 'opensource' ? '开源免费' : o.type === 'trial' ? '先玩再买' : '免费游玩');
  const still = useMotionValue(0);
  const p = progress ?? still;
  const drift = useTransform(p, [0, 1], [index % 2 === 0 ? 12 : -12, index % 2 === 0 ? -12 : 12]);
  const hasArt = Boolean(o.art?.poster ?? o.art?.hero ?? o.art?.capsule);

  return (
    <article
      aria-current={current ? 'true' : undefined}
      aria-labelledby={`radar-offer-${o.id}`}
      className={cn('group grain relative flex h-full w-full flex-col overflow-hidden border border-border-strong bg-card text-foreground', ended && 'opacity-60', className)}
    >
      <motion.div aria-hidden className={cn('absolute inset-[-2.5%]', hasArt ? 'z-0' : 'z-[2]')} style={{ x: drift, scale: 1.08 }}>
        <GameArt
          src={o.art?.poster ?? o.art?.hero ?? o.art?.capsule}
          name={o.gameName ?? o.title}
          seed={o.id}
          variant="wide"
          className="absolute inset-0"
          imgClassName="object-[50%_38%] transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.025]"
          sizes="(min-width: 1024px) 520px, 92vw"
          loading="eager"
        />
      </motion.div>

      {/* 压暗而不是发光：顶部给元数据，底部给全部正文 */}
      <div aria-hidden className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(19,18,17,0.48)_0%,rgba(19,18,17,0.08)_29%,rgba(19,18,17,0.24)_52%,rgba(19,18,17,0.88)_78%,rgba(19,18,17,0.98)_100%)]" />
      <div aria-hidden className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(19,18,17,0.58)_0%,rgba(19,18,17,0.2)_52%,rgba(19,18,17,0.02)_100%)]" />
      {/* 无原画时文字封面升到压暗层之上，否则整张胶片卡会读成空黑块 */}
      {!hasArt && (
        <div aria-hidden className="absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(19,18,17,0.2)_0%,rgba(19,18,17,0)_34%,rgba(19,18,17,0.62)_64%,rgba(19,18,17,0.97)_100%)]" />
      )}
      <span aria-hidden className="pointer-events-none absolute left-3 top-3 z-[2] size-3 border-l border-t border-foreground/35" />
      <span aria-hidden className="pointer-events-none absolute bottom-3 right-3 z-[2] size-3 border-b border-r border-foreground/35" />
      {/* 胶片齿孔：左右各一条暗边 + 逐格透光孔，强化「片格」而非卡片 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-[3] w-3 border-r border-foreground/15 bg-[#080807]/90 [background-image:repeating-linear-gradient(180deg,rgba(255,255,255,0.24)_0_9px,transparent_9px_25px)] shadow-[inset_-1px_0_0_rgba(0,0,0,0.6)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-[3] w-3 border-l border-foreground/15 bg-[#080807]/90 [background-image:repeating-linear-gradient(180deg,rgba(255,255,255,0.24)_0_9px,transparent_9px_25px)] shadow-[inset_1px_0_0_rgba(0,0,0,0.6)]"
      />
      {current && <span aria-hidden className="absolute inset-x-0 top-0 z-20 h-[2px] bg-primary" />}

      <div className="relative z-10 flex h-full min-h-0 flex-col px-6 py-5 sm:px-8 sm:py-6 lg:px-9 lg:py-7">
        <div className="flex shrink-0 items-start justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="inline-flex h-7 items-center border border-foreground/25 bg-background/90 px-2.5 text-foreground">
              <PlatformMark platform={o.platform} withLabel />
            </span>
            <span className="inline-flex h-7 items-center border border-foreground/20 bg-background/80 px-2.5 text-xs text-fg-2">
              {zh('freeType', o.type)}
            </span>
          </div>
        </div>

        <div className="mt-auto min-h-0 pt-10">
          <div className="flex flex-wrap items-center gap-2">
            <LifecycleBadge value={lc} pulse />
            {health && <StatusBadge value={health} className="bg-background/50" />}
          </div>

          <h3 id={`radar-offer-${o.id}`} className="mt-4 max-w-[18em] font-serif text-[clamp(30px,2.7vw,42px)] font-bold leading-[1.12] tracking-[-0.03em]">
            {o.gameSlug ? <Link href={`/games/${o.gameSlug}/`} className="transition-colors hover:text-primary">{o.title}</Link> : o.title}
          </h3>
          {o.claimNote && <p className="mt-2 line-clamp-2 max-w-[42ch] text-sm leading-[1.65] text-fg-2">{o.claimNote}</p>}

          <div className="mt-5 border-t border-foreground/20 pt-4">
            <div className="flex items-end justify-between gap-4 text-xs text-fg-3">
              <span className="text-fg-2">
                {lc === 'active' ? '剩余时间' : lc === 'upcoming' ? '距离开始' : '状态'}
              </span>
              <span className={cn(urgent && 'text-primary')}>
                {o.endMs ? `截止 ${shDateTime(o.endMs)}` : o.startMs ? `开始 ${shDateTime(o.startMs)}` : '无截止'}
              </span>
            </div>

            {target != null ? (
              <Countdown
                target={target}
                mode={lc === 'upcoming' ? 'start' : 'end'}
                now={now}
                variant="film"
                className={cn(
                  'mt-2 text-[clamp(48px,5.4vw,82px)] font-medium leading-none tracking-[-0.06em] [text-shadow:0_0_24px_color-mix(in_oklab,currentColor_26%,transparent)]',
                  lc === 'upcoming' ? 'text-info' : urgent ? 'text-primary' : 'text-foreground',
                )}
                labelClassName="text-fg-2"
              />
            ) : (
              <div className={cn('mt-1 flex items-end gap-4', ended || lc === 'uncertain' ? 'text-fg-2' : 'text-foreground')}>
                {!ended && lc !== 'uncertain' ? (
                  <span aria-hidden className="font-mono text-[clamp(54px,6.4vw,92px)] font-light leading-[0.72] tracking-[-0.08em] text-outline [--stroke-w:1px]">∞</span>
                ) : null}
                <span className="max-w-[11em] pb-0.5 font-serif text-[clamp(24px,2.4vw,34px)] font-bold leading-tight tracking-[-0.03em]">
                  {longStatus}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-end justify-between gap-4">
            <span className="text-xs text-fg-3">核验于 {o.checkedAt}</span>
            {!ended && <AcquireButton href={o.url} health={o.linkHealth} label={CTA[o.type] ?? '获取'} size="md" />}
          </div>
        </div>
      </div>
    </article>
  );
}
