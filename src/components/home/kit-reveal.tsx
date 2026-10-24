'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Download } from 'lucide-react';
import { KIT_ITEMS } from '@/lib/kit';
import { KitWindow } from '@/components/kit/kit-window';
import { SectionLabel } from '@/components/ui/section-label';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/components/fx/tokens';

// 第 6 章 · 揭幕：工具窗口从倾斜远处一次升起摆正，检测清单随后每 400ms 逐行扫描
export function KitReveal() {
  const reduced = useReducedMotion();
  const total = KIT_ITEMS.length;
  const [scanned, setScanned] = useState(total);
  const winRef = useRef<HTMLDivElement>(null);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (reduced) { setScanned(total); return; }
    const el = winRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      // 等 3D 升起基本落位后再开始逐行扫描
      startTimer.current = setTimeout(() => {
        let n = 0;
        setScanned(0);
        scanTimer.current = setInterval(() => {
          n += 1;
          setScanned(n);
          if (n >= total && scanTimer.current) clearInterval(scanTimer.current);
        }, 400);
      }, 900);
    }, { threshold: 0.45 });
    io.observe(el);
    return () => {
      io.disconnect();
      if (startTimer.current) clearTimeout(startTimer.current);
      if (scanTimer.current) clearInterval(scanTimer.current);
    };
  }, [reduced, total]);

  return (
    <section aria-labelledby="kit-title" className="relative isolate overflow-hidden border-t border-border bg-background py-24 md:py-32">
      <span
        aria-hidden
        className="pointer-events-none absolute right-[var(--gutter)] top-0 z-0 hidden select-none font-serif text-[clamp(220px,26vw,380px)] font-black leading-[0.7] tracking-[-0.09em] text-outline opacity-[0.055] [--stroke-w:1px] lg:block"
      >
        06
      </span>
      <div className="container-x relative z-10 grid gap-12 lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-12 lg:items-center lg:py-6">
        <div className="lg:col-span-4">
          <SectionLabel no="06" className="mb-8">装机</SectionLabel>
          <span
            className="meta mb-5 inline-flex items-center gap-2 border border-primary/40 px-2.5 py-1 text-2xs tracking-[0.04em] text-primary"
          >
            <span aria-hidden className="size-1.5 rounded-full bg-primary" />
            开发中
          </span>
          <h2 id="kit-title" className="display-l !text-[clamp(42px,5.6vw,96px)]">
            <span className="block">缺什么，</span>
            <span className="block">它比你</span>
            <span className="mt-[0.06em] block"><span className="mr-[0.1em] text-outline [--stroke-w:1px]">先知道</span>。</span>
          </h2>
          <p className="mt-6 max-w-[36ch] text-base leading-[1.8] text-fg-2">
            「一键装机工具」是我们正在开发的 Windows 小工具：检测 VC++、DirectX、.NET 等游戏运行库，缺失的一键从官方源补齐。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/kit/" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
              了解一键装机工具 <ArrowRight aria-hidden />
            </Link>
            <span aria-disabled="true" className={cn(buttonVariants({ variant: 'disabled', size: 'lg' }), 'cursor-not-allowed')}>
              <Download aria-hidden /> 下载 · 开发中
            </span>
          </div>
        </div>

        <div ref={winRef} className="lg:col-span-8 [perspective:1800px]">
          <motion.div
            initial={{ opacity: 0, y: '20vh', rotateX: 48, scale: 0.6 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={reduced ? { duration: 0 } : { duration: 1.6, ease: EASE_OUT }}
            style={{ transformOrigin: '50% 100%' }}
            className="will-change-transform"
          >
            <KitWindow scanned={scanned} />
          </motion.div>
          <p className="meta mt-5 text-right text-fg-3">FIG.06 — 界面示意，检测结果为演示数据</p>
        </div>
      </div>
    </section>
  );
}
