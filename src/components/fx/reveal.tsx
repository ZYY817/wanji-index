'use client';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { DUR, EASE_OUT } from './tokens';

const EASE_CSS = `cubic-bezier(${EASE_OUT.join(',')})`;

/**
 * 滚动揭示：内容进入视口时上浮 + 淡入。
 * 约束与 RevealLines 一致——SSR 与首帧完全可见；只有挂载时仍在视口下方的元素才会「装填」为初始态，
 * 所以无 JS、reduced-motion、已在首屏内的内容都不会被藏起来。只动 transform / opacity。
 */
export function Reveal({
  children, className, delay = 0, y = 32, as: Tag = 'div',
}: { children: React.ReactNode; className?: string; delay?: number; y?: number; as?: React.ElementType }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [state, setState] = useState<'idle' | 'armed' | 'shown'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setState('armed');
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setState('shown'); io.disconnect(); }
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <Tag
      ref={ref}
      className={cn(state !== 'idle' && 'will-change-transform', className)}
      style={{
        opacity: state === 'armed' ? 0 : 1,
        transform: state === 'armed' ? `translate3d(0, ${y}px, 0)` : 'none',
        transition: state === 'shown' ? `opacity ${DUR.enter}s ${EASE_CSS} ${delay}s, transform ${DUR.scene}s ${EASE_CSS} ${delay}s` : 'none',
      }}
    >
      {children}
    </Tag>
  );
}
