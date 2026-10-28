'use client';
import { useL } from '@/components/layout/lang-toggle';
import { L } from '@/lib/labels-i18n';
import { T } from '@/lib/i18n';
import { ChevronDown, Search, X } from 'lucide-react';
import type { OfferVM } from '@/lib/present';
import { OfferHeroCard, OfferRow } from '@/components/offer/offer-panel';
import { useNow } from '@/components/offer/countdown';
import { liveLifecycle } from '@/components/offer/use-lifecycle';
import { ExtLink } from '@/components/ui/ext-link';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/fx/reveal';
import { SectionHeading } from '@/components/ui/section-label';
import { NovaTabs } from '@/components/ui/tabs-nova';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useCatalogQuery } from './use-catalog-query';

const NAV_TABS = [
  ['', '全部', 'All'],
  ['limited', '限时领取', 'Free to keep'],
  ['upcoming', '即将开始', 'Upcoming'],
  ['permanent', '永久免费', 'Free to play'],
  ['trial_weekend', '试玩与周末', 'Trials & weekends'],
  ['opensource', '开源游戏', 'Open source'],
] as const;

const TRACKERS: [React.ReactNode, string][] = [
  [<T key="e" zh="Epic 每周免费" en="Epic weekly free games" />, 'https://store.epicgames.com/zh-CN/free-games'],
  [<T key="i" zh="IsThereAnyDeal 限免" en="IsThereAnyDeal giveaways" />, 'https://isthereanydeal.com/giveaways/'],
  [<T key="s" zh="SteamDB 免费活动" en="SteamDB free promotions" />, 'https://steamdb.info/upcoming/free/'],
] as const;

const LC_RANK: Record<string, number> = { active: 0, upcoming: 1 };
const byUrgency = (a: OfferVM, b: OfferVM) =>
  (LC_RANK[a.lifecycle ?? ''] ?? 2) - (LC_RANK[b.lifecycle ?? ''] ?? 2) || (a.endMs ?? Infinity) - (b.endMs ?? Infinity);


/**
 * 免费游戏目录：
 * - 筛选条吸顶使用 --sticky-top，背景不透明，无缝贴顶；
 * - 5 大分组：限时领取 / 即将开始 / 永久免费 / 免费试玩与周末 / 开源；
 * - 限时领取与即将开始使用大卡展示（横幅 + 倒计时 + 主按钮，最多 3 张）；
 * - 其余分组统一使用紧凑列表行，避免满屏大数字；
 * - 游戏名一律使用 o.titleZh ?? o.title，副标为 o.titleOrig。
 */
