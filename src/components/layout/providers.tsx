'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MotionConfig } from 'motion/react';
import Lenis from 'lenis';

let lenis: Lenis | null = null;
/** 供浮层在打开时暂停 / 恢复平滑滚动 */
export const getLenis = () => lenis;

function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = window.matchMedia('(pointer: fine) and (hover: hover)');
    let id = 0;
    const destroy = () => { cancelAnimationFrame(id); lenis?.destroy(); lenis = null; };
    const setup = () => {
      destroy();
      if (reduced.matches || !pointer.matches || navigator.maxTouchPoints > 0) return;
      const instance = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, anchors: { offset: -96 } });
      lenis = instance;
      const raf = (t: number) => { instance.raf(t); id = requestAnimationFrame(raf); };
      id = requestAnimationFrame(raf);
    };
    setup();
    reduced.addEventListener('change', setup);
    pointer.addEventListener('change', setup);
    return () => { reduced.removeEventListener('change', setup); pointer.removeEventListener('change', setup); destroy(); };
  }, []);
  useEffect(() => {
    if (!window.location.hash) lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      {children}
    </MotionConfig>
  );
}
