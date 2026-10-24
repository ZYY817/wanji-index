'use client';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

// 字符乱码解码：SSR 输出真实文字；悬停 / 进入视口 / 外部 key 变化时逐字由乱码解出。reduced-motion 下不执行。
const LATIN = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/+=';
const BLOCK = '▖▗▘▙▚▛▜▝▞▟░▒';

export function ScrambleText({
  text, className, trigger = 'hover', duration = 700, as: Tag = 'span', runKey,
}: {
  text: string;
  className?: string;
  trigger?: 'hover' | 'inview' | 'both' | 'none' | 'key';
  duration?: number;
  as?: any;
  /** trigger="key" 时使用：runKey 变为非负值即解码；负值 / 空值只显示真实文字（用于初始与失活） */
  runKey?: number | string | null;
}) {
  const [out, setOut] = useState(text);
  const ref = useRef<HTMLElement>(null);
  const raf = useRef(0);
  const lastKey = useRef<number | string | null>(null);
  const reduced = useReducedMotion();

  const run = () => {
    if (reduced) return;
    cancelAnimationFrame(raf.current);
    const chars = [...text];
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const settled = Math.floor(p * chars.length);
      setOut(
        chars
          .map((c, i) => {
            if (i < settled || c === ' ' || c === '·' || c === '—' || c === '/') return c;
            const pool = /[\u4e00-\u9fff]/.test(c) ? BLOCK : LATIN;
            return pool[(Math.random() * pool.length) | 0];
          })
          .join(''),
      );
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setOut(text);
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    setOut(text);
  }, [text]);

  // key 触发：只在外部 key 真正变化时跑一次；失活（负值 / 空值）立即还原真实文字
  useEffect(() => {
    if (trigger !== 'key') return;
    const idle = reduced || runKey === null || runKey === undefined || (typeof runKey === 'number' && runKey < 0);
    if (idle) {
      lastKey.current = null;
      cancelAnimationFrame(raf.current);
      setOut(text);
      return;
    }
    if (lastKey.current === runKey) return;
    lastKey.current = runKey;
    run();
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, runKey, text, reduced]);

  useEffect(() => {
    if (trigger !== 'inview' && trigger !== 'both') return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { run(); io.disconnect(); }
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, text, reduced]);

  const hover = trigger === 'hover' || trigger === 'both';
  return (
    <Tag
      ref={ref}
      className={cn('relative inline-block', className)}
      onMouseEnter={hover ? run : undefined}
      onFocus={hover ? run : undefined}
    >
      <span className="sr-only">{text}</span>
      {/* 真实文字留位但不显示：解码期间宽度 / 行高不跳动 */}
      <span aria-hidden className="invisible">{text}</span>
      <span aria-hidden className="pointer-events-none absolute inset-0">{out}</span>
    </Tag>
  );
}
