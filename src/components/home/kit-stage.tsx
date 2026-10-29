'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionTemplate, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import { ArrowRight, Download } from 'lucide-react';
import { KIT, SHORT_EN, type KitComponent } from '@/lib/kit-release';
import { T } from '@/lib/i18n';
import { withBase } from '@/lib/base';
import { useMedia, useMotionOK } from '@/components/fx/hooks';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

/*
 * 首页最后一章 · 装机工具 —— 一段「产品发布片」，全部用工具的真实界面与真实组件目录：
 *   幕 0  登场    超大标语压在上方，工具窗口像一台显示器从画面底部倾斜升起（3D 透视 + 视差）
 *   幕 1  扫描    窗口摆正；一道光带自上而下扫过，扫过的部分从「待机」变成「体检结果」
 *   幕 2  周期表  窗口退到左侧，32 个组件像元素周期表一样从窗口方向飞出、按类别排成方阵
 *   幕 3  装齐    窗口切到「正在装齐」，方阵里 5 个缺失组件随滚动逐个点亮，计数 0/5 → 5/5
 *   幕 4  下载    方阵收起，换成下载面板：版本、体积、参数与按钮
 * 画面底部字幕随幕切换，右下刻度显示进度。数据来自 data/auto/kit.json（每天从 GitHub 同步）。
 */

const COMPS = KIT.catalog?.components ?? [];
const TOTAL = COMPS.length;
const shot = (name: string) => KIT.shots.find((s) => s.name === name)?.src;

// 周期表的「元素符号」
const SYMBOL: Record<string, string> = {
  netfx48: 'N48', netfx35: 'N35', netdesktop9: 'ND9', netdesktop8: 'ND8', netdesktop6: 'ND6',
  webview2: 'WV2', 'dx-jun2010': 'DX9', directplay: 'DP', mediafeaturepack: 'MFP', java21: 'J21', xna4: 'XNA',
  openal: 'AL', physx: 'PhX', ue4prereq: 'UE', 'power-high': 'PWR', gamemode: 'GM', hags: 'HAG',
  'game-dvr-off': 'DVR', 'fullscreen-opt': 'FSO', 'visual-performance': 'VFX',
};
const symbolOf = (c: KitComponent) => {
  if (SYMBOL[c.id]) return SYMBOL[c.id];
  const vc = /^vc(\d{4})-(x64|x86)$/.exec(c.id);
  return vc ? `VC${vc[1].slice(2)}` : c.short.slice(0, 3);
};
const archOf = (c: KitComponent) => /-(x64|x86)$/.exec(c.id)?.[1];

// 类别：底色（纸面上的低饱和色）与图例
const CATS: { key: string; cats: string[]; zh: string; en: string; tone: string }[] = [
  { key: 'vc', cats: ['vcredist'], zh: 'Visual C++', en: 'Visual C++', tone: '#E3E8F2' },
  { key: 'net', cats: ['dotnet'], zh: '.NET', en: '.NET', tone: '#E1EFE6' },
  { key: 'dx', cats: ['directx', 'runtime', 'windows'], zh: 'DirectX 与系统组件', en: 'DirectX & Windows', tone: '#DDE7F5' },
  { key: 'mw', cats: ['middleware'], zh: '游戏中间件', en: 'Middleware', tone: '#F3E3E1' },
  { key: 'opt', cats: ['setting'], zh: '系统优化', en: 'Tweaks', tone: '#ECECF0' },
];
const catOf = (c: KitComponent) => CATS.find((k) => k.cats.includes(c.category)) ?? CATS[CATS.length - 1];
// 按类别排好：同色连成一片
const TILES = CATS.flatMap((k) => COMPS.filter((c) => k.cats.includes(c.category)));

// 「正在装齐 0/5」那张截图对应的演示：这 5 项在方阵里先显示为缺失，随滚动逐个装好
const DEMO_MISSING = ['vc2010-x86', 'netfx35', 'dx-jun2010', 'xna4', 'openal'].filter((id) => TILES.some((c) => c.id === id));

