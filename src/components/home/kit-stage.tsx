'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useMotionTemplate, useScroll, useTransform, type MotionValue } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { KIT_ITEMS, type KitStatus } from '@/lib/kit';
import { ArchiveRing } from '@/components/fx/archive-ring';
import { Magnetic } from '@/components/fx/interact';
import { useMedia, useMotionOK } from '@/components/fx/hooks';
import { cn } from '@/lib/utils';
import { hang } from '@/components/ui/hang';

/* 时间轴（本章滚动进度 p）：
 *   进场        光从画面中心以圆形扩散，把上一章的暗场照亮（独立计时：章节露头 → 固定）
 *   0.00–0.12  标题落下，物件从倾斜转正
 *   0.12–0.42  拆解：四组运行库从物件中心沿对角线飞出，引线随之画出
 *   0.42–0.62  体检：一圈扫描波从物件扩散，每组依次给出结果（已装 / 缺失 / 过旧）
 *   0.62–0.82  汇总与入口居中出现
 *   0.82–1.00  定格；之后亮场随滚动整体上移，片尾从下方接上（不再熄灯，避免整屏黑帧）
 */
const GROUPS = [
  { group: 'VC++', title: 'VC++', x: -1, y: -1 },
  { group: 'DirectX', title: 'DirectX', x: 1, y: -1 },
  { group: '.NET', title: '.NET', x: -1, y: 1 },
  { group: '其他', title: 'XNA 与 OpenAL', x: 1, y: 1 },
] as const;
const DX = 380;
const DY = 135;
const MARK: Record<KitStatus, { glyph: string; cls: string; word: string }> = {
  ok: { glyph: '✓', cls: 'text-[#2F8F5B]', word: '已安装' },
  missing: { glyph: '✕', cls: 'text-[#C0423F]', word: '缺失' },
  outdated: { glyph: '!', cls: 'text-[#B07A12]', word: '过旧' },
};

function Module({ g, i, p }: { g: (typeof GROUPS)[number]; i: number; p: MotionValue<number> }) {
  const out0 = 0.12 + i * 0.05;
  const out1 = out0 + 0.14;
  const t = useTransform(p, [out0, out1], [0, 1]);
  const x = useTransform(t, (v) => g.x * DX * v);
  const y = useTransform(t, (v) => g.y * DY * v);
  const opacity = useTransform(p, [out0, out0 + 0.06], [0, 1]);
  const scale = useTransform(t, [0, 1], [0.4, 1]);
  const line = useTransform(p, [out1 - 0.04, out1 + 0.04], [0, 1]);
  // 体检结果依次亮起
  const scan0 = 0.46 + i * 0.035;
  const result = useTransform(p, [scan0, scan0 + 0.05], [0, 1]);
  const items = KIT_ITEMS.filter((k) => k.group === g.group);
  const left = g.x < 0;
  const len = Math.hypot(DX, DY) - 128; // 从物件边缘（半径 120）画到模块圆点前 8px
  const angle = (Math.atan2(g.y * DY, g.x * DX) * 180) / Math.PI;

  return (
    <>
      {/* 引线：物件边缘 → 模块 */}
      <motion.span
        aria-hidden
        className="absolute left-1/2 top-1/2 h-px origin-left bg-ink/35"
        style={{ width: len, rotate: angle, translateX: Math.cos((angle * Math.PI) / 180) * 120, translateY: Math.sin((angle * Math.PI) / 180) * 120, scaleX: line }}
      />
      <motion.div className="absolute left-1/2 top-1/2" style={{ x, y, opacity, scale }}>
        {/* 标题行的中线对准圆点（不按整块居中）：四组不论条目多少，标题都在同一高度上，左右对称 */}
        <div className={cn('absolute top-[-41px] w-[270px]', left ? 'right-4 text-right' : 'left-4')}>
          <p className="font-mono text-sm text-ink-3">{String(i + 1).padStart(2, '0')}</p>
          <p className="mt-1 h-[34px] font-serif text-[26px] font-bold leading-[34px] text-ink">{g.title}</p>
          <motion.ul className="mt-2.5 space-y-1.5 text-[15px] text-ink-2" style={{ opacity: result }}>
            {items.map((it) => (
              <li key={it.name + (it.arch ?? '')} className={cn('flex items-center gap-2', left && 'justify-end')}>
                <span className="truncate">{it.name.replace(' 运行库', '').replace(/（.*?）/, '')}{it.arch ? ` ${it.arch}` : ''}</span>
                <span className={cn('shrink-0 font-semibold', MARK[it.status].cls)}>{MARK[it.status].glyph}</span>
              </li>
            ))}
          </motion.ul>
        </div>
        <span aria-hidden className="absolute size-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
      </motion.div>
    </>
  );
}

/**
 * 首页最后一章 · 装机工具（全片唯一的「白昼」）：光从中心扩散进场 → 物件拆解出四组运行库 → 扫描体检 → 汇总与入口 → 熄灯交给片尾。
 * 所有文字在中轴上：标题在物件正上方，汇总与入口在正下方；四组结果以中轴为轴对称排布。
 */
