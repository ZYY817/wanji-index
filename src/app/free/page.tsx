import { Suspense } from 'react';
import type { Metadata } from 'next';
import { loadData } from '@/lib/data.mjs';
import { computeLifecycle } from '@/lib/lifecycle.mjs';
import { OfferRow } from '@/components/offer-card';
import { FreeClient } from '@/components/free-client';
import { ExtLink } from '@/components/ext-link';
import site from '../../../config/site.json';

export const metadata: Metadata = { title: '免费游戏', description: '永久免费、限时领取、免费试玩、免费周末、开源游戏索引', alternates: { canonical: '/free/' } };

const TYPES = [
  { key: 'limited', label: '限时领取', desc: '在截止前领取即可永久入库' },
  { key: 'permanent', label: '永久免费', desc: '本身就是免费的 F2P/免费游戏' },
  { key: 'trial', label: '免费试玩', desc: '官方 Demo / 试玩版' },
  { key: 'weekend', label: '免费周末', desc: '限时畅玩，非永久入库' },
  { key: 'opensource', label: '开源', desc: '开源免费游戏' },
];

export default function FreePage() {
  const data = loadData();
  const now = Date.now();
  const lcOf = (o: any) => computeLifecycle(o, now, site.review.staleDays.offerTimed);
  const active = data.offers.filter((o) => lcOf(o) !== 'ended');
  const ended = data.offers.filter((o) => lcOf(o) === 'ended');
  const platforms = ([...new Set(data.offers.map((o) => o.platform as string))] as string[]).sort();
  const buildDate = new Date(now).toISOString().slice(0, 10);

  return (
    <div className="wrap py-10">
      <h1 className="text-3xl font-black tracking-tight">免费游戏 <span className="ml-2 text-sm font-normal text-[var(--color-txt-3)]">本页最近构建 {buildDate}</span></h1>
      <p className="mt-2 text-[var(--color-txt-2)]">五类免费：限时领取 · 永久免费 · 免费试玩 · 免费周末 · 开源 —— 只收录官方活动页</p>

      <div className="mt-6">
        <Suspense fallback={null}>
          <FreeClient
            offers={active.map((o) => ({ ...o, _lc: lcOf(o) }))}
            platforms={platforms}
            types={TYPES.map((t) => t.key)}
          />
        </Suspense>
      </div>

      <section className="mt-12">
        <div className="sect"><h2>实时追踪</h2></div>
        <p className="mb-3 text-sm text-[var(--color-txt-2)]">以下为第三方免费情报源，站内信息以核验日期为准：</p>
        <div className="flex flex-wrap gap-6">
          <ExtLink href="https://isthereanydeal.com/" label="IsThereAnyDeal" site="ITAD" />
          <ExtLink href="https://steamdb.info/" label="SteamDB" site="SteamDB" />
          <ExtLink href="https://store.epicgames.com/zh-CN/free-games" label="Epic 每周免费" site="Epic" />
        </div>
      </section>

      {ended.length > 0 && (
        <details className="group mt-12 border-t border-[var(--color-line-0)] pt-4">
          <summary className="cursor-pointer text-sm text-[var(--color-txt-3)] list-none">▸ 已结束（{ended.length}）</summary>
          <div className="mt-3 opacity-70">
            {ended.map((o) => <OfferRow key={o.id} offer={o} now={now} />)}
          </div>
        </details>
      )}
    </div>
  );
}
