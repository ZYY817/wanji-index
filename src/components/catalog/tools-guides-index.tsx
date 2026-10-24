'use client';
import type { ReactNode } from 'react';
import { useCatalogQuery } from '@/components/catalog/use-catalog-query';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
type Row = { id: string; query: string; category: string; content: ReactNode };
export function ToolsGuidesIndex({ rows, categories, param, placeholder, grid = false }: {
  rows: Row[]; categories: { value: string; label: string }[]; param: string; placeholder: string; grid?: boolean;
}) {
  const { query: params, update: updateParams } = useCatalogQuery();
  const query = params.q ?? '';
  const category = params[param] ?? '';
  function update(q: string, c: string) { updateParams({ q, [param]: c }); }
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const shown = rows.filter((r) => (!category || r.category === category) && terms.every((term) => r.query.toLocaleLowerCase().includes(term)));
  return <div className="grid gap-8 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 lg:py-12">
    <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
      <label className="flex min-h-12 items-center gap-2 border-b border-border-strong"><Search aria-hidden className="size-4 shrink-0 text-fg-3" /><span className="sr-only">{placeholder}</span><input type="search" value={query} onChange={(e) => update(e.target.value, category)} placeholder={placeholder} className="min-w-0 w-full bg-transparent py-3 text-sm placeholder:text-fg-3" /></label>
      <p className="meta mb-3 mt-8 text-fg-3">按分类查阅</p>
      <div className="flex flex-wrap gap-x-4 lg:flex-col lg:gap-0" aria-label="分类筛选">{[{ value: '', label: '全部' }, ...categories].map((c) => <button key={c.value} aria-pressed={category === c.value} onClick={() => update(query, c.value)} className={cn('flex min-h-11 items-center justify-between gap-3 border-b border-transparent text-left text-sm lg:border-border', category === c.value ? 'text-primary' : 'text-fg-2 hover:text-foreground')}><span>{c.label}</span><span className="font-mono text-xs">{String(rows.filter((r) => !c.value || r.category === c.value).length).padStart(2, '0')}</span></button>)}</div>
    </aside>
    <section aria-label="索引结果" className="min-w-0"><div className="meta mb-5 flex min-h-11 items-center justify-between gap-4 text-fg-3"><span aria-live="polite">{shown.length} / {rows.length} 条目</span>{(query || category) && <button className="inline-flex min-h-11 items-center gap-2 hover:text-foreground" onClick={() => update('', '')}><X aria-hidden className="size-3" />清除筛选</button>}</div>
      {shown.length ? <div className={cn('border-t border-border', grid && 'grid sm:grid-cols-2')}>{shown.map((r) => <div key={r.id} className={cn('min-w-0 border-b border-border', grid && 'sm:odd:border-r')}>{r.content}</div>)}</div> : <div className="border-y border-border py-16"><h2 className="font-serif text-3xl">没有匹配的条目</h2><p className="mt-3 text-fg-2">换一个关键词，或清除筛选重新查阅。</p><button onClick={() => update('', '')} className="mt-6 min-h-11 border border-border-strong px-4">清除筛选</button></div>}
    </section>
  </div>;
}

