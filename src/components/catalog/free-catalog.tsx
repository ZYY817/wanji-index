'use client';
import { useCatalogQuery } from './use-catalog-query';
import { ChevronDown, Search, X } from 'lucide-react';
import type { OfferVM } from '@/lib/present';
import { zh } from '@/lib/labels.mjs';
import { cn } from '@/lib/utils';
import { OfferPanel } from '@/components/offer/offer-panel';
import { useNow } from '@/components/offer/countdown';
import { liveLifecycle } from '@/components/offer/use-lifecycle';
import { SectionHeading } from '@/components/ui/section-label';
import { ExtLink } from '@/components/ui/ext-link';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
const TYPES = [['limited', '限时领取', '截止之前领取，永久留在库里。'], ['permanent', '永久免费', '随时加入，不必赶末班车。'], ['trial', '免费试玩', '先体验一段，再决定是否入手。'], ['weekend', '免费周末', '限时畅玩，结束后不保留所有权。'], ['opensource', '开源游戏', '开放源码，也开放游玩的可能。']] as const;
export function FreeCatalog({ offers }: { offers: OfferVM[] }) {
  const { query, update: updateQuery } = useCatalogQuery();
  const now = useNow();
  const q = query.q ?? '', type = query.type ?? '', platform = query.platform ?? '';
  const platforms = [...new Set(offers.map((o) => o.platform))].sort();
  const update = (key: string, value: string) => updateQuery({ [key]: value });
  const clear = () => updateQuery({ q: '', type: '', platform: '' });
  const live = offers.map((o) => ({ ...o, lifecycle: liveLifecycle(o, now) }));
  const matches = (o: OfferVM) => (!type || o.type === type) && (!platform || o.platform === platform) && (!q.trim() || `${o.title} ${o.gameName ?? ''} ${o.claimNote ?? ''}`.toLowerCase().includes(q.trim().toLowerCase()));
  const active = live.filter((o) => o.lifecycle !== 'ended' && matches(o)).sort((a, b) => (a.lifecycle === 'active' ? 0 : a.lifecycle === 'upcoming' ? 1 : 2) - (b.lifecycle === 'active' ? 0 : b.lifecycle === 'upcoming' ? 1 : 2) || (a.endMs ?? Infinity) - (b.endMs ?? Infinity));
  const ended = live.filter((o) => o.lifecycle === 'ended' && matches(o));
  const filtering = !!(q.trim() || type || platform);
  const panels = (items: OfferVM[]) => <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{items.map((o) => <OfferPanel key={o.id} o={o} now={now} />)}</div>;
  return <>
    <div className="sticky top-[var(--header-h)] z-20 border-b border-border bg-background"><div className="container-x flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
      <label className="flex min-w-0 flex-1 items-center gap-3 border-b border-border-strong sm:max-w-72"><Search className="size-4 shrink-0 text-fg-3" aria-hidden /><span className="sr-only">搜索免费游戏</span><input value={q} onChange={(e) => update('q', e.target.value)} placeholder="找一款免费游戏" className="h-11 w-full min-w-0 bg-transparent text-sm" /></label>
      <DropdownMenu><DropdownMenuTrigger asChild><Button className="justify-between">{platform ? zh('platform', platform) : '所有平台'}<ChevronDown aria-hidden /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuRadioGroup value={platform} onValueChange={(v) => update('platform', v)}>{['', ...platforms].map((p) => <DropdownMenuRadioItem key={p} value={p}>{p ? zh('platform', p) : '所有平台'}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>
      <div className="no-scrollbar flex w-full gap-2 overflow-x-auto [mask-image:linear-gradient(90deg,#000_0,#000_calc(100%_-_32px),transparent)] sm:[mask-image:none]" aria-label="免费类型">{[['', '全部'], ...TYPES].map(([key, label]) => <button key={key} type="button" aria-pressed={type === key} onClick={() => update('type', key)} className={cn('min-h-11 shrink-0 border-b px-3 text-sm', type === key ? 'border-primary text-foreground' : 'border-transparent text-fg-3 hover:text-foreground')}>{label}</button>)}</div>
    </div></div>
    <div className="container-x py-12 md:py-20">
      {filtering ? <section><div className="mb-6 flex items-center justify-between"><p className="meta text-fg-3" role="status">{active.length} 条当前情报 · {ended.length} 条归档</p><Button variant="ghost" onClick={clear}><X aria-hidden />清除筛选</Button></div>{active.length ? panels(active) : <div className="border-y border-border py-20"><h2 className="font-serif text-3xl">没有符合条件的当前情报。</h2><p className="mt-4 text-fg-2">试试其他关键词或平台，也可以查看下方已结束归档。</p></div>}</section> : <div className="space-y-16 md:space-y-24">{TYPES.map(([key, label, desc], i) => { const items = active.filter((o) => o.type === key); return <section key={key}><SectionHeading no={`0${i + 1}`} title={label} count={items.length} /><p className="mb-7 text-sm text-fg-2">{desc}</p>{items.length ? panels(items) : <p className="border-l border-border-strong py-4 pl-5 text-sm text-fg-3">暂未收录当前活动。</p>}</section>; })}</div>}
      {ended.length > 0 && <details className="group mt-16 border-y border-border"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between py-4 font-serif text-xl">已结束归档 <span className="flex items-center gap-4 font-mono text-sm text-fg-3">{ended.length}<ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden /></span></summary><div className="pb-8">{panels(ended)}</div></details>}
      <section className="mt-20 grid gap-8 border-t border-border pt-8 md:grid-cols-2"><div><p className="meta text-fg-3">OUTSIDE THE RADAR</p><h2 className="mt-4 font-serif text-3xl">继续追踪。</h2><p className="mt-3 max-w-sm text-sm leading-7 text-fg-2">站内记录保留核验日期。想看即时变动，可以前往这些第三方情报源。</p></div><div className="divide-y divide-border">{[['IsThereAnyDeal', 'https://isthereanydeal.com/giveaways/'], ['SteamDB', 'https://steamdb.info/upcoming/free/'], ['Epic 每周免费', 'https://store.epicgames.com/zh-CN/free-games']].map(([label, url]) => <ExtLink key={url} href={url} className="flex min-h-14 w-full justify-between py-4">{label}</ExtLink>)}</div></section>
    </div>
  </>;
}
