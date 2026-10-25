import { Suspense } from 'react';
import type { Metadata } from 'next';
import { loadData } from '@/lib/data.mjs';
import { offerVM, buildStamp } from '@/lib/present';
import { IndexMasthead, MastNum } from '@/components/layout/page-masthead';
import { OfferBand } from '@/components/layout/masthead-bands';
import { FreeCatalog } from '@/components/catalog/free-catalog';
export const metadata: Metadata = { title: '免费游戏', description: '限时领取、永久免费、试玩、免费周末与开源游戏，按官方来源核验。', alternates: { canonical: '/free/' } };

const FREE_TYPES = ['limited', 'permanent', 'trial', 'weekend', 'opensource'] as const;

export default function FreePage() {
  const data = loadData(), now = Date.now();
  const offers = data.offers.map((o) => offerVM(o, data, now));
  const build = buildStamp(new Date(now));
  const counts = Object.fromEntries(FREE_TYPES.map((t) => [t, offers.filter((o) => o.type === t).length]));
  // 刊头内容带：正在进行 / 即将开始的排在前面
  const rank = (o: (typeof offers)[number]) => (o.lifecycle === 'active' && o.type === 'limited' ? 0 : o.lifecycle === 'upcoming' ? 1 : 2);
  const live = offers.filter((o) => o.lifecycle !== 'ended' && o.art?.hero).sort((a, b) => rank(a) - rank(b));
  return <>
    <IndexMasthead
      no="02"
      title="免费游戏"
      description={<>此刻有 <MastNum>{counts.limited ?? 0}</MastNum> 个限时领取，共 <MastNum>{offers.length}</MastNum> 条免费情报。截止时间按北京时间计算，活动以官方页面为准。<span className="mt-2 block text-sm text-fg-3">最近更新 {build}</span></>}
      glow={live[0]?.art?.hero}
      band={<OfferBand offers={live} />}
    />
    <Suspense fallback={<p className="container-x py-16 text-fg-2">正在准备免费情报…</p>}><FreeCatalog offers={offers} /></Suspense>
  </>;
}
