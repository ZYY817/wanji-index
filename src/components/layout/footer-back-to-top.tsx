'use client';
import { ArrowUp } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { getLenis } from './providers';

/** 片尾「回到顶部」：Lenis 可用时走平滑滚动，reduced-motion 下立即回顶；键盘可达。 */
export function FooterBackToTop() {
  const reduced = useReducedMotion();

  const toTop = () => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: reduced ? 0 : 1.6 });
      return;
    }
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="回到页面顶部"
      className="group inline-flex min-h-11 items-center gap-3 border border-border-strong px-4 text-sm text-fg-2 transition-colors duration-300 hover:border-foreground/55 hover:text-foreground"
    >
      <span>回到顶部</span>
      <span aria-hidden className="h-px w-7 bg-border-strong transition-colors duration-300 group-hover:bg-foreground/50" />
      <ArrowUp aria-hidden className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
}
