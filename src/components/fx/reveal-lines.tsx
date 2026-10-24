'use client';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

// 逐行遮罩揭示：SSR 初始态完全可见（约束：内容不能被动效藏起来）。
// 仅当 JS 挂载后元素仍在视口下方时才「装填」为遮罩初始态，进入视口时逐行升起。
export function RevealLines({
  lines, className, lineClassName, as: Tag = 'div', stagger = 90,
}: { lines: React.ReactNode[]; className?: string; lineClassName?: string; as?: any; stagger?: number }) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'idle' | 'armed' | 'shown'>('idle');
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92) return; // 已可见：不做任何处理
    setState('armed');
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setState('shown'); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <Tag ref={ref} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <span
            className={cn('block will-change-transform', lineClassName)}
            style={{
              transform: state === 'armed' ? 'translate3d(0,108%,0) rotate(2deg)' : 'none',
              transition: state === 'shown' ? `transform 1.1s cubic-bezier(0.16,1,0.3,1) ${i * stagger}ms` : 'none',
              transformOrigin: '0 100%',
            }}
          >
            {l}
          </span>
        </span>
      ))}
    </Tag>
  );
}
