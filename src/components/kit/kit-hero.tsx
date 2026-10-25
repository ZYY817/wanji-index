'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { KIT_ITEMS } from '@/lib/kit';
import { ArchiveRing } from '@/components/fx/archive-ring';
import { Magnetic } from '@/components/fx/interact';

const GROUPS = ['VC++', 'DirectX', '.NET', '其他'] as const;

/**
 * 装机页首屏：与首页第 6 章同一套亮色展台语言（暖白空间 + 左上斜光 + 中央物件 + 四角标签）。
 * 滚动时物件缓慢转正、整屏轻微上移淡出，把画面交给下面的交互预览。
 */
export function KitHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const rotate = useTransform(p, [0, 1], [-10, 30]);
  const tilt = useTransform(p, [0, 1], [56, 24]);
  const y = useTransform(p, [0, 1], [0, -120]);
  const fade = useTransform(p, [0.2, 0.8], [1, 0]);
  const counts = GROUPS.map((g) => KIT_ITEMS.filter((k) => k.group === g).length);
  const rise = (i: number) => ({ animationDelay: `${0.1 + i * 0.08}s` });

  return (
    <section ref={ref} aria-labelledby="kit-page-title" className="relative h-[100svh] min-h-[720px] overflow-hidden bg-paper text-ink">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_38%),linear-gradient(0deg,rgba(201,192,176,0.45)_0%,transparent_35%)]" />
      <div aria-hidden className="absolute -left-[10%] top-[-20%] h-[140%] w-[38%] rotate-[28deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)]" />

      <motion.div className="relative h-full" style={{ y, opacity: fade }}>
        {/* 顶部：标题 + 状态 */}
        <div className="container-x flex items-start justify-between pt-[calc(var(--header-h)+6vh)]">
          <div>
            <p className="animate-rise text-sm tracking-[0.4em] text-ink-3" style={rise(0)}>运 行 库 体 检</p>
            <h1 id="kit-page-title" className="mt-4 animate-rise font-serif text-[clamp(40px,4.6vw,72px)] font-black leading-[1.08] tracking-[-0.04em]" style={rise(1)}>
              开机之后，
              <br />
              开玩之前。
            </h1>
            <p className="mt-5 max-w-[30ch] animate-rise text-base leading-[1.8] text-ink-2" style={rise(2)}>
              一个专注运行库检测与修复的 Windows 小工具：缺什么一屏看清，只从官方源补齐。
            </p>
          </div>
          <div className="hidden animate-rise flex-col items-end gap-3 pt-2 sm:flex" style={rise(1)}>
            <span className="inline-flex h-7 items-center gap-2 rounded-full border border-ink/20 px-3 text-sm text-ink"><span aria-hidden className="size-1.5 rounded-full bg-primary" />开发中</span>
            <p className="text-right font-mono text-xs leading-[1.8] text-ink-3">Windows 10 / 11 · x64<br />v0.1</p>
          </div>
        </div>

        {/* 中央物件 */}
        <div className="absolute left-1/2 top-[56%] size-[min(46vh,80vw,420px)] -translate-x-1/2 -translate-y-1/2">
          <ArchiveRing rotate={rotate} tilt={tilt} tone="light" className="size-full" />
          <span aria-hidden className="absolute left-1/2 top-1/2 size-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFFFFF_0%,#E4DED2_40%,#A39B8C_75%,#5E584D_100%)] shadow-[0_40px_60px_-30px_rgba(60,52,40,0.55)]" />
        </div>

        {/* 四组检测项：底部横排，节点 + 细线 */}
        <div className="container-x absolute inset-x-0 bottom-[6vh]">
          <ol className="grid grid-cols-2 gap-6 border-t border-ink/15 pt-5 md:grid-cols-4">
            {GROUPS.map((g, i) => (
              <li key={g} className="animate-rise" style={rise(3 + i)}>
                <p className="flex items-center gap-2 font-mono text-xs text-ink-3">
                  <span aria-hidden className="size-[6px] rounded-full bg-ink" />
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p className="mt-2 text-xl font-medium text-ink">{g === '其他' ? 'XNA · OpenAL' : g}</p>
                <p className="mt-1 text-sm text-ink-3">{counts[i]} 项检测</p>
              </li>
            ))}
          </ol>
        </div>

        {/* 向下：去看交互预览 */}
        <div className="absolute right-[var(--gutter)] top-[56%] hidden -translate-y-1/2 md:block">
          <Magnetic strength={10} radius={90}>
            <Link href="#preview" className="group flex flex-col items-center gap-3">
              <span className="grid size-20 place-items-center rounded-full bg-ink text-paper shadow-[0_30px_50px_-20px_rgba(20,16,10,0.6)] ring-8 ring-ink/5 transition-transform duration-300 group-hover:scale-105">
                <ArrowDown aria-hidden className="size-5" />
              </span>
              <span className="text-sm tracking-[0.3em] [margin-right:-0.3em]">看演示</span>
            </Link>
          </Magnetic>
        </div>
      </motion.div>
    </section>
  );
}
