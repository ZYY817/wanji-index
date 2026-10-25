'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, LayoutGrid, List, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlatformMark } from '@/components/ui/platform-mark';
import { genreZh } from '@/lib/genre';
import { zh } from '@/lib/labels.mjs';
import { cn } from '@/lib/utils';

export type CatalogQuery = Record<string, string>;
export type CatalogUpdate = (values: Record<string, string>) => void;
export type Counted = { key: string; count: number };
export type ActiveChip = { key: 'q' | 'genre' | 'platform'; label: string };

export const SORTS = [
  { key: 'richness', label: '资源最多' },
  { key: 'updated', label: '最近更新' },
  { key: 'name', label: '名称顺序' },
] as const;

const pad2 = (n: number) => String(n).padStart(2, '0');
const pad3 = (n: number) => String(n).padStart(3, '0');

/* ── 共用的索引标签 ───────────────────────────────────────── */

function SectionHead({ label, count }: { label: string; count?: number }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-border pb-2">
      <h3 className="text-xs font-medium tracking-[0.08em] text-foreground">
        {label}
      </h3>
      {count != null && <span className="font-mono text-2xs tabular-nums text-fg-3">{pad2(count)}</span>}
    </div>
  );
}


function SearchField({ value, onChange, variant = 'rail' }: { value: string; onChange: (v: string) => void; variant?: 'rail' | 'bar' }) {
  const bar = variant === 'bar';
  return (
    <div
      className={cn(
        'flex items-center transition-colors focus-within:border-primary',
        bar ? 'min-h-11 gap-2 border border-border-strong px-2.5' : 'gap-2 border-b border-border-strong pb-2',
      )}
    >
      <Search aria-hidden className="size-3.5 shrink-0 text-fg-3" />
      <input
        aria-label="搜索游戏"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={bar ? '搜索名称或别名' : '名称 / 英文 / 别名'}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        className={cn(
          'min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-fg-3 focus-visible:outline-none',
          bar ? 'text-lg' : 'text-sm',
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="清除搜索"
          className={cn('inline-flex shrink-0 items-center justify-center text-fg-3 transition-colors hover:text-foreground', bar ? '-mr-1 size-9' : '-my-1 size-6')}
        >
          <X className="size-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}

function SortRows({ q, update, touch }: { q: CatalogQuery; update: CatalogUpdate; touch?: boolean }) {
  const activeSort = q.sort || 'richness';
  return (
    <div role="group" aria-label="排序方式" className="flex flex-col">
      {SORTS.map((s) => {
        const active = activeSort === s.key;
        return (
          <button
            key={s.key}
            type="button"
            aria-pressed={active}
            onClick={() => update({ sort: s.key })}
            className={cn(
              'group flex w-full items-center gap-2.5 border-l-2 py-2 pl-3 text-left text-base transition-colors',
              touch ? 'min-h-11' : 'min-h-9',
              active ? 'border-l-primary font-medium text-foreground' : 'border-l-transparent text-fg-2 hover:text-foreground',
            )}
          >
            <span className="flex-1">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const GENRE_PREVIEW = 8;

function GenreButtons({ q, update, genres, total, primary }: { q: CatalogQuery; update: CatalogUpdate; genres: Counted[]; total: number; primary?: boolean }) {
  const allActive = !q.genre;
  const [expanded, setExpanded] = useState(false);
  const allRow = (
    <button
      type="button"
      aria-pressed={allActive}
      onClick={() => update({ genre: '' })}
      className={cn(
        'group flex w-full items-center gap-2 border-l-2 py-2 pl-3 text-left text-base transition-colors',
        primary ? 'min-h-11' : 'min-h-9',
        allActive ? 'border-l-primary font-medium text-foreground' : 'border-l-transparent text-fg-2 hover:text-foreground',
      )}
    >
      <span className="flex-1">全部类型</span>
      <span className="font-mono text-2xs tabular-nums text-fg-3">{pad2(total)}</span>
    </button>
  );

  if (primary) {
    return (
      <>
        {allRow}
        <div className="mt-2 grid grid-cols-2 gap-2">
          {genres.map(({ key, count }) => {
            const active = q.genre === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => update({ genre: active ? '' : key })}
                className={cn(
                  'flex min-h-11 min-w-0 items-center gap-2 border px-3 text-left text-sm transition-colors',
                  active ? 'border-primary/70 bg-surface-2 text-foreground' : 'border-border text-fg-2 hover:border-border-strong hover:text-foreground',
                )}
              >
                <span aria-hidden className={cn('size-1 shrink-0', active ? 'bg-primary' : 'bg-border-strong')} />
                <span className="truncate">{genreZh(key)}</span>
                <span className={cn('ml-auto shrink-0 font-mono text-2xs tabular-nums', active ? 'text-primary' : 'text-fg-3')}>{pad2(count)}</span>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  // 桌面侧栏：默认只列出收录最多的几个类型，其余收起；当前选中的类型始终可见
  const shown = expanded ? genres : genres.filter((g, i) => i < GENRE_PREVIEW || g.key === q.genre);
  return (
    <>
      {allRow}
      <ul className="mt-1">
        {shown.map(({ key, count }) => {
          const active = q.genre === key;
          return (
            <li key={key}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => update({ genre: active ? '' : key })}
                className={cn(
                  'group flex min-h-9 w-full min-w-0 items-center gap-2 border-l-2 py-2 pl-3 text-left text-base transition-colors',
                  active ? 'border-l-primary font-medium text-foreground' : 'border-l-transparent text-fg-2 hover:text-foreground',
                )}
              >
                <span className="flex-1 truncate">{genreZh(key)}</span>
                <span className="font-mono text-2xs tabular-nums text-fg-3">{pad2(count)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {genres.length > GENRE_PREVIEW && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 min-h-8 text-sm text-fg-3 underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {expanded ? '收起' : `展开全部 ${genres.length} 个类型`}
        </button>
      )}
    </>
  );
}

function PlatformButtons({ q, update, platforms, primary, total }: { q: CatalogQuery; update: CatalogUpdate; platforms: Counted[]; primary?: boolean; total: number }) {
  const allActive = !q.platform;
  return (
    <>
      <button
        type="button"
        aria-pressed={allActive}
        onClick={() => update({ platform: '' })}
        className={cn(
          'group flex w-full items-center gap-2.5 border-l-2 py-2 pl-3 text-left text-base transition-colors',
          primary ? 'min-h-11' : 'min-h-9',
          allActive ? 'border-l-primary font-medium text-foreground' : 'border-l-transparent text-fg-2 hover:text-foreground',
        )}
      >
        <span className="flex-1">全部平台</span>
        <span className="font-mono text-2xs tabular-nums text-fg-3">{pad2(total)}</span>
      </button>
      {platforms.map(({ key, count }) => {
        const active = q.platform === key;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            onClick={() => update({ platform: active ? '' : key })}
            className={cn(
              'group flex w-full items-center gap-2.5 border-l-2 py-2 pl-3 text-left text-base transition-colors',
              primary ? 'min-h-11' : 'min-h-9',
              active ? 'border-l-primary font-medium text-foreground' : 'border-l-transparent text-fg-2 hover:text-foreground',
            )}
          >
            <PlatformMark platform={key} withLabel />
            <span className="ml-auto font-mono text-2xs tabular-nums text-fg-3">{pad2(count)}</span>
          </button>
        );
      })}
    </>
  );
}

function ResetButton({ active, onReset }: { active: boolean; onReset: () => void }) {
  return (
    <button
      type="button"
      onClick={onReset}
      disabled={!active}
      className="group flex min-h-8 w-full items-center gap-2 text-sm text-fg-3 transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      <RotateCcw className="size-3.5" aria-hidden />
      重置筛选
    </button>
  );
}

export function ActiveChips({ chips, onRemove, className }: { chips: ActiveChip[]; onRemove: (key: ActiveChip['key']) => void; className?: string }) {
  return (
    <div className={cn('flex min-w-0 items-center gap-1.5', className)}>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex h-10 max-w-[220px] shrink-0 items-center border border-border-strong pl-2.5 text-xs text-fg-2 lg:h-8 lg:max-w-[260px]"
        >
          <span className="truncate">{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            aria-label={`移除筛选：${chip.label}`}
            className="inline-flex size-9 shrink-0 items-center justify-center text-fg-3 transition-colors hover:text-primary lg:size-7"
          >
            <X className="size-3" aria-hidden />
          </button>
        </span>
      ))}
    </div>
  );
}

export function ViewToggle({ view, update, className }: { view: string; update: CatalogUpdate; className?: string }) {
  const current = view || 'poster';
  return (
    <div role="group" aria-label="展示方式" className={cn('flex shrink-0 border border-border', className)}>
      {([['poster', LayoutGrid, '海报视图'], ['list', List, '列表视图']] as const).map(([value, Icon, label], i) => {
        const active = current === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={active}
            title={label}
            onClick={() => update({ view: value })}
            className={cn(
              'grid size-11 place-items-center transition-colors lg:size-9',
              i > 0 && 'border-l border-border',
              active ? 'bg-surface-2 text-primary' : 'text-fg-3 hover:text-foreground',
            )}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

/* ── 桌面：左侧索引栏 ─────────────────────────────────────── */

export function FilterIndex({ q, update, genres, platforms, total }: { q: CatalogQuery; update: CatalogUpdate; genres: Counted[]; platforms: Counted[]; total: number }) {
  const active = !!(q.q || q.genre || q.platform);
  const railRef = useRef<HTMLDivElement>(null);
  const [nestedScroll, setNestedScroll] = useState(false);

  // 仅当索引栏真的高过视口时才接管滚轮（Lenis 会忽略带 data-lenis-prevent 的区域）；
  // 否则让页面保持平滑滚动，不制造左侧滚轮死区。
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const measure = () => setNestedScroll(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => observer.disconnect();
  }, []);

  return (
    <aside aria-label="筛选游戏档案" className="hidden lg:block">
      <div
        ref={railRef}
        data-lenis-prevent={nestedScroll ? '' : undefined}
        className="sticky top-[calc(var(--sticky-top)+28px)] max-h-[calc(100dvh-var(--sticky-top)-48px)] overflow-y-auto overscroll-contain pb-4 pr-1 transition-[top] duration-300"
      >
        <div className="flex items-baseline justify-between gap-3 border-b border-border-strong pb-3">
          <h2 className="font-serif text-xl font-bold tracking-[-0.02em]">筛选</h2>
        </div>

        <div className="mt-4">
          <SearchField value={q.q ?? ''} onChange={(v) => update({ q: v })} />
        </div>

        <div className="mt-[18px]">
          <SectionHead label="排序" count={3} />
          <SortRows q={q} update={update} />
        </div>

        <div className="mt-[18px]">
          <SectionHead label="类型" count={genres.length} />
          <GenreButtons q={q} update={update} genres={genres} total={total} />
        </div>

        <div className="mt-[18px]">
          <SectionHead label="平台" count={platforms.length} />
          <PlatformButtons q={q} update={update} platforms={platforms} total={total} />
        </div>

        <div className="mt-[18px] border-t border-border pt-2.5">
          <ResetButton active={active} onReset={() => update({ q: '', genre: '', platform: '' })} />
        </div>
      </div>
    </aside>
  );
}

/* ── 移动端：单行工具栏 + 筛选抽屉 ─────────────────────────── */

export function MobileFilterBar({
  q, update, genres, platforms, total, resultCount, chips, onRemove,
}: {
  q: CatalogQuery; update: CatalogUpdate; genres: Counted[]; platforms: Counted[]; total: number; resultCount: number; chips: ActiveChip[]; onRemove: (key: ActiveChip['key']) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = !!(q.q || q.genre || q.platform);
  const activeCount = chips.length;

  return (
    <div className="sticky top-[var(--sticky-top)] z-30 -mx-[var(--gutter)] border-b border-border bg-background transition-[top] duration-300 lg:hidden">
      <style>{`
@keyframes catalog-sheet-in { from { transform: translate3d(0, 100%, 0); } to { transform: translate3d(0, 0, 0); } }
@keyframes catalog-sheet-out { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(0, 100%, 0); } }
`}</style>
      <div className="flex items-center gap-2 px-[var(--gutter)] py-2">
        <div className="min-w-0 flex-1">
          <SearchField variant="bar" value={q.q ?? ''} onChange={(v) => update({ q: v })} />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label={`筛选档案${activeCount ? `，${activeCount} 项已启用` : ''}`}
              className={cn(
                'relative grid size-11 shrink-0 place-items-center border transition-colors focus-visible:outline-1 focus-visible:outline-offset-0',
                activeCount ? 'border-primary/70 text-primary' : 'border-border-strong text-fg-2 hover:text-foreground',
              )}
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              {activeCount > 0 && (
                <span aria-hidden className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center bg-primary px-1 font-mono text-2xs leading-none tabular-nums text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </button>
          </DialogTrigger>

          <DialogContent
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              (event.currentTarget as HTMLElement | null)?.focus();
            }}
            className="inset-x-0 bottom-0 top-auto flex max-h-[88dvh] w-full flex-col border-t border-border-strong bg-background p-0 data-[state=open]:animate-[catalog-sheet-in_320ms_var(--ease-expo)] data-[state=closed]:animate-[catalog-sheet-out_180ms_ease-in]"
          >
            <DialogDescription className="sr-only">按排序、类型和平台筛选游戏档案，查看结果数量后关闭。</DialogDescription>

            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-[var(--gutter)] pb-3 pt-4">
              <div>
                <p className="meta text-fg-3">筛选结果 {resultCount} 款</p>
                <div className="mt-1 flex items-baseline gap-2.5">
                  <span aria-hidden className="h-px w-5 bg-primary" />
                  <DialogTitle className="font-serif text-2xl font-bold leading-none tracking-[-0.02em]">筛选</DialogTitle>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => update({ q: '', genre: '', platform: '' })}
                  disabled={!active}
                  className="inline-flex min-h-11 items-center gap-1.5 px-2 text-xs text-fg-3 transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  重置
                </button>
                <DialogClose
                  className="-mr-1 grid size-11 place-items-center text-fg-2 transition-colors hover:text-foreground"
                  aria-label="关闭筛选"
                >
                  <X className="size-5" aria-hidden />
                </DialogClose>
              </div>
            </div>

            <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[var(--gutter)] pb-8 pt-5">
              <section aria-labelledby="sheet-sort">
                <h3 id="sheet-sort" className="mb-2 flex items-baseline justify-between border-b border-border pb-2 text-2xs font-medium tracking-[0.04em] text-fg-2">
                  排序
                </h3>
                <SortRows q={q} update={update} touch />
              </section>

              <section aria-labelledby="sheet-genre" className="mt-7">
                <h3 id="sheet-genre" className="mb-2 flex items-baseline justify-between border-b border-border pb-2 text-2xs font-medium tracking-[0.04em] text-fg-2">
                  类型 <span className="font-mono text-2xs text-fg-3">{pad2(genres.length)}</span>
                </h3>
                <GenreButtons q={q} update={update} genres={genres} total={total} primary />
              </section>

              <section aria-labelledby="sheet-platform" className="mt-7">
                <h3 id="sheet-platform" className="mb-2 flex items-baseline justify-between border-b border-border pb-2 text-2xs font-medium tracking-[0.04em] text-fg-2">
                  平台 <span className="font-mono text-2xs text-fg-3">{pad2(platforms.length)}</span>
                </h3>
                <PlatformButtons q={q} update={update} platforms={platforms} total={total} primary />
              </section>
            </div>

            <div className="flex shrink-0 items-center border-t border-border bg-background px-[var(--gutter)] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
              <DialogClose asChild>
                <button
                  type="button"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 bg-foreground px-4 text-base font-medium text-background transition-colors hover:bg-fg-2"
                >
                  查看 <span className="font-mono text-sm tabular-nums">{pad3(resultCount)}</span> 个档案
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        <ViewToggle view={q.view ?? 'poster'} update={update} />
      </div>

      {activeCount > 0 && (
        <ActiveChips chips={chips} onRemove={onRemove} className="no-scrollbar w-full gap-1.5 overflow-x-auto px-[var(--gutter)] pb-2.5" />
      )}
    </div>
  );
}

/* 供页面复用的平台中文名 */
export const platformLabel = (key: string) => zh('platform', key);
