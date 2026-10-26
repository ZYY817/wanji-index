'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { OfferVM, SiteVM } from '@/lib/present';
import { SiteLogo } from '@/components/ui/site-logo';
import { Reveal } from '@/components/fx/reveal';
import { STAGGER } from '@/components/fx/tokens';
import { useMedia, useMotionOK } from '@/components/fx/hooks';
import { useEntry } from '@/components/fx/scene';
import { useNow } from '@/components/offer/countdown';
import { CARD_CLS, CardFace, GLOW_IMG, GLOW_VEIL, deckItems, deckSize, useViewport } from './free-deck';
import { cn } from '@/lib/utils';

/* 两条时间轴。
 * 进场窗口 e（见 Scene 的 relay）：
 *   0.00       画面 = 上一章最后一帧：卡组色场 + 居中的最后一张卡
 *   0.05–0.40  卡片碎开：19 个 Logo 从卡面里浮出，卡片淡去
 *   0.15–0.75  Logo 各自飞上轨道；色场换成本章的暗金底
 *   0.45–0.95  轨道线画出，「19」随之计数
 * 本章滚动进度 p：
 *   0.00–0.50  轨道转动，正前方的 Logo 放大并显示站名
 *   0.50–0.60  标题先上移成页眉
 *   0.54–0.72  三列依次「落地」（列间隔 0.03），每列落定后分组标题出现
 *   0.74–      入口出现
 */
const LAND0 = 0.5;
const COL_STEP = 0.03;
const COL_DUR = 0.12;
const TURN = Math.PI * 1.1;
const TILT = (-8 * Math.PI) / 180;
const LOGO = 44;
const HEAD = 64; // 分组标题占的高度（标题 + 下划线 + 间距）
const GROUP_GAP = 28;
const COLS = 3;

/** 一个站点在索引里的落点（相对舞台中心的像素坐标）与所在列 */
type Slot = { col: number; x: number; y: number };
type Head = { key: string; label: string; count: number; col: number; x: number; y: number; w: number };
type Geo = { rx: number; ry: number; cw: number; ch: number };

/**
 * 分组排进三列，让整体轮廓左右对称：最多的一组放中间，其余按大小依次放进左右两列中较矮的那一列。
 * 返回每个站点的落点与每个分组标题的位置。
 */