// 时间轴（本章滚动进度 p）
const TL = { rise: 0.16, scan: [0.22, 0.38], fly: [0.44, 0.6], install: [0.66, 0.82], cta: 0.86 } as const;
const PHASE_AT = [0.2, 0.42, 0.64, 0.84]; // 字幕切换点
const FIX_STEP = (TL.install[1] - TL.install[0] - 0.04) / Math.max(1, DEMO_MISSING.length);

const CAPTIONS: { zh: [string, string]; en: [string, string] }[] = [
  { zh: ['开机之后，开玩之前。', '游戏打不开？多半是缺运行库。玩机装机工具扫一遍就知道缺什么。'], en: ['After boot, before play.', 'Game won’t start? It’s usually a missing runtime. Wanji Kit tells you which.'] },
  { zh: ['一键体检', '只读检测，约 10 秒，不改动系统。缺什么、多大、能不能自动装，一屏看清。'], en: ['One-click scan', 'Read-only, about 10 seconds, no system changes. What’s missing, how big, and whether it auto-installs.'] },
  { zh: [`${TOTAL} 项组件，一张表看全`, 'VC++ 2005–2022、.NET、DirectX 旧组件、游戏中间件和系统优化项，按公开的组件目录逐项检测。'], en: [`${TOTAL} components, one table`, 'VC++ 2005–2022, .NET, legacy DirectX, game middleware and system tweaks, checked against a public catalog.'] },
  { zh: ['一键装齐，装完再验', '微软 winget 优先，官方直链兜底；只弹一次管理员授权，装完逐项重扫，扫到才算装好。'], en: ['Install it all, then verify', 'winget first, official links as a fallback; one admin prompt, then every item is re-scanned.'] },
  { zh: ['免安装，下载即用', '解压就能运行，不写注册表、不留后台服务。源码公开在 GitHub。'], en: ['Portable — just run it', 'Unzip and run; no registry entries, no background services. Open source on GitHub.'] },
];

/* ───────── 周期表的一格 ───────── */

function TileFace({ c, i }: { c: KitComponent; i: number }) {
  const arch = archOf(c);
  return (
    <>
      <span className="flex items-start justify-between font-mono text-[0.62em] leading-none text-ink-3">
        <span>{String(i + 1).padStart(2, '0')}</span>
        {arch && <span>{arch}</span>}
      </span>
      <span className="font-display text-[1.5em] font-semibold leading-none tracking-[-0.013em]">{symbolOf(c)}</span>
      <span className="truncate text-[0.62em] leading-tight text-ink-2"><T zh={c.short} en={SHORT_EN[c.id] ?? c.short} /></span>
    </>
  );
}

const TILE_CLS = 'relative flex aspect-[1/1.12] flex-col justify-between overflow-hidden rounded-[6px] p-[0.55em] text-ink shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_10px_20px_-14px_rgba(0,0,0,0.5)]';

