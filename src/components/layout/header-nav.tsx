'use client';
import Link from 'next/link';
import { NAV, navActive } from '@/lib/nav';
import { cn } from '@/lib/utils';
import { T } from '@/lib/i18n';

function NavItem({ href, label, active }: { href: string; label: React.ReactNode; active: boolean }) {
  return (
    <li className="flex h-full items-center">
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'relative flex h-8 items-center whitespace-nowrap rounded-full px-3 text-sm transition-colors duration-200 xl:px-3.5',
          active ? 'text-foreground' : 'text-foreground/55 hover:text-foreground',
        )}
      >
        <span className="relative z-10">{label}</span>
      </Link>
    </li>
  );
}

/**
 * 桌面主导航：中英双语标签（随语言切换），一个层级。当前项只靠亮度区分（白字 vs 55% 白），不加底色和下划线。
 * 首页是一条连续镜头，不再显示章节进度。
 */
export function HeaderNav({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="主导航" className="hidden h-full items-stretch justify-self-center lg:flex">
      <ul className="flex h-full items-center gap-0.5">
        {NAV.map((n) => (
          <NavItem key={n.href} href={n.href} label={<T zh={n.label} en={n.en} />} active={navActive(n, pathname)} />
        ))}
      </ul>
    </nav>
  );
}
