import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { FilterList } from '@/components/filter-list';
import { StatusBadge, Tag } from '@/components/badges';
import { ExtLink } from '@/components/ext-link';
import { zh } from '@/lib/labels.mjs';

export const metadata: Metadata = { title: '资源站', description: 'MOD、汉化、攻略、补丁等可信游戏资源站索引', alternates: { canonical: '/resources/' } };

export default function ResourcesPage() {
  const data = loadData();
  const rel = buildRelations(data);
  const sites = [...data.sites].sort((a, b) => a.name.localeCompare(b.name));
  const cats = [...new Set(sites.map((s) => s.category))];
  const entryCount = (sid: string) => rel.entriesBySite.get(sid)?.length ?? 0;

  return (
    <div className="wrap py-10">
      <h1 className="text-3xl font-black tracking-tight">资源站 <span className="ml-2 text-sm font-normal text-[var(--color-txt-3)]">已收录 {sites.length} 个</span></h1>
      <div className="mt-6">
        <Suspense fallback={null}>
          <FilterList
            placeholder="页内搜索：站名 / 别名…"
            filters={[{ key: 'cat', label: '全部分类', options: cats.map((c) => ({ value: c, label: zh('siteCategory', c) })) }]}
            rows={sites.map((s) => ({
              key: s.id,
              q: [s.name, ...(s.aliases ?? [])].join(' ').toLowerCase(),
              dims: { cat: s.category },
              node: (
                <div className="card p-4">
                  <Link href={`/resources/${s.slug}/`} className="flex items-center gap-2 font-semibold hover:text-[var(--color-amber-hi)]">
                    {s.name}{s.aliases?.length ? <span className="meta font-normal">{s.aliases[0]}</span> : null}
                  </Link>
                  <p className="meta mt-1.5 line-clamp-2">{s.summary}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Tag>{zh('siteCategory', s.category)}</Tag>
                    {entryCount(s.id) > 0 && <span className="mono text-[var(--color-txt-3)]">入口{entryCount(s.id)}</span>}
                    {s.linkHealth !== 'ok' && <StatusBadge kind={s.linkHealth} />}
                    <ExtLink href={s.url} label="访问" health={s.linkHealth} className="ml-auto" />
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
