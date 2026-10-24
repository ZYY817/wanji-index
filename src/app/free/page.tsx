import { Suspense } from 'react';
import type { Metadata } from 'next';
import { loadData } from '@/lib/data.mjs';
import { offerVM, buildStamp } from '@/lib/present';
import { PageMastheadFrame } from '@/components/layout/page-masthead';
import { FreeCatalog } from '@/components/catalog/free-catalog';
import { zh } from '@/lib/labels.mjs';
import { cn, pad } from '@/lib/utils';
export const metadata: Metadata = { title: '免费游戏', description: '限时领取、永久免费、试玩、免费周末与开源游戏，按官方来源核验。', alternates: { canonical: '/free/' } };

const FREE_TYPES = ['limited', 'permanent', 'trial', 'weekend', 'opensource'] as const;

// 免费雷达小盘：同心圆 + 十字 + 扫掠线全部由发丝线构成；光点位置与平台读数均来自真实条目。
function Radar({ total, counts, platforms, className }: { total: number; counts: Record<string, number>; platforms: [string, number][]; className?: string }) {
  const max = Math.max(1, ...FREE_TYPES.map((t) => counts[t] ?? 0));
  const blips = FREE_TYPES.map((t, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    const r = 11 + ((counts[t] ?? 0) / max) * 29;
    return { t, left: 50 + Math.cos(angle) * r, top: 50 + Math.sin(angle) * r, count: counts[t] ?? 0, isMax: (counts[t] ?? 0) === max };
  });
  return (
    <div className={cn('w-[150px] md:w-[176px]', className)}>
      <div aria-hidden className="relative aspect-square">
        <span className="absolute inset-0 rounded-full border border-border" />
        <span className="absolute inset-[16%] rounded-full border border-border" />
        <span className="absolute inset-[32%] rounded-full border border-border" />
        <span className="absolute inset-y-0 left-1/2 w-px bg-border" />
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
        <span className="absolute left-1/2 top-1/2 h-px w-1/2 origin-left -translate-y-1/2 rotate-[-26deg] bg-primary/70" />
        <span className="absolute left-1/2 top-0 h-1.5 w-px -translate-x-1/2 bg-foreground/50" />
        <span className="absolute right-0 top-1/2 h-px w-1.5 -translate-y-1/2 bg-foreground/50" />
        <span className="absolute bottom-0 left-1/2 h-1.5 w-px -translate-x-1/2 bg-foreground/50" />
        <span className="absolute left-0 top-1/2 h-px w-1.5 -translate-y-1/2 bg-foreground/50" />
        {blips.map((b) => (
          <span key={b.t} className={cn('absolute size-[3px] -translate-x-1/2 -translate-y-1/2', b.isMax ? 'bg-primary' : 'bg-foreground/70')} style={{ left: `${b.left}%`, top: `${b.top}%` }} />
        ))}
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-[58px] place-items-center rounded-full border border-border bg-background text-center">
            <span>
              <span className="block font-mono text-xl leading-none tabular text-foreground md:text-2xl">{pad(total, 3)}</span>
              <span className="meta mt-1 block text-2xs text-fg-3">SIGNALS</span>
            </span>
          </span>
        </span>
      </div>
      <div className="mt-3 flex flex-wrap justify-between gap-x-3 gap-y-1 border-t border-border pt-2">
        {platforms.map(([p, c]) => (
          <span key={p} className="meta text-2xs text-fg-3">{zh('platform', p)} <span className="text-foreground">{pad(c, 2)}</span></span>
        ))}
      </div>
    </div>
  );
}

export default function FreePage() {
  const data = loadData(), now = Date.now();
  const offers = data.offers.map((o) => offerVM(o, data, now));
  const build = buildStamp(new Date(now));
  const counts = Object.fromEntries(FREE_TYPES.map((t) => [t, offers.filter((o) => o.type === t).length]));
  const platformCounts = [...new Set(offers.map((o) => o.platform))]
    .map((p) => [p, offers.filter((o) => o.platform === p).length] as [string, number])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  return <>
    <PageMastheadFrame no="02" en="FREE RADAR" crumbs={[['免费']]}>
      <div className="flex items-start justify-between gap-5 md:grid md:grid-cols-12 md:gap-8 md:pb-10 md:pt-11">
        <div className="min-w-0 pb-8 pt-8 md:col-span-8 md:py-0">
          <h1 className="display-m flex flex-wrap items-baseline gap-x-4 gap-y-1">
            免费
            <span className="font-mono text-2xs font-normal tracking-[0.14em] text-fg-3">雷达 / RADAR</span>
          </h1>
          <p className="mt-4 max-w-[52ch] text-base leading-[1.8] text-fg-2">值得玩的，不一定需要付费。领取、试玩与长期免费分开记录，时间和来源放在明处。</p>
          <p className="meta mt-6 max-w-[64ch] border-t border-border pt-3 text-2xs leading-[1.7] text-fg-3">
            最近构建 <span className="text-foreground">{build}</span> · 截止时间采用北京时间 · 活动以官方页面为准
          </p>
        </div>
        <div className="shrink-0 pt-8 md:col-span-4 md:flex md:justify-end md:py-0 md:pb-1">
          <Radar total={offers.length} counts={counts} platforms={platformCounts} className="w-[108px] md:w-[176px]" />
        </div>
      </div>
      <div className="pb-7 md:pb-9">
        <div className="meta flex items-baseline justify-between gap-4 border-t border-foreground/30 pt-2 text-2xs text-fg-3">
          <span className="text-foreground">TYPE LEDGER / 类型清点</span>
          <span>在册 {pad(offers.length, 3)} 条</span>
        </div>
        <dl className="mt-1 grid grid-cols-2 border-b border-border sm:grid-cols-6">
          {FREE_TYPES.map((t, i) => (
            <div key={t} className={cn('border-b border-border py-3 pr-4 odd:border-r sm:border-b-0 sm:border-r sm:pl-4', i === 0 && 'sm:pl-0')}>
              <dt className="meta text-2xs text-fg-3">{pad(i + 1, 2)} / {zh('freeType', t)}</dt>
              <dd className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-2xl leading-none tabular text-foreground md:text-3xl">{pad(counts[t], 2)}</span>
                <span className="meta text-2xs text-fg-3">条</span>
              </dd>
            </div>
          ))}
          <div className="py-3 sm:pl-4">
            <dt className="meta text-2xs text-fg-3">06 / 构建</dt>
            <dd className="mt-1 font-mono text-xs leading-none text-fg-2">{build}</dd>
          </div>
        </dl>
      </div>
    </PageMastheadFrame>
    <Suspense fallback={<p className="container-x py-16 text-fg-2">正在准备免费情报…</p>}><FreeCatalog offers={offers} /></Suspense>
  </>;
}
