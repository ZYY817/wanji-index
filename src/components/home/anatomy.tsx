'use client';
import { T } from '@/lib/i18n';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import { ArrowRight, BookOpen, FolderOpen, Puzzle, ShoppingBag, type LucideIcon } from 'lucide-react';
import type { DossierVM } from '@/lib/home-data';
import { PlatformMark } from '@/components/ui/platform-mark';
import { GameLogo } from '@/components/game/game-logo';
import { ArchiveRing } from '@/components/fx/archive-ring';
import { Ring3D } from '@/components/fx/ring-3d';
import { useMedia, useMotionOK } from '@/components/fx/hooks';
import { cn } from '@/lib/utils';

// 拆解构图（桌面，px）：海报居中，四张信息卡分列四角；卡片入场时从海报中心飞出到这里
const POSTER_W = 280;
const CARD_W = 320;
const GAP = 76;
const CX = POSTER_W / 2 + GAP + CARD_W / 2; // 卡片中心到舞台中心的水平距离
const CY = 132;                              // 卡片中心到舞台中心的垂直距离

type Slot = { key: string; icon: LucideIcon; title: React.ReactNode; count: number; x: -1 | 1; y: -1 | 1; body: React.ReactNode };

function slots(d: DossierVM): Slot[] {
  return [
    {
      key: 'buy', icon: ShoppingBag, title: <T zh="去哪买" en="Where to buy" />, count: d.channels.length, x: -1, y: -1,
      body: (
        <ul className="space-y-2">
          {d.channels.slice(0, 3).map((c, i) => (
            <li key={i} className="flex items-center justify-between gap-3 text-sm">
              <PlatformMark platform={c.platform} withLabel className="text-foreground" />
              <span className="text-fg-3"><T zh={c.priceNote ?? c.type} en={c.priceNoteEn ?? c.typeEn} /></span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: 'mod', icon: Puzzle, title: <T zh="MOD 与汉化" en="Mods & translations" />, count: d.mods.length, x: 1, y: -1,
      body: (
        <ul className="space-y-2">
          {d.mods.slice(0, 2).map((m, i) => (
            <li key={i} className="text-sm">
              <span className="block truncate text-foreground">{m.name}</span>
              <span className="text-xs text-fg-3"><T zh={`来自 ${m.site}`} en={`From ${m.site}`} /></span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: 'save', icon: FolderOpen, title: <T zh="存档在哪" en="Where saves are" />, count: d.paths.length, x: -1, y: 1,
      body: (
        <ul className="space-y-2">
          {d.paths.slice(0, 2).map((p, i) => (
            <li key={i}>
              <span className="text-xs text-fg-3"><T zh={p.label} en={p.labelEn} /></span>
              <code className="mt-0.5 block truncate font-mono text-xs text-foreground">{p.path}</code>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: 'fix', icon: BookOpen, title: <T zh="出了问题" en="When it breaks" />, count: d.guides.length + d.tools.length, x: 1, y: 1,
      body: (
        <ul className="space-y-2">
          {d.guides.slice(0, 2).map((g, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-foreground">{g.title}</span>
              <span className="shrink-0 text-xs text-fg-3"><T zh={`${g.steps} 步`} en={`${g.steps} steps`} /></span>
            </li>
          ))}
        </ul>
      ),
    },
  ];
}

function Card({ s, className, focus, reveal }: { s: Slot; className?: string; focus?: boolean | null; reveal?: MotionValue<string> }) {
  const Icon = s.icon;
  return (
    <article
      className={cn(
        'relative border bg-card bg-[linear-gradient(160deg,rgba(255,255,255,0.08)_0%,transparent_45%)] p-5 transition-[border-color,opacity] duration-500',
        focus ? 'border-primary/60' : 'border-border-strong',
        focus === false && 'opacity-55',
        className,
      )}
    >
      <span aria-hidden className={cn('absolute -left-[3px] -top-[3px] size-[5px] rounded-full transition-colors duration-500', focus ? 'bg-primary' : 'bg-primary/60')} />
      <header className="mb-4 flex items-center gap-3 border-b border-border pb-3">
        <span className="grid size-8 place-items-center rounded-full border border-primary/30 text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
        <h3 className="flex-1 font-display text-lg font-semibold">{s.title}</h3>
        <span className="tabular text-sm text-fg-3">{s.count}</span>
      </header>
      <motion.div style={reveal ? { clipPath: reveal } : undefined}>{s.body}</motion.div>
    </article>
  );
}

/** 一张信息卡的飞出：从海报中心（相对自身最终位置的反向偏移）飞到最终位置，并错峰 */
function FlyCard({ s, i, p, focus }: { s: Slot; i: number; p: MotionValue<number>; focus: boolean | null }) {
  const start = 0.34 + i * 0.05;
  const end = start + 0.2;
  const x = useTransform(p, [start, end], [-s.x * CX, 0]);
  const y = useTransform(p, [start, end, 1], [-s.y * CY, 0, s.y * 14 * (i % 2 ? 1.6 : 1)]);
  const scale = useTransform(p, [start, end], [0.55, 1]);
  const opacity = useTransform(p, [start, start + 0.08], [0, 1]);
  // 连接线：卡片落位后从海报边缘画向卡片
  const line = useTransform(p, [end - 0.04, end + 0.06], [0, 1]);
  const node = useTransform(p, [end + 0.02, end + 0.07], [0, 1]);
  // 卡片落位后，内容自上而下逐行揭开（像档案被逐行打印出来）
  const bodyClip = useTransform(p, [end - 0.02, end + 0.1], [100, 0]);
  const reveal = useTransform(bodyClip, (v) => `inset(0 0 ${v}% 0)`);
  return (
    <>
      <motion.span
        aria-hidden
        className={cn('absolute top-1/2 h-px w-[var(--gap)] bg-primary/60', s.x < 0 ? 'right-1/2 mr-[calc(var(--poster)/2)] origin-right' : 'left-1/2 ml-[calc(var(--poster)/2)] origin-left')}
        style={{ scaleX: line, y: s.y * CY }}
      />
      {/* 连线两端的节点：海报一侧 + 卡片一侧 */}
      {[0, 1].map((k) => (
        <motion.span
          key={k}
          aria-hidden
          className="absolute top-1/2 size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary bg-background"
          style={{
            left: `calc(50% + ${s.x} * (var(--poster) / 2 + ${k} * var(--gap)))`,
            y: s.y * CY,
            scale: node,
          }}
        />
      ))}
      {/* 外层负责落位（静态居中），内层只做动画位移，避免与 translate 居中互相覆盖 */}
      <div className="absolute w-[var(--card)] -translate-x-1/2 -translate-y-1/2" style={{ left: `calc(50% + ${s.x * CX}px)`, top: `calc(50% + ${s.y * CY}px)` }}>
        <motion.div style={{ x, y, scale, opacity }}>
          <Card s={s} focus={focus} reveal={reveal} />
        </motion.div>
      </div>
    </>
  );
}

/**
 * 第 3 章 · 一款游戏，四个答案（Apple 式拆解视图）。
 * 舞台固定一屏，滚动驱动四幕：整屏美术 + Logo 开场 → 美术退暗、竖版海报升起 → 四张信息卡从海报背后飞出落位并连线 → 标题与入口浮现。
 * 小屏 / reduced-motion：静态的「海报 + 2×2 卡片」。
 */
export function Anatomy({ d }: { d: DossierVM }) {
  const ref = useRef<HTMLElement>(null);
  const ok = useMotionOK();
  const wide = useMedia('(min-width: 1280px)');
  const pinned = ok && wide;
  const g = d.game;
  const list = slots(d);

  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // 第一幕：整屏美术 + Logo
  const bgScale = useTransform(p, [0, 0.3], [1.12, 1]);
  const bgDim = useTransform(p, [0.1, 0.3], [0.25, 0.82]);
  const introOpacity = useTransform(p, [0.06, 0.16], [1, 0]);
  const introY = useTransform(p, [0.06, 0.16], [0, -40]);
  // 第二幕：海报升起
  const posterOpacity = useTransform(p, [0.14, 0.26], [0, 1]);
  const posterScale = useTransform(p, [0.14, 0.3], [1.3, 1]);
  const posterY = useTransform(p, [0.14, 0.3, 1], [60, 0, -10]);
  // 第四幕：标题与入口
  const headOpacity = useTransform(p, [0.62, 0.72], [0, 1]);
  const headY = useTransform(p, [0.62, 0.72], [24, 0]);
  // 档案之环：随海报一起升起，并随滚动缓慢转动、从倾斜转到正面
  const ringOpacity = useTransform(p, [0.16, 0.32], [0, 1]);
  const ringRotate = useTransform(p, [0.16, 1], [-30, 40]);
  const ringTilt = useTransform(p, [0.16, 0.45], [62, 18]);
  const ringScale = useTransform(p, [0.16, 0.4], [0.7, 1]);
  const [gl, setGL] = useState(false);
  const onGL = useCallback(() => setGL(true), []);
  // 海报表面的光带：海报落定时斜扫一次
  const sweep = useTransform(p, [0.26, 0.4], ['-120%', '220%']);
  // 收束阶段四张卡轮流成为焦点（null = 尚未进入轮换，全部正常亮度）
  const [focus, setFocus] = useState<number | null>(null);
  useMotionValueEvent(p, 'change', (v) => {
    const next = v < 0.64 ? null : Math.min(3, Math.floor((v - 0.64) / 0.08));
    setFocus((prev) => (prev === next ? prev : next));
  });

  if (!pinned) {
    return (
      <section ref={ref} aria-labelledby="anatomy-title" className="border-t border-border bg-background py-20 md:py-28">
        <div className="container-x">
          <p className="text-sm tracking-[0.04em] text-primary"><T zh={`以《${g.name}》为例`} en={`Take ${g.en || g.name}`} /></p>
          <h2 id="anatomy-title" className="mt-4 font-display text-[clamp(36px,5vw,64px)] font-semibold leading-[1.08] tracking-[-0.018em]"><T zh="一款游戏，四个答案。" en="One game, four answers." /></h2>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-[240px_minmax(0,1fr)] md:gap-10">
            {g.art && <img src={g.art.poster} alt="" loading="lazy" className="aspect-[2/3] w-full max-w-[240px] rounded-sm object-cover ring-1 ring-white/10" />}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{list.map((s) => <Card key={s.key} s={s} />)}</div>
          </div>
          <Link href={`/games/${g.slug}/`} className="mt-10 inline-flex min-h-11 items-center gap-2 border-b border-foreground/30 text-base font-medium hover:border-primary">
            <T zh={`打开${g.name}完整档案`} en={`Open the full ${g.en || g.name} file`} /> <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} aria-labelledby="anatomy-title" className="relative h-[360vh] bg-background">
      <div
        className="sticky top-0 h-[100svh] overflow-hidden"
        style={{ '--poster': `${POSTER_W}px`, '--card': `${CARD_W}px`, '--gap': `${GAP}px` } as React.CSSProperties}
      >
        {/* 背景：整屏美术 → 退暗成环境光 */}
        <motion.div aria-hidden className="absolute inset-0 will-change-transform" style={{ scale: bgScale }}>
          {g.art && <img src={g.art.hero} alt="" loading="eager" fetchPriority="low" decoding="async" className="size-full object-cover" />}
        </motion.div>
        <motion.div aria-hidden className="absolute inset-0 bg-background" style={{ opacity: bgDim }} />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_30%,rgba(0,0,0,0.8)_100%)]" />

        {/* 第一幕：Logo + 引子 */}
        <motion.div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center" style={{ opacity: introOpacity, y: introY }}>
          {g.art?.logo && <GameLogo src={g.art.logo} className="w-[min(520px,46vw)] drop-shadow-[0_12px_40px_rgba(0,0,0,0.6)]" />}
          <p className="mt-8 text-lg text-foreground/85"><T zh={`以《${g.name}》为例，看一份档案里有什么`} en={`Here’s what’s in a file, using ${g.en || g.name}`} /></p>
        </motion.div>

        {/* 第四幕：标题 */}
        <motion.div className="absolute inset-x-0 top-[calc(var(--header-h)+5vh)] z-10 text-center" style={{ opacity: headOpacity, y: headY }}>
          <h2 id="anatomy-title" className="font-display text-[clamp(40px,4vw,64px)] font-semibold leading-[1.08] tracking-[-0.018em]"><T zh="一款游戏，四个答案。" en="One game, four answers." /></h2>
        </motion.div>

        {/* 第二、三幕：档案之环 + 海报 + 四张信息卡 */}
        <div className="absolute inset-0 z-10 translate-y-[3vh]">
          {/* 先显示 SVG 版作为底图；WebGL 首帧渲染完成后交叉淡入实时 3D 版（同一组滚动参数驱动） */}
          <div className="absolute left-1/2 top-1/2 size-[580px] -translate-x-1/2 -translate-y-1/2">
            <motion.div className="relative size-full" style={{ opacity: ringOpacity, scale: ringScale }}>
              <ArchiveRing rotate={ringRotate} tilt={ringTilt} className={cn('size-full transition-opacity duration-700', gl && 'opacity-0')} />
              <Ring3D rotate={ringRotate} tilt={ringTilt} onReady={onGL} className={cn('absolute -inset-[20%] transition-opacity duration-700', gl ? 'opacity-100' : 'opacity-0')} />
            </motion.div>
          </div>
          {list.map((s, i) => <FlyCard key={s.key} s={s} i={i} p={p} focus={focus === null ? null : focus === i} />)}
          <div className="absolute left-1/2 top-1/2 w-[var(--poster)] -translate-x-1/2 -translate-y-1/2">
            <motion.div style={{ y: posterY, scale: posterScale, opacity: posterOpacity }}>
              <div className="relative overflow-hidden rounded-md shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/15">
                {g.art && <img src={g.art.poster} alt={`${g.name} 官方海报`} loading="eager" className="aspect-[2/3] w-full object-cover" />}
                <motion.span aria-hidden className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(255,244,224,0.35),transparent)]" style={{ x: sweep }} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* 第四幕：入口 */}
        <motion.div className="absolute inset-x-0 bottom-[6vh] z-10 flex justify-center" style={{ opacity: headOpacity }}>
          <Link href={`/games/${g.slug}/`} className="inline-flex min-h-11 items-center gap-2 border-b border-foreground/30 text-base font-medium transition-colors hover:border-primary">
            <T zh={`打开${g.name}完整档案`} en={`Open the full ${g.en || g.name} file`} /> <ArrowRight aria-hidden className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
