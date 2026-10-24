import { Suspense } from 'react';
import type { Metadata } from 'next';
import { loadData } from '@/lib/data.mjs';
import { PageMastheadFrame } from '@/components/layout/page-masthead';
import { SearchCatalog } from '@/components/catalog/search-catalog';
import { pad } from '@/lib/utils';
export const metadata: Metadata = { title: '搜索', description: '查找游戏、资源站、工具与排障教程', robots: { index: false }, alternates: { canonical: '/search/' } };

export default function SearchPage() {
  const data = loadData();
  const holdings: [string, number][] = [
    ['游戏', data.games.length], ['资源站', data.sites.length], ['工具', data.tools.length], ['教程', data.guides.length],
  ];
  return <>
    <PageMastheadFrame no="00" en="FIND YOUR NEXT" crumbs={[['搜索']]}>
      <div className="pb-8 pt-8 md:pb-9 md:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div>
            <h1 className="display-m">从这里找到。</h1>
            <p className="mt-3 max-w-[52ch] text-base leading-[1.8] text-fg-2">一个名字、一条报错，或是你想解决的问题。游戏与它的全部线索，在这里交汇。</p>
          </div>
          <dl className="meta flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-2 text-2xs text-fg-3 md:border-t-0 md:pt-0">
            {holdings.map(([label, n]) => (
              <div key={label} className="flex items-baseline gap-2">
                <dt>{label}</dt>
                <dd className="font-mono text-base leading-none text-foreground tabular">{pad(n, 3)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </PageMastheadFrame>
    <Suspense fallback={<p className="container-x py-16 text-fg-2">正在准备搜索…</p>}><SearchCatalog /></Suspense>
  </>;
}
