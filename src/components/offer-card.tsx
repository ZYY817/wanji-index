import Link from 'next/link';
import { LifecycleBadge, StatusBadge } from './badges';
import { ExtLink } from './ext-link';
import { zh } from '@/lib/labels.mjs';
import { computeLifecycle } from '@/lib/lifecycle.mjs';
import site from '../../config/site.json';

// 免费活动卡片（首页用）+ 行（/free/ 用）
export function OfferCard({ offer, now }: { offer: any; now: number }) {
  const lc = computeLifecycle(offer, now, site.review.staleDays.offerTimed);
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        <LifecycleBadge state={lc ?? 'uncertain'} />
        <span className="tag">{zh('freeType', offer.type)}</span>
        <span className="tag">{zh('platform', offer.platform)}</span>
      </div>
      <h3 className="mt-2.5 font-semibold tracking-tight">{offer.gameTitle}</h3>
      {offer.claimNote && <p className="meta mt-1">{offer.claimNote}</p>}
      <div className="mt-3 flex items-center gap-3">
        {offer.endDate && <span className="mono text-[var(--color-warn)]">截止 {offer.endDate}</span>}
        {lc !== 'ended' && <ExtLink href={offer.url} label="领取" health={offer.linkHealth} className="ml-auto" />}
        {offer.gameId && <Link href={`/games/${offer.gameId}/`} className="meta hover:text-[var(--color-amber-hi)]">档案→</Link>}
      </div>
    </div>
  );
}

export function OfferRow({ offer, now }: { offer: any; now: number }) {
  const lc = computeLifecycle(offer, now, site.review.staleDays.offerTimed);
  const ended = lc === 'ended';
  return (
    <div className={`irow ${ended ? 'opacity-55' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className={`font-medium ${ended ? 'text-[var(--color-txt-3)] line-through' : ''}`}>{offer.gameTitle}</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <span className="tag">{zh('freeType', offer.type)}</span>
          <span className="tag">{zh('platform', offer.platform)}</span>
          <LifecycleBadge state={lc ?? 'uncertain'} />
        </div>
      </div>
      <div className="hidden items-center gap-4 text-sm sm:flex">
        {offer.claimNote && <span className="meta max-w-[16em] truncate">{offer.claimNote}</span>}
        {offer.endDate && <span className="mono text-[var(--color-txt-3)]">截止 {offer.endDate}</span>}
        {offer.linkHealth !== 'ok' && <StatusBadge kind={offer.linkHealth} />}
      </div>
      <div className="flex items-center gap-3">
        {offer.gameId && <Link href={`/games/${offer.gameId}/`} className="meta hover:text-[var(--color-amber-hi)]">档案→</Link>}
        <ExtLink href={offer.url} label={ended ? '查看' : '领取'} health={offer.linkHealth} />
      </div>
    </div>
  );
}
