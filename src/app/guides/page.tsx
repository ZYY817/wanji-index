import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { loadData } from '@/lib/data.mjs';
import { FilterList } from '@/components/filter-list';
import { Tag } from '@/components/badges';
import { zh } from '@/lib/labels.mjs';

export const metadata: Metadata = { title: '教程与排查', description: '游戏安装、报错排查、MOD 安装、存档备份教程', alternates: { canonical: '/guides/' } };

export default function GuidesPage() {
  const data = loadData();
  const guides = [...data.guides].sort((a, b) => a.title.localeCompare(b.title, 'zh'));
  const games = new Map(data.games.map((g) => [g.id, g]));
  const cats = [...new Set(guides.map((g) => g.category))];

  return (
    <div className="wrap py-10">
      <h1 className="text-3xl font-black tracking-tight">教程与排查 <span className="ml-2 text-sm font-normal text-[var(--color-txt-3)]">已收录 {guides.length} 篇</span></h1>
      <div className="mt-6">
        <Suspense fallback={null}>
          <FilterList
            placeholder="页内搜索：标题 / 报错原文…"
            filters={[{ key: 'cat', label: '全部分类', options: cats.map((c) => ({ value: c, label: zh('guideCategory', c) })) }]}
            rows={guides.map((g) => ({
              key: g.id,
              q: [g.title, ...(g.keywords ?? [])].join(' ').toLowerCase(),
              dims: { cat: g.category },
              node: (
                <Link href={`/guides/${g.slug}/`} className="card block p-4">
                  <h3 className="font-semibold">{g.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Tag>{zh('guideKind', g.kind)}</Tag>
                    <Tag>{zh('guideCategory', g.category)}</Tag>
                    {(g.games ?? []).slice(0, 2).map((id: string) => { const gm: any = games.get(id); return gm?.name.zh && <span key={id} className="meta">{gm.name.zh}</span>; })}
                    <span className="meta ml-auto">核验 {g.checkedAt}</span>
                  </div>
                </Link>
              ),
            }))}
          />
        </Suspense>
      </div>
    </div>
  );
}
