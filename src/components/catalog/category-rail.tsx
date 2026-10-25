'use client';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RailItem = { value: string; label: string; count: number };

/**
 * 列表页左侧栏（资源站 / 工具 / 教程共用）：搜索框 + 分类列表。
 * V6 规范：
 * - 桌面吸顶 top-[calc(var(--sticky-top)+32px)]，带 0.3s 顶栏避让过渡；
 * - 去掉列表前的短横线；
 * - 选项 text-base，计数 font-mono text-2xs tabular-nums text-fg-3；
 * - 桌面当前项用香槟金左边线（border-l-2 border-primary）+ text-foreground；
 * - 小于 1024px 时收成横向可滚动筛选条，点击目标 ≥ 44px。
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
    <aside className="min-w-0 bg-background transition-[top] duration-300 lg:sticky lg:top-[calc(var(--sticky-top)+32px)] lg:self-start">
      <label className="flex min-h-12 items-center gap-3 border-b border-border-strong">
        <Search aria-hidden className="size-4 shrink-0 text-fg-3" />
        <span className="sr-only">{placeholder}</span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent py-3 text-base placeholder:text-fg-3 focus:outline-none"
        />
      </label>

      <h2 className="mb-3 mt-8 hidden text-sm font-medium text-fg-2 lg:block">分类</h2>

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
      <button
        type="button"
        onClick={onClear}
        className="mt-6 inline-flex min-h-11 items-center justify-center border border-border-strong px-5 text-base text-foreground transition-colors hover:border-foreground/60"
      >
        清除筛选
      </button>
    </div>
  );
}
