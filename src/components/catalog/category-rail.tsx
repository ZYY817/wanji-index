'use client';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Kbd } from '@/components/ui/kbd';
import { Button } from '@/components/ui/button';

export type RailItem = { value: string; label: string; count: number };

export function CategoryRail({
  query, onQuery, placeholder, items, active, onSelect, allLabel = '全部',
}: {
  query: string; onQuery: (v: string) => void; placeholder: string;
  items: RailItem[]; active: string; onSelect: (v: string) => void; allLabel?: string;
}) {
  const total = items.reduce((n, i) => n + i.count, 0);
  const all: RailItem[] = [{ value: '', label: allLabel, count: total }, ...items];

  return (
    <aside className="min-w-0 bg-background transition-[top] duration-300 lg:sticky lg:top-[calc(var(--sticky-top)+32px)] lg:self-start">
      {/* 终端指令风格检索条 */}
      <label className="flex min-h-10 items-center gap-2 rounded-xs border border-border bg-surface-2/40 px-2.5 py-1 text-sm transition-colors focus-within:border-primary/80 focus-within:bg-card">
        <Search aria-hidden className="size-3.5 shrink-0 text-fg-3" />
        <span className="sr-only">{placeholder}</span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent py-1 text-base placeholder:text-fg-3 focus:outline-none"
        />
        <Kbd className="text-fg-3">/</Kbd>
      </label>

      <div className="mb-3 mt-7 hidden items-baseline justify-between border-b border-border/60 pb-2 lg:flex">
        <h2 className="text-sm font-medium text-fg-2">分类</h2>
      </div>

      {/* 移动端横向滚动条，桌面纵向列表 */}
      <nav
        aria-label="分类筛选"
        className="no-scrollbar -mx-[var(--gutter)] flex gap-2 overflow-x-auto border-b border-border bg-background px-[var(--gutter)] py-2 lg:mx-0 lg:block lg:border-none lg:p-0"
      >
        {all.map((c) => {
          const on = active === c.value;
          return (
            <button
              key={c.value || 'all'}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(c.value)}
              className={cn(
                'flex min-h-11 shrink-0 items-center gap-3 text-left text-base transition-colors',
                // 移动端样式：横向卡片式按钮，点击区域 ≥ 44px
                'rounded-xs px-3.5 lg:w-full lg:rounded-none lg:px-0 lg:py-2.5',
                // 桌面端样式：2px 左边线，激活为 primary，未激活为 transparent
                'lg:border-l-2 lg:pl-3',
                on
                  ? 'border-b-2 border-primary bg-surface-2 font-medium text-foreground lg:border-b-0 lg:border-l-primary lg:bg-transparent'
                  : 'text-fg-2 hover:text-foreground lg:border-l-transparent',
              )}
            >
              <span className="flex-1 whitespace-nowrap">{c.label}</span>
              <span className="font-mono text-2xs tabular-nums text-fg-3">{c.count}</span>
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
      <p className="font-serif text-3xl font-bold text-foreground">没有匹配的条目</p>
      <p className="mt-3 text-base text-fg-2">换一个关键词，或清除筛选重新查看。</p>
      <Button type="button" variant="outline" onClick={onClear} className="mt-6">
        清除筛选
      </Button>
    </div>
  );
}
