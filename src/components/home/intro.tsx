'use client';
import { T } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { animate, motion } from 'motion/react';
import { EASE_INOUT, EASE_OUT } from '@/components/fx/tokens';

export const INTRO_KEY = 'wanji-intro-seen';

/**
 * 开场（约 1.6 秒，只在首次访问播放）：
 *   0–0.6s 金线画出圆环 → 0.5–1.1s 环内数字 0 → total、下方淡入站名 → 1.15–1.6s 上下幕布拉开。
 * 是否播放在 <head> 的内联脚本里决定（见 layout.tsx）：访问过或 reduced-motion 时，html 带 intro-seen，CSS 直接隐藏本层，
 * 所以 SSR 首帧不会出现「先闪开场再消失」。播放期间锁定滚动。
 */
export function Intro({ total }: { total: number }) {
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains('intro-seen')) { setDone(true); return; }
    root.style.overflow = 'hidden';
    const count = animate(0, total, { duration: 0.6, delay: 0.5, ease: EASE_OUT, onUpdate: (v) => setN(Math.round(v)) });
    const t1 = setTimeout(() => setOpen(true), 1150);
    const t2 = setTimeout(() => {
      setDone(true);
      root.style.overflow = '';
      root.classList.add('intro-seen');
      try { localStorage.setItem(INTRO_KEY, '1'); } catch { /* 隐私模式下忽略 */ }
    }, 1650);
    return () => { count.stop(); clearTimeout(t1); clearTimeout(t2); root.style.overflow = ''; };
  }, [total]);

  if (done) return null;
  const curtain = { duration: 0.5, ease: EASE_INOUT };

  return (
    <div data-intro aria-hidden className="fixed inset-0 z-[100]">
      <motion.div className="absolute inset-x-0 top-0 h-1/2 bg-shell" animate={{ y: open ? '-100%' : 0 }} transition={curtain} />
      <motion.div className="absolute inset-x-0 bottom-0 h-1/2 bg-shell" animate={{ y: open ? '100%' : 0 }} transition={curtain} />
      <motion.div className="absolute inset-0 flex flex-col items-center justify-center" animate={{ opacity: open ? 0 : 1 }} transition={{ duration: 0.25 }}>
        <div className="relative grid size-40 place-items-center">
          <svg viewBox="0 0 160 160" className="absolute inset-0 -rotate-90">
            <motion.circle cx="80" cy="80" r="76" fill="none" stroke="#F5F5F7" strokeWidth="1.2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: EASE_INOUT }} />
          </svg>
          <span className="font-display text-5xl font-semibold tabular-nums">{n}</span>
        </div>
        <motion.p className="mt-6 text-sm tracking-[0.04em] text-fg-2 [margin-right:-0.5em]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5, ease: EASE_OUT }}>
          <T zh="玩机索引" en="WANJI INDEX" />
        </motion.p>
      </motion.div>
    </div>
  );
}
