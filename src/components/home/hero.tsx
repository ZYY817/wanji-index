'use client';
import Link from 'next/link';
import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import type { GameVM } from '@/lib/present';
import { SearchTrigger } from '@/components/layout/search-trigger';
import { useFinePointer, useIsDesktop, useMotionOK } from '@/components/fx/hooks';
import { cn } from '@/lib/utils';

// 第 1 章 · 开映：背景美术（慢）→ 官方 logo / 漂浮海报（中）→ 字标（快）三层视差。
// V3 精简：一屏只留 5 个信息点——美术与 logo、字标、导语、搜索、轮播署名。
export function Hero({ heroes, floaters, counts }: {
  heroes: GameVM[]; floaters: GameVM[]; counts: { games: number; sites: number; offers: number }; build?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const ok = useMotionOK();
  const desktop = useIsDesktop();
  const fine = useFinePointer();
  // 移动端视差幅度 ×0.4；reduced-motion 下全部归零
  const k = ok ? (desktop ? 1 : 0.4) : 0;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', `${15 * k}%`]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.06 + 0.12 * k]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, -500 * k]);
  const fgY = useTransform(scrollYProgress, [0, 1], [0, -220 * k]);
  const fade = useTransform(scrollYProgress, [0.16, 0.78], [1, ok ? 0 : 1]);
  const shade = useTransform(scrollYProgress, [0, 0.9], [0, ok ? 0.72 : 0]);

  // 中景鼠标微视差：官方 logo 幅度最小，三张海报依次放大，最大 ±30px
  const mx = useMotionValue(0), my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 50, damping: 18 }), smy = useSpring(my, { stiffness: 50, damping: 18 });
  const logoPX = useTransform(smx, (v) => v * 12 * k), logoPY = useTransform(smy, (v) => v * 9 * k);
  const f0x = useTransform(smx, (v) => v * 22 * k), f0y = useTransform(smy, (v) => v * 16 * k);
  const f1x = useTransform(smx, (v) => v * 30 * k), f1y = useTransform(smy, (v) => v * 22 * k);
  const f2x = useTransform(smx, (v) => v * 38 * k), f2y = useTransform(smy, (v) => v * 28 * k);
  const fx = [[f0x, f0y], [f1x, f1y], [f2x, f2y]];

  // 漂浮海报：三张各自不同的滚动速度
  const fl0 = useTransform(scrollYProgress, [0, 1], [0, -58 * k]);
  const fl1 = useTransform(scrollYProgress, [0, 1], [0, -96 * k]);
  const fl2 = useTransform(scrollYProgress, [0, 1], [0, -134 * k]);
  const floaterY = [fl0, fl1, fl2];

  // 背景轮播：首张 LCP；其余延迟挂载；reduced-motion / 暂停 / 离屏时不轮播
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
  useEffect(() => {
    if (!ok || paused || !extra || !visible || heroes.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % heroes.length), 7000);
    return () => clearInterval(t);
  }, [ok, paused, extra, visible, heroes.length]);
  const cur = heroes[idx];

  return (
    <section
      ref={ref}
      aria-label="玩机索引"
      className="grain relative min-h-[100svh] overflow-hidden bg-background"
      onPointerMove={(e) => {
        if (!ok || !fine || !desktop || e.pointerType !== 'mouse') return;
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
    >
      {/* L0 · 背景美术（慢） */}
      <motion.div aria-hidden className="absolute inset-0 will-change-transform" style={{ y: bgY, scale: bgScale }}>
        {heroes.map((h, i) => (i === 0 || extra) && (
          <picture key={h.id}>
            <source media="(max-width: 767px)" srcSet={h.art!.poster} />
            <img
              src={h.art!.hero}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'low'}
              decoding={i === 0 ? 'sync' : 'async'}
              className="absolute inset-0 size-full object-cover object-[64%_26%] transition-opacity duration-[1800ms] ease-out md:object-[70%_24%]"
              style={{ opacity: i === idx ? 1 : 0 }}
            />
          </picture>
        ))}
      </motion.div>
      {/* 压暗：左下为文字区，右上保留美术 */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,18,17,0.95)_0%,rgba(19,18,17,0.78)_30%,rgba(19,18,17,0.22)_64%,rgba(19,18,17,0.48)_100%)] max-md:bg-[linear-gradient(180deg,rgba(19,18,17,0.62)_0%,rgba(19,18,17,0.3)_32%,rgba(19,18,17,0.88)_68%,#131211_100%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[46%] bg-[linear-gradient(0deg,#131211_10%,rgba(19,18,17,0)_100%)]" />
      <motion.div aria-hidden className="absolute inset-0 bg-background" style={{ opacity: shade }} />

      {/* L1 · 中景：巨型片目号 + 官方透明 logo */}
      <motion.div className="pointer-events-none absolute inset-0 z-[2] hidden md:block" style={{ y: midY }}>
        <motion.div
          className="pointer-events-auto absolute right-[clamp(24px,7vw,112px)] top-[13vh] w-[clamp(230px,23vw,420px)]"
          style={{ x: logoPX, y: logoPY }}
        >
          <Link href={cur ? `/games/${cur.slug}/` : '/games/'} className="group block" aria-label={cur ? `查看 ${cur.name} 游戏档案` : '浏览游戏库'}>
            <div className="relative aspect-[16/9]">
              {heroes.map((h, i) => (i === 0 || extra) && (
                <img
                  key={h.id}
                  src={h.art!.logo}
                  alt=""
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                  className="absolute inset-0 size-full object-contain object-right drop-shadow-[0_10px_28px_rgba(0,0,0,0.78)] transition-[opacity,transform] duration-[1400ms] ease-out group-hover:brightness-110"
                  style={{ opacity: i === idx ? 1 : 0, transform: i === idx ? 'none' : 'translateY(14px)' }}
                />
              ))}
            </div>
          </Link>
        </motion.div>
      </motion.div>

      {/* L2 · 前景 */}
      <motion.div
        className="container-x relative z-10 flex min-h-[max(740px,100svh)] flex-col pb-5 pt-[calc(var(--header-h)+22px)] md:pb-6"
        style={{ y: fgY }}
      >
        {/* 中景留白：漂浮海报 / 官方 logo 在这一层呼吸 */}
        <div className="relative min-h-[130px] flex-1 lg:min-h-[180px]">
          <div className="pointer-events-none absolute left-0 top-[3vh] hidden items-start gap-4 xl:flex">
            {floaters.slice(0, 2).map((g, i) => (
              <motion.div key={g.id} style={{ y: floaterY[i], marginTop: [0, -18, 28][i] }} className="will-change-transform">
                <motion.div style={{ x: fx[i][0], y: fx[i][1] }}>
                  <motion.div
                    className="[perspective:900px]"
                    whileHover={{ rotateY: 9, rotateX: -5, scale: 1.06 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 24, mass: 0.55 }}
                  >
                    <Link
                      href={`/games/${g.slug}/`}
                      tabIndex={-1}
                      className="pointer-events-auto group relative block w-[clamp(124px,9.2vw,176px)] overflow-hidden border border-white/20 bg-surface-2 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.9)] transition-[border-color,box-shadow] duration-500 hover:border-primary/70 hover:shadow-[0_28px_64px_-24px_rgba(216,182,122,0.45)]"
                      style={{ rotate: ['-4deg', '2.5deg', '-1.5deg'][i] }}
                    >
                      <div className="relative aspect-[2/3]">
                        <img src={g.art!.poster} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]" />
                        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(19,18,17,0.9)_0%,rgba(19,18,17,0.08)_58%)]" />
                      </div>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* 移动端保留两枚小片格，避免字标之上只剩空暗场 */}
          <div aria-hidden className="pointer-events-none absolute right-0 top-0 flex items-start gap-3 xl:hidden">
            {floaters.slice(0, 2).map((g, i) => (
              <div
                key={g.id}
                className="w-[clamp(72px,20vw,104px)] overflow-hidden border border-white/15 bg-surface-2 shadow-[0_18px_38px_-22px_rgba(0,0,0,0.9)]"
                style={{ rotate: ['-3deg', '2.5deg'][i], marginTop: [0, 16][i] }}
              >
                <div className="relative aspect-[2/3]">
                  <img src={g.art!.poster} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
                  <span className="absolute inset-0 bg-[linear-gradient(0deg,rgba(19,18,17,0.82),transparent_55%)]" />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* 字标与导语 */}
        <motion.div style={{ opacity: fade }}>
          <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between xl:gap-12">
            <h1 className="display-hero shrink-0 whitespace-nowrap !text-[clamp(86px,19vw,150px)] xl:!text-[clamp(120px,15.5vw,250px)]">
              玩机<span className="text-outline [--stroke-w:1.2px] xl:[--stroke-w:2px] 2xl:[--stroke-w:2.5px]">索引</span>
            </h1>
            <div className="max-w-[38ch] xl:mb-[0.55em] xl:max-w-[360px] 2xl:max-w-[390px]">
              <p className="font-serif text-[clamp(19px,1.85vw,27px)] font-bold leading-[1.34] tracking-[-0.02em]">
                去哪买、免不免费、MOD 在哪、要什么工具、报错怎么办——一份档案答完。
              </p>
              <p className="mt-4 text-sm leading-[1.8] text-fg-2">
                已收录 {counts.games} 款游戏、{counts.sites} 个资源站、{counts.offers} 条免费情报。只指向官方与可信来源，不托管文件，不收录破解。
              </p>
              <Link href="/games/" className="mt-6 inline-flex min-h-11 items-center gap-3 border-b border-foreground/30 pb-1 text-sm font-medium text-foreground transition-colors hover:border-primary">
                直接进入游戏库 <span aria-hidden className="text-primary">→</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 底栏：搜索是主动作，片目字幕在其下 */}
        <div className="mt-7 border-t border-foreground/15 pt-4 md:mt-8">
          <div className="grid items-center gap-4 md:grid-cols-12 md:gap-6">
            <SearchTrigger variant="bar" className="md:col-span-5" label="搜索游戏、资源站、工具或报错…" />
            <div className="hidden min-w-0 items-center gap-4 md:col-span-6 md:flex">
              <div className="flex items-center gap-1">
                {heroes.map((h, i) => (
                  <button key={h.id} type="button" onClick={() => { setIdx(i); setExtra(true); setPaused(true); }} aria-label={`放映 ${h.name}`} aria-pressed={i === idx} className="grid min-h-11 w-7 place-items-center">
                    <span className={cn('h-[2px] w-6 transition-colors duration-300', i === idx ? 'bg-primary' : 'bg-foreground/25 hover:bg-foreground/60')} />
                  </button>
                ))}
              </div>
              {cur && (
                <Link href={`/games/${cur.slug}/`} className="min-w-0 truncate text-xs text-fg-2 transition-colors hover:text-foreground">
                  {cur.name} · 官方美术 <span className="text-fg-3">© {cur.publisher ?? '各自权利人'}</span>
                </Link>
              )}
            </div>
            <div className="hidden justify-end md:col-span-1 md:flex">
              <button type="button" onClick={() => setPaused((v) => !v)} aria-label={paused ? '继续背景轮播' : '暂停背景轮播'} aria-pressed={paused} className="grid size-11 place-items-center border border-foreground/20 text-fg-2 transition-colors hover:border-foreground/50 hover:text-foreground">
                {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
