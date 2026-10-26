'use client';
import { ChevronDown, Search, X } from 'lucide-react';
import type { OfferVM } from '@/lib/present';
import { zh } from '@/lib/labels.mjs';
import { OfferHeroCard, OfferRow } from '@/components/offer/offer-panel';
import { useNow } from '@/components/offer/countdown';
import { liveLifecycle } from '@/components/offer/use-lifecycle';
import { ExtLink } from '@/components/ui/ext-link';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/fx/reveal';
import { NovaTabs } from '@/components/ui/tabs-nova';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useCatalogQuery } from './use-catalog-query';

const NAV_TABS = [
  ['', '全部'],
  ['limited', '限时领取'],
  ['upcoming', '即将开始'],
  ['permanent', '永久免费'],
  ['trial_weekend', '试玩与周末'],
  ['opensource', '开源游戏'],
] as const;

const TRACKERS = [
  ['Epic 每周免费', 'https://store.epicgames.com/zh-CN/free-games'],
  ['IsThereAnyDeal 限免', 'https://isthereanydeal.com/giveaways/'],
  ['SteamDB 免费活动', 'https://steamdb.info/upcoming/free/'],
] as const;

const LC_RANK: Record<string, number> = { active: 0, upcoming: 1 };
const byUrgency = (a: OfferVM, b: OfferVM) =>
  (LC_RANK[a.lifecycle ?? ''] ?? 2) - (LC_RANK[b.lifecycle ?? ''] ?? 2) || (a.endMs ?? Infinity) - (b.endMs ?? Infinity);

function SectionTitle({ title, count, description }: { title: string; count: number; description?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4">
      <div>
        <h2 className="flex items-baseline gap-3 font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {title}
          <span className="font-mono text-sm font-normal text-fg-3">({count})</span>
        </h2>
        {description && <p className="mt-1.5 text-base leading-relaxed text-fg-2">{description}</p>}
      </div>
    </div>
  );
}

/**
 * 免费游戏目录：
 * - 筛选条吸顶使用 --sticky-top，背景不透明，无缝贴顶；
 * - 5 大分组：限时领取 / 即将开始 / 永久免费 / 免费试玩与周末 / 开源；
 * - 限时领取与即将开始使用大卡展示（横幅 + 倒计时 + 主按钮，最多 3 张）；
 * - 其余分组统一使用紧凑列表行，避免满屏大数字；
 * - 游戏名一律使用 o.titleZh ?? o.title，副标为 o.titleOrig。
 */
