'use client';
import { T } from '@/lib/i18n';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import type { GameVM } from '@/lib/present';
import { buttonVariants } from '@/components/ui/button';
import { PlatformMark } from '@/components/ui/platform-mark';
import { useFinePointer, useIsDesktop, useMotionOK, useLiveTransform } from '@/components/fx/hooks';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// 每列行程 ±480px：奇偶列反向，快速滚动时几乎看不清单张，形成“海报淹没感”
const TRAVEL = 480;

function Column({
  games, progress, direction, offset, dense,
}: { games: GameVM[]; progress: MotionValue<number>; direction: 1 | -1; offset: boolean; dense: boolean }) {
  const y = useTransform(progress, [0, 1], [direction * TRAVEL, direction * -TRAVEL]);
  return (
    <motion.div
      className={cn('flex flex-col will-change-transform', dense ? 'gap-[1vw]' : 'gap-[1.8vw]', offset && 'pt-[20vw]')}
      style={{ y }}
    >
      {games.map((g, i) => (
        <motion.div
          key={`${g.id}-${i}`}
          className="[perspective:1000px]"
          whileHover={{ rotateY: direction * (dense ? 8 : 5), rotateX: 5, scale: 1.08, zIndex: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26, mass: 0.55 }}
        >
          <Link
            href={`/games/${g.slug}/`}
            tabIndex={-1}
            aria-hidden
            className="group relative block aspect-[2/3] overflow-hidden rounded-sm bg-surface-2 ring-1 ring-white/[0.06] transition-[box-shadow,ring-color] duration-500 hover:ring-primary/50 hover:shadow-[0_30px_70px_-26px_rgba(216,182,122,0.55)]"
          >
            <img src={g.art!.poster} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.07]" />
            <span aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(19,18,17,0.97)_0%,rgba(19,18,17,0.5)_42%,transparent_72%)] opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
            <span className="absolute inset-0 flex flex-col justify-end p-[8%] opacity-0 transition-opacity duration-400 group-hover:opacity-100">
              <span className="font-serif text-[clamp(14px,1.15vw,20px)] font-bold leading-tight"><T zh={g.name} en={g.en || g.name} /></span>
              <span className="mt-1.5 flex items-center gap-2 text-xs text-fg-2">
                <T zh={`${g.counts.total} 条资源`} en={`${g.counts.total} resources`} />
                <span className="flex gap-1 text-foreground/80">{g.platforms.map((p) => <PlatformMark key={p} platform={p} />)}</span>
              </span>
            </span>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

// 前景层：少量大海报从左右边缘以更快的速度掠过（速度约为墙面的 1.6 倍），制造第三层景深
const FRONT = [
  { left: '-4vw', top: '12%', w: '16vw', rot: -8, from: 60, to: -90 },
  { left: '84vw', top: '30%', w: '18vw', rot: 7, from: 90, to: -120 },
  { left: '6vw', top: '68%', w: '13vw', rot: 5, from: 110, to: -140 },
  { left: '76vw', top: '-6%', w: '13vw', rot: -6, from: 40, to: -70 },
  { left: '90vw', top: '74%', w: '11vw', rot: -4, from: 120, to: -150 },
] as const;

function FrontPoster({ g, cfg, progress }: { g: GameVM; cfg: (typeof FRONT)[number]; progress: MotionValue<number> }) {
  const y = useTransform(progress, [0, 1], [`${cfg.from}vh`, `${cfg.to}vh`]);
  return (
    <motion.div className="absolute will-change-transform" style={{ left: cfg.left, top: cfg.top, width: cfg.w, y, rotate: cfg.rot }}>
      <Link href={`/games/${g.slug}/`} tabIndex={-1} className="group block overflow-hidden rounded-md shadow-[0_50px_90px_-30px_rgba(0,0,0,0.95)] ring-1 ring-white/10">
        <img src={g.art!.poster} alt="" loading="lazy" decoding="async" className="aspect-[2/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
      </Link>
    </motion.div>
  );
}

/**
 * 第 2 章 · 片库。整屏只有海报墙本身：3D 倾斜的海报列，奇偶列反向滚动；
 * 墙面倾角随滚动从 28° 放平到 10°（镜头慢慢抬起），正中只有一个数字和一个入口，不放任何说明文字。
 */
export function PosterWall({ games, total }: { games: GameVM[]; total: number }) {
  const ref = useRef<HTMLElement>(null);
  const ok = useMotionOK();
  const desktop = useIsDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const still = useTransform(scrollYProgress, () => 0.5);
  const p = ok ? scrollYProgress : still;
  const tilt = useLiveTransform(p, [0, 1], desktop ? [28, 10] : [16, 8]);
  const spin = useLiveTransform(p, [0, 1], desktop ? [-14, -6] : [-8, -4]);
  const zoom = useTransform(p, [0, 1], [1.08, 0.96]);
  // 数字在墙面放平的过程中浮现：先小后大，避免与上一章的标题重叠
  const numOpacity = useLiveTransform(p, [0.12, 0.38], [ok ? 0 : 1, 1]);
  const numScale = useLiveTransform(p, [0.12, 0.45], [ok ? 0.86 : 1, 1]);
  // 计数绑定在滚动位置上：0 → total（不是按时间播放），与海报涌入同步
  const countMV = useLiveTransform(p, [0.1, 0.4], [ok ? 0 : total, total]);
  const [count, setCount] = useState(total);
  useMotionValueEvent(countMV, 'change', (v) => setCount(Math.round(v)));
  // 鼠标聚光灯：光标附近亮、其余略暗
  const fine = useFinePointer();
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const spot = useMotionTemplate`radial-gradient(circle 320px at ${mx}% ${my}%, transparent 0%, rgba(19,18,17,0.55) 100%)`;

  const cols = desktop ? 8 : 5;
  const perCol = 7;
  const columns = Array.from({ length: cols }, (_, c) =>
    Array.from({ length: perCol }, (_, r) => games[(c * 5 + r * 3 + c) % games.length]),
  );

  return (
    <section ref={ref} aria-labelledby="wall-title" className="relative h-[220vh] bg-background">
      <div
        className="sticky top-0 h-[100svh] overflow-hidden"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(((e.clientX - r.left) / r.width) * 100);
          my.set(((e.clientY - r.top) / r.height) * 100);
        }}
      >
        <div aria-hidden className="absolute inset-0 [perspective:2200px]">
          <motion.div
            className={cn('absolute left-1/2 top-1/2 will-change-transform', desktop ? 'w-[150vw]' : 'w-[210vw]')}
            style={{ x: '-50%', y: '-46%', rotateX: tilt, rotateZ: spin, scale: zoom }}
          >
            <div className={cn('grid', desktop ? 'gap-[1vw]' : 'gap-[1.8vw]')} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {columns.map((col, c) => (
                <Column key={c} games={col} progress={p} direction={c % 2 === 0 ? 1 : -1} offset={c % 2 === 1} dense={desktop} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* 第三层：前景大海报 */}
        {desktop && (
          <div aria-hidden className="absolute inset-0">
            {FRONT.map((cfg, i) => {
              const g = games[(i * 7 + 3) % games.length];
              return g ? <FrontPoster key={i} g={g} cfg={cfg} progress={p} /> : null;
            })}
          </div>
        )}

        {/* 鼠标聚光灯（仅鼠标设备） */}
        {fine && ok && <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: spot }} />}

        {/* 只压上下边缘与正中一小块，海报铺满整屏 */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(19,18,17,0.88)_0%,rgba(19,18,17,0.5)_36%,transparent_68%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,#131211,transparent)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,#131211,transparent)]" />

        <motion.div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center text-center" style={{ opacity: numOpacity, scale: numScale }}>
          {/* 数字单独一行严格居中，单位放在下方：避免「22 款游戏」并排把视觉重心拉偏 */}
          <h2 id="wall-title" className="flex flex-col items-center">
            <span className="font-serif text-[clamp(120px,17vw,260px)] font-black leading-[0.82] tracking-[-0.06em] tabular-nums" aria-label={String(total)}>{count}</span>
            <span className="mt-4 text-lg tracking-[0.5em] text-foreground/85 [margin-right:-0.5em]"><T zh="款游戏" en="GAMES" /></span>
          </h2>
          <Link href="/games/" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'pointer-events-auto mt-10 bg-background/60')}>
            <T zh="进入游戏库" en="Browse games" /> <ArrowRight aria-hidden />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
