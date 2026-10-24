import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { SearchTrigger } from '@/components/layout/search-trigger';
import { NAV } from '@/lib/nav';

export const metadata: Metadata = { title: '未找到页面', robots: { index: false } };

export default function NotFound() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="container-x grid min-h-[86svh] content-end gap-10 pb-16 pt-[calc(var(--header-h)+64px)] lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-sm text-fg-3">404 · 页面不存在</p>
          <h1 className="mt-6">
            <span aria-hidden className="display-xl block">
              4<span className="text-outline [--stroke-w:1.5px]">0</span>4
            </span>
            <span className="mt-6 block font-serif text-[clamp(28px,3.4vw,52px)] font-black leading-tight tracking-[-0.035em]">这份档案还没建立。</span>
          </h1>
          <p className="mt-5 max-w-[46ch] text-base leading-[1.8] text-fg-2">
            链接可能已更改，或者这款游戏、这个站点还没被收录。试试搜索，或从目录重新进入。
          </p>
          <div className="mt-8 max-w-[560px]">
            <SearchTrigger variant="bar" />
          </div>
        </div>
        <nav aria-label="目录" className="self-end lg:col-span-4 lg:col-start-9">
          <p className="mb-3 text-sm text-fg-3">从这里重新进入</p>
          <ul className="border-t border-border">
            <li>
              <Link href="/" className="group flex min-h-12 items-center gap-4 border-b border-border text-lg transition-colors hover:text-primary">
                <span className="flex-1 font-serif font-bold">首页</span>
                <ArrowRight aria-hidden className="size-4 text-fg-3 group-hover:text-foreground" />
              </Link>
            </li>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="group flex min-h-12 items-center gap-4 border-b border-border text-lg transition-colors hover:text-primary">
                  <span className="flex-1 font-serif font-bold">{n.label}</span>
                  <ArrowRight aria-hidden className="size-4 text-fg-3 group-hover:text-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
