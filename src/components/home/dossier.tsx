'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { DossierVM } from '@/lib/home-data';
import { SectionLabel } from '@/components/ui/section-label';
import { useFinePointer, useMedia, useMotionOK } from '@/components/fx/hooks';
import { DossierBoard, DOSSIER_STEPS, stepCount, stepTotal } from '@/components/home/dossier-parts';
import { DossierMobile } from '@/components/home/dossier-mobile';
import { cn, pad } from '@/lib/utils';

const WIDE = '(min-width: 1280px)';
const TOTAL: number = DOSSIER_STEPS.length;
// 短屏时按可用高度反推宽度上限，保证档案板与底部 FIG 注都不被 100svh 舞台裁掉
const PAPER_W = 'clamp(430px, min(43vw, calc(160svh - 720px)), 680px)';
const GAP = 'clamp(40px, 4vw, 64px)';

// 滚动 → 第几步：0–4 为当前步，5 = 全章读毕（全部点亮）
function toStep(v: number) {
  if (v >= 0.955) return TOTAL;
  const p = Math.max(0, Math.min(1, (v - 0.04) / 0.9));
  return Math.min(TOTAL - 1, Math.floor(p * TOTAL));
}

// 第 3 章 · 档案装配台：全出血美术（唯一光源）→ 巨型描边字（远景）→ 倾斜档案板（近景）
// 左边的五步与右边的五行一一对应；滚动驱动摆正、上浮、橙色进度轨与连接线。
export function Dossier({ d }: { d: DossierVM }) {
  const ref = useRef<HTMLElement>(null);
  const ok = useMotionOK();
  const wide = useMedia(WIDE);
  const fine = useFinePointer();
  const pinned = ok && wide;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [step, setStep] = useState(TOTAL);
  // -1 = 尚未发生滚动步进：初次挂载 / SSR / reduced-motion 都不解码
  const [runKey, setRunKey] = useState(-1);
  const stepRef = useRef(TOTAL);

  useEffect(() => {
    const s = pinned ? toStep(scrollYProgress.get()) : TOTAL;
    stepRef.current = s;
    setStep(s);
  }, [pinned, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!pinned) return;
    const s = toStep(v);
    if (s !== stepRef.current) {
      stepRef.current = s;
      setStep(s);
      setRunKey((n) => n + 1);
    }
  });

  // 镜头：桌面 + 未开启 reduced-motion 才动；SSR / 移动 / 降级 = 全静态
  const k = pinned ? 1 : 0;
  const active = step < TOTAL ? step : null;
  const g = d.game;

  const bgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.08 + 0.12 * k]);
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', `${2.2 * k}%`]);
  const shade = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0, 0.16 * k]);
  const giantX = useTransform(scrollYProgress, [0, 1], [0, -140 * k]);
  const giantY = useTransform(scrollYProgress, [0, 1], [0, 92 * k]);
  const paperZ = useTransform(scrollYProgress, [0, 0.26], [-2.5 * k, 0]);
  const paperY = useTransform(scrollYProgress, [0, 0.26, 1], [8 * k, 0, -6 * k]);
  const railScale = useTransform(scrollYProgress, [0.04, 0.955], [0.015, 1]);

  // 鼠标微视差：只给精确指针；幅度远小于 4°
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 18, mass: 0.35 });
  const sy = useSpring(my, { stiffness: 55, damping: 18, mass: 0.35 });
  const tiltY = useTransform(sx, (v) => v * 3.2 * k);
  const tiltX = useTransform(sy, (v) => v * -1.8 * k);
  const shiftX = useTransform(sx, (v) => v * 9 * k);
  const shiftY = useTransform(sy, (v) => v * 7 * k);

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pinned || !fine || e.pointerType !== 'mouse') return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section
      ref={ref}
      aria-label="一个游戏，一份档案"
      className="relative border-t border-border bg-background xl:motion-safe:h-[280vh]"
    >
      <DossierMobile d={d} />

      {/* 桌面：100svh sticky 舞台；移动端整体不 pin（上方 DossierMobile） */}
      <div
        className="relative hidden xl:block xl:h-[100svh] xl:overflow-hidden xl:motion-safe:sticky xl:motion-safe:top-0"
        data-pin={pinned ? 'true' : 'false'}
        data-step={step}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        {/* L0 · 全出血美术：唯一光源；随滚动放大、轻微反向位移 */}
        <div aria-hidden className="grain absolute inset-0 bg-shell">
          <motion.div className="absolute inset-0 will-change-transform" style={{ scale: bgScale, y: bgY }}>
            {g.art && (
              <img
                src={g.art.hero}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover object-[50%_45%]"
              />
            )}
          </motion.div>
          {/* 压暗是遮罩，不是发光：左暗保字、上暗托片头、下暗接章尾 */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,9,0.97)_0%,rgba(10,10,9,0.94)_18%,rgba(10,10,9,0.62)_42%,rgba(10,10,9,0.14)_72%,rgba(10,10,9,0.34)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,9,0.78)_0%,rgba(10,10,9,0.08)_22%,rgba(10,10,9,0.04)_55%,rgba(10,10,9,0.92)_100%)]" />
          <motion.div className="absolute inset-0 bg-background" style={{ opacity: shade }} />
        </div>

        {/* L1 · 巨型描边字：藏在标题右侧与档案板后方，只露出左半；和档案板反向移动制造景深 */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute left-[calc(var(--gutter)+18vw)] top-[10px] z-[1] select-none whitespace-nowrap font-serif text-[20vw] font-black leading-[0.75] tracking-[-0.08em] text-outline opacity-[0.18] [--stroke-w:1px] will-change-transform"
          style={{
            x: giantX,
            y: giantY,
            maskImage: 'linear-gradient(180deg, #000 0%, #000 82%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 82%, transparent 100%)',
          }}
        >
          档案
        </motion.span>

        {/* L2 · 左：五步大字 + 装配进度轨 / 右：档案板 */}
        <div
          className="container-x relative z-10 flex h-full gap-[var(--dossier-gap)] pb-5 pt-[calc(var(--header-h)+20px)] [@media(max-height:760px)]:pb-3 [@media(max-height:760px)]:pt-[calc(var(--header-h)+8px)]"
          style={{ '--dossier-gap': GAP } as CSSProperties}
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <SectionLabel no="03" aside={`${pad(stepTotal(d))} 项 · 真实数据`} className="shrink-0">
              档案 / Dossier
            </SectionLabel>

            <h2 className="mt-3 shrink-0 font-serif text-[clamp(44px,3.5vw,56px)] font-black leading-[1.01] tracking-[-0.05em]">
              <span className="block">一个游戏，</span>
              <span className="block">一份档案。</span>
            </h2>

            <p className="mt-2.5 max-w-[40ch] shrink-0 text-sm leading-[1.7] text-fg-2">
              每份档案按同一顺序回答玩家最常问的五件事。右边是一份真实档案——{g.name}。
            </p>

            <div className="mt-4 flex shrink-0 items-center justify-between border-t border-foreground/15 pt-2">
              <span className="meta text-2xs text-fg-3">装配顺序 / {pad(TOTAL)} 项</span>
              <span className={cn('meta text-2xs tabular', active === null ? 'text-fg-2' : 'text-primary')}>
                {active === null ? '全部就绪' : `${pad(active + 1)} / ${pad(TOTAL)}`}
              </span>
            </div>

            <ol className="relative mt-2">
              {/* 竖向进度轨：橙色段随滚动增长 */}
              <span aria-hidden className="absolute -left-4 top-2 bottom-2 w-px bg-foreground/15" />
              <motion.span
                aria-hidden
                className="absolute -left-4 top-2 bottom-2 w-px origin-top bg-primary"
                style={{ scaleY: pinned ? railScale : 1 }}
              />
              {DOSSIER_STEPS.map((s, i) => {
                const isActive = active === i;
                const dim = active !== null && !isActive;
                return (
                  <li key={s.no} aria-current={isActive ? 'step' : undefined} className="relative grid grid-cols-[44px_minmax(0,1fr)] gap-3 py-1.5">
                    <span
                      aria-hidden
                      className={cn(
                        'absolute -left-[18px] top-[30px] size-[5px] rotate-45 transition-colors duration-500',
                        isActive ? 'bg-primary' : active === null ? 'bg-foreground/40' : 'bg-foreground/20',
                      )}
                    />
                    <span className={cn('meta pt-2 text-2xs leading-none transition-colors duration-500', isActive ? 'text-primary' : 'text-fg-3')}>
                      {s.no}
                    </span>
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-baseline gap-2.5">
                        <h3
                          className={cn(
                            'font-serif text-[clamp(56px,4.1vw,64px)] font-black leading-[1.02] tracking-[-0.045em] transition-colors duration-500',
                            isActive ? 'text-primary' : dim ? 'text-foreground/45' : 'text-foreground',
                          )}
                        >
                          {s.title}
                        </h3>
                        <span className="meta hidden text-2xs text-fg-3 sm:inline">{s.en}</span>
                        <span className={cn('meta ml-auto shrink-0 text-2xs tabular', isActive ? 'text-foreground' : 'text-fg-2')}>
                          {pad(stepCount(d, i))}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)]',
                          isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                        )}
                      >
                        <div className="overflow-hidden">
                          <p className="mt-1 max-w-[40ch] pb-1 text-xs leading-[1.55] text-fg-2">{s.desc}</p>
                        </div>
                      </div>
                    </div>
                    {/* 当前步 → 档案板的细线：scaleX / opacity 驱动 */}
                    <span
                      aria-hidden
                      className={cn(
                        'pointer-events-none absolute left-full top-[30px] h-px w-[var(--dossier-gap)] origin-left bg-primary/75 transition-[transform,opacity] duration-500 after:absolute after:right-0 after:top-1/2 after:size-[5px] after:-translate-y-1/2 after:border after:border-primary after:bg-background',
                        isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0',
                      )}
                    />
                  </li>
                );
              })}
            </ol>

            <Link
              href={`/games/${g.slug}/`}
              className="group mt-3 inline-flex min-h-11 w-fit items-center gap-2.5 text-sm text-foreground"
            >
              <span className="border-b border-foreground/25 pb-0.5 transition-colors group-hover:border-primary">
                打开{g.name}完整档案
              </span>
              <ArrowRight aria-hidden className="size-4 text-fg-2 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          </div>

          {/* 近景档案板：入章时倾斜下沉，随滚动摆正上浮；鼠标微视差 */}
          <div className="relative z-10 w-[var(--paper-w)] shrink-0 [perspective:2000px]" style={{ '--paper-w': PAPER_W } as CSSProperties}>
            <motion.div
              key={ok ? 'animated' : 'static'}
              initial={ok ? { opacity: 0, rotate: -2.5, y: 40 } : false}
              whileInView={{ opacity: 1, rotate: 0, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div className="[transform-style:preserve-3d]" style={{ rotateZ: paperZ, y: paperY }}>
                <motion.div style={{ rotateY: tiltY, rotateX: tiltX, x: shiftX, y: shiftY }}>
                  <DossierBoard d={d} active={active} runKey={runKey} />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* 舞台底注：FIG 注释在所有桌面高度都在，避免 1280×800 被裁掉；左侧装配台标签只在够高时出现 */}
        <span
          aria-hidden
          className="meta pointer-events-none absolute bottom-2.5 right-[var(--gutter)] z-10 text-right text-2xs text-fg-3"
        >
          FIG.03 — 真实数据，非示意 · PLATE 03
        </span>
        <span
          aria-hidden
          className="meta pointer-events-none absolute bottom-2.5 left-[var(--gutter)] z-10 hidden text-2xs text-fg-3 [@media(min-height:860px)]:block"
        >
          EVIDENCE TABLE / 档案装配台
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[var(--gutter)] bottom-[26px] z-10 hidden h-px bg-foreground/10 [@media(min-height:860px)]:block"
        />
      </div>
    </section>
  );
}
