'use client';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RailItem = { value: string; label: string; count: number };

/**
 * 列表页左侧栏（资源站 / 工具 / 教程共用）：搜索框 + 分类列表。
 * 桌面吸顶纵向排列；移动端分类改为横向滚动的一行。当前分类 = 白字 + 左侧信号色短线。
 */
export function CategoryRail({
  query, onQuery, placeholder, items, active, onSelect, allLabel = '全部',
}: {
  query: string; onQuery: (v: string) => void; placeholder: string;
  items: RailItem[]; active: string; onSelect: (v: string) => void; allLabel?: string;
}) {
  const total = items.reduce((n, i) => n + i.count, 0);
  const all: RailItem[] = [{ value: '', label: allLabel, count: total }, ...items];
  return (
    <aside className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:self-start">
      <label className="flex min-h-12 items-center gap-3 border-b border-border-strong">
        <Search aria-hidden className="size-4 shrink-0 text-fg-3" />
        <span className="sr-only">{placeholder}</span>
        <input type="search" value={query} onChange={(e) => onQuery(e.target.value)} placeholder={placeholder} className="w-full min-w-0 bg-transparent py-3 text-base placeholder:text-fg-3" />
      </label>

      <h2 className="mb-2 mt-8 hidden text-sm text-fg-3 lg:block">分类</h2>
      <nav aria-label="分类筛选" className="no-scrollbar mt-4 flex gap-1 overflow-x-auto lg:mt-0 lg:block">
        {all.map((c) => {
          const on = active === c.value;
          return (
            <button
              key={c.value || 'all'}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(c.value)}
              className={cn(
                'flex min-h-11 shrink-0 items-center gap-3 px-3 text-left text-base transition-colors lg:w-full lg:border-b lg:border-border lg:px-0',
                on ? 'text-foreground' : 'text-fg-2 hover:text-foreground',
              )}
            >
              <span aria-hidden className={cn('hidden h-px w-3 shrink-0 lg:block', on ? 'bg-primary' : 'bg-border-strong')} />
              <span className="flex-1 whitespace-nowrap">{c.label}</span>
              <span className={cn('text-sm tabular-nums', on ? 'text-primary' : 'text-fg-3')}>{c.count}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

/** 列表为空时的统一提示 */
export function EmptyResult({ onClear }: { onClear: () => void }) {
  return (
    <div className="border-y border-border py-20 text-center">
      <p className="font-serif text-3xl font-bold">没有匹配的条目</p>
      <p className="mt-3 text-base text-fg-2">换一个关键词，或清除筛选重新查看。</p>
      <button type="button" onClick={onClear} className="mt-6 min-h-11 border border-border-strong px-5 text-base transition-colors hover:border-foreground/60">
        清除筛选
      </button>
    </div>
  );
}