export function FreeCatalog({ offers }: { offers: OfferVM[] }) {
  const l = useL();
  const { query, update } = useCatalogQuery();
  const now = useNow();
  const q = query.q ?? '', type = query.type ?? '', platform = query.platform ?? '';
  const platforms = [...new Set(offers.map((o) => o.platform))].sort();
  const filtering = Boolean(q.trim() || type || platform);

  // t：按哪个类型标签筛（默认当前选中的）；算每个标签的数量时传入各自的 key
  const matches = (o: OfferVM, t: string = type) => {
    // 类型过滤（限时领取包含截止时间未公布的赠送）
    if (t === 'limited' && (o.type !== 'limited' || !['active', 'deadline_unknown', 'uncertain'].includes(o.lifecycle ?? ''))) return false;
    if (t === 'upcoming' && o.lifecycle !== 'upcoming') return false;
    if (t === 'permanent' && o.type !== 'permanent') return false;
    if (t === 'trial_weekend' && o.type !== 'trial' && o.type !== 'weekend') return false;
    if (t === 'opensource' && o.type !== 'opensource') return false;
    // 平台过滤
    if (platform && o.platform !== platform) return false;
    // 关键词过滤
    if (q.trim()) {
      const haystack = `${o.title} ${o.titleZh ?? ''} ${o.titleOrig ?? ''} ${o.gameName ?? ''} ${o.claimNote ?? ''}`.toLowerCase();
      if (!haystack.includes(q.trim().toLowerCase())) return false;
    }
    return true;
  };

  const withLc = offers.map((o) => ({ ...o, lifecycle: liveLifecycle(o, now) }));
  const live = withLc.filter((o) => matches(o));
  // 每个类型标签各自的数量（同样受关键词 / 平台筛选影响，不受当前选中的类型影响）
  const tabCount = (t: string) => withLc.filter((o) => o.lifecycle !== 'ended' && matches(o, t)).length;
  const current = live.filter((o) => o.lifecycle !== 'ended').sort(byUrgency);
  const ended = live.filter((o) => o.lifecycle === 'ended');

  // 未筛选视图的 5 组数据
  // 限时领取：有明确截止时间的全部列出（来源多了以后不再只取前 3 条，否则多出来的活动会被藏起来）
  const limitedOffers = current.filter((o) => o.type === 'limited' && o.lifecycle === 'active');
  // 截止时间没公布的限时领取（IndieGala、部分 itch.io 赠送）：单列一组紧凑行
  const openEndedOffers = current.filter((o) => o.type === 'limited' && (o.lifecycle === 'deadline_unknown' || o.lifecycle === 'uncertain'));
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
            <span className="sr-only"><T zh="搜索免费游戏" en="Search free games" /></span>
            <input
              type="text"
              value={q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder={l('搜索中文名或原名', 'Search by name')}
              className="h-7 w-full min-w-0 bg-transparent text-xs sm:text-sm placeholder:text-fg-3 focus:outline-none"
            />
            {q && (
              <button
                type="button"
                onClick={() => update({ q: '' })}
                className="inline-flex size-5 items-center justify-center text-fg-3 hover:text-foreground"
                aria-label={l('清空搜索', 'Clear search')}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </label>

          {/* Motion 驱动的物理弹簧分类切换栏 */}
          <NovaTabs
            items={NAV_TABS.map(([key, zhL, enL]) => ({
              id: key,
              label: <T zh={zhL} en={enL} />,
              count: tabCount(key),
            }))}
            activeId={type}
            onChange={(key) => update({ type: key })}
            className="order-last lg:order-none"
          />

          {/* 平台下拉选择（Nova 紧凑按钮） */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto h-9 justify-between gap-2 text-xs">
                {platform ? L('platform', platform) : <T zh="全部平台" en="All platforms" />}
                <ChevronDown className="size-3.5 text-fg-3" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={platform} onValueChange={(v) => update({ platform: v })}>
                {['', ...platforms].map((p) => (
                  <DropdownMenuRadioItem key={p} value={p} className="text-xs">
                    {p ? L('platform', p) : <T zh="全部平台" en="All platforms" />}
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
                <T zh="筛选结果" en="Results" />
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
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {current.map((o) => <OfferHeroCard key={o.id} o={o} now={now} />)}
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {current.map((o) => <OfferRow key={o.id} o={o} now={now} />)}
                </ul>
              )
            ) : (
              <div className="border-y border-border py-20 text-center">
                <p className="font-serif text-3xl font-bold text-foreground"><T zh="没有符合条件的免费情报" en="No free games match" /></p>
                <p className="mt-3 text-base text-fg-2"><T zh="换个关键词或平台试试，也可以看看下方的已结束归档。" en="Try another keyword or platform, or check the archive below." /></p>
              </div>
            )}
          </section>
        ) : (
          /* 默认视图：5 大分组清晰呈现 */
          <div className="space-y-16 md:space-y-20">
            {/* 1. 限时领取：进行中与已公布的下一期放在同一组大卡里（预告卡带「预告」标与开始倒计时），一行排满，不再各自留半行空白 */}
            {limitedOffers.length + upcomingOffers.length > 0 && (
              <Reveal as="section" aria-label="限时领取">
                <SectionHeading
                  title={<T zh="限时领取" en="Free to keep" />}
                  count={limitedOffers.length + upcomingOffers.length}
                  description={upcomingOffers.length ? <T zh="在截止前领取，永久保留在个人库中；标「预告」的是已公布的下一期。" en="Claim before the deadline and keep it forever. “Upcoming” marks the next announced giveaway." /> : <T zh="在截止日期前领取，永久保留在个人库中。" en="Claim before the deadline and keep it forever." />}
                />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[...limitedOffers, ...upcomingOffers.filter((u) => !limitedOffers.some((l) => l.id === u.id))].map((o) => <OfferHeroCard key={o.id} o={o} now={now} />)}
                </div>
              </Reveal>
            )}

            {limitedOffers.length + upcomingOffers.length === 0 && (
              <Reveal as="section" aria-label="限时领取">
                <SectionHeading title={<T zh="限时领取" en="Free to keep" />} count={0} />
                <p className="max-w-[44em] text-base leading-[1.8] text-fg-2">
                  <T zh="这一期的限时领取已经结束。Epic 一般在每周四晚上公布下一期，本站会随后更新；在那之前，可以先看看下面的长期免费游戏，或者去这些地方查看最新动态：" en="This round of giveaways has ended. Epic usually announces the next one on Thursday; until then, see the free-to-play games below or check these trackers:" />
                </p>
                <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                  {TRACKERS.map(([label, url]) => (
                    <ExtLink key={url} href={url} className="inline-flex min-h-11 items-center text-base text-foreground underline decoration-primary underline-offset-4 hover:text-primary">{label}</ExtLink>
                  ))}
                </p>
              </Reveal>
            )}

            {/* 2. 截止时间未公布的免费领取：紧凑列表行 */}
            {openEndedOffers.length > 0 && (
              <Reveal as="section" aria-label="免费领取（截止未公布）">
                <SectionHeading
                  title={<T zh="免费领取 · 截止未公布" en="Free to claim · no deadline given" />}
                  count={openEndedOffers.length}
                  description={<T zh="平台没有写明结束时间的赠送，多为独立游戏，随时可能下架，想要就早点领。" en="Giveaways without a stated end date, mostly indie games — they can end any time, so grab them early." />}
                />
                <ul className="divide-y divide-border">
                  {openEndedOffers.map((o) => <OfferRow key={o.id} o={o} now={now} />)}
                </ul>
              </Reveal>
            )}

            {/* 3. 永久免费：紧凑列表行 */}
            {permanentOffers.length > 0 && (
              <Reveal as="section" aria-label="永久免费">
                <SectionHeading
                  title={<T zh="永久免费" en="Free to play" />}
                  count={permanentOffers.length}
                  description={<T zh="随时可以加入并免费游玩，无需赶末班车。" en="Jump in any time and play for free." />}
                />
                <ul className="divide-y divide-border">
                  {permanentOffers.map((o) => <OfferRow key={o.id} o={o} now={now} />)}
                </ul>
              </Reveal>
            )}

            {/* 4. 免费试玩与周末：紧凑列表行 */}
            {trialWeekendOffers.length > 0 && (
              <Reveal as="section" aria-label="免费试玩与周末">
                <SectionHeading
                  title={<T zh="免费试玩与周末" en="Free trials & weekends" />}
                  count={trialWeekendOffers.length}
                  description={<T zh="先体验部分章节或在限定周末畅玩，再决定是否入手。" en="Try part of the game or play free for a weekend before you buy." />}
                />
                <ul className="divide-y divide-border">
                  {trialWeekendOffers.map((o) => <OfferRow key={o.id} o={o} now={now} />)}
                </ul>
              </Reveal>
            )}

            {/* 5. 开源游戏：紧凑列表行 */}
            {opensourceOffers.length > 0 && (
              <Reveal as="section" aria-label="开源游戏">
                <SectionHeading
                  title={<T zh="开源游戏" en="Open source" />}
                  count={opensourceOffers.length}
                  description={<T zh="完全开放代码与资产，社区驱动的纯粹创作。" en="Open code and assets, built by the community." />}
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
              <span className="font-serif text-2xl font-bold text-foreground"><T zh="已结束归档" en="Ended" /></span>
              <span className="flex items-center gap-3 font-mono text-sm text-fg-3">
                {ended.length} <T zh="款" en="games" />
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
              <T zh="雷达之外" en="More trackers" />
            </h2>
            <p className="mt-2.5 max-w-[36ch] text-base leading-relaxed text-fg-2">
              <T zh="站内每条记录都标注了核验日期。想追踪第一时间的即时变动，可以前往这些第三方情报源。" en="Every entry here shows when it was checked. For up-to-the-minute changes, see these trackers." />
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
