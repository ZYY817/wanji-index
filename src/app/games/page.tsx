import type { Metadata } from 'next';
import Link from 'next/link';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { gameVM, byRichness } from '@/lib/present';
import { PageMastheadFrame } from '@/components/layout/page-masthead';
import { GamesCatalog } from '@/components/catalog/games-catalog';
import { pad } from '@/lib/utils';
export const metadata: Metadata = { title: '游戏库', description: '全部已收录 PC 游戏档案', alternates: { canonical: '/games/' } };

export default function GamesPage() {
  const data = loadData(); const rel = buildRelations(data);
  const games = data.games.map((g) => ({ ...gameVM(g, rel), keywords: g.keywords ?? [] }));
  const sheet = [...games].sort(byRichness).filter((g) => g.art?.poster).slice(0, 6);
  const latest = games.reduce((m, g) => (g.checkedAt > m ? g.checkedAt : m), '');
  return <>
    <PageMastheadFrame no="01" en="THE GAME ARCHIVE" crumbs={[['游戏']]}>
      <div className="grid gap-7 pb-9 pt-8 md:grid-cols-12 md:gap-8 md:pb-12 md:pt-11">
        <div className="md:col-span-5">
          <h1 className="display-m">游戏档案</h1>
          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border pt-3">
            <span className="font-mono text-3xl leading-none tracking-[-0.03em] text-primary tabular md:text-4xl">{pad(games.length, 3)}</span>
            <span className="meta text-fg-3">款游戏在档</span>
            <span className="flex-1" />
            <span className="meta text-2xs text-fg-3">核验至 {latest || '—'}</span>
          </div>
          <p className="mt-5 max-w-[38ch] text-base leading-[1.8] text-fg-2">从一款游戏出发。获取渠道、MOD、工具与排障线索，在同一份档案里归位。</p>
        </div>

        <div className="min-w-0 md:col-span-7">
          <div className="meta flex items-baseline justify-between gap-3 border-t border-foreground/30 pt-2 text-2xs text-fg-3">
            <span className="text-foreground">CONTACT SHEET / 接触印样</span>
            <span>FR {pad(1, 3)}–{pad(sheet.length, 3)} · 共 {pad(games.length, 3)} 帧</span>
          </div>
          <ol className="mt-2 grid grid-cols-6 gap-1.5 md:gap-2.5">
            {sheet.map((g, i) => (
              <li key={g.id}>
                <Link href={`/games/${g.slug}/`} className="group block">
                  <span className="relative block aspect-[2/3] overflow-hidden border border-border bg-surface-2">
                    <img src={g.art!.poster} alt={`${g.name} 官方海报`} width={600} height={900} loading="lazy" decoding="async" className="size-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                    <span aria-hidden className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(10,10,9,0.9),transparent)] px-1 pb-0.5 pt-3 font-mono text-2xs tracking-[0.1em] text-foreground/90 md:px-1.5 md:pb-1 md:text-2xs">{pad(i + 1, 3)}</span>
                  </span>
                  <span className="mt-1 hidden truncate font-mono text-2xs tracking-[0.06em] text-fg-3 group-hover:text-foreground md:block">{g.name}</span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="meta mt-2 flex justify-between gap-3 text-2xs text-fg-3">
            <span>按档案资源量取帧</span>
            <span className="hidden sm:inline">官方海报 · STEAM CDN</span>
          </p>
        </div>
      </div>
    </PageMastheadFrame>
    <GamesCatalog games={games} />
  </>;
}
