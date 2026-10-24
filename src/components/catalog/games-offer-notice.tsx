'use client';
import type { OfferVM } from '@/lib/present';
import { useNow, Countdown } from '@/components/offer/countdown';
import { liveLifecycle } from '@/components/offer/use-lifecycle';
import { LifecycleBadge } from '@/components/ui/badge';
import { ExtLink } from '@/components/ui/ext-link';
export function GamesOfferNotice({offers}:{offers:OfferVM[]}){const now=useNow();const offer=offers.find(o=>['active','upcoming'].includes(liveLifecycle(o,now)??''));if(!offer)return null;const lifecycle=liveLifecycle(offer,now);const target=lifecycle==='upcoming'?offer.startMs:offer.endMs;return <div className="flex flex-wrap items-center gap-4 border-l-2 border-primary bg-surface-2 px-5 py-4 text-sm"><LifecycleBadge value={lifecycle}/><span>{offer.title}</span>{target!=null&&<Countdown target={target} mode={lifecycle==='upcoming'?'start':'end'} size="sm" className="text-fg-2"/>}<ExtLink href={offer.url} health={offer.linkHealth} className="ml-auto underline underline-offset-4">查看免费活动</ExtLink></div>}
