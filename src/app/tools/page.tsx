import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { loadData } from '@/lib/data.mjs';
import { PageMastheadFrame } from '@/components/layout/page-masthead';
import { ToolsGuidesIndex } from '@/components/catalog/tools-guides-index';
import { StatusBadge, Tag } from '@/components/ui/badge';
import { ExtLink } from '@/components/ui/ext-link';
import { zh } from '@/lib/labels.mjs';
import { pad } from '@/lib/utils';
export const metadata: Metadata = { title: '工具', description: 'MOD 管理、存档、性能监控等 PC 游戏工具索引', alternates: { canonical: '/tools/' } };

export default function ToolsPage() {
  const tools = [...loadData().tools].sort((a, b) => a.name.localeCompare(b.name));
  const types = [...new Set<string>(tools.map((t) => t.type))];
  return <>
    <PageMastheadFrame no="04" en="TOOL REGISTER" crumbs={[['工具']]}>
      <div className="pb-9 pt-8 md:pb-12 md:pt-11">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div>
            <h1 className="display-m">工具</h1>
            <p className="mt-4 max-w-[48ch] text-base leading-[1.8] text-fg-2">管理 MOD，保管存档，看清每一帧。从一个具体问题，找到合适的工具。</p>
          </div>
          <div className="flex items-baseline gap-3 border-t border-border pt-3 md:border-t-0 md:pt-0">
            <span className="font-mono text-4xl leading-none tracking-[-0.02em] text-primary tabular md:text-5xl">{pad(tools.length, 3)}</span>
            <span className="meta text-2xs leading-[1.6] text-fg-3">件工具<br />IN REGISTER</span>
          </div>
        </div>

        <div className="mt-7">
          <div className="meta flex items-baseline justify-between gap-3 pb-2 text-2xs text-fg-3">
            <span className="text-foreground">REGISTER / 机械索引板</span>
            <span>按名称排列 · Nº {pad(1, 2)}–{pad(tools.length, 2)}</span>
          </div>
          <ol className="hairline-grid grid-cols-2 md:grid-cols-4">
            {tools.map((t, i) => (
              <li key={t.id} className="bg-background">
                <Link href={`/tools/${t.slug}/`} className="group flex h-full min-h-[86px] flex-col p-3 md:min-h-[96px] md:p-4">
                  <span className="meta flex items-baseline justify-between gap-2 text-2xs text-fg-3">
                    <span>Nº {pad(i + 1, 2)}</span>
                    <span className="truncate">{zh('toolType', t.type)}</span>
                  </span>
                  <span className="mt-2 block truncate font-serif text-lg font-semibold leading-tight transition-colors group-hover:text-primary md:text-xl">{t.name}</span>
                  <span className="mt-auto pt-2 font-mono text-2xs uppercase tracking-[0.1em] text-fg-3">{(t.os ?? []).join(' / ') || 'WINDOWS'}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </PageMastheadFrame>
    <div className="container-x pb-20"><ToolsGuidesIndex param="type" placeholder="搜索工具、用途…" grid categories={types.map((t) => ({ value: t, label: zh('toolType', t) }))} rows={tools.map((t, i) => ({
      id: t.id, query: [t.name, t.summary, ...(t.aliases ?? [])].join(' '), category: t.type,
      content: <article className="flex h-full flex-col p-5 md:p-7"><div className="meta mb-9 flex items-center justify-between text-fg-3"><span>Nº {String(i + 1).padStart(2, '0')}</span><StatusBadge value={t.linkHealth === 'ok' ? t.reviewStatus : t.linkHealth} /></div>
        <Link href={`/tools/${t.slug}/`} className="group flex min-h-11 items-start justify-between gap-3"><h2 className="font-serif text-2xl font-semibold leading-tight group-hover:text-primary">{t.name}</h2><ArrowUpRight aria-hidden className="mt-1 size-5 shrink-0 text-fg-3 group-hover:text-primary" /></Link><p className="mb-8 mt-4 flex-1 text-sm leading-7 text-fg-2">{t.summary}</p>
        <div className="flex flex-wrap items-center gap-2"><Tag>{zh('toolType', t.type)}</Tag>{(t.os ?? []).map((o: string) => <Tag key={o}>{zh('os', o)}</Tag>)}</div><div className="meta mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-fg-3"><span>核验 {t.checkedAt}</span><ExtLink href={t.officialUrl} health={t.linkHealth} className="min-h-11 items-center hover:text-foreground">官网</ExtLink></div>
      </article>,
    }))} /></div>
  </>;
}
