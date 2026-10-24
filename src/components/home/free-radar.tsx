'use client';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowRight, MoveHorizontal } from 'lucide-react';
import type { OfferVM } from '@/lib/present';
import { ExtLink } from '@/components/ui/ext-link';
import { buttonVariants } from '@/components/ui/button';
import { OfferPanel } from '@/components/offer/offer-panel';
import { Countdown, useNow } from '@/components/offer/countdown';
import { isUrgent, liveLifecycle } from '@/components/offer/use-lifecycle';
import { RadarDial } from '@/components/offer/radar-dial';
import { RadarTimeline } from '@/components/offer/radar-timeline';
import { useIsDesktop, useMotionOK, useMedia } from '@/components/fx/hooks';
import { shDateTime, pad2 } from '@/lib/time';
import { cn } from '@/lib/utils';

const TRACKERS = [
  { name: 'Epic 每周免费', url: 'https://store.epicgames.com/zh-CN/free-games' },
  { name: 'IsThereAnyDeal 限免', url: 'https://isthereanydeal.com/giveaways/' },
  { name: 'SteamDB 免费活动', url: 'https://steamdb.info/upcoming/free/' },
];

const clockFmt = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

function Clock({ now }: { now: number | null }) {
  return <span className="tabular-nums text-foreground">{now == null ? '--:--:--' : clockFmt.format(now)}</span>;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

// 第 4 章 · 免费雷达 / 雷达室：桌面 sticky 100svh，左侧雷达盘 + 右侧横向胶片带 + 全宽时间轴。
// 移动端和 reduced-motion 使用同一套内容的静态版：紧凑读数 + 原生横滑 + snap，没有 pin。
export function FreeRadar({ offers, total }: { offers: OfferVM[]; total: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const ok = useMotionOK();
  const desktop = useIsDesktop();
  const tall = useMedia('(min-height: 780px)');
  const now = useNow();
  const [dist, setDist] = useState(0);
  const [activePos, setActivePos] = useState(0);
  const metricsRef = useRef({ step: 538, cardWidth: 518, viewportWidth: 797 });

  const items = offers.filter((o) => liveLifecycle(o, now) !== 'ended').slice(0, 10);
  const activeCount = offers.filter((o) => liveLifecycle(o, now) === 'active').length;
  const upcomingCount = offers.filter((o) => liveLifecycle(o, now) === 'upcoming').length;
  const pinned = ok && desktop && tall;
  const activePinned = pinned && dist > 0;
  const currentCardIndex = Math.min(activePos, Math.max(0, items.length - 1));
  const atEnd = items.length > 0 && activePos >= items.length;
  const cardCount = items.length;

  const countRef = useRef(items.length);
  countRef.current = items.length;
  const pinnedRef = useRef(activePinned);
  pinnedRef.current = activePinned;
  const distRef = useRef(dist);
  distRef.current = dist;

  useLayoutEffect(() => {
    if (!pinned) { setDist(0); return; }
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const measure = () => {
      const next = Math.max(0, track.scrollWidth - viewport.clientWidth);
      setDist((prev) => (prev === next ? prev : next));
      const cards = track.querySelectorAll<HTMLElement>('[data-radar-card]');
      const first = cards[0];
      const second = cards[1];
      if (first) {
        metricsRef.current = {
          step: second ? second.offsetLeft - first.offsetLeft : first.offsetWidth + 20,
          cardWidth: first.offsetWidth,
          viewportWidth: viewport.clientWidth,
        };
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(track);
    return () => ro.disconnect();
  }, [pinned, items.length]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const titleY = useTransform(scrollYProgress, [0, 0.85], [0, -34]);
  const titleFade = useTransform(scrollYProgress, [0, 0.7, 0.94], [1, 1, 0.16]);
  const backdropX = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const backdropY = useTransform(scrollYProgress, [0, 1], [0, 46]);

  // 横向位置按 activePos 吸附：每越过一步，弹簧把当前卡完整停在视口左侧，不再任意裁切。
  const xTarget = useMotionValue(0);
  const x = useSpring(xTarget, { stiffness: 220, damping: 26, mass: 0.5 });

  useEffect(() => {
    if (!activePinned) { xTarget.set(0); return; }
    const step = metricsRef.current.step;
    const target = atEnd ? -dist : -currentCardIndex * step;
    xTarget.set(target);
  }, [activePinned, atEnd, currentCardIndex, dist, items.length, xTarget]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!pinnedRef.current) return;
    const n = countRef.current;
    if (!n) return;
    const next = Math.round(clamp(v, 0, 1) * n);
    setActivePos((prev) => (prev === next ? prev : next));
  });

  // playhead 从同一个弹簧位移推导，和卡片完全同步；最后一步把 playhead 推到 100%。
  const playheadProgress = useTransform(x, (v) => {
    const n = countRef.current;
    const { step } = metricsRef.current;
    const px = Math.max(0, -v);
    if (n <= 1) return 0;
    const lastCardX = (n - 1) * step;
    if (px <= lastCardX) return clamp(px / Math.max(1, step) / n, 0, 0.9);
    const tail = Math.max(1, distRef.current - lastCardX);
    return clamp(((n - 1) + clamp((px - lastCardX) / tail, 0, 1)) / n, 0, 1);
  });

  const onStripScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const n = items.length;
    if (!n) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-radar-card]');
    const first = cards[0];
    const second = cards[1];
    if (!first) return;
    const step = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
    const next = clamp(Math.round((el.scrollLeft + el.clientWidth / 2 - first.offsetWidth / 2) / Math.max(1, step)), 0, n - 1);
    setActivePos((prev) => (prev === next ? prev : next));
  };

  const lead = items.find((o) => liveLifecycle(o, now) === 'active' && o.endMs != null)
    ?? items.find((o) => liveLifecycle(o, now) === 'upcoming' && o.startMs != null)
    ?? items[0]
    ?? null;
  const leadLc = lead ? liveLifecycle(lead, now) : null;
  const leadTarget = leadLc === 'active' ? lead?.endMs ?? null : leadLc === 'upcoming' ? lead?.startMs ?? null : null;
  const leadUrgent = lead ? isUrgent(lead, leadLc, now) : false;

  // 表盘跟随当前卡片：横滑到哪一张，盘心就读哪一张（到达末尾追踪源卡时停在最后一条）
  const dialLead = activePinned && items.length ? items[currentCardIndex] : lead;
  const dialLc = dialLead ? liveLifecycle(dialLead, now) : null;
  const dialTarget = dialLc === 'active' ? dialLead?.endMs ?? null : dialLc === 'upcoming' ? dialLead?.startMs ?? null : null;

  const cardWidth = activePinned ? 'w-[clamp(430px,36vw,520px)]' : 'w-[88vw] max-w-[480px] lg:w-[clamp(350px,31vw,460px)]';
  const cardHeight = activePinned ? 'h-full min-h-0' : 'h-[clamp(510px,68svh,620px)]';
  const endWidth = activePinned
    ? 'w-[clamp(300px,24vw,380px)]'
    : 'w-[84vw] max-w-[400px] lg:w-[clamp(300px,24vw,360px)]';

  return (
    <section
      ref={sectionRef}
      aria-labelledby="radar-title"
      className="relative overflow-x-clip border-t border-border bg-background"
      style={activePinned ? { height: `calc(100svh + ${dist}px)` } : undefined}
    >
      <div className={cn(
        'relative',
        activePinned ? 'sticky top-0 h-[100svh] overflow-hidden' : 'pb-20 pt-[calc(var(--header-h)+28px)] md:pb-28',
      )}>
        {/* 尺度反差：巨型描边编号作为背景层，只在雷达室上方微微漂移 */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute left-[calc(var(--gutter)-0.05em)] top-[13%] z-0 select-none font-serif text-[clamp(240px,31vw,460px)] font-black leading-[0.7] tracking-[-0.09em] text-outline opacity-[0.085] [--stroke-w:1px]"
          style={activePinned ? { x: backdropX, y: backdropY } : undefined}
        >
          04
        </motion.span>
        <span aria-hidden className="pointer-events-none absolute left-[calc(var(--gutter)+6px)] top-[12%] z-0 hidden select-none font-mono text-2xs tracking-[0.3em] text-fg-3 opacity-50 [writing-mode:vertical-rl] sm:block">
          Nº 04 · RADAR ROOM
        </span>

        <div className={cn(
          'relative z-10 px-[var(--gutter)]',
          activePinned ? 'flex h-full flex-col pb-4 pt-[calc(var(--header-h)+14px)]' : '',
        )}>
          <header className="relative z-10 flex shrink-0 items-center justify-between gap-4 border-b border-border pb-3">
            <div className="meta flex min-w-0 items-center gap-3 text-2xs text-fg-3">
              <span className="shrink-0 text-foreground">Nº 04</span>
              <span aria-hidden className="h-px w-7 shrink-0 bg-current opacity-50" />
              <span className="truncate text-fg-2">免费雷达 / RADAR ROOM</span>
              <span className="hidden shrink-0 text-fg-3 xl:inline">免费情报 · 实时重算</span>
            </div>
            <div className="meta flex shrink-0 items-center gap-3 text-2xs text-fg-3 sm:gap-4">
              <span className="hidden items-center gap-1.5 sm:inline-flex">
                <span aria-hidden className="size-1.5 bg-ok" /> LIVE · 扫描中
              </span>
              <span className="hidden text-fg-3 md:inline">北京时间</span>
              <Clock now={now} />
              <span className="hidden text-fg-3 xl:inline">UTC+8</span>
            </div>
          </header>

          <div className={cn(
            'relative z-10',
            activePinned
              ? 'grid min-h-0 flex-1 grid-cols-[clamp(360px,33vw,480px)_minmax(0,1fr)] gap-x-10 pt-5 xl:gap-x-14'
              : 'mt-7 grid gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-10',
          )}>
            <div className={cn('relative flex min-h-0 flex-col', activePinned && 'justify-between')}>
              <motion.div
                className="relative z-10"
                style={activePinned ? { y: titleY, opacity: titleFade } : undefined}
              >
                <p className="meta mb-4 flex items-center gap-2 text-2xs text-fg-3">
                  <span aria-hidden className="size-1 bg-primary" />
                  当前章节 / FREE FEED
                </p>
                <h2
                  id="radar-title"
                  className="font-serif text-[clamp(48px,5.1vw,80px)] font-black leading-[0.91] tracking-[-0.055em]"
                >
                  此刻，
                  <br />
                  免费的。
                </h2>
                <p className="mt-4 max-w-[36ch] text-sm leading-[1.8] text-fg-2 sm:text-sm">
                  限时领取按截止时间排在最前，倒计时以北京时间计算；永久免费与开源游戏常驻雷达。
                </p>
              </motion.div>

              {activePinned ? (
                <>
                  <div className="flex min-h-0 flex-1 items-center justify-center py-2">
                    <RadarDial
                      items={items}
                      lead={dialLead}
                      leadLc={dialLc}
                      target={dialTarget}
                      now={now}
                      activeCount={activeCount}
                      upcomingCount={upcomingCount}
                      total={total}
                      progress={scrollYProgress}
                      className="w-[min(100%,clamp(360px,46svh,460px))]"
                    />
                  </div>
                  <dl className="relative z-10 grid shrink-0 grid-cols-3 border-y border-border">
                    <div className="border-r border-border py-3 pr-3">
                      <dt className="meta text-2xs text-fg-3">进行中</dt>
                      <dd className="mt-1 font-mono text-lg leading-none tabular-nums text-ok">{pad2(activeCount)}</dd>
                    </div>
                    <div className="border-r border-border px-3 py-3">
                      <dt className="meta text-2xs text-fg-3">预告</dt>
                      <dd className="mt-1 font-mono text-lg leading-none tabular-nums text-info">{pad2(upcomingCount)}</dd>
                    </div>
                    <div className="py-3 pl-3">
                      <dt className="meta text-2xs text-fg-3">收录</dt>
                      <dd className="mt-1 font-mono text-lg leading-none tabular-nums text-foreground">{pad2(total)}</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <Readout
                  lead={lead}
                  leadLc={leadLc}
                  target={leadTarget}
                  urgent={leadUrgent}
                  now={now}
                  activeCount={activeCount}
                  upcomingCount={upcomingCount}
                  total={total}
                />
              )}
            </div>

            <div className={cn('flex min-h-0 min-w-0 flex-col', activePinned && 'pt-0.5')}>
              <div className="meta mb-3 flex shrink-0 items-center justify-between gap-4 text-2xs text-fg-3">
                <span className="flex items-center gap-2.5">
                  <span className="text-fg-2">胶片带 / FREE FEED</span>
                  <span aria-hidden className="h-px w-6 bg-border-strong" />
                  <span className="hidden sm:inline">按紧迫度排序</span>
                </span>
                <span className="tabular-nums text-fg-2">
                  T{pad2(Math.min(currentCardIndex + 1, items.length))} / {pad2(items.length)}
                </span>
              </div>

              <div ref={viewportRef} className={cn(activePinned ? 'relative min-h-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,#000_0%,#000_calc(100%-40px),transparent_100%)]' : 'relative')}>
                <motion.div
                  ref={trackRef}
                  role="region"
                  aria-label="免费情报胶片带"
                  tabIndex={activePinned ? undefined : 0}
                  onScroll={activePinned ? undefined : onStripScroll}
                  className={cn(
                    'flex items-stretch',
                    activePinned
                      ? 'h-full w-max gap-5 will-change-transform'
                      : 'no-scrollbar w-full snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1 md:gap-5',
                  )}
                  style={activePinned ? { x } : undefined}
                >
                  {items.map((o, i) => (
                    <div
                      key={o.id}
                      data-radar-card
                      className={cn('shrink-0 snap-start', cardWidth, cardHeight)}
                    >
                      <OfferPanel
                        o={o}
                        now={now}
                        variant="radar"
                        progress={activePinned ? scrollYProgress : undefined}
                        index={i}
                        current={i === currentCardIndex}
                        className="h-full"
                      />
                    </div>
                  ))}

                  {!items.length && (
                    <div className={cn('flex shrink-0 snap-start flex-col justify-between border border-dashed border-border-strong p-6', cardWidth, cardHeight)}>
                      <p className="meta text-fg-3">NO SIGNAL</p>
                      <div>
                        <p className="font-serif text-3xl font-bold leading-tight tracking-[-0.03em]">雷达静默，<br />此刻没有在架情报。</p>
                        <Link href="/free/" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'mt-7 w-full justify-between')}>
                          去免费情报库 <ArrowRight aria-hidden />
                        </Link>
                      </div>
                    </div>
                  )}

                  <div
                    data-radar-card
                    className={cn(
                      'flex shrink-0 snap-start flex-col justify-between border border-border-strong bg-card p-6',
                      endWidth,
                      cardHeight,
                    )}
                  >
                    <div>
                      <div className="meta flex items-center justify-between text-2xs text-fg-3">
                        <span>OUT OF RANGE</span>
                        <span aria-hidden className="text-foreground">+</span>
                      </div>
                      <p className="mt-8 max-w-[10em] font-serif text-3xl font-bold leading-[1.12] tracking-[-0.03em]">
                        雷达之外，<br />还有这些追踪源。
                      </p>
                      <ul className="mt-7 border-t border-border">
                        {TRACKERS.map((t) => (
                          <li key={t.url} className="border-b border-border">
                            <ExtLink href={t.url} className="flex min-h-12 w-full items-center justify-between gap-4 text-sm text-fg-2 transition-colors hover:text-foreground">
                              {t.name}
                            </ExtLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-8">
                      <p className="meta mb-4 text-2xs leading-[1.7] text-fg-3">
                        收录 {pad2(total)} 条免费情报<br />北京时间实时重算 · 已结束自动离场
                      </p>
                      <Link href="/free/" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full justify-between')}>
                        全部免费情报 <ArrowRight aria-hidden />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="meta mt-3 flex shrink-0 items-center justify-between gap-4 text-2xs text-fg-3">
                <span className="flex items-center gap-2">
                  <MoveHorizontal aria-hidden className="size-3" />
                  {activePinned ? '纵向滚动 · 横向检索' : '左右滑动 · 查看全部'}
                </span>
                {activePinned && (
                  <span className="hidden tabular-nums text-fg-3 sm:inline">
                    {leadUrgent ? <span className="text-primary">有一项即将截止</span> : '所有时间均为 UTC+8'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <RadarTimeline
            items={items}
            now={now}
            progress={playheadProgress}
            activeIndex={currentCardIndex}
            moving={activePinned}
            className={cn('relative z-10', activePinned ? 'mt-4' : 'mt-9 border-t border-border pt-4')}
          />
        </div>
      </div>
    </section>
  );
}

/** 非 pinned / 移动端的紧凑读数：最近截止、进行中数量与收录数 */
function Readout({
  lead, leadLc, target, urgent, now, activeCount, upcomingCount, total,
}: {
  lead: OfferVM | null;
  leadLc: string | null;
  target: number | null;
  urgent: boolean;
  now: number | null;
  activeCount: number;
  upcomingCount: number;
  total: number;
}) {
  return (
    <div className="relative mt-6 overflow-hidden border border-border-strong bg-card">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full border border-border" />
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-14 size-44 rounded-full border border-border" />
      <div className="relative">
        <div className="meta flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 text-2xs text-fg-3">
          <span className="text-fg-2">雷达读数 / READOUT</span>
          <span className="flex items-center gap-2">
            <span aria-hidden className="size-1 bg-ok" />
            {lead ? (urgent ? '紧急' : '扫描中') : '静默'}
          </span>
        </div>
        <div className="px-4 pb-4 pt-4">
          <p className="meta text-2xs tracking-[0.16em] text-fg-3">
            {leadLc === 'upcoming' ? '最近开始 / STARTS IN' : leadLc === 'active' ? '最近截止 / NEXT DEADLINE' : '常驻 / OPEN-ENDED'}
          </p>

          {target != null ? (
            <Countdown
              target={target}
              mode={leadLc === 'upcoming' ? 'start' : 'end'}
              now={now}
              variant="film"
              className={cn(
                'mt-3 text-[clamp(40px,12.8vw,52px)] font-medium leading-none tracking-[-0.055em]',
                leadLc === 'upcoming' ? 'text-info' : urgent ? 'text-primary' : 'text-foreground',
              )}
              labelClassName="text-fg-3"
            />
          ) : (
            <div className="mt-2 flex items-end gap-3">
              <span aria-hidden className="font-mono text-5xl font-light leading-[0.8] tracking-[-0.08em] text-outline [--stroke-w:1px]">∞</span>
              <span className="pb-1 font-serif text-2xl font-bold leading-tight tracking-[-0.02em]">
                {lead ? '长期开放' : '暂无情报'}
              </span>
            </div>
          )}

          <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-border pt-2.5">
            <span className="meta min-w-0 truncate text-2xs text-fg-3">
              {lead ? lead.title : '等待下一次扫描'}
            </span>
            <span className={cn('meta shrink-0 text-2xs', urgent ? 'text-primary' : 'text-fg-3')}>
              {lead?.endMs ? `截止 ${shDateTime(lead.endMs)}` : lead?.startMs ? `开始 ${shDateTime(lead.startMs)}` : '无截止'}
            </span>
          </div>
        </div>
        <dl className="grid grid-cols-3 border-t border-border">
          <div className="border-r border-border px-4 py-2.5">
            <dt className="meta text-2xs text-fg-3">进行中</dt>
            <dd className="mt-0.5 font-mono text-base leading-none tabular-nums text-ok">{pad2(activeCount)}</dd>
          </div>
          <div className="border-r border-border px-4 py-2.5">
            <dt className="meta text-2xs text-fg-3">预告</dt>
            <dd className="mt-0.5 font-mono text-base leading-none tabular-nums text-info">{pad2(upcomingCount)}</dd>
          </div>
          <div className="px-4 py-2.5">
            <dt className="meta text-2xs text-fg-3">收录</dt>
            <dd className="mt-0.5 font-mono text-base leading-none tabular-nums text-foreground">{pad2(total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
