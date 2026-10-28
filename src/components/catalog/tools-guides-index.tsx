'use client';
import { T } from '@/lib/i18n';
import type { ReactNode } from 'react';
import { useCatalogQuery } from '@/components/catalog/use-catalog-query';
import { cn } from '@/lib/utils';
import { CategoryRail, EmptyResult } from './category-rail';

type Row = { id: string; query: string; category: string; content: ReactNode };

/**
 * 工具 / 教程列表：左侧 CategoryRail（搜索 + 分类），右侧条目。
 * 条目内容由页面在服务端渲染好传入（content），这里只负责筛选与排布；grid = 双列卡片，否则单列行。
 */
export function ToolsGuidesIndex({ rows, categories, param, placeholder, placeholderEn, grid = false }: {
  rows: Row[]; categories: { value: string; label: ReactNode }[]; param: string; placeholder: string; placeholderEn?: string; grid?: boolean;
}) {
  const { query: params, update } = useCatalogQuery();
  const query = params.q ?? '';
  const category = params[param] ?? '';
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const shown = rows.filter((r) => (!category || r.category === category) && terms.every((t) => r.query.toLocaleLowerCase().includes(t)));
  const clear = () => update({ q: '', [param]: '' });

  return (
    <div className="grid gap-10 py-12 md:py-16 lg:grid-cols-12 lg:gap-12">
      <div className="min-w-0 lg:col-span-3">
        <CategoryRail
          query={query}
          onQuery={(v) => update({ q: v })}
          placeholder={placeholder}
          placeholderEn={placeholderEn}
          items={categories.map((c) => ({ ...c, count: rows.filter((r) => r.category === c.value).length }))}
          active={category}
          onSelect={(v) => update({ [param]: v })}
        />
      </div>

      <section aria-label="List" className="min-w-0 lg:col-span-9">
        <p aria-live="polite" className="mb-4 text-sm text-fg-3">
          <T zh="共" en="" /> <span className="text-foreground">{shown.length}</span> <T zh="条" en="items" />
          {(query || category) && (
            <button type="button" onClick={clear} className="ml-4 underline-offset-4 transition-colors hover:text-foreground hover:underline"><T zh="清除筛选" en="Clear filters" /></button>
          )}
        </p>
        {shown.length ? (
          <ul className={cn(grid ? 'grid gap-px border border-border bg-border sm:grid-cols-2' : 'border-t border-border-strong')}>
            {shown.map((r) => (
              <li key={r.id} className={cn('min-w-0', grid ? 'bg-background' : 'border-b border-border')}>{r.content}</li>
            ))}
          </ul>
        ) : (
          <EmptyResult onClear={clear} />
        )}
      </section>
    </div>
  );
}
