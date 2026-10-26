import type { Metadata } from 'next';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { gameVM } from '@/lib/present';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { GamesCatalog } from '@/components/catalog/games-catalog';

export const metadata: Metadata = { title: '游戏库', description: '全部已收录 PC 游戏档案', alternates: { canonical: '/games/' } };

export default function GamesPage() {
  const data = loadData();
  const rel = buildRelations(data);
  const games = data.games.map((g) => ({ ...gameVM(g, rel), keywords: g.keywords ?? [] }));
  const resources = games.reduce((n, g) => n + g.counts.total, 0);
  const featured = games.find((g) => g.id === 'black-myth-wukong') ?? games[0];

  return (
    <>
      <IndexMasthead
        title="游戏库"
        count={games.length}
        description={`收录 ${games.length} 款 PC 游戏档案，整理了 ${resources} 条资源线索。去哪买、MOD 与汉化在哪、报错排障，一处查到。`}
        glow={featured?.art?.hero}
      />
      <GamesCatalog games={games} />
    </>
  );
}