export function KitStage() {
  const ref = useRef<HTMLElement>(null);
  const ok = useMotionOK();
  const wide = useMedia('(min-width: 1280px)');
  const pinned = ok && wide;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'start start'] });
  const radius = useTransform(enter, [0.08, 1], [0, 75]);
  const clip = useMotionTemplate`circle(${radius}% at 50% 50%)`;

  const ringRotate = useTransform(p, [0, 1], [-25, 30]);
  const ringTilt = useTransform(p, [0, 0.4], [62, 20]);
  const objS = useTransform(p, [0, 0.12, 0.42], [0.8, 1, 0.92]);
  const titleO = useTransform(p, [0, 0.08], [0, 1]);
  const titleY = useTransform(p, [0, 0.08], [24, 0]);
  const wave = useTransform(p, [0.44, 0.62], [0.3, 2.6]);
  const waveO = useTransform(p, [0.44, 0.5, 0.62], [0, 0.5, 0]);
  const sumO = useTransform(p, [0.62, 0.7], [0, 1]);
  const sumY = useTransform(p, [0.62, 0.7], [20, 0]);

  const missing = KIT_ITEMS.filter((k) => k.status === 'missing').length;
  const outdated = KIT_ITEMS.filter((k) => k.status === 'outdated').length;

  if (!pinned) {
    return (
      <section ref={ref} aria-labelledby="kit-title" className="bg-paper py-24 text-ink">
        <div className="container-x text-center">
          <p className="text-sm text-ink-3">装机工具 · 开发中</p>
          <h2 id="kit-title" className="mt-3 text-balance font-serif text-[clamp(32px,8vw,64px)] font-black leading-[1.15] tracking-[-0.04em]">{hang('缺什么，它比你先知道。')}</h2>
          <p className="mx-auto mt-5 max-w-[36ch] text-base leading-[1.8] text-ink-2">检测 VC++、DirectX、.NET 等游戏运行库，缺失的从官方源一键补齐。</p>
          <Link href="/kit/" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-base text-paper">了解装机工具 <ArrowRight aria-hidden className="size-4" /></Link>
        </div>
      </section>
    );
  }

  return (
    // 外层透明：光斑以外仍能看到上一章的定格画面，光从画面中「长出来」
    <section ref={ref} aria-labelledby="kit-title" className="relative">
      <div className="relative h-[230vh]">
        <motion.div className="sticky top-0 h-[100svh] overflow-hidden bg-paper text-ink" style={{ clipPath: clip }}>
          {/* 展台的光：左上窗光斜射 + 地面反光 */}
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_38%),linear-gradient(0deg,rgba(201,192,176,0.45)_0%,transparent_35%)]" />
          <div aria-hidden className="absolute -left-[10%] top-[-20%] h-[140%] w-[38%] rotate-[28deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)]" />

          {/* 标题：物件正上方 */}
          <motion.div className="absolute inset-x-0 top-[calc(var(--header-h)+4vh)] flex flex-col items-center text-center" style={{ opacity: titleO, y: titleY }}>
            <p className="text-sm text-ink-3">装机工具 · Windows 10 / 11 · 开发中</p>
            <h2 id="kit-title" className="mt-3 font-serif text-[clamp(38px,3.6vw,60px)] font-black leading-[1.08] tracking-[-0.04em]">{hang('缺什么，它比你先知道。')}</h2>
          </motion.div>

          {/* 物件 + 拆解 + 扫描 */}
          <div className="absolute inset-0 translate-y-[3vh]">
            <motion.div aria-hidden className="absolute left-1/2 top-1/2 size-[260px] rounded-full border border-ink/40" style={{ x: '-50%', y: '-50%', scale: wave, opacity: waveO }} />
            {GROUPS.map((g, i) => <Module key={g.group} g={g} i={i} p={p} />)}
            <motion.div className="absolute left-1/2 top-1/2 size-[340px]" style={{ x: '-50%', y: '-50%', scale: objS }}>
              <ArchiveRing rotate={ringRotate} tilt={ringTilt} tone="light" className="size-full" />
              <span aria-hidden className="absolute left-1/2 top-1/2 size-[118px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFFFFF_0%,#E4DED2_40%,#A39B8C_75%,#5E584D_100%)] shadow-[0_40px_60px_-30px_rgba(60,52,40,0.55)]" />
            </motion.div>
          </div>

          {/* 汇总 + 入口：物件正下方 */}
          <motion.div className="absolute inset-x-0 bottom-[6vh] flex flex-col items-center text-center" style={{ opacity: sumO, y: sumY }}>
            <p className="text-base text-ink-2">
              共 {KIT_ITEMS.length} 项检测 · <span className="text-[#C0423F]">{missing} 项缺失</span> · <span className="text-[#B07A12]">{outdated} 项过旧</span>
              <span className="text-ink-3">（演示数据）</span>
            </p>
            <Magnetic strength={8} radius={80}>
              <Link href="/kit/" className="mt-5 inline-flex h-12 items-center gap-3 rounded-full bg-ink px-7 text-base text-paper shadow-[0_24px_40px_-20px_rgba(20,16,10,0.6)] transition-transform duration-300 hover:scale-[1.03]">
                了解装机工具 <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Magnetic>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
