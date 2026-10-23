'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import site from '../../config/site.json';

const NAV = [
  { href: '/games/', label: '游戏库' },
  { href: '/free/', label: '免费' },
  { href: '/resources/', label: '资源站' },
  { href: '/tools/', label: '工具' },
  { href: '/guides/', label: '教程' },
  { href: '/kit/', label: '一键装机' },
  { href: '/about/', label: '关于' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState('');

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line-0)] bg-[rgba(11,14,19,0.82)] backdrop-blur-md">
      <div className="wrap flex h-14 items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--color-amber)] text-[13px] font-black text-[#0B0E13]">玩</span>
          <span>{site.name}</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-[var(--color-txt-2)] md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={`hover:text-[var(--color-txt-1)] transition-colors ${pathname.startsWith(n.href) ? 'text-[var(--color-amber-hi)] font-medium' : ''}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <form className="ml-auto hidden w-64 md:block" onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/search/?q=${encodeURIComponent(q.trim())}`); }}>
          <input className="inp !h-9" placeholder="搜游戏、报错、工具…" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        <button className="ml-auto flex h-11 w-11 flex-col items-center justify-center gap-[5px] md:hidden" aria-label="菜单" onClick={() => setOpen(!open)}>
          {[0, 1, 2].map((i) => <span key={i} className={`block h-[1.5px] w-5 bg-[var(--color-txt-1)] transition-transform ${open && i === 0 ? 'translate-y-[6.5px] rotate-45' : ''} ${open && i === 1 ? 'opacity-0' : ''} ${open && i === 2 ? '-translate-y-[6.5px] -rotate-45' : ''}`} />)}
        </button>
      </div>
      {open && (
        <div className="border-t border-[var(--color-line-0)] bg-[var(--color-ink-0)] md:hidden">
          <form className="p-4" onSubmit={(e) => { e.preventDefault(); if (q.trim()) { router.push(`/search/?q=${encodeURIComponent(q.trim())}`); setOpen(false); } }}>
            <input className="inp" placeholder="搜游戏、报错、工具…" value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className="block border-t border-[var(--color-line-0)] px-5 py-3.5 text-sm">{n.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
