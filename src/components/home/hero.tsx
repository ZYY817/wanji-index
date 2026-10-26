'use client';
import Link from 'next/link';
import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll } from 'motion/react';
import type { GameVM } from '@/lib/present';
import { SearchTrigger } from '@/components/layout/search-trigger';
import { useIsDesktop, useMotionOK, useLiveTransform } from '@/components/fx/hooks';
import { Magnetic } from '@/components/fx/interact';
import { cn } from '@/lib/utils';
import { hang } from '@/components/ui/hang';

const SLIDE_MS = 7000;

/**
 * 第 1 章 · 开映。一屏只有一个主角：整屏游戏官方美术。
 *   正中：一行定位 → 一句标题 → 一句说明 → 搜索 → 三个热门入口
 *   底部：当前美术署名 + 轮播进度 + 暂停（左），向下滚动提示（右）
 * 镜头：每张美术缓慢推近（CSS，交叉淡入）；滚动时美术继续放大并压暗，文字上移淡出，把画面交给海报墙。
 */
export function Hero({ heroes, popular, counts }: {
  heroes: GameVM[]; popular: GameVM[]; counts: { games: number; sites: number; offers: number };
}) {
  const ref = useRef<HTMLElement>(null);
  const ok = useMotionOK();
  const desktop = useIsDesktop();
  const k = ok ? (desktop ? 1 : 0.5) : 0;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const artScale = useLiveTransform(scrollYProgress, [0, 1], [1, 1 + 0.22 * k]);
  const shade = useLiveTransform(scrollYProgress, [0, 0.85], [0, 0.85 * k]);
  const textY = useLiveTransform(scrollYProgress, [0, 1], [0, -180 * k]);
  const textFade = useLiveTransform(scrollYProgress, [0.05, 0.55], [1, ok ? 0 : 1]);

  // 轮播：首张是 LCP（eager），其余 1.5 秒后再挂载；暂停 / 离屏 / reduced-motion 时停止
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [extra, setExtra] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => { const t = setTimeout(() => setExtra(true), 1500); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const running = ok && !paused && extra && visible && heroes.length > 1;
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % heroes.length), SLIDE_MS);
    return () => clearInterval(t);
  }, [running, heroes.length]);
  const cur = heroes[idx];
  // 首次访问时开场幕布约 1.2s 后拉开，入场动画整体顺延（--intro-delay 由 layout 的内联脚本设置）
  const rise = (i: number) => ({ animationDelay: `calc(var(--intro-delay, 0s) + ${0.15 + i * 0.09}s)` });

  return (
    <section ref={ref} aria-label="玩机索引" className="grain relative h-[100svh] min-h-[680px] overflow-hidden bg-shell">
      {/* 美术层：滚动推近（motion）× 每张自身的缓慢推近（CSS） */}
      <motion.div aria-hidden className="absolute inset-0 will-change-transform" style={{ scale: artScale }}>
        {heroes.map((h, i) => (i === 0 || extra) && (
          <picture key={h.id}>
            <source media="(max-width: 767px)" srcSet={h.art!.poster} />
            <img
              src={h.art!.hero}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'low'}
              decoding={i === 0 ? 'sync' : 'async'}
              className={cn(
                'absolute inset-0 size-full object-cover object-[60%_25%] transition-opacity duration-[1600ms] ease-out',
                i === idx ? 'opacity-100 motion-safe:animate-[kenburns_9s_ease-out_both]' : 'opacity-0',
              )}
            />
          </picture>
        ))}
      </motion.div>

      {/* 压暗：中心留亮、四周与底部收暗，保证标题在任何美术上都可读 */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(19,18,17,0.22)_0%,rgba(19,18,17,0.55)_58%,rgba(19,18,17,0.9)_100%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,#131211_0%,transparent_100%)]" />
      <motion.div aria-hidden className="absolute inset-0 bg-background" style={{ opacity: shade }} />

      {/* 正中内容 */}
      <motion.div className="container-x relative z-10 flex h-full flex-col items-center justify-center pt-[var(--header-h)] text-center" style={{ y: textY, opacity: textFade }}>
        <p className="animate-rise text-sm tracking-[0.3em] text-primary" style={rise(0)}>PC 游戏资源索引</p>
        <h1 className="mt-6 font-serif text-[clamp(44px,6.6vw,108px)] font-black leading-[1.04] tracking-[-0.045em]">
          {['每一款游戏，', '都有一份档案。'].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <span className="block animate-line-up" style={{ animationDelay: `calc(var(--intro-delay, 0s) + ${0.25 + i * 0.1}s)` }}>{hang(line)}</span>
            </span>
          ))}
        </h1>
        <p className="mt-7 max-w-[36em] animate-rise text-base leading-[1.8] text-foreground/80 md:text-lg" style={rise(2)}>
          去哪买、现在免不免费、MOD 与汉化、存档与报错，一次查清。
          <br className="hidden md:block" />
          已收录 {counts.games} 款游戏、{counts.sites} 个资源站、{counts.offers} 条免费情报，全部免费查阅。
        </p>
        <div className="mt-10 w-full max-w-[640px] animate-rise" style={rise(3)}>
          <Magnetic strength={6} radius={60}>
            <SearchTrigger variant="bar" label="搜索游戏、资源站、工具或报错…" />
          </Magnetic>
        </div>
        <p className="mt-5 flex animate-rise flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-fg-2" style={rise(4)}>
          <span className="text-fg-3">热门</span>
          {popular.map((g) => (
            <Link key={g.id} href={`/games/${g.slug}/`} className="underline-offset-4 transition-colors hover:text-foreground hover:underline">{g.name}</Link>
          ))}
        </p>
      </motion.div>

      {/* 底栏：署名与轮播 / 滚动提示 */}
      <div className="container-x absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-6 pb-7">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            aria-label={paused ? '继续背景轮播' : '暂停背景轮播'}
            aria-pressed={paused}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-foreground/25 text-fg-2 transition-colors hover:border-foreground/60 hover:text-foreground"
          >
            {paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
          </button>
          <div className="flex items-center gap-1.5">
            {heroes.map((h, i) => (
              <button key={h.id} type="button" onClick={() => { setIdx(i); setExtra(true); }} aria-label={`切换到 ${h.name}`} aria-pressed={i === idx} className="grid h-9 w-8 place-items-center">
                <span className="relative block h-[2px] w-full overflow-hidden bg-foreground/20">
                  {i === idx && (
                    <span
                      key={`${idx}-${running}`}
                      className={cn('absolute inset-y-0 left-0 w-full origin-left bg-primary', running && 'animate-[progress_7s_linear_both]')}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
          {cur && (
            <Link href={`/games/${cur.slug}/`} className="hidden min-w-0 truncate text-sm text-fg-2 transition-colors hover:text-foreground sm:block">
              {cur.name}<span className="text-fg-3"> · 官方美术</span>
            </Link>
          )}
        </div>
        <span aria-hidden className="hidden items-center gap-3 text-sm text-fg-3 md:flex">
          向下滚动
          <span className="relative block h-10 w-px overflow-hidden bg-foreground/20">
            <span className="absolute inset-x-0 top-0 h-1/2 bg-foreground/80 motion-safe:animate-[scroll-down_2s_cubic-bezier(.65,0,.35,1)_infinite]" />
          </span>
        </span>
      </div>
    </section>
  );
}
