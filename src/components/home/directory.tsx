import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { SiteVM } from '@/lib/present';
import { Monogram } from '@/components/ui/monogram';
import { SectionLabel } from '@/components/ui/section-label';
import { buttonVariants } from '@/components/ui/button';
import { Marquee } from '@/components/fx/marquee';
import { CountUp } from '@/components/fx/count-up';
import { RevealLines } from '@/components/fx/reveal-lines';
import { zh } from '@/lib/labels.mjs';
import { cn } from '@/lib/utils';

function Stamp({ s }: { s: SiteVM }) {
  return (
    <Link href={`/resources/${s.slug}/`} className="group flex h-[88px] shrink-0 items-center gap-4 border border-ink/15 bg-paper pl-3 pr-7 transition-colors hover:border-ink hover:bg-paper-2">
      <Monogram seed={s.id} name={s.name} size={64} tone="ink" className="rounded-none" />
      <span className="pr-2">
        <span className="block font-serif text-xl font-bold leading-tight text-ink">{s.name}</span>
        <span className="mt-1 block font-serif text-sm italic leading-none text-ink-3">{s.domain}</span>
      </span>
    </Link>
  );
}

// 第 5 章 · 资源站目录（纸面反白）：巨型计数 + 双向图章跑马灯 + 书后索引式目录
export function Directory({ sites, groups, counts }: {
  sites: SiteVM[]; groups: { category: string; label: string; sites: SiteVM[] }[]; counts: { sites: number; categories: number; entries: number };
}) {
  const half = Math.ceil(sites.length / 2);
  const rowA = sites.slice(0, half), rowB = sites.slice(half);
  return (
    <section aria-labelledby="dir-title" className="paper-texture relative overflow-hidden bg-paper py-24 text-ink md:py-36">
      <div className="container-x">
        <SectionLabel no="05" tone="paper" aside={`${counts.categories} 个分类`} className="mb-12">资源站目录 / Directory</SectionLabel>
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="flex items-end gap-5 font-serif font-black leading-[0.8] tracking-[-0.065em]">
              <CountUp value={counts.sites} pad={2} className="text-[clamp(132px,20vw,320px)]" />
              <span className="pb-[0.2em] font-serif text-[clamp(24px,2.6vw,40px)] font-bold tracking-[-0.03em]">个资源站</span>
            </p>
          </div>
          <div className="lg:col-span-5 lg:pb-4">
            <RevealLines as="h2" className="font-serif text-[clamp(30px,3.2vw,48px)] font-black leading-[1.1] tracking-[-0.035em]" lines={[<span key="a" id="dir-title">像一本书后的索引，</span>, <span key="b">按分类排好、可查可跳。</span>]} />
            <p className="mt-5 max-w-[46ch] font-serif text-base leading-[1.85] text-ink-2">
              商店、MOD 社区、技术百科、比价与数据库——每个站点都有字母图章、域名、用途与核验日期，并反查到 {counts.entries} 个游戏专区入口。
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 space-y-3 md:mt-24">
        <Marquee duration={28}>{rowA.map((s) => <Stamp key={s.id} s={s} />)}</Marquee>
        <Marquee duration={34} reverse>{(rowB.length ? rowB : rowA).map((s) => <Stamp key={s.id} s={s} />)}</Marquee>
      </div>

      <div className="container-x mt-20 md:mt-28">
        <div className="columns-1 gap-12 md:columns-2 xl:columns-3">
          {groups.map((g, gi) => (
            <section key={g.category} className="mb-14 break-inside-avoid" aria-label={g.label}>
              <header className="mb-4 flex items-baseline gap-4 border-b-2 border-ink pb-2.5">
                <span aria-hidden className="font-serif text-5xl font-black leading-[0.72] tracking-[-0.06em] text-ink/25">{String.fromCharCode(65 + gi)}</span>
                <h3 className="font-serif text-2xl font-black tracking-[-0.03em]">{g.label}</h3>
                <span className="ml-auto font-serif text-lg italic tabular-nums text-ink-3">{String(g.sites.length).padStart(2, '0')}</span>
              </header>
              <ul>
                {g.sites.map((s) => (
                  <li key={s.id}>
                    <Link href={`/resources/${s.slug}/`} className="group flex min-h-12 items-center gap-3 py-2 font-serif text-lg">
                      <Monogram seed={s.id} name={s.name} size={24} tone="ink" className="rounded-none" />
                      <span className="font-bold tracking-[-0.01em] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{s.name}</span>
                      <span aria-hidden className="leader" />
                      <span className="shrink-0 text-sm italic text-ink-3">{s.domain}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink/20 pt-6">
          <p className="font-serif text-sm italic tracking-[0.02em] text-ink-3">分类依据：{groups.map((g) => zh('siteCategory', g.category)).join(' · ')}</p>
          <Link href="/resources/" className={cn(buttonVariants({ variant: 'paper', size: 'lg' }))}>
            打开完整目录 <ArrowRight aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
