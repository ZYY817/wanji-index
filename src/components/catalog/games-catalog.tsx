'use client';
import { genreZh } from '@/lib/genre';
import type { GameVM } from '@/lib/present';
import { PosterCard } from '@/components/game/poster-card';
import { GameRow, GameTableHead } from '@/components/game/game-row';
import { Button } from '@/components/ui/button';
import { useCatalogQuery } from './use-catalog-query';
import { T } from '@/lib/i18n';
import { G, L } from '@/lib/labels-i18n';
import {
  ActiveChips, FilterIndex, MobileFilterBar, SORTS, ViewToggle,
  type ActiveChip, type Counted,
} from './filter-index';

const PLATFORM_RANK = ['steam', 'epic', 'gog', 'itch', 'official', 'xbox-pc', 'other'];

function countBy(games: GameVM[], pick: (g: GameVM) => string[]) {
  return [...new Set(games.flatMap(pick))].map((key) => ({
    key,
    count: games.filter((g) => pick(g).includes(key)).length,
  }));
}

export function GamesCatalog({ games }: { games: (GameVM & { keywords?: string[] })[] }) {
  const { query: q, update } = useCatalogQuery();

  const genres: Counted[] = countBy(games, (g) => g.genres).sort(
    (a, b) => b.count - a.count || genreZh(a.key).localeCompare(genreZh(b.key), 'zh-CN'),
  );
  const platforms: Counted[] = countBy(games, (g) => g.platforms).sort(
    (a, b) => b.count - a.count || PLATFORM_RANK.indexOf(a.key) - PLATFORM_RANK.indexOf(b.key),
  );

  const filtered = games
    .filter((g) => (!q.q || [g.name, g.en, ...g.aliases, ...(g.keywords ?? [])].join(' ').toLowerCase().includes(q.q.trim().toLowerCase()))
      && (!q.genre || g.genres.includes(q.genre))
      && (!q.platform || g.platforms.includes(q.platform)))
    .sort((a, b) => q.sort === 'name'
      ? a.name.localeCompare(b.name, 'zh-CN')
      : q.sort === 'updated'
        ? b.updatedAt.localeCompare(a.updatedAt)
        : q.sort === 'newest'
          ? (b.releasedAt ?? 0) - (a.releasedAt ?? 0) || b.counts.total - a.counts.total
        : b.counts.total - a.counts.total || a.name.localeCompare(b.name, 'zh-CN'));

  const chips: ActiveChip[] = ([
    q.q ? { key: 'q' as const, label: <T zh={`检索「${q.q}」`} en={`“${q.q}”`} /> } : null,
    q.genre ? { key: 'genre' as const, label: <><T zh="类型" en="Genre" /> · {G(q.genre)}</> } : null,
    q.platform ? { key: 'platform' as const, label: <><T zh="平台" en="Platform" /> · {L('platform', q.platform)}</> } : null,
  ] as (ActiveChip | null)[]).filter((chip): chip is ActiveChip => chip !== null);

  const removeFilter = (key: ActiveChip['key']) => update({ [key]: '' });
  const resetFilters = () => update({ q: '', genre: '', platform: '' });
  const view = q.view === 'list' ? 'list' : 'poster';
  const sort = SORTS.find((s) => s.key === (q.sort || 'richness')) ?? SORTS[0];
  const sortLabel = <T zh={sort.label} en={sort.en} />;

  return (
    <div className="container-x pb-24 lg:pb-32">
      <div className="grid lg:grid-cols-[212px_minmax(0,1fr)] lg:gap-x-12 xl:grid-cols-[228px_minmax(0,1fr)] xl:gap-x-14">
        <FilterIndex q={q} update={update} genres={genres} platforms={platforms} total={games.length} />

        <div className="min-w-0">
          <MobileFilterBar
            q={q}
            update={update}
            genres={genres}
            platforms={platforms}
            total={games.length}
            resultCount={filtered.length}
            chips={chips}
            onRemove={removeFilter}
          />

          {/* 桌面 · 索引册页眉：计数、活动筛选、视图 */}
          <div className="hidden min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border pb-3 lg:flex">
            <p aria-live="polite" aria-atomic="true" className="meta shrink-0 text-fg-3">
              <span className="text-foreground">{filtered.length}</span> / {games.length} <T zh="款游戏" en="games" />
            </p>
            {chips.length > 0 && <span aria-hidden className="h-4 w-px shrink-0 bg-border" />}
            <ActiveChips chips={chips} onRemove={removeFilter} className="min-w-0 flex-1 flex-wrap gap-1.5" />
            <ViewToggle view={view} update={update} className="ml-auto" />
          </div>

          {/* 移动 · 结果计数行（筛选栏自身保持单行） */}
          <div className="flex items-center justify-between gap-4 py-4 lg:hidden">
            <p aria-live="polite" aria-atomic="true" className="meta text-fg-3">
              <span className="text-foreground">{filtered.length}</span> / {games.length} <T zh="款游戏" en="games" />
            </p>
            <p className="meta shrink-0 text-fg-3"><T zh="按" en="By" /> <span className="text-fg-2">{sortLabel}</span></p>
          </div>

          {filtered.length ? (
            <div className={view === 'list' ? 'mt-5 lg:mt-8' : 'mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:mt-8 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'}>
              {view === 'list'
                ? <><GameTableHead />{filtered.map((g) => <GameRow key={g.id} g={g} />)}</>
                : filtered.map((g, i) => <PosterCard key={g.id} g={g} priority={i < 4} />)}
            </div>
          ) : (
            <div className="mt-6 border-y border-border py-20 text-center lg:mt-8">
              <p className="mt-4 font-display text-3xl"><T zh="没有找到这份档案" en="No games found" /></p>
              <p className="mt-3 text-sm text-fg-3"><T zh="试试其他名称，或放宽筛选条件。" en="Try another name or loosen the filters." /></p>
              <Button className="mt-6" onClick={resetFilters}><T zh="清除筛选" en="Clear filters" /></Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