export function FreeCatalog({ offers }: { offers: OfferVM[] }) {
  const { query, update } = useCatalogQuery();
  const now = useNow();
  const q = query.q ?? '', type = query.type ?? '', platform = query.platform ?? '';
  const platforms = [...new Set(offers.map((o) => o.platform))].sort();
  const filtering = Boolean(q.trim() || type || platform);

  const matches = (o: OfferVM) => {
    // 类型过滤
    if (type === 'limited' && (o.type !== 'limited' || o.lifecycle !== 'active')) return false;
    if (type === 'upcoming' && o.lifecycle !== 'upcoming') return false;
    if (type === 'permanent' && o.type !== 'permanent') return false;
    if (type === 'trial_weekend' && o.type !== 'trial' && o.type !== 'weekend') return false;
    if (type === 'opensource' && o.type !== 'opensource') return false;
    // 平台过滤
    if (platform && o.platform !== platform) return false;
    // 关键词过滤
    if (q.trim()) {
      const haystack = `${o.title} ${o.titleZh ?? ''} ${o.titleOrig ?? ''} ${o.gameName ?? ''} ${o.claimNote ?? ''}`.toLowerCase();
      if (!haystack.includes(q.trim().toLowerCase())) return false;
    }
    return true;
  };

  const live = offers.map((o) => ({ ...o, lifecycle: liveLifecycle(o, now) })).filter(matches);
  const current = live.filter((o) => o.lifecycle !== 'ended').sort(byUrgency);
  const ended = live.filter((o) => o.lifecycle === 'ended');

  // 未筛选视图的 5 组数据
  const limitedOffers = current.filter((o) => o.type === 'limited' && o.lifecycle === 'active').slice(0, 3);
  const upcomingOffers = current.filter((o) => o.lifecycle === 'upcoming');
  const permanentOffers = current.filter((o) => o.type === 'permanent');
  const trialWeekendOffers = current.filter((o) => o.type === 'trial' || o.type === 'weekend');
  const opensourceOffers = current.filter((o) => o.type === 'opensource');

  return (
    <>
      {/* 吸顶筛选条：shadcn/ui Nova 紧凑设计 + 贴顶避让 */}
      <div className="sticky top-[var(--sticky-top)] z-20 border-b border-border bg-background transition-[top] duration-300">
        <div className="container-x flex flex-wrap items-center gap-x-4 gap-y-2.5 py-2.5">
          {/* Nova 紧凑搜索框 */}
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xs border border-border bg-surface-2/40 px-2.5 py-1 text-sm transition-colors focus-within:border-primary/80 focus-within:bg-card sm:max-w-72">
            <Search className="size-3.5 shrink-0 text-fg-3" aria-hidden />
            <span className="sr-only">搜索免费游戏</span>
            <input
              type="text"
              value={q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="搜索中文名或原名"
              className="h-7 w-full min-w-0 bg-transparent text-xs sm:text-sm placeholder:text-fg-3 focus:outline-none"
            />
            {q && (
              <button
                type="button"
                onClick={() => update({ q: '' })}
                className="inline-flex size-5 items-center justify-center text-fg-3 hover:text-foreground"
                aria-label="清空搜索"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </label>

          {/* Motion 驱动的物理弹簧分类切换栏 */}
          <NovaTabs
            items={NAV_TABS.map(([key, label]) => ({
              id: key,
              label,
              count: key === '' ? current.length : undefined,
            }))}
            activeId={type}
            onChange={(key) => update({ type: key })}
            className="order-last lg:order-none"
          />

          {/* 平台下拉选择（Nova 紧凑按钮） */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto h-9 justify-between gap-2 text-xs">
                {platform ? zh('platform', platform) : '全部平台'}
                <ChevronDown className="size-3.5 text-fg-3" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={platform} onValueChange={(v) => update({ platform: v })}>
                {['', ...platforms].map((p) => (
                  <DropdownMenuRadioItem key={p} value={p} className="text-xs">
                    {p ? zh('platform', p) : '全部平台'}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="container-x py-12 md:py-16">
        {filtering ? (
          /* 筛选结果列表 */
          <section>
            <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-border pb-4">
              <h2 className="flex items-baseline gap-3 font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                筛选结果
                <span className="font-mono text-sm font-normal text-fg-3">({current.length})</span>
              </h2>
              <Button
                variant="ghost"
                className="min-h-11 text-base text-fg-2 hover:text-foreground"
                onClick={() => update({ q: '', type: '', platform: '' })}
              >
                <X className="size-4" aria-hidden />
                清除筛选
              </Button>
            </div>

            {current.length ? (
              type === 'limited' || type === 'upcoming' ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {current.map((o) => <OfferHeroCard key={o.id} o={o} now={now} />)}
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {current.map((o) => <OfferRow key={o.id} o={o} now={now} />)}
                </ul>
              )
            ) : (
              <div className="border-y border-border py-20 text-center">
                <p className="font-serif text-3xl font-bold text-foreground">没有符合条件的免费情报</p>
                <p className="mt-3 text-base text-fg-2">换个关键词或平台试试，也可以看看下方的已结束归档。</p>
              </div>
            )}
          </section>
        ) : (
          /* 默认视图：5 大分组清晰呈现 */
          <div className="space-y-16 md:space-y-20">
            {/* 1. 限时领取：大卡（最多 3 张） */}
            {limitedOffers.length > 0 && (
              <Reveal as="section" aria-label="限时领取">
                <SectionTitle
                  title="限时领取"
                  count={limitedOffers.length}
                  description="在截止日期前领取，永久保留在个人库中。"
                />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {limitedOffers.map((o) => <OfferHeroCard key={o.id} o={o} now={now} />)}
                </div>
              </Reveal>
            )}

            {/* 2. 即将开始：若有预告则以带倒计时的大卡呈现 */}
            {upcomingOffers.length > 0 && (
              <Reveal as="section" aria-label="即将开始">
                <SectionTitle
                  title="即将开始"
                  count={upcomingOffers.length}
                  description="官方已公布的下一期免费活动预告。"
                />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {upcomingOffers.map((o) => <OfferHeroCard key={o.id} o={o} now={now} />)}
                </div>
              </Reveal>
            )}

            {/* 3. 永久免费：紧凑列表行 */}
            {permanentOffers.length > 0 && (
              <Reveal as="section" aria-label="永久免费">
                <SectionTitle
                  title="永久免费"
                  count={permanentOffers.length}
                  description="随时可以加入并免费游玩，无需赶末班车。"
                />
                <ul className="divide-y divide-border">
                  {permanentOffers.map((o) => <OfferRow key={o.id} o={o} now={now} />)}
                </ul>
              </Reveal>
            )}

            {/* 4. 免费试玩与周末：紧凑列表行 */}
            {trialWeekendOffers.length > 0 && (
              <Reveal as="section" aria-label="免费试玩与周末">
                <SectionTitle
                  title="免费试玩与周末"
                  count={trialWeekendOffers.length}
                  description="先体验部分章节或在限定周末畅玩，再决定是否入手。"
                />
                <ul className="divide-y divide-border">
                  {trialWeekendOffers.map((o) => <OfferRow key={o.id} o={o} now={now} />)}
                </ul>
              </Reveal>
            )}

            {/* 5. 开源游戏：紧凑列表行 */}
            {opensourceOffers.length > 0 && (
              <Reveal as="section" aria-label="开源游戏">
                <SectionTitle
                  title="开源游戏"
                  count={opensourceOffers.length}
                  description="完全开放代码与资产，社区驱动的纯粹创作。"
                />
                <ul className="divide-y divide-border">
                  {opensourceOffers.map((o) => <OfferRow key={o.id} o={o} now={now} />)}
                </ul>
              </Reveal>
            )}
          </div>
        )}

        {/* 已结束归档折叠面板 */}
        {ended.length > 0 && (
          <details className="group mt-16 border-y border-border">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between py-4 transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
              <span className="font-serif text-2xl font-bold text-foreground">已结束归档</span>
              <span className="flex items-center gap-3 font-mono text-sm text-fg-3">
                {ended.length} 款
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
              </span>
            </summary>
            <div className="pb-8 pt-2">
              <ul className="divide-y divide-border">
                {ended.map((o) => <OfferRow key={o.id} o={o} now={now} />)}
              </ul>
            </div>
          </details>
        )}

        {/* 雷达之外第三方来源链接 */}
        <Reveal as="section" aria-labelledby="trackers-title" className="mt-16 grid gap-8 border-t border-border pt-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 id="trackers-title" className="font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              雷达之外
            </h2>
            <p className="mt-2.5 max-w-[36ch] text-base leading-relaxed text-fg-2">
              站内每条记录都标注了核验日期。想追踪第一时间的即时变动，可以前往这些第三方情报源。
            </p>
          </div>
          <ul className="md:col-span-6 md:col-start-7 divide-y divide-border">
            {TRACKERS.map(([label, url]) => (
              <li key={url}>
                <ExtLink
                  href={url}
                  className="flex min-h-14 w-full items-center justify-between text-base text-fg-2 transition-colors hover:text-foreground"
                >
                  {label}
                </ExtLink>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </>
  );
}
