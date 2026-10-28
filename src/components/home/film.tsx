'use client';
import { T as Tx } from '@/lib/i18n';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import type { GameVM } from '@/lib/present';
import type { DossierVM } from '@/lib/home-data';
import { PlatformMark } from '@/components/ui/platform-mark';
import { SearchTrigger } from '@/components/layout/search-trigger';
import { Magnetic, Tilt } from '@/components/fx/interact';
import { GLOW_VEIL, SCENE_IMG } from './free-deck';
import { cn } from '@/lib/utils';
import { hang } from '@/components/ui/hang';
import { TextLink } from '@/components/ui/button';

/* ───────────────────────────── 时间轴 ─────────────────────────────
 * 整段（首屏 → 海报墙 → 档案）是一个固定舞台上的一条镜头。下面每个区间都是本段滚动进度 p（0–1）。
 * 规则：同一时刻只有一个主动作；任何文字都不和另一组文字同时出现在画面中央；不超过 1 屏的静止。
 */
const T = {
  heroTextOut: [0.01, 0.07],  // 首屏标题上移淡出：在裁切框开始收缩前基本退完
  morph: [0.05, 0.2],         // 整屏美术收成中央一张竖版海报（同一张图，裁切框收缩）
  posterSwap: [0.17, 0.21],   // 裁切框里的横幅美术换成同一游戏的竖版海报
  wallIn: [0.08, 0.26],       // 海报墙从四周涌入（与收缩重叠，画面四周始终有内容）
  countIn: [0.22, 0.3],       // 「22 款游戏」在左栏浮现，数字随滚动计数
  countOut: [0.4, 0.45],
  flip: [0.42, 0.52],         // 中央海报翻面：黑神话 → 星露谷（墙里「抽出」样本游戏）
  wallOut: [0.44, 0.56],      // 墙后退、变暗、散开
  bgIn: [0.48, 0.6],          // 星露谷美术成为环境光
  panels: 0.58,               // 四组答案依次展开（每组 0.05 间隔，0.08 时长）
  titleIn: [0.72, 0.78],
  focus: [0.78, 0.9],          // 四组答案轮流聚焦
  exit: [0.9, 1],             // 收场：引线收回、文字退去，只留中央海报与环境光——这一帧由免费章接住（海报翻面成第一张卡）
};

const COLS = 7;
const PER_COL = 6;
const CENTER = Math.floor(COLS / 2);

const smoothStep = (t: number) => t * t * (3 - 2 * t);

function useViewport() {
  const [vp, setVp] = useState({ w: 1440, h: 900 });
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return vp;
}

const WALL_GAP = 0.011; // 列间距 / 视口宽（gap-[1.1vw]）

/** 墙的几何：列宽、格高（px）。墙宽 140vw、7 列 */
function wallGeo(vw: number) {
  const gap = vw * WALL_GAP;
  const colW = (vw * 1.4 - gap * (COLS - 1)) / COLS;
  return { gap, colW, cellH: colW * 1.5 };
}

/** 中央列：静止，正中是空位——中央海报在海报墙阶段就嵌在这个空位里 */
function SlotColumn({ games, vw }: { games: GameVM[]; vw: number }) {
  const { gap, cellH } = wallGeo(vw);
  const ks = [-3, -2, -1, 1, 2, 3];
  return (
    <div className="relative">
      {ks.map((k, i) => (
        <img key={k} src={games[i % games.length].art!.poster} alt="" loading="eager" decoding="async"
          className="absolute inset-x-0 aspect-[2/3] w-full rounded-[3px] object-cover brightness-[0.62] saturate-[0.7]"
          style={{ top: `calc(50% + ${k * (cellH + gap) - cellH / 2}px)` }} />
      ))}
      {/* 空位本身（透明）：中央海报对齐的目标 */}
      <div data-slot aria-hidden className="absolute inset-x-0 aspect-[2/3] w-full" style={{ top: `calc(50% - ${cellH / 2}px)` }} />
    </div>
  );
}

