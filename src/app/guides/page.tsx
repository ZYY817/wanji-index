import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { loadData } from '@/lib/data.mjs';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { ToolsGuidesIndex } from '@/components/catalog/tools-guides-index';
import { Tag } from '@/components/ui/badge';
import { zh } from '@/lib/labels.mjs';
export const metadata: Metadata = { title: '教程与排查', description: '游戏安装、报错排查、MOD 安装、存档备份教程', alternates: { canonical: '/guides/' } };

export default function GuidesPage() {
  const data = loadData();
  const guides = [...data.guides].sort((a, b) => a.title.localeCompare(b.title, 'zh'));
  const cats = [...new Set<string>(guides.map((g) => g.category))];
  return <>
    <IndexMasthead
      no="05"
      title="教程"
      description="从报错原文开始。每一步写明操作、预期结果和失败后的去向，排查有迹可循。"
      stats={[{ value: guides.length, label: '篇教程' }, { value: cats.length, label: '个分类' }]}
    />
    <div className="container-x pb-20"><ToolsGuidesIndex param="cat" placeholder="标题 / 报错原文…" categories={cats.map((c) => ({ value: c, label: zh('guideCategory', c) }))} rows={guides.map((g, i) => ({
      id: g.id, query: [g.title, g.problem?.description, g.problem?.errorText, ...(g.keywords ?? [])].join(' '), category: g.category,
      content: <Link href={`/guides/${g.slug}/`} className="group grid gap-4 py-7 transition-colors hover:bg-surface-2/50 sm:grid-cols-[48px_minmax(0,1fr)_24px] sm:gap-5 sm:py-9"><span className="font-mono text-2xl text-fg-3">{String(i + 1).padStart(2, '0')}</span>
        <div className="min-w-0"><div className="mb-4 flex flex-wrap gap-2"><Tag>{zh('guideKind', g.kind)}</Tag><Tag>{zh('guideCategory', g.category)}</Tag></div><h2 className="font-serif text-2xl font-semibold leading-relaxed group-hover:text-primary md:text-3xl">{g.title}</h2><p className="mt-3 max-w-[70ch] text-sm leading-7 text-fg-2">{g.problem?.description}</p><div className="meta mt-5 flex flex-wrap gap-x-5 gap-y-2 text-fg-3">{(g.games ?? []).map((id: string) => { const game = data.games.find((x) => x.id === id); return game && <span key={id}>{game.name.zh}</span>; })}<span>{g.steps.length} 个步骤</span><span>核验 {g.checkedAt}</span></div></div><ArrowUpRight aria-hidden className="hidden size-5 text-fg-3 group-hover:text-primary sm:block" />
      </Link>,
    }))} /></div>
  </>;
}
