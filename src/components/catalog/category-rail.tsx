'use client';
import { useL } from '@/components/layout/lang-toggle';
import { T } from '@/lib/i18n';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Kbd } from '@/components/ui/kbd';
import { Button } from '@/components/ui/button';

export type RailItem = { value: string; label: React.ReactNode; count: number };

export function CategoryRail({
  query, onQuery, placeholder: zhPh, placeholderEn, items, active, onSelect, allLabel = <T zh="全部" en="All" />,
}: {
  query: string; onQuery: (v: string) => void; placeholder: string; placeholderEn?: string;
  items: RailItem[]; active: string; onSelect: (v: string) => void; allLabel?: React.ReactNode;
}) {
  const l = useL();
  const placeholder = l(zhPh, placeholderEn);
  const total = items.reduce((n, i) => n + i.count, 0);
  const all: RailItem[] = [{ value: '', label: allLabel, count: total }, ...items];

  return (
    <aside className="min-w-0 transition-[top] duration-300 lg:sticky lg:top-[calc(var(--sticky-top)+32px)] lg:self-start">
      {/* 终端指令风格检索条 */}
      <label className="flex min-h-10 items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-1 text-sm ring-1 ring-transparent transition-[box-shadow,background-color] focus-within:bg-white/[0.1] focus-within:ring-primary/70">
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
        <h2 className="text-sm font-medium text-fg-2"><T zh="分类" en="Categories" /></h2>
      </div>

      {/* 移动端横向滚动条，桌面纵向列表 */}
      <nav
        aria-label="Categories"
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
                // 手机：横向一排的按钮；桌面：纵向列表。当前项都是圆角浅底 + 白字（不用左侧竖条）
                'rounded-sm px-3.5 lg:w-full lg:px-3 lg:py-2.5',
                on ? 'bg-white/[0.1] font-medium text-foreground' : 'text-fg-2 hover:bg-white/[0.05] hover:text-foreground',
              )}
            >
              <span className="flex-1 whitespace-nowrap">{c.label}</span>
              <span className="tabular text-2xs tabular-nums text-fg-3">{c.count}</span>
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
      <p className="font-display text-3xl font-semibold text-foreground"><T zh="没有匹配的条目" en="Nothing matches" /></p>
      <p className="mt-3 text-base text-fg-2"><T zh="换一个关键词，或清除筛选重新查看。" en="Try another keyword or clear the filters." /></p>
      <Button type="button" variant="outline" onClick={onClear} className="mt-6">
        <T zh="清除筛选" en="Clear filters" />
      </Button>
    </div>
  );
}
