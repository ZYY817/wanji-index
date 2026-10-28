import { T } from '@/lib/i18n';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { loadData } from '@/lib/data.mjs';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { SearchCatalog } from '@/components/catalog/search-catalog';
export const metadata: Metadata = { title: '搜索', description: '查找游戏、资源站、工具与排障教程', robots: { index: false }, alternates: { canonical: '/search/' } };

export default function SearchPage() {
  const data = loadData();
  const holdings: [string, string, number][] = [
    ['游戏', 'Games', data.games.length], ['排障', 'Fixes', data.problems.length], ['资源站', 'Sites', data.sites.length], ['工具', 'Tools', data.tools.length], ['教程', 'Guides', data.guides.length],
  ];
  return <>
    <IndexMasthead
      no="00"
      title={<T zh="搜索" en="Search" />}
      description={<T zh="输入游戏名、一条报错，或你想解决的问题。游戏、资源站、工具与教程在这里一起检索。" en="Type a game, an error message, or the problem you want to solve. Games, sites, tools and guides are searched together." />}
      stats={holdings.map(([zhL, enL, n]) => ({ value: n, label: <T zh={zhL} en={enL} /> }))}
    />
    <Suspense fallback={<p className="container-x py-16 text-fg-2"><T zh="正在准备搜索…" en="Loading search…" /></p>}><SearchCatalog /></Suspense>
  </>;
}
