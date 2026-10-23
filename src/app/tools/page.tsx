import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { loadData } from '@/lib/data.mjs';
import { FilterList } from '@/components/filter-list';
import { StatusBadge, Tag } from '@/components/badges';
import { ExtLink } from '@/components/ext-link';
import { zh } from '@/lib/labels.mjs';

export const metadata: Metadata = { title: '工具', description: 'MOD 管理、存档、性能监控等 PC 游戏工具索引', alternates: { canonical: '/tools/' } };

export default function ToolsPage() {
  const data = loadData();
  const tools = [...data.tools].sort((a, b) => a.name.localeCompare(b.name));
  const types = [...new Set(tools.map((t) => t.type))];

  return (
    <div className="wrap py-10">
      <h1 className="text-3xl font-black tracking-tight">工具 <span className="ml-2 text-sm font-normal text-[var(--color-txt-3)]">已收录 {tools.length} 个</span></h1>
      <div className="mt-6">
        <Suspense fallback={null}>
          <FilterList
            placeholder="页内搜索：工具名…"
            filters={[{ key: 'type', label: '全部类型', options: types.map((t) => ({ value: t, label: zh('toolType', t) })) }]}
            rows={tools.map((t) => ({
              key: t.id,
              q: [t.name, ...(t.aliases ?? [])].join(' ').toLowerCase(),
              dims: { type: t.type },
              node: (
                <div className="card p-4">
                  <Link href={`/tools/${t.slug}/`} className="font-semibold hover:text-[var(--color-amber-hi)]">{t.name}</Link>
                  <p className="meta mt-1.5 line-clamp-2">{t.summary}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Tag>{zh('toolType', t.type)}</Tag>
                    {(t.os ?? []).map((o: string) => <Tag key={o}>{zh('os', o)}</Tag>)}
                    {t.linkHealth !== 'ok' && <StatusBadge kind={t.linkHealth} />}
                    <ExtLink href={t.officialUrl} label="官网" health={t.linkHealth} className="ml-auto" />
                  </div>
                </div>
              ),
            }))}
          />
        </Suspense>
      </div>
    </div>
  );
}
