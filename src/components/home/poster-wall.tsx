'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import type { GameVM } from '@/lib/present';
import { buttonVariants } from '@/components/ui/button';
import { PlatformMark } from '@/components/ui/platform-mark';
import { SectionLabel } from '@/components/ui/section-label';
import { RevealLines } from '@/components/fx/reveal-lines';
import { CountUp } from '@/components/fx/count-up';
import { useIsDesktop, useMotionOK } from '@/components/fx/hooks';
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
              <span className="font-serif text-[clamp(14px,1.15vw,20px)] font-bold leading-tight">{g.name}</span>
              <span className="meta mt-1.5 flex items-center gap-2 text-2xs text-fg-2">
                资源 {String(g.counts.total).padStart(2, '0')}
                <span className="flex gap-1 text-foreground/80">{g.platforms.map((p) => <PlatformMark key={p} platform={p} />)}</span>
              </span>
            </span>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

// 第 2 章 · 片库：粘性舞台内 3D 倾斜的海报墙，奇偶列反向错位
export function PosterWall({ games, total, entries }: { games: GameVM[]; total: number; entries: number }) {
  const ref = useRef<HTMLElement>(null);
  const ok = useMotionOK();
  const desktop = useIsDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const still = useTransform(scrollYProgress, () => 0.5);
  const p = ok ? scrollYProgress : still;

  const cols = desktop ? 8 : 5;
  const perCol = 7;
  const columns = Array.from({ length: cols }, (_, c) =>
    Array.from({ length: perCol }, (_, r) => games[(c * 5 + r * 3 + c) % games.length]),
  );

  return (
    <section ref={ref} aria-labelledby="wall-title" className="relative h-[210vh] bg-background">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <div
            className={cn('absolute left-1/2 top-1/2 will-change-transform', desktop ? 'w-[150vw]' : 'w-[210vw]')}
            style={{
              transform: desktop
                ? 'translate(-50%, -45%) perspective(2200px) rotateX(24deg) rotateZ(-12deg)'
                : 'translate(-50%, -44%) perspective(1800px) rotateX(16deg) rotateZ(-8deg)',
            }}
          >
            <div className={cn('grid', desktop ? 'gap-[1vw]' : 'gap-[1.8vw]')} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {columns.map((col, c) => (
                <Column key={c} games={col} progress={p} direction={c % 2 === 0 ? 1 : -1} offset={c % 2 === 1} dense={desktop} />
              ))}
            </div>
          </div>
        </div>

        {/* 暗场：保证文字可读 */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#131211_0%,rgba(19,18,17,0.9)_24%,rgba(19,18,17,0.18)_60%,rgba(19,18,17,0.68)_100%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(19,18,17,0.95)_0%,rgba(19,18,17,0.55)_34%,rgba(19,18,17,0.04)_72%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(19,18,17,0.8),transparent)]" />

        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end px-[var(--gutter)] pb-[8vh]">
          <SectionLabel no="02" aside={`${String(entries).padStart(3, '0')} 条外部入口`} className="pointer-events-auto mb-6 max-w-[860px]">片库</SectionLabel>
          <div className="flex flex-wrap items-end gap-x-10 gap-y-8">
            <p aria-hidden className="font-serif text-[clamp(134px,22vw,340px)] font-black leading-[0.76] tracking-[-0.06em] text-outline [--stroke-w:1.5px] max-md:pb-[0.08em] max-md:leading-[0.84] max-md:[--stroke-w:1px]">
              <CountUp value={total} pad={3} />
            </p>
            <div className="pointer-events-auto max-w-[540px] pb-[1vw]">
              <RevealLines
                as="h2"
                className="display-l !text-[clamp(40px,5vw,84px)]"
                lines={[<span key="a" id="wall-title">{total} 款游戏，</span>, <span key="b">每一款都建了档。</span>]}
              />
              <p className="mt-5 max-w-[42ch] text-base leading-[1.8] text-fg-2">
                从独立小品到三 A 巨制：渠道、MOD、工具、排障、存档路径，一款游戏一份档案。悬停海报可看资源计数。
              </p>
              <Link href="/games/" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'mt-7 bg-background/40 backdrop-blur-none')}>
                进入游戏库 <ArrowRight aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
