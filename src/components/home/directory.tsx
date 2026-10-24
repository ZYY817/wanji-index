import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { SiteVM } from '@/lib/present';
import { Monogram } from '@/components/ui/monogram';
import { SectionLabel } from '@/components/ui/section-label';
import { buttonVariants } from '@/components/ui/button';
import { Marquee } from '@/components/fx/marquee';
import { CountUp } from '@/components/fx/count-up';
import { RevealLines } from '@/components/fx/reveal-lines';
import { Reveal } from '@/components/fx/reveal';
import { STAGGER } from '@/components/fx/tokens';
import { cn } from '@/lib/utils';

function Stamp({ s }: { s: SiteVM }) {
  return (
    <Link href={`/resources/${s.slug}/`} className="group flex h-[88px] shrink-0 items-center gap-4 border border-ink/15 bg-paper pl-3 pr-7 transition-colors hover:border-ink hover:bg-paper-2">
      <Monogram seed={s.id} name={s.name} size={64} tone="ink" className="rounded-none" />
      <span className="pr-2">
        <span className="block font-serif text-xl font-bold leading-tight text-ink">{s.name}</span>
        <span className="mt-1.5 block font-mono text-xs leading-none text-ink-3">{s.domain}</span>
      </span>
    </Link>
  );
}

// 第 5 章 · 资源站目录（纸面反白，全站唯一的亮色章节）：巨型计数 → 一行图章跑马灯 → 书后索引式目录（分组逐个浮现）
export function Directory({ sites, groups, counts }: {
  sites: SiteVM[]; groups: { category: string; label: string; sites: SiteVM[] }[]; counts: { sites: number; categories: number; entries: number };
}) {
  return (
    <section aria-labelledby="dir-title" className="paper-texture relative overflow-hidden bg-paper py-24 text-ink md:py-36">
      <div className="container-x">
        <SectionLabel no="05" tone="paper" aside={`${counts.categories} 个分类`} className="mb-12">资源站目录</SectionLabel>
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="flex items-end gap-5 font-serif font-black leading-[0.8] tracking-[-0.065em]">
              <CountUp value={counts.sites} pad={2} className="text-[clamp(132px,20vw,320px)]" />
              <span className="pb-[0.2em] font-serif text-[clamp(24px,2.6vw,40px)] font-bold tracking-[-0.03em]">个资源站</span>
            </p>
          </div>
          <div className="lg:col-span-5 lg:pb-4">
            <RevealLines as="h2" className="font-serif text-[clamp(30px,3.2vw,48px)] font-black leading-[1.1] tracking-[-0.035em]" lines={[<span key="a" id="dir-title">像一本书后的索引，</span>, <span key="b">按分类排好、可查可跳。</span>]} />
            <p className="mt-5 max-w-[42ch] text-base leading-[1.85] text-ink-2">
              商店、MOD 社区、攻略百科、比价与数据库。每个站点写明用途与核验日期，并能反查到 {counts.entries} 个游戏专区入口。
            </p>
          </div>
        </div>
      </div>

      {/* 一行图章跑马灯：全部站点按字母图章流过，悬停暂停 */}
      <div className="mt-16 md:mt-24">
        <Marquee duration={48}>{sites.map((s) => <Stamp key={s.id} s={s} />)}</Marquee>
      </div>

      <div className="container-x mt-20 md:mt-28">
        <div className="columns-1 gap-12 md:columns-2 xl:columns-3">
          {groups.map((g, gi) => (
            <Reveal as="section" key={g.category} delay={gi * STAGGER} className="mb-14 break-inside-avoid" aria-label={g.label}>
              <header className="mb-4 flex items-baseline gap-4 border-b-2 border-ink pb-2.5">
                <span aria-hidden className="font-serif text-4xl font-black leading-[0.72] tracking-[-0.06em] text-ink/20">{String.fromCharCode(65 + gi)}</span>
                <h3 className="font-serif text-2xl font-black tracking-[-0.03em]">{g.label}</h3>
                <span className="ml-auto text-sm tabular-nums text-ink-3">{g.sites.length} 个</span>
              </header>
              <ul>
                {g.sites.map((s) => (
                  <li key={s.id}>
                    <Link href={`/resources/${s.slug}/`} className="group flex min-h-12 items-center gap-3 py-2 font-serif text-lg">
                      <Monogram seed={s.id} name={s.name} size={24} tone="ink" className="rounded-none" />
                      <span className="font-bold tracking-[-0.01em] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{s.name}</span>
                      <span aria-hidden className="leader" />
                      <span className="shrink-0 font-mono text-xs text-ink-3">{s.domain}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        <div className="mt-6 flex justify-end border-t border-ink/20 pt-6">
          <Link href="/resources/" className={cn(buttonVariants({ variant: 'paper', size: 'lg' }))}>
            打开完整目录 <ArrowRight aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
