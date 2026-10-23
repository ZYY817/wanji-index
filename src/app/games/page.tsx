import { Suspense } from 'react';
import type { Metadata } from 'next';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { GameCard } from '@/components/game-card';
import { FilterList } from '@/components/filter-list';
import { zh } from '@/lib/labels.mjs';

export const metadata: Metadata = { title: '游戏库', description: '全部已收录 PC 游戏档案', alternates: { canonical: '/games/' } };

export default function GamesPage() {
  const data = loadData();
  const rel = buildRelations(data);
  const counts = (gid: string) => [
    (rel.entriesByGame.get(gid)?.length ?? 0) && `MOD${rel.entriesByGame.get(gid)!.length}`,
    (rel.toolsByGame.get(gid)?.length ?? 0) && `工具${rel.toolsByGame.get(gid)!.length}`,
  ].filter(Boolean).join(' ');
  const games = [...data.games].sort((a, b) => a.name.zh.localeCompare(b.name.zh, 'zh'));
  const genres = [...new Set(games.flatMap((g) => g.genres ?? []))].sort();
  const platforms = [...new Set(games.flatMap((g) => (g.channels ?? []).map((c: any) => c.platform)))].sort();

  return (
    <div className="wrap py-10">
      <h1 className="text-3xl font-black tracking-tight">游戏库 <span className="ml-2 text-sm font-normal text-[var(--color-txt-3)]">已收录 {games.length} 款</span></h1>
      <div className="mt-6">
        <Suspense fallback={null}>
          <FilterList
            placeholder="页内搜索：游戏名 / 英文名 / 别名…"
            filters={[
              { key: 'genre', label: '全部类型', options: genres.map((g) => ({ value: g, label: g })) },
              { key: 'platform', label: '全部平台', options: platforms.map((p) => ({ value: p, label: zh('platform', p) })) },
            ]}
            rows={games.map((g) => ({
              key: g.id,
              q: [g.name.zh, g.name.en, ...(g.aliases ?? []), ...(g.keywords ?? [])].join(' ').toLowerCase(),
              dims: { genre: g.genres ?? [], platform: (g.channels ?? []).map((c: any) => c.platform) },
              node: <GameCard game={g} counts={counts(g.id)} />,
            }))}
          />
        </Suspense>
      </div>
    </div>
  );
}
