import type { Metadata } from 'next';
import { homeData } from '@/lib/home-data';
import { SITE, SITE_BASE } from '@/lib/present';
import { webSiteLd } from '@/lib/jsonld.mjs';
import { JsonLd } from '@/components/seo/json-ld';
import { Hero } from '@/components/home/hero';
import { PosterWall } from '@/components/home/poster-wall';
import { Dossier } from '@/components/home/dossier';
import { FreeRadar } from '@/components/home/free-radar';
import { Directory } from '@/components/home/directory';
import { KitReveal } from '@/components/home/kit-reveal';
import { ChapterRail } from '@/components/layout/header-chapter';
import { Scene } from '@/components/fx/scene';

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} — PC 游戏资源与工具索引` },
  description: '以游戏为入口的中文 PC 资源索引：去哪买、现在免不免费、MOD 与汉化在哪、需要什么工具、报错怎么办。只指向官方与可信的原始来源。',
  alternates: { canonical: '/' },
};

// 首页 = 七章滚动叙事（docs/V2-视觉系统.md）
export default function Home() {
  const d = homeData();
  return (
    <>
      <JsonLd data={webSiteLd(SITE, `${SITE_BASE}/`)} />
      <ChapterRail />
      <Hero heroes={d.heroes} floaters={d.floaters} counts={{ games: d.counts.games, sites: d.counts.sites, offers: d.counts.offers }} build={d.build} />
      {/* 第 2–6 章用 Scene 包裹：离场时下沉、缩小、压暗，下一章从上方接力（层级逐章递增） */}
      <Scene order={1}><PosterWall games={d.wall} total={d.counts.games} entries={d.counts.entries} /></Scene>
      {d.dossier && <Scene order={2}><Dossier d={d.dossier} /></Scene>}
      <Scene order={3}><FreeRadar offers={d.offers} total={d.counts.offers} /></Scene>
      <Scene order={4}><Directory sites={d.sites} groups={d.siteGroups} counts={{ sites: d.counts.sites, categories: d.counts.categories, entries: d.counts.entries }} /></Scene>
      <Scene order={5}><KitReveal /></Scene>
    </>
  );
}
