import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { loadData } from '@/lib/data.mjs';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { ToolsGuidesIndex } from '@/components/catalog/tools-guides-index';
import { StatusBadge, Tag } from '@/components/ui/badge';
import { ExtLink } from '@/components/ui/ext-link';
import { zh } from '@/lib/labels.mjs';
export const metadata: Metadata = { title: '工具', description: 'MOD 管理、存档、性能监控等 PC 游戏工具索引', alternates: { canonical: '/tools/' } };

export default function ToolsPage() {
  const tools = [...loadData().tools].sort((a, b) => a.name.localeCompare(b.name));
  const types = [...new Set<string>(tools.map((t) => t.type))];
  return <>
    <IndexMasthead
      no="04"
      title="工具"
      description="管理 MOD、备份存档、监控帧数。从一个具体问题出发，找到合适的工具和它的官网。"
      stats={[{ value: tools.length, label: '个工具' }, { value: types.length, label: '个用途分类' }]}
    />
    <div className="container-x pb-20"><ToolsGuidesIndex param="type" placeholder="搜索工具、用途…" grid categories={types.map((t) => ({ value: t, label: zh('toolType', t) }))} rows={tools.map((t, i) => ({
      id: t.id, query: [t.name, t.summary, ...(t.aliases ?? [])].join(' '), category: t.type,
      content: <article className="flex h-full flex-col p-5 md:p-7"><div className="meta mb-9 flex items-center justify-between text-fg-3"><span>Nº {String(i + 1).padStart(2, '0')}</span><StatusBadge value={t.linkHealth === 'ok' ? t.reviewStatus : t.linkHealth} /></div>
        <Link href={`/tools/${t.slug}/`} className="group flex min-h-11 items-start justify-between gap-3"><h2 className="font-serif text-2xl font-semibold leading-tight group-hover:text-primary">{t.name}</h2><ArrowUpRight aria-hidden className="mt-1 size-5 shrink-0 text-fg-3 group-hover:text-primary" /></Link><p className="mb-8 mt-4 flex-1 text-sm leading-7 text-fg-2">{t.summary}</p>
        <div className="flex flex-wrap items-center gap-2"><Tag>{zh('toolType', t.type)}</Tag>{(t.os ?? []).map((o: string) => <Tag key={o}>{zh('os', o)}</Tag>)}</div><div className="meta mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-fg-3"><span>核验 {t.checkedAt}</span><ExtLink href={t.officialUrl} health={t.linkHealth} className="min-h-11 items-center hover:text-foreground">官网</ExtLink></div>
      </article>,
    }))} /></div>
  </>;
}
