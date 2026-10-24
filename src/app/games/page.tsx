import type { Metadata } from 'next';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { gameVM } from '@/lib/present';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { GamesCatalog } from '@/components/catalog/games-catalog';
export const metadata: Metadata = { title: '游戏库', description: '全部已收录 PC 游戏档案', alternates: { canonical: '/games/' } };

export default function GamesPage() {
  const data = loadData(); const rel = buildRelations(data);
  const games = data.games.map((g) => ({ ...gameVM(g, rel), keywords: g.keywords ?? [] }));
  const resources = games.reduce((n, g) => n + g.counts.total, 0);
  return <>
    <IndexMasthead
      no="01"
      title="游戏库"
      description="从一款游戏出发：去哪买、MOD 与汉化在哪、需要什么工具、报错怎么办，都在它的档案里。"
      stats={[{ value: games.length, label: '款游戏' }, { value: resources, label: '条资源线索' }]}
    />
    <GamesCatalog games={games} />
  </>;
}
