import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { loadData } from '@/lib/data.mjs';
import { PageMastheadFrame } from '@/components/layout/page-masthead';
import { ToolsGuidesIndex } from '@/components/catalog/tools-guides-index';
import { Tag } from '@/components/ui/badge';
import { zh } from '@/lib/labels.mjs';
import { pad } from '@/lib/utils';
export const metadata: Metadata = { title: '教程与排查', description: '游戏安装、报错排查、MOD 安装、存档备份教程', alternates: { canonical: '/guides/' } };

export default function GuidesPage() {
  const data = loadData();
  const guides = [...data.guides].sort((a, b) => a.title.localeCompare(b.title, 'zh'));
  const cats = [...new Set<string>(guides.map((g) => g.category))];
  const featured = data.guides.find((g) => g.slug === 'directx-runtime-missing') ?? guides[0];
  const featuredNo = Math.max(1, guides.findIndex((g) => g.id === featured?.id) + 1);
  const errorText = featured?.problem?.errorText ?? featured?.problem?.description ?? '';
  return <>
    <PageMastheadFrame no="05" en="FIELD MANUAL" crumbs={[['教程与排查']]}>
      <div className="grid gap-8 pb-9 pt-8 md:grid-cols-12 md:gap-10 md:pb-12 md:pt-11">
        <div className="md:col-span-6">
          <h1 className="display-m leading-[1.04]">
            <span className="block">把问题</span>
            <span className="mt-1 flex items-baseline gap-4 pl-[0.9em]">
              解开
              <span className="font-mono text-2xs font-normal tracking-[0.14em] text-fg-3">{pad(guides.length, 2)} 篇手册</span>
            </span>
          </h1>
          <p className="mt-6 max-w-[42ch] text-base leading-[1.8] text-fg-2">从报错原文开始。每一步都有操作、预期结果与失败后的去向，让排查有迹可循。</p>
          <div className="meta mt-6 flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-2xs text-fg-3">
            <span className="text-foreground">FIELD MANUAL</span>
            <span>报错 → 操作 → 预期 → 失败去向</span>
            <span className="hidden sm:inline">核验日期随条目记录</span>
          </div>
        </div>

        <figure className="min-w-0 md:col-span-6">
          <div className="border border-border-strong bg-[#0E0E0D]">
            <div className="flex h-8 items-center gap-3 border-b border-border px-3">
              <span aria-hidden className="size-1.5 bg-primary" />
              <span className="meta text-2xs text-fg-3"><span className="text-foreground">ERROR NOTE</span> / 报错原文</span>
              <span className="flex-1" />
              <span className="meta text-2xs text-fg-3">档案 Nº {pad(featuredNo, 2)}</span>
            </div>
            <div className="px-3 py-3.5 font-mono text-2xs leading-[1.85] text-fg-2 md:px-4 md:text-2xs">
              <p className="text-fg-3">$ open /guides/{featured?.slug ?? 'index'}/</p>
              <p className="mt-3 whitespace-pre-line text-bad-text">{errorText}</p>
              {featured?.problem?.conditions && <p className="mt-3 text-fg-3">条件 · {featured.problem.conditions}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border pt-3">
                <Link href={`/guides/${featured?.slug ?? ''}/`} className="inline-flex min-h-8 items-center text-foreground underline decoration-primary decoration-1 underline-offset-4 hover:text-primary">读取排查步骤</Link>
                <span className="text-fg-3">{featured?.steps?.length ?? 0} 步 · 核验 {featured?.checkedAt ?? '—'}</span>
                <span aria-hidden className="inline-block h-3 w-1.5 animate-blink bg-foreground" />
              </div>
            </div>
          </div>
          <figcaption className="meta mt-2 flex justify-between gap-3 text-2xs text-fg-3">
            <span>报错原文逐字引自站内教程</span>
            <span className="hidden sm:inline">终端示意 · 不执行命令</span>
          </figcaption>
        </figure>
      </div>
    </PageMastheadFrame>
    <div className="container-x pb-20"><ToolsGuidesIndex param="cat" placeholder="标题 / 报错原文…" categories={cats.map((c) => ({ value: c, label: zh('guideCategory', c) }))} rows={guides.map((g, i) => ({
      id: g.id, query: [g.title, g.problem?.description, g.problem?.errorText, ...(g.keywords ?? [])].join(' '), category: g.category,
      content: <Link href={`/guides/${g.slug}/`} className="group grid gap-4 py-7 transition-colors hover:bg-surface-2/50 sm:grid-cols-[48px_minmax(0,1fr)_24px] sm:gap-5 sm:py-9"><span className="font-mono text-2xl text-fg-3">{String(i + 1).padStart(2, '0')}</span>
        <div className="min-w-0"><div className="mb-4 flex flex-wrap gap-2"><Tag>{zh('guideKind', g.kind)}</Tag><Tag>{zh('guideCategory', g.category)}</Tag></div><h2 className="font-serif text-2xl font-semibold leading-relaxed group-hover:text-primary md:text-3xl">{g.title}</h2><p className="mt-3 max-w-[70ch] text-sm leading-7 text-fg-2">{g.problem?.description}</p><div className="meta mt-5 flex flex-wrap gap-x-5 gap-y-2 text-fg-3">{(g.games ?? []).map((id: string) => { const game = data.games.find((x) => x.id === id); return game && <span key={id}>{game.name.zh}</span>; })}<span>{g.steps.length} 个步骤</span><span>核验 {g.checkedAt}</span></div></div><ArrowUpRight aria-hidden className="hidden size-5 text-fg-3 group-hover:text-primary sm:block" />
      </Link>,
    }))} /></div>
  </>;
}
