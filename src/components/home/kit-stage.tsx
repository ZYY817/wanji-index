'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionTemplate, useScroll, useTransform, type MotionValue } from 'motion/react';
import { ArrowRight, Download } from 'lucide-react';
import { KIT, SHORT_EN, type KitComponent } from '@/lib/kit-release';
import { T } from '@/lib/i18n';
import { ArchiveRing } from '@/components/fx/archive-ring';
import { Magnetic } from '@/components/fx/interact';
import { useMedia, useMotionOK } from '@/components/fx/hooks';
import { cn } from '@/lib/utils';
import { hang } from '@/components/ui/hang';
import { buttonVariants } from '@/components/ui/button';

/* 时间轴（本章滚动进度 p）：
 *   进场        光从画面中心以圆形扩散，把上一章的暗场照亮（独立计时：章节露头 → 固定）
 *   0.00–0.12  标题落下，物件从倾斜转正
 *   0.12–0.42  拆解：四组运行库从物件中心沿对角线飞出，引线随之画出
 *   0.42–0.62  体检：一圈扫描波从物件扩散，每组依次列出检测项
 *   0.62–0.82  汇总（真实参数）与下载入口居中出现
 *   0.82–1.00  定格；之后亮场随滚动整体上移，片尾从下方接上
 * 数据全部来自工具公开的组件目录（data/auto/kit.json，每天从 GitHub 同步），不是演示数据。
 */

type Row = { key: string; zh: string; en: string; meta?: string; essential?: boolean };
type Slot = { key: string; zh: string; en: string; x: -1 | 1; y: -1 | 1; count: number; rows: Row[]; more: number };

const comps = KIT.catalog?.components ?? [];
const RANK: Record<string, number> = { essential: 0, common: 1, optional: 2, low: 3 };
const byRank = (a: KitComponent, b: KitComponent) => (RANK[a.importance] ?? 9) - (RANK[b.importance] ?? 9);
const row = (c: KitComponent): Row => ({
  key: c.id, zh: c.short, en: SHORT_EN[c.id] ?? c.short,
  meta: c.sizeMb ? `${c.sizeMb} MB` : undefined, essential: c.importance === 'essential',
});

/** VC++ 按年份合并 x64 / x86 两行：「VC++ 2015–2022 · x64 x86」 */
function vcRows(list: KitComponent[]): Row[] {
  const years = new Map<string, KitComponent[]>();
  for (const c of list) {
    const y = /Visual C\+\+ (.+?) 运行库/.exec(c.name)?.[1] ?? c.short;
    years.set(y, [...(years.get(y) ?? []), c]);
  }
  return [...years].map(([y, cs]) => ({
    key: y, zh: `VC++ ${y}`, en: `VC++ ${y}`,
    meta: cs.map((c) => (/x86|32/.test(c.short + c.name) ? 'x86' : 'x64')).sort((a, b) => (a === 'x64' ? -1 : b === 'x64' ? 1 : 0)).join(' · '),
    essential: cs.some((c) => c.importance === 'essential'),
  }));
}

function slot(key: string, zh: string, en: string, x: -1 | 1, y: -1 | 1, cats: string[], max: number): Slot {
  const list = comps.filter((c) => cats.includes(c.category)).sort(byRank);
  const rows = key === 'vc' ? vcRows(list) : list.map(row);
  return { key, zh, en, x, y, count: list.length, rows: rows.slice(0, max), more: Math.max(0, rows.length - max) };
}

const SLOTS: Slot[] = [
  slot('vc', 'Visual C++', 'Visual C++', -1, -1, ['vcredist'], 6),
  slot('dx', 'DirectX 与中间件', 'DirectX & more', 1, -1, ['directx', 'runtime', 'middleware', 'windows'], 6),
  slot('net', '.NET', '.NET', -1, 1, ['dotnet'], 6),
  slot('opt', '系统优化', 'System tweaks', 1, 1, ['setting'], 6),
];
const TOTAL = comps.length;

/** 四组清单的排布随窗口变化：横向距离与宽度按视口宽度、纵向距离与行数按视口高度，保证 1280 宽 / 720 高也不出屏、不压到底部参数 */
type Geo = { dx: number; dy: number; w: number; rows: number };
function useGeo(): Geo {
  const calc = (): Geo => {
    if (typeof window === 'undefined') return { dx: 390, dy: 150, w: 300, rows: 6 };
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = Math.round(Math.min(300, Math.max(250, vw * 0.19)));
    const dx = Math.round(Math.min(390, vw / 2 - w - 40));
    const dy = Math.round(Math.min(150, Math.max(105, vh * 0.15)));
    return { dx, dy, w, rows: vh < 820 ? 3 : vh < 960 ? 4 : 6 };
  };
  const [geo, setGeo] = useState<Geo>(calc);
  useEffect(() => { const on = () => setGeo(calc()); on(); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on); }, []);
  return geo;
}

