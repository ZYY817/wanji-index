'use client';
import { ArrowUp } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { getLenis } from './providers';
import { T } from '@/lib/i18n';
import { useL } from './lang-toggle';

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

  const l = useL();
  return (
    <button
      type="button"
      onClick={toTop}
      aria-label={l('回到页面顶部', 'Back to top')}
      className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-white/[0.08] px-4 text-sm text-fg-2 transition-colors duration-300 hover:bg-white/[0.14] hover:text-foreground"
    >
      <span><T zh="回到顶部" en="Back to top" /></span>
      <ArrowUp aria-hidden className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
}
