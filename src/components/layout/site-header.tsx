'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useAnimate, useReducedMotion } from 'motion/react';
import type { NavCounts } from '@/lib/nav';
import { cn } from '@/lib/utils';
import { SearchTrigger } from './search-trigger';
import { MobileMenu } from './mobile-menu';
import { HeaderLockup } from './header-lockup';
import { HeaderNav } from './header-nav';
import { LangToggle } from './lang-toggle';
import { EASE_OUT } from '@/components/fx/tokens';


// 全站顶栏：向下滚动自动让出画面、向上滚动回来。首页初始 72px 透明压在 Hero 上，滚过 80px 收为 60px 实色；
// 内页始终实色 60px；移动端固定 56px。
export function SiteHeader({ counts }: { counts: NavCounts }) {
  const pathname = usePathname() ?? '/';
  const home = pathname === '/';
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [scope, animate] = useAnimate<HTMLElement>();

  const solid = !home || scrolled;

  // 向下滚动时让出画面（顶栏上移隐藏），向上滚动立即回来；菜单、搜索弹窗打开时不隐藏
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      // 首页：开场镜头（[data-film]）播放期间顶栏始终透明，镜头结束后才收成实色，避免中途突然出现底色和横线
      const film = home ? document.querySelector<HTMLElement>('[data-film]') : null;
      setScrolled(film ? y > film.offsetTop + film.offsetHeight - window.innerHeight : y > 80);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 240 && !document.querySelector('[role="dialog"]'));
        last = y;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [home]);

  // 同步吸顶偏移变量 --sticky-top 到 <html>（顶栏隐藏时为 0px，可见时回落到 var(--header-h)）
  useEffect(() => {
    const root = document.documentElement;
    if (hidden) {
      root.setAttribute('data-header-hidden', 'true');
      root.style.setProperty('--sticky-top', '0px');
    } else {
      root.removeAttribute('data-header-hidden');
      root.style.removeProperty('--sticky-top');
    }
    return () => {
      root.removeAttribute('data-header-hidden');
      root.style.removeProperty('--sticky-top');
    };
  }, [hidden]);

  // 高度/背景交给 Motion：从元素当前 CSS 高度起步，首帧与 SSR 完全一致，滚动时不产生布局抖动。
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    let ctrl: { stop: () => void } | null = null;

    const apply = (instant = false) => {
      const desktop = window.matchMedia('(min-width: 1024px)').matches;
      const height = desktop ? (home && !scrolled ? 72 : 60) : 56;
      const backgroundColor = solid ? 'rgba(19,18,17,1)' : 'rgba(19,18,17,0)';
      ctrl?.stop();
      if (reduced) {
        el.style.height = `${height}px`;
        el.style.backgroundColor = backgroundColor;
        return;
      }
      ctrl = animate(el, { height, backgroundColor }, { duration: instant ? 0 : 0.45, ease: EASE_OUT });
    };

    apply();
    const onResize = () => apply(true);
    window.addEventListener('resize', onResize);
    return () => {
      ctrl?.stop();
      window.removeEventListener('resize', onResize);
    };
  }, [scope, animate, home, scrolled, solid, reduced]);


  return (
    <header
      ref={scope}
      className={cn(
        // CSS 兜底高度保证 SSR / 首帧不跳；Motion 从同一高度接管
        'fixed inset-x-0 top-0 z-50 h-14',
        home ? 'bg-transparent lg:h-[72px]' : 'bg-background lg:h-[60px]',
      )}
      style={{ transform: hidden && !reduced ? 'translateY(-100%)' : 'none', transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)' }}
      onFocusCapture={() => setHidden(false)}
    >
      {/* 首页透明态压在亮美术上：顶部压暗，保证操作台可读；收为实色后淡出 */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: solid ? 0 : 1 }}
        transition={{ duration: reduced ? 0 : 0.4 }}
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.34)_46%,transparent_100%)]"
      />
      {/* 发丝底线：透明态隐去，实色态出现 */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 border-b transition-colors duration-500',
          solid && !home ? 'border-border' : 'border-transparent',
        )}
      />

      <div className="relative flex h-full items-center gap-4 px-[var(--gutter)] lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-5">
        <HeaderLockup solid={solid} />
        <HeaderNav pathname={pathname} />
        <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-0 lg:justify-self-end">
          <SearchTrigger className="hidden lg:inline-flex" />
          <LangToggle className="ml-1 lg:ml-2" />
          <SearchTrigger variant="icon" className="lg:hidden" />
          <MobileMenu counts={counts} pathname={pathname} />
        </div>
      </div>

    </header>
  );
}
