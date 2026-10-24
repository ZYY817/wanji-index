import { Suspense } from 'react';
import type { Metadata } from 'next';
import { loadData } from '@/lib/data.mjs';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { SearchCatalog } from '@/components/catalog/search-catalog';
export const metadata: Metadata = { title: '搜索', description: '查找游戏、资源站、工具与排障教程', robots: { index: false }, alternates: { canonical: '/search/' } };

export default function SearchPage() {
  const data = loadData();
  const holdings: [string, number][] = [
    ['游戏', data.games.length], ['资源站', data.sites.length], ['工具', data.tools.length], ['教程', data.guides.length],
  ];
  return <>
    <IndexMasthead
      no="00"
      title="搜索"
      description="输入游戏名、一条报错，或你想解决的问题。游戏、资源站、工具与教程在这里一起检索。"
      stats={holdings.map(([label, n]) => ({ value: n, label }))}
    />
    <Suspense fallback={<p className="container-x py-16 text-fg-2">正在准备搜索…</p>}><SearchCatalog /></Suspense>
  </>;
}
