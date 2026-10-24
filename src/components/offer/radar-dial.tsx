'use client';
import { useEffect, useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, type MotionValue } from 'motion/react';
import type { OfferVM } from '@/lib/present';
import { shDateTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import { Countdown } from './countdown';
import { isUrgent, liveLifecycle } from './use-lifecycle';

const TICKS = Array.from({ length: 72 }, (_, i) => {
  const major = i % 6 === 0;
  const mid = i % 3 === 0;
  return { i, major, mid, angle: i * 5 };
});

// 稳定的伪随机方位，避免 SSR / 水合不一致
const BLIP_RING = [164, 142, 118, 156, 128, 98, 160, 136];
const BLIP_ANGLE = [24, 72, 128, 186, 247, 302, 334, 49];

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * 雷达盘：同心发丝圆 + 刻度 + 缓慢扫描线 + 盘心读数。
 * 扫描速度在中段随滚动进度加快、两端放慢；离开视口或 reduced-motion 时停止。
 */
export function RadarDial({
  items, lead, leadLc, target, now, activeCount, upcomingCount, total, progress, className,
}: {
  items: OfferVM[];
  lead: OfferVM | null;
  leadLc: string | null;
  target: number | null;
  now: number | null;
  activeCount: number;
  upcomingCount: number;
  total: number;
  progress: MotionValue<number>;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useRef(false);
  const angle = useMotionValue(34);
  const reduced = useReducedMotion();
  const urgent = lead ? isUrgent(lead, leadLc, now) : false;
  const targetLabel = leadLc === 'upcoming' ? '距开始' : leadLc === 'active' ? '剩余时间' : '免费常驻';

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      inView.current = e.isIntersecting;
    }, { rootMargin: '80px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (!inView.current || reduced) return;
    // 一圈约 6 秒；滚动中段稍微加速，两端保持紧迫感
    const p = Math.min(1, Math.max(0, progress.get()));
    const speed = 0.06 + 0.022 * Math.sin(p * Math.PI);
    angle.set((angle.get() + Math.min(delta, 64) * speed) % 360);
  });

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label="免费雷达读数"
      className={cn('relative aspect-square select-none', className)}
    >
      <svg aria-hidden className="absolute inset-0 size-full overflow-visible" viewBox="0 0 400 400">
        {/* 同心圆与十字线 */}
        <circle cx="200" cy="200" r="197" fill="none" stroke="var(--color-border-strong)" strokeWidth="1" />
        <circle className="motion-safe:animate-[radar-pulse_3.4s_ease-in-out_infinite]" cx="200" cy="200" r="186" fill="none" stroke="var(--color-border)" strokeWidth="1" />
        <circle className="motion-safe:animate-[radar-pulse_3.4s_ease-in-out_infinite]" cx="200" cy="200" r="156" fill="none" stroke="var(--color-border-strong)" strokeWidth="1" strokeDasharray="1 6" style={{ animationDelay: '0.55s' }} />
        <circle className="motion-safe:animate-[radar-pulse_3.4s_ease-in-out_infinite]" cx="200" cy="200" r="118" fill="none" stroke="var(--color-border)" strokeWidth="1" style={{ animationDelay: '1.1s' }} />
        <circle className="motion-safe:animate-[radar-pulse_3.4s_ease-in-out_infinite]" cx="200" cy="200" r="76" fill="none" stroke="var(--color-border-strong)" strokeWidth="1" style={{ animationDelay: '1.65s' }} />
        <path d="M200 4v392M4 200h392" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 8" />
        <path d="M61 61l278 278M339 61L61 339" stroke="var(--color-border)" strokeWidth="1" opacity="0.5" strokeDasharray="1 9" />

        {/* 72 格刻度：5° 小刻度 / 15° 中刻度 / 30° 长刻度 */}
        {TICKS.map(({ i, major, mid, angle: a }) => {
          const from = 188;
          const to = major ? 174 : mid ? 181 : 185;
          const p1 = polar(200, 200, from, a);
          const p2 = polar(200, 200, to, a);
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={major ? 'var(--color-fg-3)' : 'var(--color-border-strong)'}
              strokeWidth="1"
              opacity={major ? 0.8 : 0.55}
            />
          );
        })}

        {/* 免费情报的方位点：颜色只表示生命周期，不发光 */}
        {items.slice(0, 8).map((o, i) => {
          const lc = liveLifecycle(o, now);
          const u = isUrgent(o, lc, now);
          const point = polar(200, 200, BLIP_RING[i], BLIP_ANGLE[i]);
          const color = u ? 'var(--color-primary)' : lc === 'active' ? 'var(--color-ok)' : lc === 'upcoming' ? 'var(--color-info)' : 'var(--color-fg-3)';
          return (
            <g key={o.id} opacity={lc === 'ended' ? 0.25 : 1}>
              <circle cx={point.x} cy={point.y} r={u ? 3.6 : 2.5} fill={color} />
              {(u || lc === 'active') && <circle cx={point.x} cy={point.y} r={u ? 10 : 7} fill="none" stroke={color} strokeWidth="1" opacity="0.38" />}
            </g>
          );
        })}
      </svg>

      {/* 扫描扇区：conic-gradient 尾迹 + 一根橙色扫描线，约 6 秒一圈 */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-[3%] z-[1] rounded-full will-change-transform" style={{ rotate: angle }}>
        <div
          className="absolute inset-0 rounded-full opacity-90 mix-blend-screen"
          style={{ background: 'conic-gradient(from -5deg, rgba(216,182,122,0.52) 0deg, rgba(216,182,122,0.2) 26deg, rgba(216,182,122,0.05) 52deg, transparent 68deg, transparent 360deg)' }}
        />
        <span className="absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 origin-bottom bg-primary shadow-[0_0_14px_rgba(216,182,122,0.6)]" />
      </motion.div>


      {/* 盘心读数 */}
      <div className="absolute inset-x-[3%] top-1/2 flex -translate-y-1/2 flex-col items-center text-center">
        <span className="text-xs tracking-[0.04em] text-fg-3">
          {urgent ? <span className="text-primary">紧急</span> : targetLabel}
        </span>

        {target != null && lead ? (
          <Countdown
            target={target}
            mode={leadLc === 'upcoming' ? 'start' : 'end'}
            now={now}
            variant="dial"
            fallbackClassName="mt-5 font-mono text-sm tracking-[0.06em] text-fg-2"
            className={cn(
              'mt-3 text-[clamp(80px,6.7vw,96px)] font-medium leading-none tracking-[-0.07em] [text-shadow:0_0_26px_color-mix(in_oklab,currentColor_28%,transparent)]',
              urgent ? 'text-primary' : 'text-foreground',
            )}
            labelClassName="text-fg-3"
          />
        ) : (
          <div className="mt-1 flex flex-col items-center">
            <span aria-hidden className="font-mono text-[clamp(64px,7vw,98px)] font-light leading-[0.82] tracking-[-0.08em] text-outline [--stroke-w:1.2px]">∞</span>
            <span className="font-serif text-xl font-bold leading-tight tracking-[-0.02em]">{lead ? '常驻雷达' : '雷达静默'}</span>
          </div>
        )}

        <div className="mt-3 flex w-full items-center justify-center gap-2 text-2xs text-fg-3">
          <span aria-hidden className="h-px w-5 bg-border-strong" />
          <span className="max-w-[26ch] truncate text-sm text-foreground">
            {lead ? lead.title : '暂无在架免费情报'}
          </span>
          <span aria-hidden className="h-px w-5 bg-border-strong" />
        </div>
        <span className={cn('mt-1.5 text-xs', urgent ? 'text-primary' : 'text-fg-3')}>
          {target != null ? `${leadLc === 'upcoming' ? '开始' : '截止'} ${shDateTime(target)}` : '无截止'}
        </span>
      </div>

    </div>
  );
}