function ItemRow({ r, left, compact }: { r: Row; left?: boolean; compact?: boolean }) {
  return (
    <li className={cn('flex items-baseline gap-3', left && 'flex-row-reverse')}>
      <span className="truncate text-ink"><T zh={r.zh} en={r.en} /></span>
      <span aria-hidden className="h-px min-w-3 flex-1 translate-y-[-0.3em] bg-ink/12" />
      {r.essential && (compact
        ? <span title="必备 / essential" className="size-1.5 shrink-0 translate-y-[-0.2em] rounded-full bg-[#9A6B1E]" />
        : <span className="shrink-0 text-xs font-medium text-[#9A6B1E]"><T zh="必备" en="essential" /></span>)}
      {r.meta && <span className="shrink-0 font-mono text-xs text-ink-3">{compact ? r.meta.replace(' · ', '/') : r.meta}</span>}
    </li>
  );
}

function Module({ s, i, p, g }: { s: Slot; i: number; p: MotionValue<number>; g: Geo }) {
  const DX = g.dx, DY = g.dy;
  // 上面两组最多 6 行，下面两组少一行，给底部的参数与按钮留出空间
  const max = s.y < 0 ? g.rows : Math.max(3, g.rows - 1);
  const rows = s.rows.slice(0, max);
  const more = s.more + s.rows.length - rows.length;
  const out0 = 0.12 + i * 0.05;
  const out1 = out0 + 0.14;
  const t = useTransform(p, [out0, out1], [0, 1]);
  const x = useTransform(t, (v) => s.x * DX * v);
  const y = useTransform(t, (v) => s.y * DY * v);
  const opacity = useTransform(p, [out0, out0 + 0.06], [0, 1]);
  const scale = useTransform(t, [0, 1], [0.4, 1]);
  const line = useTransform(p, [out1 - 0.04, out1 + 0.04], [0, 1]);
  // 体检：清单依次亮起
  const scan0 = 0.46 + i * 0.035;
  const result = useTransform(p, [scan0, scan0 + 0.05], [0, 1]);
  const left = s.x < 0;
  const len = Math.hypot(DX, DY) - 128; // 从物件边缘（半径 120）画到模块圆点前 8px
  const angle = (Math.atan2(s.y * DY, s.x * DX) * 180) / Math.PI;

  return (
    <>
      <motion.span
        aria-hidden
        className="absolute left-1/2 top-1/2 h-px origin-left bg-ink/35"
        style={{ width: len, rotate: angle, translateX: Math.cos((angle * Math.PI) / 180) * 120, translateY: Math.sin((angle * Math.PI) / 180) * 120, scaleX: line }}
      />
      <motion.div className="absolute left-1/2 top-1/2" style={{ x, y, opacity, scale }}>
        {/* 标题行的中线对准圆点：四组不论条目多少，标题都在同一高度上，左右对称 */}
        <div className={cn('absolute top-[-41px]', left ? 'right-4 text-right' : 'left-4')} style={{ width: g.w }}>
          <p className="font-mono text-sm text-ink-3">{String(i + 1).padStart(2, '0')} · <T zh={`${s.count} 项`} en={`${s.count} items`} /></p>
          <p className="mt-1 h-[34px] truncate whitespace-nowrap font-serif text-[26px] font-bold leading-[34px] text-ink"><T zh={s.zh} en={s.en} /></p>
          <motion.ul className="mt-2.5 space-y-1.5 text-[15px]" style={{ opacity: result }}>
            {rows.map((r) => <ItemRow key={r.key} r={r} left={left} compact={g.w < 280} />)}
            {more > 0 && <li className="text-sm text-ink-3"><T zh={`另有 ${more} 项`} en={`+${more} more`} /></li>}
          </motion.ul>
        </div>
        <span aria-hidden className="absolute size-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
      </motion.div>
    </>
  );
}

/** 真实参数一行：32 项检测 · 官方源 · 免安装 · 体积 */
function Facts({ className }: { className?: string }) {
  const items: [React.ReactNode, React.ReactNode][] = [
    [<span key="n" className="font-mono">{TOTAL}</span>, <T key="t" zh="项检测" en="checks" />],
    [<T key="o" zh="微软 / 官方源" en="Microsoft & official" />, <T key="o2" zh="安装" en="sources" />],
    [<T key="p" zh="免安装" en="Portable" />, <T key="p2" zh="绿色版" en="zip" />],
    ...(KIT.asset ? [[<span key="s" className="font-mono">{KIT.asset.sizeMb} MB</span>, <T key="s2" zh="下载" en="download" />] as [React.ReactNode, React.ReactNode]] : []),
  ];
  return (
    <ul className={cn('flex flex-wrap justify-center gap-x-8 gap-y-2 text-base text-ink-2', className)}>
      {items.map(([a, b], i) => <li key={i}><span className="font-semibold text-ink">{a}</span> {b}</li>)}
    </ul>
  );
}