function layout(groups: { category: string; label: string; sites: SiteVM[] }[], vp: { w: number; h: number }) {
  const colW = Math.min(340, (vp.w - 200) / COLS);
  const maxN = Math.max(...groups.map((g) => g.sites.length));
  const row = Math.max(44, Math.min(56, (vp.h - 440) / maxN));
  const height = (n: number) => HEAD + n * row;
  const sorted = [...groups].sort((a, b) => b.sites.length - a.sites.length);
  const cols: (typeof groups)[] = [[], [], []];
  const hs = [0, 0, 0];
  sorted.forEach((g, i) => {
    const c = i === 0 ? 1 : hs[0] <= hs[2] ? 0 : 2;
    cols[c].push(g);
    hs[c] += height(g.sites.length) + (cols[c].length > 1 ? GROUP_GAP : 0);
  });
  const top = -vp.h * 0.5 + 240;
  const slots = new Map<string, Slot>();
  const heads: Head[] = [];
  cols.forEach((list, c) => {
    const left = (c - 1) * colW - colW / 2 + 16;
    let y = top;
    list.forEach((g) => {
      heads.push({ key: g.category, label: g.label, count: g.sites.length, col: c, x: left, y, w: colW - 40 });
      g.sites.forEach((site, r) => slots.set(site.id, { col: c, x: left + LOGO / 2, y: y + HEAD + LOGO / 2 + r * row }));
      y += height(g.sites.length) + GROUP_GAP;
    });
  });
  return { slots, heads };
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const landStart = (col: number) => LAND0 + 0.04 + col * COL_STEP;

/** 一个站点：卡面里的起点 → 轨道位置 → 索引位置；轨道阶段用景深控制大小、明暗、层级 */
function Node({ s, i, n, slot, g, p, e }: { s: SiteVM; i: number; n: number; slot: Slot; g: Geo; p: MotionValue<number>; e: MotionValue<number> }) {
  const state = useTransform(() => {
    const v = p.get();
    // 进场：从卡面上的格子（5 × 4）飞上轨道，略有先后
    const k = smooth(clamp01((e.get() - 0.15 - (i % 7) * 0.02) / 0.45));
    const sx = ((i % 5) - 2) * (g.cw / 5);
    const sy = (Math.floor(i / 5) - 1.5) * (g.ch / 4);
    const a = (i / n) * Math.PI * 2 + Math.min(v, LAND0) * TURN;
    const ox = Math.cos(a) * g.rx, oy = Math.sin(a) * g.ry;
    const tx = ox * Math.cos(TILT) - oy * Math.sin(TILT);
    const ty = ox * Math.sin(TILT) + oy * Math.cos(TILT);
    const depth = (Math.sin(a) + 1) / 2;
    const gx = slot.x, gy = slot.y;
    // 按列依次落地，像一列列被「排版」进去
    const land = smooth(clamp01((v - landStart(slot.col)) / COL_DUR));
    const orbitS = 0.6 + depth * 0.55, orbitO = 0.3 + depth * 0.7;
    const ox2 = sx + (tx - sx) * k, oy2 = sy + (ty - sy) * k;
    return {
      x: ox2 + (gx - ox2) * land,
      y: oy2 + (gy - oy2) * land,
      scale: (0.7 + (orbitS - 0.7) * k) * (1 - land) + land,
      opacity: clamp01(k * 4) * (orbitO + (1 - orbitO) * (1 - k)) * (1 - land) + land,
      // 轨道阶段只给正前方的那一个显示站名
      label: Math.max(clamp01((depth - 0.96) / 0.03) * clamp01((k - 0.9) / 0.1) * (1 - land) * (v < LAND0 ? 1 : 0), clamp01((land - 0.6) / 0.4)),
      z: Math.round(depth * 100),
    };
  });
  const x = useTransform(state, (st) => st.x);
  const y = useTransform(state, (st) => st.y);
  const scale = useTransform(state, (st) => st.scale);
  const opacity = useTransform(state, (st) => st.opacity);
  const zIndex = useTransform(state, (st) => st.z);
  const label = useTransform(state, (st) => st.label);

  return (
    <motion.div className="absolute left-1/2 top-1/2" style={{ x, y, zIndex }}>
      <motion.div style={{ scale, opacity }}>
        <Link href={`/resources/${s.slug}/`} className="group flex items-center gap-3" style={{ marginLeft: -LOGO / 2, marginTop: -LOGO / 2 }}>
          <SiteLogo id={s.id} name={s.name} size={LOGO} tone="paper" className="rounded-lg transition-transform duration-300 group-hover:scale-110" />
          <motion.span className="whitespace-nowrap leading-tight" style={{ opacity: label }}>
            <span className="block text-[15px] text-foreground transition-colors group-hover:text-primary">{s.name}</span>
            <span className="block font-mono text-xs text-fg-3">{s.domain}</span>
          </motion.span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

/** 分组标题：所在列落定时出现 */
function GroupHead({ h, p }: { h: Head; p: MotionValue<number> }) {
  const s0 = landStart(h.col) + COL_DUR * 0.7;
  const opacity = useTransform(p, [s0, s0 + 0.04], [0, 1]);
  const y = useTransform(p, [s0, s0 + 0.04], [8, 0]);
  return (
    <motion.div className="absolute border-b border-foreground/15 pb-2" style={{ left: h.x, top: h.y, width: h.w, opacity, y }}>
      <span className="font-serif text-lg font-bold">{h.label}</span>
      <span className="ml-2 text-sm text-fg-3">{h.count}</span>
    </motion.div>
  );
}

/**
 * 第 3 章 · 资源站：上一章的最后一张卡碎成 19 个 Logo → 星图 → 落地成分类索引（同一组 Logo，不换画面）。
 * 小屏 / reduced-motion：直接显示分类索引。
 */
export function Directory({ offers, sites, groups, counts }: {
  offers: OfferVM[]; sites: SiteVM[]; groups: { category: string; label: string; sites: SiteVM[] }[]; counts: { sites: number; categories: number; entries: number };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ok = useMotionOK();
  const wide = useMedia('(min-width: 1280px)');
  const pinned = ok && wide;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const e = useEntry(ref);
  const now = useNow();
  const deck = deckItems(offers, now);
  const last = deck[deck.length - 1];

  const vp = useViewport();
  const card = deckSize(vp);
  const geo: Geo = { rx: Math.min(vp.w * 0.36, 620), ry: Math.min(vp.w * 0.12, 210), cw: card.w, ch: card.h };
  const { slots, heads } = layout(groups, vp);

  // 进场：卡片碎开、色场切换、轨道画出、数字计数
  const cardO = useTransform(e, [0.05, 0.4], [1, 0]);
  const cardS = useTransform(e, [0.05, 0.4], [1, 0.82]);
  const cardBlur = useTransform(e, [0.05, 0.4], ['blur(0px)', 'blur(10px)']);
  const ambientO = useTransform(e, [0.2, 0.65], [1, 0]);
  const draw = useTransform(e, [0.45, 0.95], [0, 1]);
  const lineO = useTransform(p, [LAND0, LAND0 + 0.08], [1, 0]);
  const titleIn = useTransform(e, [0.45, 0.7], [0, 1]);
  const count = useTransform(e, [0.5, 0.95], [0, counts.sites]);
  const num = useTransform(count, (v) => Math.round(v));
  // 落地：标题先上移、缩小成页眉，各列随后依次落下
  const titleY = useTransform(p, [LAND0, LAND0 + 0.1], [0, -vp.h * 0.5 + 140]);
  const titleS = useTransform(p, [LAND0, LAND0 + 0.1], [1, 0.5]);
  const ctaO = useTransform(p, [0.74, 0.8, 0.9, 1], [0, 1, 1, 0]);
  // 收场：索引压暗，装机章的光从一片安静的暗场里长出来，而不是正面撞上一列列文字
  const indexO = useTransform(p, [0.9, 1], [1, 0.22]);

  if (!pinned) {
    return (
      <section ref={ref} aria-labelledby="dir-title" className="container-x bg-background pb-24 pt-10">
        <h2 id="dir-title" className="text-center font-serif text-[clamp(64px,16vw,120px)] font-black leading-none tracking-[-0.05em]">
          {counts.sites}<span className="mt-3 block font-sans text-base font-normal tracking-[0.4em] text-foreground/85">个资源站</span>
        </h2>
        <div className="mt-14 space-y-10">
          {groups.map((g, gi) => (
            <Reveal as="section" key={g.category} delay={gi * STAGGER} aria-label={g.label}>
              <h3 className="border-b border-foreground/15 pb-2 font-serif text-xl font-bold">{g.label}<span className="ml-2 font-sans text-sm font-normal text-fg-3">{g.sites.length}</span></h3>
              <ul className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {g.sites.map((s) => (
                  <li key={s.id}>
                    <Link href={`/resources/${s.slug}/`} className="flex items-center gap-3">
                      <SiteLogo id={s.id} name={s.name} size={36} tone="paper" className="rounded-lg" />
                      <span className="leading-tight"><span className="block text-[15px]">{s.name}</span><span className="block font-mono text-xs text-fg-3">{s.domain}</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="dir-title" className="relative bg-background">
      <div ref={ref} className="relative h-[240vh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(216,182,122,0.1)_0%,transparent_62%)]" />

          {/* 交接帧：上一章的色场 + 最后一张卡（无文字），随后碎开淡去 */}
          {last && (
            <>
              <motion.div aria-hidden className="absolute inset-0" style={{ opacity: ambientO }}>
                <img src={last.art?.hero ?? last.art?.capsule ?? ''} alt="" className={cn(GLOW_IMG, 'opacity-35')} />
                <div className={GLOW_VEIL} />
              </motion.div>
              <motion.div aria-hidden className="absolute left-1/2 top-1/2" style={{ width: card.w, height: card.h, marginLeft: -card.w / 2, marginTop: -card.h / 2, opacity: cardO, scale: cardS, filter: cardBlur }}>
                <div className={CARD_CLS}><CardFace o={last} text={0} /></div>
              </motion.div>
            </>
          )}

          {/* 轨道线：随 Logo 上轨画出，落地开始后淡出 */}
          <motion.div aria-hidden className="absolute left-1/2 top-1/2" style={{ width: geo.rx * 2, height: geo.ry * 2, x: '-50%', y: '-50%', rotate: -8, opacity: lineO }}>
            <svg className="size-full overflow-visible" viewBox={`0 0 ${geo.rx * 2} ${geo.ry * 2}`}>
              <motion.ellipse cx={geo.rx} cy={geo.ry} rx={geo.rx} ry={geo.ry} fill="none" stroke="#D8B67A" strokeOpacity="0.35" strokeWidth="1" style={{ pathLength: draw }} />
            </svg>
          </motion.div>

          {/* 分类列标题：每列落定时出现，与该列第一个 Logo 左对齐 */}
          <motion.div aria-hidden className="absolute left-1/2 top-1/2" style={{ opacity: indexO }}>
            {heads.map((h) => <GroupHead key={h.key} h={h} p={p} />)}
          </motion.div>

          {/* 卡面 → 星图 → 索引 */}
          <motion.div className="absolute inset-0" style={{ opacity: indexO }}>
            {sites.map((s, i) => <Node key={s.id} s={s} i={i} n={sites.length} slot={slots.get(s.id) ?? { col: 0, x: 0, y: 0 }} g={geo} p={p} e={e} />)}
          </motion.div>

          {/* 标题：中心 → 页眉 */}
          <motion.div className="pointer-events-none absolute inset-0 z-[200] flex items-center justify-center" style={{ y: titleY, scale: titleS, opacity: titleIn }}>
            <h2 id="dir-title" className="flex flex-col items-center text-center">
              <motion.span className="font-serif text-[clamp(96px,11vw,170px)] font-black leading-[0.85] tracking-[-0.05em] tabular-nums" aria-label={String(counts.sites)}>{num}</motion.span>
              <span className="mt-4 text-lg tracking-[0.5em] text-foreground/85 [margin-right:-0.5em]">个资源站</span>
            </h2>
          </motion.div>

          {/* 入口：索引定格后出现在底部中轴 */}
          <motion.div className="absolute inset-x-0 bottom-[6vh] flex justify-center" style={{ opacity: ctaO }}>
            <Link href="/resources/" className="group inline-flex items-center gap-2 border-b border-primary pb-1 text-base">
              查看全部资源站 <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
