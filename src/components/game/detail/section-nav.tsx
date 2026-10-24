'use client';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { SectionMeta } from '@/lib/game-detail';
import { getLenis } from '@/components/layout/providers';
import { cn } from '@/lib/utils';

const OFFSET = 128; // 顶栏 + 本导航的高度，跳转后章节标题不被遮住

/** 档案章节导航：吸顶；滚动时高亮当前章节（IntersectionObserver，不在滚动中读布局） */
export function SectionNav({ sections }: { sections: SectionMeta[] }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver((list) => {
      for (const e of list) visible.set(e.target.id, e.isIntersecting);
      const first = sections.find((s) => visible.get(s.id));
      if (first) setActive(first.id);
    }, { rootMargin: `-${OFFSET}px 0px -55% 0px` });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const top = el.getBoundingClientRect().top + window.scrollY - OFFSET + 8;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top, { duration: reduced ? 0 : 1.1 });
    else window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav aria-label="档案章节" className="sticky top-[var(--header-h)] z-30 border-b border-border bg-background">
      <div className="container-x">
        <ul className="no-scrollbar -mx-4 flex overflow-x-auto">
          {sections.map((s) => {
            const on = active === s.id;
            return (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  onClick={(e) => go(e, s.id)}
                  aria-current={on ? 'location' : undefined}
                  className={cn('relative flex h-14 items-center gap-2 px-4 text-base transition-colors', on ? 'text-foreground' : 'text-fg-2 hover:text-foreground')}
                >
                  {s.title}
                  <span className={cn('font-mono text-xs tabular-nums', on ? 'text-primary' : 'text-fg-3')}>{s.count}</span>
                  {on && (
                    <motion.span
                      layoutId="detail-nav-underline"
                      aria-hidden
                      className="absolute inset-x-4 bottom-0 h-[2px] bg-primary"
                      transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 42, mass: 0.7 }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