function Actions({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-3', className)}>
      {KIT.asset && (
        <a href={KIT.asset.url} className={cn(buttonVariants({ variant: 'ink', size: 'lg' }), 'shadow-[0_24px_40px_-20px_rgba(20,16,10,0.6)]')}>
          <Download aria-hidden /> <T zh={`下载 v${KIT.version}`} en={`Download v${KIT.version}`} />
        </a>
      )}
      <Link href="/kit/" className={buttonVariants({ variant: 'paper', size: 'lg' })}>
        <T zh="了解装机工具" en="Learn more" /> <ArrowRight aria-hidden />
      </Link>
    </div>
  );
}

/**
 * 首页最后一章 · 装机工具（全片唯一的「白昼」）：光从中心扩散进场 → 物件拆解出四组运行库 → 扫描列出检测项 → 真实参数与下载入口。
 * 所有文字在中轴上：标题在物件正上方，汇总与入口在正下方；四组清单以中轴为轴对称排布。
 */
export function KitStage() {
  const ref = useRef<HTMLElement>(null);
  const ok = useMotionOK();
  const wide = useMedia('(min-width: 1280px)');
  const pinned = ok && wide;
  const geo = useGeo();
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

  const eyebrow = <T zh={`装机工具 · Windows 10 / 11 · v${KIT.version} 已发布`} en={`Wanji Kit · Windows 10 / 11 · v${KIT.version} released`} />;
  const title = <T zh={hang('缺什么，它比你先知道。')} en="Knows what’s missing before you do." />;

  if (!pinned) {
    // 小屏 / 低动效：同样的四组真实清单，排成卡片
    return (
      <section ref={ref} aria-labelledby="kit-title" className="bg-paper py-24 text-ink">
        <div className="container-x">
          <div className="text-center">
            <p className="text-sm text-ink-3">{eyebrow}</p>
            <h2 id="kit-title" className="mt-3 text-balance font-serif text-[clamp(32px,8vw,64px)] font-black leading-[1.15] tracking-[-0.04em]">{title}</h2>
            <p className="mx-auto mt-5 max-w-[36ch] text-base leading-[1.8] text-ink-2">
              <T zh="游戏打不开？多半是缺运行库。扫一遍就知道缺什么，点一下从官方源自动装齐。" en="Game won’t start? It’s usually a missing runtime. Scan once, then install what’s missing from official sources." />
            </p>
          </div>
          <ul className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2">
            {SLOTS.map((s, i) => (
              <li key={s.key} className="bg-paper p-6">
                <p className="font-mono text-sm text-ink-3">{String(i + 1).padStart(2, '0')} · <T zh={`${s.count} 项`} en={`${s.count} items`} /></p>
                <p className="mt-1 font-serif text-2xl font-bold"><T zh={s.zh} en={s.en} /></p>
                <ul className="mt-3 space-y-1.5 text-[15px]">
                  {s.rows.slice(0, 4).map((r) => <ItemRow key={r.key} r={r} />)}
                  {s.more + Math.max(0, s.rows.length - 4) > 0 && <li className="text-sm text-ink-3"><T zh={`另有 ${s.more + Math.max(0, s.rows.length - 4)} 项`} en={`+${s.more + Math.max(0, s.rows.length - 4)} more`} /></li>}
                </ul>
              </li>
            ))}
          </ul>
          <Facts className="mt-10" />
          <Actions className="mt-8" />
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
            <p className="text-sm text-ink-3">{eyebrow}</p>
            <h2 id="kit-title" className="mt-3 font-serif text-[clamp(38px,3.6vw,60px)] font-black leading-[1.08] tracking-[-0.04em]">{title}</h2>
          </motion.div>

          {/* 物件 + 拆解 + 扫描 */}
          <div className="absolute inset-0 translate-y-[1vh]">
            <motion.div aria-hidden className="absolute left-1/2 top-1/2 size-[260px] rounded-full border border-ink/40" style={{ x: '-50%', y: '-50%', scale: wave, opacity: waveO }} />
            {SLOTS.map((s, i) => <Module key={s.key} s={s} i={i} p={p} g={geo} />)}
            <motion.div className="absolute left-1/2 top-1/2 size-[340px]" style={{ x: '-50%', y: '-50%', scale: objS }}>
              <ArchiveRing rotate={ringRotate} tilt={ringTilt} tone="light" className="size-full" />
              <span aria-hidden className="absolute left-1/2 top-1/2 size-[118px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFFFFF_0%,#E4DED2_40%,#A39B8C_75%,#5E584D_100%)] shadow-[0_40px_60px_-30px_rgba(60,52,40,0.55)]" />
              {/* 盘心：检测总数 */}
              <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center leading-none text-ink">
                <span className="font-serif text-[34px] font-black tabular-nums">{TOTAL}</span>
                <span className="mt-1 text-[11px] tracking-[0.2em] text-ink-2"><T zh="项检测" en="CHECKS" /></span>
              </span>
            </motion.div>
          </div>

          {/* 汇总 + 入口：物件正下方 */}
          <motion.div className="absolute inset-x-0 bottom-[5vh] flex flex-col items-center text-center" style={{ opacity: sumO, y: sumY }}>
            <Facts />
            <Magnetic strength={8} radius={80}>
              <Actions className="mt-5" />
            </Magnetic>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
