'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import type { OfferVM } from '@/lib/present';
import { zh } from '@/lib/labels.mjs';
import { shDateTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import { AcquireButton } from '@/components/ui/button';
import { PlatformMark } from '@/components/ui/platform-mark';
import { GameArt } from '@/components/game/game-art';
import { Countdown, useNow } from '@/components/offer/countdown';
import { isUrgent, liveLifecycle } from '@/components/offer/use-lifecycle';
import { useMotionOK, useMedia } from '@/components/fx/hooks';
import { useEntry } from '@/components/fx/scene';
import { Tilt } from '@/components/fx/interact';
import { hang } from '@/components/ui/hang';

const LIMIT = 6;
const CTA: Record<string, string> = { limited: '免费领取', weekend: '免费畅玩', trial: '免费试玩', permanent: '免费获取', opensource: '免费下载' };

/* 两条时间轴。
 * 进场窗口 e（本章从露头到固定，见 Scene 的 relay）：
 *   0.00       画面 = 上一章最后一帧：星露谷环境光 + 中央竖版海报
 *   0.04–0.55  海报翻面，同时由竖版变成横版——背面就是卡组第一张卡
 *   0.25–0.70  环境光从星露谷换成卡组色场
 *   0.55–0.85  左右两侧的卡滑入
 *   0.70–0.90  标题落下；0.85–1.00 倒计时与底栏出现
 * 本章滚动进度 v：
 *   0.04–0.86  卡组翻页：每张占一格，格内前 62% 停住、后 38% 切换
 *   0.88–1.00  收场：文字与两侧的卡退去，只留最后一张卡居中——这一帧由资源站接住（卡片碎成 Logo 星图）
 */
const DECK: [number, number] = [0.04, 0.86];
const HOLD = 0.62;
const FLIP: [number, number] = [0.04, 0.55];
const OUT: [number, number] = [0.88, 1];


import { GLOW_IMG, GLOW_VEIL } from '@/components/fx/glow';
export { GLOW_IMG, GLOW_VEIL };
/** 档案章的环境：游戏美术本身，重度压暗（配 GLOW_VEIL 的暗角） */
export const SCENE_IMG = 'absolute inset-0 size-full object-cover opacity-50';

/** 首页卡组实际展示的条目（资源站章用同一份数据画出交接帧） */
export function deckItems(offers: OfferVM[], now: number | null) {
  return offers.filter((o) => liveLifecycle(o, now) !== 'ended' && o.art).slice(0, LIMIT);
}

/** 卡组尺寸：资源站章交接时用同一套尺寸 */
export function deckSize(vp: { w: number; h: number }) {
  const h = Math.round(Math.min(vp.h * 0.44, 420));
  const w = Math.round(h * 1.6);
  return { w, h, gap: Math.min(vp.w * 0.3, w * 0.78) };
}

export function useViewport() {
  const [vp, setVp] = useState({ w: 1440, h: 900 });
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return vp;
}

/** 滚动进度 → 连续的卡片位置 pos（整数 = 停在某张卡上；小数 = 正在切换） */
function toPos(v: number, n: number) {
  const t = Math.min(1, Math.max(0, (v - DECK[0]) / (DECK[1] - DECK[0]))) * (n - 1);
  const i = Math.floor(t);
  const f = t - i;
  const ease = f < HOLD ? 0 : (f - HOLD) / (1 - HOLD);
  const smooth = ease * ease * (3 - 2 * ease);
  return Math.min(n - 1, i + smooth);
}

export const CARD_CLS = 'edge-light relative size-full overflow-hidden rounded-md shadow-[0_50px_100px_-30px_rgba(0,0,0,0.95)]';

/** 卡面：美术 + 底部压暗 + 平台与标题（text 控制文字的透明度） */
export function CardFace({ o, text = 1 }: { o: OfferVM; text?: MotionValue<number> | number }) {
  return (
    <>
      <GameArt src={[o.art?.hero, o.art?.capsule, o.art?.header]} name={o.gameName ?? o.title} seed={o.id} variant="wide" loading="eager" className="absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(12,11,10,0.9)_0%,rgba(12,11,10,0.1)_55%)]" />
      <motion.div className="absolute inset-x-0 bottom-0 p-7" style={{ opacity: text }}>
        <p className="flex items-center gap-2 text-sm text-foreground/85"><PlatformMark platform={o.platform} withLabel /><span className="text-fg-3">·</span>{zh('freeType', o.type)}</p>
        <h3 className="mt-2 text-balance font-serif text-[clamp(26px,2.2vw,38px)] font-black leading-tight tracking-[-0.02em]">{o.titleZh ?? o.title}</h3>
        {o.titleOrig && <p className="mt-1 text-sm text-foreground/70">{o.titleOrig}</p>}
      </motion.div>
    </>
  );
}

/** 卡组里的一张：相对当前位置的偏移 d 决定它在左/中/右、大小、明暗；只有正中那张显示文字 */
function DeckCard({ o, i, n, pos, w, h, gap, enter, out, first }: {
  o: OfferVM; i: number; n: number; pos: MotionValue<number>; w: number; h: number; gap: number;
  enter: MotionValue<number>; out: MotionValue<number>; first: MotionValue<number>;
}) {
  const d = useTransform(pos, (p) => i - p);
  // 进场：两侧的卡从更远处滑入
  const x = useTransform(() => {
    const v = d.get();
    return Math.sign(v) * (Math.min(Math.abs(v), 2) * gap + (1 - enter.get()) * 140);
  });
  const scale = useTransform(d, (v) => 1 - Math.min(Math.abs(v), 2) * 0.28);
  const rotateY = useTransform(d, (v) => -Math.max(-1, Math.min(1, v)) * 18);
  // 第一张卡进场时由翻面的海报代替；两侧的卡进场滑入、收场退去；最后一张一直留到交接
  const opacity = useTransform(() => {
    const v = d.get();
    const base = Math.abs(v) > 1.6 ? 0 : 1 - Math.min(Math.abs(v), 1.6) * 0.5;
    const centre = Math.abs(v) < 0.5;
    const keep = i === n - 1 ? 1 : out.get();
    return base * (centre ? (i === 0 ? first.get() : 1) : enter.get()) * keep;
  });
  const dim = useTransform(d, (v) => Math.min(Math.abs(v), 1) * 0.6);
  const zIndex = useTransform(d, (v) => 100 - Math.round(Math.abs(v) * 10));
  const text = useTransform(() => Math.max(0, 1 - Math.abs(d.get()) * 3) * out.get());
  return (
    <motion.div className="absolute left-1/2 top-1/2 [perspective:1600px]" style={{ width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2, x, scale, opacity, zIndex }}>
      <Tilt max={4} className="size-full rounded-md">
        <motion.div className={CARD_CLS} style={{ rotateY }}>
          <CardFace o={o} text={text} />
          <motion.div aria-hidden className="absolute inset-0 bg-shell" style={{ opacity: dim }} />
        </motion.div>
      </Tilt>
    </motion.div>
  );
}

type From = { poster: string; hero: string };

/** 交接：上一章最后一帧（星露谷环境光 + 竖版海报）→ 海报翻面、变成横版的第一张卡 */
function Handoff({ from, first, e, vp, w, h }: { from: From; first: OfferVM; e: MotionValue<number>; vp: { w: number; h: number }; w: number; h: number }) {
  const ch = Math.min(vp.h * 0.52, 500);
  const pw = Math.round((ch * 2) / 3), ph = Math.round(ch);
  const t = useTransform(e, FLIP, [0, 1]);
  const flip = useTransform(t, (v) => v * 180);
  const ease = (v: number) => v * v * (3 - 2 * v);
  const width = useTransform(t, (v) => pw + (w - pw) * ease(v));
  const height = useTransform(t, (v) => ph + (h - ph) * ease(v));
  const lift = useTransform(t, [0, 0.5, 1], [1, 1.06, 1]);
  const frontO = useTransform(flip, (v) => (v < 90 ? 1 : 0));
  const backO = useTransform(flip, (v) => (v < 90 ? 0 : 1));
  const shown = useTransform(e, (v) => (v >= FLIP[1] ? 0 : 1));
  const bgO = useTransform(e, [0.2, 0.65], [1, 0]);
  return (
    <>
      <motion.div aria-hidden className="absolute inset-0 bg-shell" style={{ opacity: bgO }}>
        <img src={from.hero} alt="" className={SCENE_IMG} />
        <div className={GLOW_VEIL} />
      </motion.div>
      <motion.div aria-hidden className="absolute left-1/2 top-1/2 z-[150] [perspective:1800px]" style={{ width, height, x: '-50%', y: '-50%', opacity: shown }}>
        <motion.div className="relative size-full" style={{ rotateY: flip, scale: lift }}>
          <motion.div className="edge-light absolute inset-0 overflow-hidden rounded-md shadow-[0_50px_100px_-30px_rgba(0,0,0,0.95)]" style={{ opacity: frontO }}>
            <img src={from.poster} alt="" className="size-full object-cover" />
          </motion.div>
          <motion.div className="absolute inset-0 [transform:rotateY(180deg)]" style={{ opacity: backO }}>
            <div className={CARD_CLS}><CardFace o={first} text={0} /></div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}

/**
 * 第 2 章 · 此刻，免费的。中轴卡组：当前卡在正中，上一张 / 下一张分列左右、压暗缩小；
 * 滚动一格换一张，当前卡的倒计时与领取按钮居中在卡组下方（随卡片切换淡入淡出）。
 * 进场接住档案章的海报（翻面成第一张卡），收场只留最后一张卡交给资源站。
 * 小屏 / reduced-motion：原生横滑。
 */
export function FreeDeck({ offers, total, from }: { offers: OfferVM[]; total: number; from?: From }) {
  const ref = useRef<HTMLElement>(null);
  const ok = useMotionOK();
  const wide = useMedia('(min-width: 1280px)');
  const pinned = ok && wide;
  const now = useNow();
  const items = deckItems(offers, now);
  const n = Math.max(1, items.length);
  const vp = useViewport();
  const { w, h, gap } = deckSize(vp);

  const { scrollYProgress: v } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const e = useEntry(ref);
  const pos = useTransform(v, (x) => toPos(x, n));
  const [cur, setCur] = useState(0);
  useMotionValueEvent(pos, 'change', (p) => setCur((c) => (c === Math.round(p) ? c : Math.round(p))));

  // 进场
  const first = useTransform(e, (x): number => (!from || x >= FLIP[1] ? 1 : 0));
  const sideIn = useTransform(e, [0.5, 0.8], [0, 1]);
  const headIn = useTransform(e, [0.62, 0.85], [0, 1]);
  const headY = useTransform(e, [0.62, 0.85], [24, 0]);
  const infoIn = useTransform(e, [0.8, 1], [0, 1]);
  // 收场：最后一张卡始终在；其余的退去
  const out = useTransform(v, OUT, [1, 0]);
  const textOut = useTransform(v, [OUT[0], OUT[0] + 0.03], [1, 0]);
  // 信息栏只在「停住」时显示：切换途中淡出
  const infoO = useTransform(pos, (p) => 1 - Math.min(1, Math.abs(p - Math.round(p)) * 4));
  const infoVis = useTransform(() => infoO.get() * textOut.get() * infoIn.get());
  const headVis = useTransform(() => headIn.get() * textOut.get());
  const barVis = useTransform(() => infoIn.get() * out.get());
  const progress = useTransform(v, DECK, [0, 1]);

  const o = items[cur];
  const lc = o ? liveLifecycle(o, now) : null;
  const target = lc === 'active' ? o?.endMs : lc === 'upcoming' ? o?.startMs : null;

  if (!pinned) {
    return (
      <section ref={ref} aria-labelledby="free-title" className="bg-background py-20">
        <h2 id="free-title" className="container-x text-center font-serif text-[clamp(36px,8vw,56px)] font-black tracking-[-0.04em]">{hang('此刻，免费的。')}</h2>
        <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)]">
          {items.map((x) => (
            <Link key={x.id} href="/free/" className="relative aspect-[16/10] w-[82vw] max-w-[560px] shrink-0 snap-center overflow-hidden rounded-md">
              <GameArt src={[x.art?.hero, x.art?.capsule]} name={x.gameName ?? x.title} seed={x.id} variant="wide" className="absolute inset-0" />
              <span className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(12,11,10,0.9),transparent)] p-4 font-serif text-xl font-bold">{x.titleZh ?? x.title}</span>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} aria-labelledby="free-title" className="relative bg-background" style={{ height: `${100 + n * 50}vh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* 环境光：当前卡美术的高斯模糊色场——只留颜色，不留形状 */}
        <div aria-hidden className="absolute inset-0">
          {items.map((x, i) => (
            <img key={x.id} src={x.art?.hero ?? x.art?.capsule ?? ''} alt="" className={cn(GLOW_IMG, 'transition-opacity duration-700', i === cur ? 'opacity-35' : 'opacity-0')} />
          ))}
          <div className={GLOW_VEIL} />
        </div>

        {from && items[0] && <Handoff from={from} first={items[0]} e={e} vp={vp} w={w} h={h} />}

        {/* 标题：卡组正上方 */}
        <motion.div className="absolute inset-x-0 flex flex-col items-center text-center" style={{ bottom: `calc(50% + ${h / 2 + 32}px)`, opacity: headVis, y: headY }}>
          <p className="text-sm text-primary">免费游戏 · 精选 {n} 条 / 共 {total} 条</p>
          <h2 id="free-title" className="mt-2 font-serif text-[clamp(40px,3.8vw,64px)] font-black leading-tight tracking-[-0.04em]">{hang('此刻，免费的。')}</h2>
        </motion.div>

        {/* 卡组 */}
        <div className="absolute inset-0">
          {items.map((x, i) => <DeckCard key={x.id} o={x} i={i} n={n} pos={pos} w={w} h={h} gap={gap} enter={sideIn} out={out} first={first} />)}
        </div>

        {/* 当前卡的「票根」：与卡同宽、贴在卡下方——左边是还剩多久，右边是整块的领取按钮。信息和行动都属于这张卡 */}
        <motion.div className="absolute left-1/2" style={{ top: `calc(50% + ${h / 2 + 14}px)`, width: w, marginLeft: -w / 2, opacity: infoVis }}>
          {o && (
            <div className="edge-light relative flex min-h-[88px] items-stretch overflow-hidden rounded-md bg-[rgba(30,28,25,0.88)] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
              <div className="flex min-w-0 flex-1 flex-col justify-center px-6 py-3">
                <p className="text-sm text-fg-2">
                  {lc === 'upcoming' ? <span className="text-info">即将免费 · {target != null && `${shDateTime(target)} 开始`}</span>
                    : target != null ? <>剩余时间<span className="text-fg-3"> · {shDateTime(target)} 截止</span></> : zh('freeType', o.type)}
                </p>
                <div className="mt-1.5">
                  {target != null ? (
                    <Countdown target={target} mode={lc === 'upcoming' ? 'start' : 'end'} now={now} variant="film" className={cn('text-[32px] font-medium leading-none tracking-[-0.05em]', lc === 'upcoming' ? 'text-info' : isUrgent(o, lc, now) ? 'text-primary' : 'text-foreground')} labelClassName="text-fg-3" />
                  ) : (
                    <span className="font-serif text-[28px] font-black leading-none">长期免费</span>
                  )}
                </div>
              </div>
              <AcquireButton href={o.url} health={o.linkHealth} label={CTA[o.type] ?? '免费获取'} size="lg" className="h-auto shrink-0 rounded-none px-9 text-lg font-medium [&_svg]:size-5" />
            </div>
          )}
        </motion.div>

        {/* 底边：进度 + 全部入口 */}
        <motion.div className="container-x absolute inset-x-0 bottom-[4vh] flex items-center gap-6 text-sm text-fg-3" style={{ opacity: barVis }}>
          <span className="font-mono tabular-nums"><span className="text-foreground">{String(cur + 1).padStart(2, '0')}</span> / {String(n).padStart(2, '0')}</span>
          <span className="relative h-px flex-1 bg-border-strong"><motion.span className="absolute inset-0 origin-left bg-primary" style={{ scaleX: progress }} /></span>
          <Link href="/free/" className="border-b border-foreground/25 pb-0.5 text-fg-2 transition-colors hover:border-primary hover:text-foreground">全部免费情报</Link>
        </motion.div>
      </div>
    </section>
  );
}
