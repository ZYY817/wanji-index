'use client';
import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';

// 数字滚动计数：SSR 直接输出最终值；挂载后若仍在视口外才回退到起点，进入视口时滚动到终值。
// 起点取终值的 60%（不从 0 起跳：快速滚动时也不会看到「000」这类错误数字）。
// intro：Hero 元数据用——挂载后主动从起点滚到终值（SSR 仍是终值，reduced-motion 不动）。
export function CountUp({
  value, pad = 0, duration = 1.6, className, intro = false,
}: { value: number; pad?: number; duration?: number; className?: string; intro?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);
  const reduced = useReducedMotion();

  const from = Math.floor(value * 0.6);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let ctrl: { stop: () => void } | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (intro) {
      setN(from);
      timer = setTimeout(() => {
        ctrl = animate(from, value, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
      }, 180);
      return () => { clearTimeout(timer); ctrl?.stop(); };
    }

    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // 已在视口内：保持终值
    setN(from);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      ctrl = animate(from, value, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    }, { threshold: 0.15 });
    io.observe(el);
    return () => { io.disconnect(); ctrl?.stop(); };
  }, [value, from, duration, reduced, intro]);

  return (
    <span ref={ref} aria-label={String(value)} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span aria-hidden>{String(n).padStart(pad, '0')}</span>
    </span>
  );
}