/** 海报墙的一列：奇偶列反向流动 */
function WallColumn({ games, p, dir, offset }: { games: GameVM[]; p: MotionValue<number>; dir: 1 | -1; offset: boolean }) {
  const y = useTransform(p, [T.wallIn[0], T.wallOut[1]], [dir * 260, dir * -260]);
  return (
    <motion.div className={cn('flex flex-col gap-[1.1vw]', offset && 'pt-[14vw]')} style={{ y }}>
      {games.map((g, i) => (
        <img key={`${g.id}-${i}`} src={g.art!.poster} alt="" loading="eager" decoding="async" className="aspect-[2/3] w-full rounded-[3px] object-cover brightness-[0.62] saturate-[0.7]" />
      ))}
    </motion.div>
  );
}

type Answer = { key: string; no: string; title: React.ReactNode; side: -1 | 1; row: -1 | 1; lines: React.ReactNode[] };

function answers(d: DossierVM): Answer[] {
  return [
    {
      key: 'buy', no: '01', title: <Tx zh="去哪买" en="Where to buy" />, side: -1, row: -1,
      lines: d.channels.slice(0, 3).map((c, i) => (
        <span key={i} className="flex items-center justify-between gap-4"><PlatformMark platform={c.platform} withLabel /><span className="text-fg-3"><Tx zh={c.priceNote ?? c.type} en={c.priceNoteEn ?? c.typeEn} /></span></span>
      )),
    },
    {
      key: 'save', no: '02', title: <Tx zh="存档在哪" en="Where saves are" />, side: -1, row: 1,
      lines: d.paths.slice(0, 2).map((p, i) => (
        <span key={i} className="block truncate"><span className="text-fg-3"><Tx zh={p.label} en={p.labelEn} />　</span><code className="font-mono text-[0.92em]">{p.path}</code></span>
      )),
    },
    {
      key: 'mod', no: '03', title: <Tx zh="MOD 与汉化" en="Mods & translations" />, side: 1, row: -1,
      lines: d.mods.slice(0, 2).map((m, i) => (
        <span key={i} className="block truncate">{m.name}<span className="text-fg-3">　{m.site}</span></span>
      )),
    },
    {
      key: 'fix', no: '04', title: <Tx zh="出了问题" en="When it breaks" />, side: 1, row: 1,
      lines: d.guides.slice(0, 2).map((g, i) => (
        <span key={i} className="block truncate">{g.title}<span className="text-fg-3">　<Tx zh={`${g.steps} 步`} en={`${g.steps} steps`} /></span></span>
      )),
    },
  ];
}

