import type { Metadata } from 'next';
import { homeData } from '@/lib/home-data';
import { SITE, SITE_BASE } from '@/lib/present';
import { webSiteLd } from '@/lib/jsonld.mjs';
import { JsonLd } from '@/components/seo/json-ld';
import { Opening } from '@/components/home/opening';
import { FreeDeck } from '@/components/home/free-deck';
import { Directory } from '@/components/home/directory';
import { KitStage } from '@/components/home/kit-stage';
import { Scene } from '@/components/fx/scene';
import { Intro } from '@/components/home/intro';

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} — PC 游戏资源与工具索引` },
  description: '以游戏为入口的中文 PC 资源索引：去哪买、现在免不免费、MOD 与汉化在哪、需要什么工具、报错怎么办。只指向官方与可信的原始来源。',
  alternates: { canonical: '/' },
};

// 首页：开场连续镜头 → 免费 → 资源站 → 装机（docs/V5-诊断与改造方案.md）
export default function Home() {
  const d = homeData();
  return (
    <>
      <JsonLd data={webSiteLd(SITE, `${SITE_BASE}/`)} />
      <Intro total={d.counts.games} />
      {/* 开场段：首屏 → 海报墙 → 档案 是同一条连续镜头（Film）；之后的章节用 Scene「接力」衔接：每章进场先画出上一章的最后一帧，再自己完成交接 */}
      {d.dossier && (
        <Scene order={0} enter={false}>
          <Opening heroes={d.heroes} popular={d.popular} wall={d.wall} total={d.counts.games} sites={d.counts.sites} offers={d.counts.offers} d={d.dossier} />
        </Scene>
      )}
      <Scene order={3}><FreeDeck offers={d.offers} total={d.counts.offers} from={d.dossier?.game.art ? { poster: d.dossier.game.art.poster, hero: d.dossier.game.art.hero } : undefined} /></Scene>
      <Scene order={4}><Directory offers={d.offers} sites={d.sites} groups={d.siteGroups} counts={{ sites: d.counts.sites, categories: d.counts.categories, entries: d.counts.entries }} /></Scene>
      <Scene order={5} hold={false}><KitStage /></Scene>
    </>
  );
}
