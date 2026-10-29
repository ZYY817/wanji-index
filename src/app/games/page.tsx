import { T } from '@/lib/i18n';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Info } from 'lucide-react';
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
        title={<T zh="游戏库" en="Games" />}
        count={games.length}
        description={<T zh={`收录 ${games.length} 款 PC 游戏档案，整理了 ${resources} 条资源线索。去哪买、MOD 与汉化在哪、报错排障，一处查到。`} en={`${games.length} PC games with ${resources} leads: where to buy, mods and Chinese patches, and fixes for common errors — all in one place.`} />}
        glow={featured?.art?.header ?? featured?.art?.hero}
        aside={(
          // 收录范围说明：这是个人作品、按资料完整度精选，不是全量游戏库；想要更多游戏去作者页
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-3">
            <Info aria-hidden className="size-4 shrink-0" />
            <T zh="这是一个个人作品：游戏按热度和资料完整度精选收录，仍在持续扩充。" en="A personal project: games are hand-picked by popularity and how complete their info is, and the list keeps growing." />
            <Link href="/author/#more-games" className="inline-flex items-center gap-0.5 text-foreground underline-offset-4 hover:underline">
              <T zh="想看到更多游戏？告诉作者" en="Want more games? Tell the author" />
              <ChevronRight aria-hidden className="size-3.5" />
            </Link>
          </p>
        )}
      />
      <GamesCatalog games={games} />
    </>
  );
}
