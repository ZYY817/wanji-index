'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { DossierVM } from '@/lib/home-data';
import { SectionLabel } from '@/components/ui/section-label';
import { useFinePointer, useMedia, useMotionOK } from '@/components/fx/hooks';
import { DUR, EASE_OUT } from '@/components/fx/tokens';
import { DossierBoard, DOSSIER_STEPS, stepCount, stepTotal } from '@/components/home/dossier-parts';
import { DossierMobile } from '@/components/home/dossier-mobile';
import { cn, pad } from '@/lib/utils';

const WIDE = '(min-width: 1280px)';
const TOTAL: number = DOSSIER_STEPS.length;
// 短屏时按可用高度反推宽度上限，保证档案板不被 100svh 舞台裁掉
const PAPER_W = 'clamp(430px, min(43vw, calc(160svh - 720px)), 660px)';
const GAP = 'clamp(40px, 4vw, 64px)';

// 滚动 → 第几步：0–4 为当前步，5 = 全章读毕（全部点亮）
function toStep(v: number) {
  if (v >= 0.955) return TOTAL;
  const p = Math.max(0, Math.min(1, (v - 0.04) / 0.9));
  return Math.min(TOTAL - 1, Math.floor(p * TOTAL));
}

/**
 * 第 3 章 · 一个游戏，一份档案。
 * 两栏：左边五个步骤（当前步变橙并展开说明），右边一份真实档案板（当前行高亮，其余压暗）。
 * 层级：章节标题 > 步骤名 > 说明；装饰只保留进度轨与「步骤 → 档案行」连接线。
 */
export function Dossier({ d }: { d: DossierVM }) {
  const ref = useRef<HTMLElement>(null);
  const ok = useMotionOK();
  const wide = useMedia(WIDE);
  const fine = useFinePointer();
  const pinned = ok && wide;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [step, setStep] = useState(TOTAL);

  useEffect(() => {
    setStep(pinned ? toStep(scrollYProgress.get()) : TOTAL);
  }, [pinned, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!pinned) return;
    const s = toStep(v);
    setStep((prev) => (prev === s ? prev : s));
  });

  // 镜头：桌面 + 未开启 reduced-motion 才动；SSR / 移动 / 降级 = 全静态
  const k = pinned ? 1 : 0;
  const active = step < TOTAL ? step : null;
  const g = d.game;

  const bgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.08 + 0.12 * k]);
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', `${2.2 * k}%`]);
  const shade = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0, 0.16 * k]);
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
        {/* 背景美术：唯一光源；随滚动缓慢放大 */}
        <div aria-hidden className="grain absolute inset-0 bg-shell">
          <motion.div className="absolute inset-0 will-change-transform" style={{ scale: bgScale, y: bgY }}>
            {g.art && (
              <img src={g.art.hero} alt="" loading="eager" fetchPriority="low" decoding="async" className="absolute inset-0 size-full object-cover object-[50%_45%]" />
            )}
          </motion.div>
          {/* 左侧压暗保证文字可读，右侧保留美术 */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,18,17,0.97)_0%,rgba(19,18,17,0.94)_22%,rgba(19,18,17,0.66)_46%,rgba(19,18,17,0.2)_74%,rgba(19,18,17,0.4)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,18,17,0.8)_0%,rgba(19,18,17,0.1)_24%,rgba(19,18,17,0.06)_58%,rgba(19,18,17,0.92)_100%)]" />
          <motion.div className="absolute inset-0 bg-background" style={{ opacity: shade }} />
        </div>

        <div
          className="container-x relative z-10 flex h-full items-center gap-[var(--dossier-gap)] pb-6 pt-[calc(var(--header-h)+20px)]"
          style={{ '--dossier-gap': GAP } as CSSProperties}
        >
          {/* 左：章节标题 + 五步 */}
          <div className="flex min-w-0 flex-1 flex-col">
            <SectionLabel no="03" aside={`${pad(stepTotal(d))} 项真实数据`}>档案</SectionLabel>

            <h2 className="mt-5 font-serif text-[clamp(44px,3.6vw,58px)] font-black leading-[1.02] tracking-[-0.05em]">
              一个游戏，
              <br />
              一份档案。
            </h2>
            <p className="mt-4 max-w-[38ch] text-base leading-[1.75] text-fg-2">
              每份档案按同一顺序回答玩家最常问的五件事。右边是一份真实档案：{g.name}。
            </p>

            <ol className="relative mt-8 border-l border-foreground/15 pl-6">
              {/* 进度轨：橙色段随滚动增长 */}
              <motion.span
                aria-hidden
                className="absolute -left-px top-0 h-full w-px origin-top bg-primary"
                style={{ scaleY: pinned ? railScale : 1 }}
              />
              {DOSSIER_STEPS.map((s, i) => {
                const isActive = active === i;
                const dim = active !== null && !isActive;
                return (
                  <li key={s.no} aria-current={isActive ? 'step' : undefined} className="relative py-2">
                    <div className="flex items-baseline gap-3">
                      <span className={cn('w-6 shrink-0 font-mono text-xs tabular-nums transition-colors', isActive ? 'text-primary' : 'text-fg-3')}>
                        {s.no}
                      </span>
                      <h3
                        className={cn(
                          'font-serif text-[clamp(30px,2.5vw,40px)] font-black leading-[1.1] tracking-[-0.04em] transition-colors duration-500',
                          isActive ? 'text-primary' : dim ? 'text-foreground/40' : 'text-foreground',
                        )}
                      >
                        {s.title}
                      </h3>
                      <span className={cn('text-xs tabular-nums transition-colors', dim ? 'text-fg-3/60' : 'text-fg-3')}>
                        {stepCount(d, i)} 项
                      </span>
                    </div>
                    <div
                      className={cn(
                        'grid pl-9 transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)]',
                        isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                      )}
                    >
                      <p className="overflow-hidden text-sm leading-[1.7] text-fg-2">
                        <span className="block max-w-[36ch] pt-1">{s.desc}</span>
                      </p>
                    </div>
                    {/* 当前步 → 档案板的连接线 */}
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

            <Link href={`/games/${g.slug}/`} className="group mt-8 inline-flex min-h-11 w-fit items-center gap-2.5 text-sm font-medium text-foreground">
              <span className="border-b border-foreground/30 pb-0.5 transition-colors group-hover:border-primary">打开{g.name}完整档案</span>
              <ArrowRight aria-hidden className="size-4 text-fg-2 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          </div>

          {/* 右：档案板。入章时倾斜下沉，随滚动摆正上浮；鼠标微视差 */}
          <div className="relative z-10 w-[var(--paper-w)] shrink-0 [perspective:2000px]" style={{ '--paper-w': PAPER_W } as CSSProperties}>
            <motion.div
              key={ok ? 'animated' : 'static'}
              initial={ok ? { opacity: 0, rotate: -2.5, y: 40 } : false}
              whileInView={{ opacity: 1, rotate: 0, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: DUR.scene, ease: EASE_OUT }}
            >
              <motion.div className="[transform-style:preserve-3d]" style={{ rotateZ: paperZ, y: paperY }}>
                <motion.div style={{ rotateY: tiltY, rotateX: tiltX, x: shiftX, y: shiftY }}>
                  <DossierBoard d={d} active={active} eager />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
