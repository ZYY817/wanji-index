'use client';
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
import { Reveal } from '@/components/fx/reveal';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { useCatalogQuery } from './use-catalog-query';

const TYPES = [
  ['limited', '限时领取', '截止之前领取，永久留在库里。'],
  ['permanent', '永久免费', '随时加入，不必赶末班车。'],
  ['trial', '免费试玩', '先体验一段，再决定是否入手。'],
  ['weekend', '免费周末', '限时畅玩，结束后不保留所有权。'],
  ['opensource', '开源游戏', '开放源码，也开放游玩的可能。'],
] as const;

const TRACKERS = [
  ['Epic 每周免费', 'https://store.epicgames.com/zh-CN/free-games'],
  ['IsThereAnyDeal 限免', 'https://isthereanydeal.com/giveaways/'],
  ['SteamDB 免费活动', 'https://steamdb.info/upcoming/free/'],
] as const;

// 进行中 → 预告 → 其余；同一状态按截止时间先后
const LC_RANK: Record<string, number> = { active: 0, upcoming: 1 };
const byUrgency = (a: OfferVM, b: OfferVM) =>
  (LC_RANK[a.lifecycle ?? ''] ?? 2) - (LC_RANK[b.lifecycle ?? ''] ?? 2) || (a.endMs ?? Infinity) - (b.endMs ?? Infinity);

function Grid({ items, now }: { items: OfferVM[]; now: number | null }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((o) => <OfferPanel key={o.id} o={o} now={now} />)}
    </div>
  );
}

/**
 * 免费游戏目录：吸顶筛选条（搜索 / 平台 / 类型）→ 按类型分组的卡片 → 已结束归档 → 站外追踪源。
 * 筛选时不再分组，直接给出结果数与结果卡片。
 */
export function FreeCatalog({ offers }: { offers: OfferVM[] }) {
  const { query, update } = useCatalogQuery();
  const now = useNow();
  const q = query.q ?? '', type = query.type ?? '', platform = query.platform ?? '';
  const platforms = [...new Set(offers.map((o) => o.platform))].sort();
  const filtering = Boolean(q.trim() || type || platform);

  const matches = (o: OfferVM) =>
    (!type || o.type === type) &&
    (!platform || o.platform === platform) &&
    (!q.trim() || `${o.title} ${o.gameName ?? ''} ${o.claimNote ?? ''}`.toLowerCase().includes(q.trim().toLowerCase()));
  const live = offers.map((o) => ({ ...o, lifecycle: liveLifecycle(o, now) })).filter(matches);
  const current = live.filter((o) => o.lifecycle !== 'ended').sort(byUrgency);
  const ended = live.filter((o) => o.lifecycle === 'ended');

  return (
    <>
      <div className="sticky top-[var(--header-h)] z-20 border-b border-border bg-background">
        <div className="container-x flex flex-wrap items-center gap-x-8 gap-y-3 py-3">
          <label className="flex min-w-0 flex-1 items-center gap-3 border-b border-border-strong sm:max-w-80">
            <Search className="size-4 shrink-0 text-fg-3" aria-hidden />
            <span className="sr-only">搜索免费游戏</span>
            <input value={q} onChange={(e) => update({ q: e.target.value })} placeholder="搜索游戏名" className="h-11 w-full min-w-0 bg-transparent text-base placeholder:text-fg-3" />
          </label>

          <nav aria-label="免费类型" className="no-scrollbar order-last flex w-full gap-1 overflow-x-auto lg:order-none lg:w-auto">
            {[['', '全部'] as const, ...TYPES].map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={type === key}
                onClick={() => update({ type: key })}
                className={cn('relative min-h-11 shrink-0 px-3 text-base transition-colors', type === key ? 'text-foreground' : 'text-fg-2 hover:text-foreground')}
              >
                {label}
                {type === key && <span aria-hidden className="absolute inset-x-3 bottom-0 h-[2px] bg-primary" />}
              </button>
            ))}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="ml-auto justify-between gap-3">{platform ? zh('platform', platform) : '所有平台'}<ChevronDown aria-hidden /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={platform} onValueChange={(v) => update({ platform: v })}>
                {['', ...platforms].map((p) => <DropdownMenuRadioItem key={p} value={p}>{p ? zh('platform', p) : '所有平台'}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="container-x py-14 md:py-20">
        {filtering ? (
          <section>
            <SectionHeading title="筛选结果" count={current.length}>
              <Button variant="ghost" className="ml-auto" onClick={() => update({ q: '', type: '', platform: '' })}><X aria-hidden />清除筛选</Button>
            </SectionHeading>
            {current.length ? (
              <Grid items={current} now={now} />
            ) : (
              <div className="border-y border-border py-20 text-center">
                <p className="font-serif text-3xl">没有符合条件的免费游戏</p>
                <p className="mt-3 text-base text-fg-2">换个关键词或平台试试，也可以看看下方的已结束归档。</p>
              </div>
            )}
          </section>
        ) : (
          <div className="space-y-20 md:space-y-28">
            {TYPES.map(([key, label, desc]) => {
              const items = current.filter((o) => o.type === key);
              return (
                <Reveal as="section" key={key} aria-label={label}>
                  <SectionHeading title={label} count={items.length} description={desc} />
                  {items.length ? <Grid items={items} now={now} /> : <p className="text-base text-fg-3">当前没有进行中的活动，有新消息会出现在这里。</p>}
                </Reveal>
              );
            })}
          </div>
        )}

        {ended.length > 0 && (
          <details className="group mt-20 border-y border-border">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
              <span className="font-serif text-2xl font-bold">已结束归档</span>
              <span className="flex items-center gap-4 font-mono text-sm text-fg-3">
                {ended.length}
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
              </span>
            </summary>
            <div className="pb-10 pt-4"><Grid items={ended} now={now} /></div>
          </details>
        )}

        <Reveal as="section" aria-labelledby="trackers-title" className="mt-20 grid gap-8 border-t border-border-strong pt-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 id="trackers-title" className="font-serif text-3xl font-bold tracking-[-0.03em]">雷达之外</h2>
            <p className="mt-3 max-w-[36ch] text-base leading-[1.75] text-fg-2">站内每条记录都写明核验日期。想看即时变动，可以去这些第三方情报源。</p>
          </div>
          <ul className="md:col-span-6 md:col-start-7">
            {TRACKERS.map(([label, url]) => (
              <li key={url} className="border-b border-border">
                <ExtLink href={url} className="flex min-h-14 w-full items-center justify-between text-base text-fg-2 transition-colors hover:text-foreground">{label}</ExtLink>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </>
  );
}