/** 一组答案：没有盒子——编号、强调色细线、标题、两三行内容；从海报边缘展开，一条线连回海报 */
function AnswerBlock({ a, i, p, card, vp, focus }: {
  a: Answer; i: number; p: MotionValue<number>; card: { w: number; h: number }; vp: { w: number; h: number }; focus: boolean | null;
}) {
  const start = T.panels + i * 0.05;
  const end = start + 0.08;
  // 整组宽度有上限：宽屏上不再把答案推到屏幕边缘（人眼一次看得完的范围约 1200px）
  const width = Math.min(340, (vp.w - card.w) / 2 - 120);
  const gap = Math.min(120, Math.max(48, (vp.w - card.w) / 2 - width - 72));
  const dy = a.row * card.h * 0.24 - card.h * 0.06;
  const x = useTransform(p, [start, end], [-a.side * (gap + width / 2), 0]);
  const opacity = useTransform(p, [start, end], [0, 1]);
  // 引线：展开时画出，收场时先收回海报（比文字早一步）
  const line = useTransform(p, [end - 0.03, end + 0.04, T.exit[0], T.exit[0] + 0.04], [0, 1, 1, 0]);
  const reveal = useTransform(p, [end - 0.02, end + 0.08], ['inset(0 0 100% 0)', 'inset(0 0 0% 0)']);
  const left = a.side < 0;

  return (
    <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(${a.side * (card.w / 2)}px, ${dy}px)` }}>
      {/* 连线：海报边缘 → 答案 */}
      <motion.span
        aria-hidden
        className={cn('absolute top-0 h-px bg-[var(--accent)] transition-opacity duration-500', left ? 'right-0 origin-right' : 'left-0 origin-left', focus === false && 'opacity-30')}
        style={{ width: gap, scaleX: line }}
      />
      <motion.span aria-hidden className="absolute top-0 size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]" style={{ scale: line, left: 0 }} />
      <motion.div
        className={cn('absolute transition-opacity duration-500', left && 'text-right', focus === false && 'opacity-35')}
        style={{ width, x, opacity, top: -17, [left ? 'right' : 'left']: gap + 20 }}
      >
        {/* 标题行的中线压在引线上；左侧两组右对齐，与右侧镜像 */}
        <p className={cn('flex h-[34px] items-center gap-3', left && 'justify-end')}>
          <span className="font-mono text-sm text-[var(--accent)]">{a.no}</span>
          <span className="font-serif text-[26px] font-bold leading-tight">{a.title}</span>
        </p>
        <motion.div className="mt-3 space-y-2 border-t border-foreground/15 pt-3 text-base leading-snug text-foreground/90" style={{ clipPath: reveal }}>
          {a.lines}
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * 首页第一段连续镜头：首屏 → 海报墙 → 档案。共享元素：
 *   首屏整屏美术 = 收缩后墙中央的那张海报；这张海报翻面 = 档案章的样本游戏；
 *   强调色随镜头里的游戏从「黑神话」赭色过渡到「星露谷」青绿。
 */
export function Film({ lead, popular, wall, total, d }: { lead: GameVM; popular: GameVM[]; wall: GameVM[]; total: number; d: DossierVM }) {
  const ref = useRef<HTMLElement>(null);
  const vp = useViewport();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const sample = d.game;
  const accentA = '#D08A4E';
  const accentB = '#5CC2B2';

  // 中央海报尺寸（舞台中心）
  const ch = Math.min(vp.h * 0.52, 500);
  const card = { w: Math.round((ch * 2) / 3), h: Math.round(ch) };
  const insetY = (vp.h - card.h) / 2;
  const insetX = (vp.w - card.w) / 2;

  // ── 收场 ──
  const exitO = useTransform(p, T.exit, [1, 0]);
  // ── 首屏 ──
  const heroTextY = useTransform(p, T.heroTextOut, [0, -80]);
  const heroTextO = useTransform(p, T.heroTextOut, [1, 0]);
  const heroPE = useTransform(heroTextO, (o) => (o > 0.5 ? 'auto' : 'none'));
  // ── 收缩：裁切框从整屏收到海报尺寸 ──
  const m = useTransform(p, T.morph, [0, 1]);
  // 横向收得快、纵向收得慢：裁切框很快变成竖版比例，不会出现「横条」中间态
  const clip = useTransform(m, (t) => { const tx = Math.pow(t, 0.55), ty = Math.pow(t, 1.5); return `inset(${ty * insetY}px ${tx * insetX}px ${ty * insetY}px ${tx * insetX}px round ${t * 6}px)`; });
  const heroGrad = useTransform(m, [0, 0.6], [1, 0]);
  const artScale = useTransform(m, [0, 1], [1.08, 1]);
  const shade = useTransform(m, [0, 1], [0.15, 0]);
  const morphGone = useTransform(p, T.posterSwap, [1, 0]);
  const ambientO = useTransform(p, [T.morph[0], (T.morph[0] + T.wallIn[1]) / 2, T.wallIn[1]], [0, 0.45, 0]);
  const posterIn = useTransform(p, T.posterSwap, [0, 1]);
  // ── 海报墙 ──
  const wallO = useTransform(p, [T.wallIn[0], T.wallIn[1], T.wallOut[0], T.wallOut[1]], [0, 1, 1, 0]);
  const wallS = useTransform(p, [T.wallIn[0], T.wallIn[1], T.wallOut[1]], [1.35, 1, 0.82]);
  const wallTilt = useTransform(p, [T.wallIn[0], T.wallOut[1]], [34, 14]);
  const count = useTransform(p, [T.countIn[0], T.countIn[1] + 0.04], [0, total]);
  const countText = useTransform(count, (v) => String(Math.round(v)));
  const countO = useTransform(p, [T.countIn[0], T.countIn[1], T.countOut[0], T.countOut[1]], [0, 1, 1, 0]);
  const countY = useTransform(p, [T.countIn[0], T.countIn[1], T.countOut[1]], [40, 0, -30]);
  // ── 翻面 + 换色 ──
  const flip = useTransform(p, T.flip, [0, 180]);
  const frontO = useTransform(flip, (v) => (v < 90 ? 1 : 0));
  const backO = useTransform(flip, (v) => (v < 90 ? 0 : 1));
  const lift = useTransform(p, [T.flip[0], (T.flip[0] + T.flip[1]) / 2, T.flip[1]], [1, 1.08, 1]);
  const accent = useTransform(p, T.flip, [accentA, accentB]);
  // seat：0 = 平放在画面中央，1 = 嵌在墙的空位里（与空位同尺寸、同倾斜、同旋转）
  const seat = useTransform(p, [T.morph[1], T.wallIn[1], T.flip[0], T.flip[0] + 0.05], [0, 1, 1, 0]);
  const slotScale = wallGeo(vp.w).colW / card.w;
  const cardRotZ = useTransform(() => -10 * smoothStep(seat.get()));
  const cardRotX = useTransform(() => wallTilt.get() * smoothStep(seat.get()));
  const cardScale = useTransform(() => lift.get() * (1 + (slotScale * wallS.get() - 1) * smoothStep(seat.get())));
  // 嵌在墙里时与邻居同样压暗（墙图 brightness .62）；被抽出时才亮起来
  const cardDim = useTransform(() => 0.38 * smoothStep(seat.get()));
  // ── 档案 ──
  const bgO = useTransform(p, T.bgIn, [0, 1]);
  const titleO = useTransform(p, T.titleIn, [0, 1]);
  const titleVis = useTransform(() => titleO.get() * exitO.get());
  // 翻面一结束就说明「为什么换成这一款」：以它为例
  const eyebrowO = useTransform(p, [T.flip[1] - 0.02, T.flip[1] + 0.04], [0, 1]);
  const eyebrowVis = useTransform(() => eyebrowO.get() * exitO.get());
  const titleY = useTransform(p, T.titleIn, [24, 0]);
  const [focus, setFocus] = useState<number | null>(null);
  useMotionValueEvent(p, 'change', (v) => {
    const next = v < T.focus[0] ? null : Math.min(3, Math.floor(((v - T.focus[0]) / (T.focus[1] - T.focus[0])) * 4));
    setFocus((prev) => (prev === next ? prev : next));
  });

  const cols = Array.from({ length: COLS }, (_, c) => Array.from({ length: PER_COL }, (_, r) => wall[(c * 5 + r * 3 + c) % wall.length]));
  const list = answers(d);

  return (
    <section ref={ref} data-film aria-label="Wanji Index" className="relative h-[480vh] bg-shell">
      <motion.div className="sticky top-0 h-[100svh] overflow-hidden" style={{ '--accent': accent } as React.CSSProperties}>
        {/* ── 档案的环境：星露谷的夜景本身（重度压暗 + 暗角）——有地点感，又不抢四组答案 ── */}
        <motion.div aria-hidden className="absolute inset-0" style={{ opacity: bgO }}>
          {sample.art && <img src={sample.art.hero} alt="" className={SCENE_IMG} />}
          <div className={GLOW_VEIL} />
        </motion.div>

        {/* ── 海报墙 ── */}
        <motion.div aria-hidden className="absolute inset-0 [perspective:2200px]" style={{ opacity: wallO }}>
          <motion.div className="absolute left-1/2 top-1/2 w-[140vw]" style={{ x: '-50%', y: '-50%', rotateX: wallTilt, rotateZ: -10, scale: wallS }}>
            <div className="grid gap-[1.1vw]" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}>
              {cols.map((c, i) => (i === CENTER ? <SlotColumn key={i} games={c} vw={vp.w} /> : <WallColumn key={i} games={c} p={p} dir={i % 2 ? -1 : 1} offset={i % 2 === 1} />))}
            </div>
          </motion.div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_42%_at_50%_50%,rgba(12,11,10,0.78)_0%,rgba(12,11,10,0.5)_55%,rgba(12,11,10,0.38)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_40%,rgba(12,11,10,0.92)_100%)]" />
        </motion.div>

        {/* ── 环境光：首屏美术的暗化副本，只在收缩过程中出现，填满裁切框四周 ── */}
        <motion.div aria-hidden className="absolute inset-0" style={{ opacity: ambientO }}>
          {lead.art && <img src={lead.art.hero} alt="" className="size-full scale-110 object-cover object-[64%_30%] opacity-60" />}
          <div className="absolute inset-0 bg-shell/60" />
        </motion.div>

        {/* ── 首屏美术：整屏 → 裁切成中央海报 ── */}
        <motion.div aria-hidden className="absolute inset-0" style={{ clipPath: clip, opacity: morphGone }}>
          {lead.art && <motion.img src={lead.art.hero} alt="" fetchPriority="high" className="size-full object-cover object-[64%_30%] motion-safe:animate-[kenburns_12s_ease-out_both]" style={{ scale: artScale }} />}
          <motion.div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(12,11,10,0.6)_0%,transparent_30%,rgba(12,11,10,0.3)_100%)]" style={{ opacity: heroGrad }} />
          <motion.div className="absolute inset-0 bg-shell" style={{ opacity: shade }} />
        </motion.div>

        {/* ── 中央海报：正面 = 首屏游戏，背面 = 样本游戏 ── */}
        <motion.div className="absolute left-1/2 top-1/2 [perspective:2200px]" style={{ width: card.w, height: card.h, x: '-50%', y: '-50%' }}>
          {/* 翻面不依赖 backface-visibility（透明度、滤镜等会让 3D 层被拍平而失效）：过 90° 时直接切换正反面 */}
          <motion.div className="relative size-full [perspective:2200px]" style={{ opacity: posterIn }}>
          <motion.div data-card className="relative size-full" style={{ rotateY: flip, rotateX: cardRotX, rotateZ: cardRotZ, scale: cardScale }}>
            <motion.div className="edge-light absolute inset-0 overflow-hidden rounded-md shadow-[0_50px_100px_-30px_rgba(0,0,0,0.95)]" style={{ opacity: frontO }}>
              {lead.art && <img src={lead.art.poster} alt={`${lead.name} 海报`} className="size-full object-cover" />}
              <motion.div aria-hidden className="absolute inset-0 bg-shell" style={{ opacity: cardDim }} />
            </motion.div>
            <motion.div className="absolute inset-0" style={{ opacity: backO }}>
            <Link
              href={`/games/${sample.slug}/`}
              className="absolute inset-0 rounded-md shadow-[0_50px_100px_-30px_rgba(0,0,0,0.95)] [transform:rotateY(180deg)]"
            >
              {/* 档案阶段的海报随鼠标微倾，带一道跟随高光 */}
              <Tilt max={5} className="size-full rounded-md">
                <div className="edge-light relative size-full overflow-hidden rounded-md">
                  {sample.art && <img src={sample.art.poster} alt={`${sample.name} 海报`} className="size-full object-cover" />}
                </div>
              </Tilt>
            </Link>
            </motion.div>
          </motion.div>
          </motion.div>
        </motion.div>

        {/* ── 四组答案 ── */}
        <motion.div className="absolute inset-0" style={{ opacity: exitO }}>
          {list.map((a, i) => <AnswerBlock key={a.key} a={a} i={i} p={p} card={card} vp={vp} focus={focus === null ? null : focus === i} />)}
        </motion.div>

        {/* ── 文字层 ── */}
        {/* 首屏：一句话的画面——居中。标题、说明、搜索、热门都在中轴上；署名与滚动提示贴在左右下角 */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(12,11,10,0.62)_0%,rgba(12,11,10,0.4)_45%,rgba(12,11,10,0.7)_100%)]" style={{ opacity: heroTextO }} />
        <motion.div className="container-x absolute inset-0 flex flex-col items-center justify-center pt-[var(--header-h)] text-center" style={{ y: heroTextY, opacity: heroTextO, pointerEvents: heroPE }}>
          <h1 className="font-serif text-[clamp(52px,6.4vw,112px)] font-black leading-[1.04] tracking-[-0.05em]">
            {([['每一款游戏，', 'Every game'], ['都有一份档案。', 'gets a file.']] as const).map(([line, lineEn], i) => (
              <span key={line} className="block overflow-hidden pb-[0.04em]">
                <span className="block animate-line-up" style={{ animationDelay: `calc(var(--intro-delay, 0s) + ${0.2 + i * 0.1}s)` }}><Tx zh={hang(line)} en={lineEn} /></span>
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-[34em] animate-rise text-lg leading-[1.75] text-foreground/85" style={{ animationDelay: 'calc(var(--intro-delay, 0s) + 0.45s)' }}>
            <Tx zh={`去哪买、现在免不免费、MOD 与汉化、存档与报错。${total} 款 PC 游戏的资料，一处收齐，全部免费。`} en={`Where to buy, what’s free, mods, saves and fixes — ${total} PC games, all in one place, all free.`} />
          </p>
          <div className="mt-9 w-full max-w-[600px] animate-rise" style={{ animationDelay: 'calc(var(--intro-delay, 0s) + 0.55s)' }}>
            <Magnetic strength={6} radius={60}>
              <SearchTrigger variant="bar" />
            </Magnetic>
            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-fg-2">
              <span className="text-fg-3"><Tx zh="热门" en="Popular" /></span>
              {popular.map((g) => (
                <Link key={g.id} href={`/games/${g.slug}/`} className="underline-offset-4 transition-colors hover:text-foreground hover:underline"><Tx zh={g.name} en={g.en || g.name} /></Link>
              ))}
            </p>
          </div>
        </motion.div>
        <motion.div className="container-x pointer-events-none absolute inset-x-0 bottom-[5vh] flex items-center justify-between text-sm text-fg-3" style={{ opacity: heroTextO }}>
          <span><Tx zh={lead.name} en={lead.en || lead.name} /> · <Tx zh="官方美术" en="Official art" /></span>
          <span className="flex items-center gap-3">
            <Tx zh="向下滚动" en="Scroll" />
            <span aria-hidden className="relative block h-px w-14 overflow-hidden bg-foreground/25">
              <span className="absolute inset-y-0 left-0 w-1/2 bg-foreground/80 motion-safe:animate-[scroll-hint_2.2s_cubic-bezier(.65,0,.35,1)_infinite]" />
            </span>
          </span>
        </motion.div>

        {/* 海报墙：数字在卡片正下方、中轴上（卡片是主角，数字是它的注脚）；底部压暗保证可读 */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh] bg-[linear-gradient(0deg,rgba(12,11,10,0.95)_0%,rgba(12,11,10,0.7)_45%,transparent_100%)]" style={{ opacity: countO }} />
        <motion.div className="pointer-events-none absolute inset-x-0 flex flex-col items-center text-center" style={{ top: `calc(50% + ${card.h / 2 + 22}px)`, opacity: countO, y: countY }}>
          <p className="flex items-baseline gap-4">
            <motion.span className="font-serif text-[clamp(64px,6vw,96px)] font-black leading-none tracking-[-0.05em] text-[var(--accent)] tabular-nums" aria-label={String(total)}>{countText}</motion.span>
            <span className="text-xl text-foreground/90"><Tx zh="款游戏，每一款都有一份档案" en="games, each with its own file" /></span>
          </p>
          <TextLink href="/games/" tone="accent" className="pointer-events-auto mt-2"><Tx zh="进入游戏库" en="Browse games" /></TextLink>
        </motion.div>

        {/* 档案：标题在卡片正上方，入口在正下方——都在中轴上，四组答案在两侧对称展开 */}
        <motion.div className="pointer-events-none absolute inset-x-0 flex flex-col items-center text-center" style={{ bottom: `calc(50% + ${card.h / 2 + 26}px)` }}>
          <motion.p className="text-sm text-[var(--accent)]" style={{ opacity: eyebrowVis }}><Tx zh={`以《${sample.name}》为例`} en={`Take ${sample.en || sample.name}`} /></motion.p>
          <motion.h2 style={{ opacity: titleVis, y: titleY }} className="mt-2 font-serif text-[clamp(30px,2.6vw,44px)] font-black leading-tight tracking-[-0.03em]"><Tx zh={hang('一款游戏，四个答案。')} en="One game, four answers." /></motion.h2>
        </motion.div>
        <motion.div className="absolute inset-x-0 flex justify-center" style={{ top: `calc(50% + ${card.h / 2 + 28}px)`, opacity: titleVis }}>
          <TextLink href={`/games/${sample.slug}/`} tone="accent"><Tx zh={`打开${sample.name}完整档案`} en={`Open the full ${sample.en || sample.name} file`} /></TextLink>
        </motion.div>
      </motion.div>
    </section>
  );
}
