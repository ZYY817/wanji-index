import { Suspense } from 'react';
import type { Metadata } from 'next';
import { loadData } from '@/lib/data.mjs';
import { offerVM, buildStamp } from '@/lib/present';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { FreeCatalog } from '@/components/catalog/free-catalog';
import { LiveFreeSummary } from '@/components/offer/live-free-summary';

export const metadata: Metadata = { title: '免费游戏', description: '限时领取、永久免费、试玩、免费周末与开源游戏情报，随时更新。', alternates: { canonical: '/free/' } };


export default function FreePage() {
  const data = loadData(), now = Date.now();
  const offers = data.offers.map((o) => offerVM(o, data, now));
  const build = buildStamp(new Date(now));
  
  const rank = (o: (typeof offers)[number]) => (o.lifecycle === 'active' && o.type === 'limited' ? 0 : o.lifecycle === 'upcoming' ? 1 : 2);
  const live = offers.filter((o) => o.lifecycle !== 'ended' && o.art?.hero).sort((a, b) => rank(a) - rank(b));
  const top = live[0];

  return (
    <>
      <IndexMasthead
        title="免费游戏"
        count={offers.length}
        description={<LiveFreeSummary offers={offers} build={build} />}
        glow={top?.art?.hero}
      />
      <Suspense fallback={<p className="container-x py-16 text-fg-2">正在准备免费情报…</p>}>
        <FreeCatalog offers={offers} />
      </Suspense>
    </>
  );
}