/** 动画版：从窗口方向（左侧）依次落位；缺失项在装齐阶段依次点亮 */
function LiveTile({ c, i, p }: { c: KitComponent; i: number; p: MotionValue<number> }) {
  const t0 = TL.fly[0] + (i / Math.max(1, TILES.length)) * 0.1;
  const t = useTransform(p, [t0, t0 + 0.05], [0, 1]);
  const x = useTransform(t, [0, 1], ['-26vw', '0vw']);
  const sc = useTransform(t, [0, 1], [0.4, 1]);
  const k = DEMO_MISSING.indexOf(c.id);
  const fix0 = TL.install[0] + 0.02 + Math.max(0, k) * FIX_STEP;
  const fixed = useTransform(p, [fix0, fix0 + 0.015], [0, 1]);
  const ringO = useTransform(fixed, [0, 1], [1, 0]);
  return (
    <motion.li className={TILE_CLS} style={{ background: catOf(c).tone, x, scale: sc, opacity: t }} title={c.name}>
      <TileFace c={c} i={i} />
      {k >= 0 && (
        <>
          {/* 缺失：虚线外框 + 红点；装好后淡出，换成墨色实点 */}
          <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-[6px] border border-dashed border-[#FF3B30]/70 bg-paper/45" style={{ opacity: ringO }} />
          <motion.span aria-hidden className="absolute right-[0.55em] top-[1.7em] size-[0.45em] rounded-full bg-[#FF3B30]" style={{ opacity: ringO }} />
          <motion.span aria-hidden className="absolute right-[0.55em] top-[1.7em] size-[0.45em] rounded-full bg-ink" style={{ opacity: fixed }} />
        </>
      )}
    </motion.li>
  );
}

function StaticTile({ c, i }: { c: KitComponent; i: number }) {
  return <li className={TILE_CLS} style={{ background: catOf(c).tone }} title={c.name}><TileFace c={c} i={i} /></li>;
}

/* ───────── 其他小部件 ───────── */

function Legend({ className }: { className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-5 gap-y-1.5 text-[0.8em] text-ink-2', className)}>
      {CATS.map((k) => (
        <li key={k.key} className="flex items-center gap-1.5">
          <span aria-hidden className="size-[0.8em] rounded-[2px]" style={{ background: k.tone, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)' }} />
          <T zh={k.zh} en={k.en} />
          <span className="font-mono text-ink-3">{COMPS.filter((c) => k.cats.includes(c.category)).length}</span>
        </li>
      ))}
    </ul>
  );
}

function Specs({ className }: { className?: string }) {
  const rows: [React.ReactNode, React.ReactNode][] = [
    [<T key="a" zh="检测" en="Checks" />, <T key="a2" zh={`${TOTAL} 项`} en={`${TOTAL} items`} />],
    [<T key="b" zh="安装来源" en="Sources" />, <T key="b2" zh="微软 winget / 官方直链" en="Microsoft winget / official links" />],
    [<T key="c" zh="系统" en="System" />, 'Windows 10 / 11 · x64'],
    [<T key="d" zh="形态" en="Package" />, <T key="d2" zh="免安装 zip · 开源" en="Portable zip · open source" />],
  ];
  return (
    <dl className={cn('border-t border-ink/15', className)}>
      {rows.map(([k, v], i) => (
        <div key={i} className="flex items-baseline justify-between gap-6 border-b border-ink/10 py-2.5 text-sm">
          <dt className="text-ink-3">{k}</dt>
          <dd className="text-right text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Actions({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {KIT.asset && (
        <a href={KIT.asset.url} className={cn(buttonVariants({ variant: 'ink', size: 'lg' }), 'shadow-[0_24px_40px_-20px_rgba(0,0,0,0.6)]')}>
          <Download aria-hidden /> <T zh={`下载 v${KIT.version}`} en={`Download v${KIT.version}`} />
        </a>
      )}
      <Link href="/kit/" className={buttonVariants({ variant: 'paper', size: 'lg' })}>
        <T zh="了解装机工具" en="Learn more" /> <ArrowRight aria-hidden />
      </Link>
    </div>
  );
}

/** 下载面板：大号版本与体积 + 参数 + 按钮 */
function DownloadPanel({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p className="tabular text-xs tracking-[0.04em] text-ink-3">WANJI-KIT</p>
      <div className="mt-3 flex items-end gap-8">
        <p className="font-display text-[clamp(56px,6vw,104px)] font-semibold leading-[0.85] tracking-[-0.023em]">v{KIT.version}</p>
        {KIT.asset && (
          <p className="pb-1 tabular text-[clamp(22px,2vw,32px)] leading-none text-ink-2">{KIT.asset.sizeMb}<span className="ml-1 text-[0.55em]">MB</span></p>
        )}
      </div>
      <Specs className="mt-7" />
      <Actions className="mt-7" />
    </div>
  );
}

/** 工具窗口：截图本身带标题栏，这里给圆角、描边、落在纸面上的投影与一道玻璃反光 */
function Frame({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.ComponentProps<typeof motion.div>['style'] }) {
  return (
    <motion.div
      className={cn('relative overflow-hidden rounded-[12px] bg-[#FBFBFD] ring-1 ring-ink/10 shadow-[0_80px_140px_-60px_rgba(0,0,0,0.65),0_30px_60px_-40px_rgba(0,0,0,0.4)]', className)}
      style={style}
    >
      {children}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[12px] bg-[linear-gradient(125deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0)_28%)]" />
    </motion.div>
  );
}

/* ───────── 主组件 ───────── */

const EYEBROW = <T zh={`玩机装机工具 · v${KIT.version} 已发布`} en={`Wanji Kit · v${KIT.version} released`} />;

/** 桌面且允许动效时播放发布片；否则静态版。发布片单独成组件：滚动测量在挂载时就绑定到正确的区块上 */
export function KitStage() {
  const ok = useMotionOK();
  const wide = useMedia('(min-width: 1180px)');
  const pinned = ok && wide && TOTAL > 0 && !!shot('idle');
  return pinned ? <KitFilm /> : <KitStatic eyebrow={EYEBROW} />;
}

function KitFilm() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'start start'] });
  const radius = useTransform(enter, [0.08, 1], [0, 75]);
  const clip = useMotionTemplate`circle(${radius}% at 50% 50%)`;

  // 标语：比窗口慢、向上退场（视差）
  const headY = useTransform(p, [0, 0.2], ['0vh', '-16vh']);
  const headO = useTransform(p, [0.1, 0.2], [1, 0]);
  const headS = useTransform(p, [0, 0.2], [1, 0.92]);
  // 窗口：倾斜升起 → 摆正居中 → 退到左侧 → 停留
  const winRX = useTransform(p, [0, TL.rise], [34, 0]);
  const winY = useTransform(p, [0, TL.rise], ['34vh', '0vh']);
  const winS = useTransform(p, [0, TL.rise, TL.fly[0], TL.fly[0] + 0.1], [1.08, 1, 1, 0.64]);
  const winX = useTransform(p, [TL.fly[0], TL.fly[0] + 0.1], ['0vw', '-22vw']);
  // 扫描：光带从上到下，扫过的部分显示体检结果
  const scan = useTransform(p, [TL.scan[0], TL.scan[1]], [0, 100]);
  const scanRest = useTransform(scan, (v) => 100 - v);
  const scanClip = useMotionTemplate`inset(0 0 ${scanRest}% 0)`;
  const beamTop = useMotionTemplate`${scan}%`;
  const beamO = useTransform(p, [TL.scan[0], TL.scan[0] + 0.01, TL.scan[1] - 0.01, TL.scan[1]], [0, 1, 1, 0]);
  // 组件清单 / 正在装齐：交叉淡入
  const compsO = useTransform(p, [TL.fly[0] - 0.02, TL.fly[0] + 0.02], [0, 1]);
  const installO = useTransform(p, [TL.install[0] - 0.02, TL.install[0] + 0.01], [0, 1]);
  // 方阵 → 下载面板
  const gridO = useTransform(p, [TL.cta - 0.02, TL.cta + 0.02], [1, 0]);
  const legendO = useTransform(p, [TL.fly[1] - 0.04, TL.fly[1]], [0, 1]);
  const countO = useTransform(p, [TL.install[0], TL.install[0] + 0.02], [0, 1]);
  const ctaO = useTransform(p, [TL.cta, TL.cta + 0.04], [0, 1]);
  const ctaY = useTransform(p, [TL.cta, TL.cta + 0.04], [30, 0]);
  const ctaPE = useTransform(ctaO, (v) => (v > 0.5 ? 'auto' : 'none'));

  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(0);
  useMotionValueEvent(p, 'change', (v) => {
    const ph = PHASE_AT.filter((x) => v >= x).length;
    setPhase((prev) => (prev === ph ? prev : ph));
    const n = Math.max(0, Math.min(DEMO_MISSING.length, Math.floor((v - TL.install[0] - 0.02) / FIX_STEP) + 1));
    setCount((prev) => (prev === n ? prev : n));
  });

  const eyebrow = EYEBROW;
  const cap = CAPTIONS[phase];
  return (
    // 外层透明：光斑以外仍能看到上一章的定格画面，光从画面中「长出来」
    <section ref={ref} aria-labelledby="kit-title" className="relative">
      <div className="relative h-[520vh]">
        <motion.div className="sticky top-0 h-[100svh] overflow-hidden bg-paper text-ink" style={{ clipPath: clip }}>
          {/* 展台光：左上窗光斜射 + 地面反光 + 中心柔光 */}
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_58%,rgba(255,255,255,0.7),transparent_70%),linear-gradient(118deg,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_38%),linear-gradient(0deg,rgba(201,192,176,0.5)_0%,transparent_32%)]" />
          <div aria-hidden className="absolute -left-[10%] top-[-20%] h-[140%] w-[38%] rotate-[28deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)]" />

          {/* 幕 0：标语 */}
          <motion.div className="absolute inset-x-0 top-[calc(var(--header-h)+5vh)] z-10 flex flex-col items-center text-center" style={{ y: headY, opacity: headO, scale: headS }}>
            <p className="text-sm tracking-[0.2em] text-ink-3">{eyebrow}</p>
            <h2 id="kit-title" className="mt-4 font-display text-[clamp(48px,6.2vw,112px)] font-semibold leading-[1] tracking-[-0.023em]">
              <T zh="缺什么，它比你先知道。" en={<>Knows what’s missing<br />before you do.</>} />
            </h2>
          </motion.div>

          {/* 工具窗口（3D 透视） */}
          <div className="absolute inset-0 flex items-center justify-center [perspective:1600px]">
            <Frame
              className="aspect-[16/9] w-[min(64vw,calc((100svh-200px)*1.7778))] origin-center"
              style={{ rotateX: winRX, y: winY, scale: winS, x: winX }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={withBase(shot('idle')!)} alt="" className="absolute inset-0 size-full object-cover object-top" />
              {shot('result') && (
                <motion.img src={withBase(shot('result')!)} alt="" decoding="async" className="absolute inset-0 size-full object-cover object-top" style={{ clipPath: scanClip }} />
              )}
              {/* 扫描光带 */}
              <motion.span aria-hidden className="pointer-events-none absolute inset-x-0 h-16 -translate-y-1/2" style={{ top: beamTop, opacity: beamO }}>
                <span className="absolute inset-x-0 top-1/2 h-px bg-[#0071E3]" />
                <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(41,151,255,0.28)_50%,transparent)]" />
              </motion.span>
              {shot('components') && <motion.img src={withBase(shot('components')!)} alt="" decoding="async" className="absolute inset-0 size-full object-cover object-top" style={{ opacity: compsO }} />}
              {shot('install') && <motion.img src={withBase(shot('install')!)} alt="" decoding="async" className="absolute inset-0 size-full object-cover object-top" style={{ opacity: installO }} />}
            </Frame>
          </div>

          {/* 幕 2–3：组件周期表（右侧） */}
          <motion.div className="absolute left-[53vw] right-[5vw] top-1/2 -translate-y-[55%] text-[clamp(11px,0.95vw,16px)]" style={{ opacity: gridO }}>
            <motion.div className="mb-[1.4em] flex items-end justify-between gap-4" style={{ opacity: legendO }}>
              <p className="font-display text-[1.9em] font-semibold leading-none tracking-[-0.013em]"><T zh="组件周期表" en="The runtime table" /></p>
              <motion.p className="tabular text-[0.95em] text-ink-2" style={{ opacity: countO }}>
                <T zh="正在装齐" en="Installing" /> <span className="text-ink">{count}</span> / {DEMO_MISSING.length}
              </motion.p>
            </motion.div>
            <ol className="grid grid-cols-8 gap-[0.45em]">
              {TILES.map((c, i) => <LiveTile key={c.id} c={c} i={i} p={p} />)}
            </ol>
            <motion.div style={{ opacity: legendO }}><Legend className="mt-[1.4em]" /></motion.div>
          </motion.div>

          {/* 幕 4：下载面板（右侧，接替方阵） */}
          <motion.div className="absolute left-[55vw] right-[7vw] top-1/2 -translate-y-[58%]" style={{ opacity: ctaO, y: ctaY, pointerEvents: ctaPE }}>
            <DownloadPanel />
          </motion.div>

          {/* 字幕（左下）+ 刻度（右下） */}
          <div className="container-x pointer-events-none absolute inset-x-0 bottom-[4.5vh] flex items-end justify-between gap-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={cn('max-w-[34em]', phase === 0 && 'invisible')}
              >
                <p className="tabular text-xs text-ink-3">{String(phase + 1).padStart(2, '0')} / {String(CAPTIONS.length).padStart(2, '0')}</p>
                <p className="mt-1.5 text-xl font-semibold"><T zh={cap.zh[0]} en={cap.en[0]} /></p>
                <p className="mt-1 text-[15px] leading-[1.7] text-ink-2"><T zh={cap.zh[1]} en={cap.en[1]} /></p>
              </motion.div>
            </AnimatePresence>
            <ol aria-hidden className="flex items-end gap-1.5">
              {CAPTIONS.map((_, i) => (
                <li key={i} className={cn('h-6 w-[3px] rounded-full transition-colors duration-500', i <= phase ? 'bg-ink' : 'bg-ink/15')} />
              ))}
            </ol>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────── 小屏 / 低动效：静态版 ───────── */

