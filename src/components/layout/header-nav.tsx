'use client';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { NAV, navActive } from '@/lib/nav';
import { cn } from '@/lib/utils';

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  const reduced = useReducedMotion();
  return (
    <li className="h-full">
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'relative flex h-full items-center whitespace-nowrap px-3 text-base font-medium tracking-[0.02em] transition-colors duration-200 xl:px-4',
          active ? 'text-foreground' : 'text-foreground/65 hover:text-foreground',
        )}
      >
        {label}
        {active && (
          <motion.span
            aria-hidden
            layoutId="header-nav-underline"
            className="absolute inset-x-3 bottom-0 h-[2px] bg-primary xl:inset-x-4"
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 42, mass: 0.7 }}
          />
        )}
      </Link>
    </li>
  );
}

/**
 * 桌面主导航：只有中文标签，一个层级。当前项 = 白字 + 贴底 2px 信号橙线（随路由滑动）。
 * 首页是一条连续镜头，不再显示章节进度。
 */
export function HeaderNav({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="主导航" className="hidden h-full items-stretch justify-self-center lg:flex">
      <ul className="flex h-full items-stretch">
        {NAV.map((n) => (
          <NavItem key={n.href} href={n.href} label={n.label} active={navActive(n, pathname)} />
        ))}
      </ul>
    </nav>
  );
}