function KitStatic({ eyebrow }: { eyebrow: React.ReactNode }) {
  const idle = shot('idle');
  return (
    <section aria-labelledby="kit-title" className="bg-paper py-24 text-ink">
      <div className="container-x">
        <p className="text-sm tracking-[0.15em] text-ink-3">{eyebrow}</p>
        <h2 id="kit-title" className="mt-3 text-balance font-display text-[clamp(36px,9vw,72px)] font-semibold leading-[1.08] tracking-[-0.02em]">
          <T zh={<>缺什么，<br />它比你先知道。</>} en={<>Knows what’s missing<br />before you do.</>} />
        </h2>
        <p className="mt-5 max-w-[36ch] text-base leading-[1.8] text-ink-2"><T zh={CAPTIONS[0].zh[1]} en={CAPTIONS[0].en[1]} /></p>
        {idle && (
          <Frame className="mt-10 aspect-[16/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBase(idle)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover object-top" />
          </Frame>
        )}
        <p className="mt-14 font-display text-3xl font-semibold tracking-[-0.013em]"><T zh="组件周期表" en="The runtime table" /></p>
        <p className="mt-2 text-sm text-ink-2"><T zh={CAPTIONS[2].zh[1]} en={CAPTIONS[2].en[1]} /></p>
        <div className="text-[11px] sm:text-[13px]">
          <ol className="mt-6 grid grid-cols-6 gap-1 sm:grid-cols-8 sm:gap-1.5">
            {TILES.map((c, i) => <StaticTile key={c.id} c={c} i={i} />)}
          </ol>
          <Legend className="mt-4" />
        </div>
        <DownloadPanel className="mt-16" />
      </div>
    </section>
  );
}
