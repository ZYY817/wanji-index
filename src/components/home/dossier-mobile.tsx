'use client';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import type { DossierVM } from '@/lib/home-data';
import { DossierPlate, DOSSIER_STEPS, StepContent, stepCount, stepTotal } from '@/components/home/dossier-parts';
import { genreZh } from '@/lib/genre';
import { zh } from '@/lib/labels.mjs';
import { pad } from '@/lib/utils';

// 第 3 章 · 移动端：强编辑式堆叠。全出血 16:9 美术 → 标题 → 五条可展开的档案行。
// 五个 <details> 默认全部 open：无 JS 也读得到全部真实内容；点击标题才收起。
export function DossierMobile({ d }: { d: DossierVM }) {
  const g = d.game;
  return (
    <div className="relative overflow-x-clip bg-background xl:hidden">
      {/* 全出血 16:9 美术板；顶上留出固定顶栏高度，片头字幕不被压住 */}
      <div className="pt-[var(--header-h)]">
        <DossierPlate d={d} />
      </div>

      <div className="container-x pb-20 pt-7 md:pb-28 md:pt-9">
        <div className="meta flex items-center gap-3 text-2xs text-fg-3">
          <span className="shrink-0 text-foreground">Nº 03</span>
          <span aria-hidden className="h-px w-6 shrink-0 bg-current opacity-60" />
          <span className="shrink-0">档案 / Dossier</span>
          <span aria-hidden className="h-px flex-1 bg-current opacity-30" />
          <span className="shrink-0">{pad(stepTotal(d))} 项</span>
        </div>

        <h2 className="mt-5 font-serif text-[clamp(38px,10.4vw,56px)] font-black leading-[1.04] tracking-[-0.045em]">
          <span className="block">一个游戏，</span>
          <span className="block">一份档案。</span>
        </h2>

        <p className="mt-4 max-w-[46ch] text-base leading-[1.75] text-fg-2">
          每份档案按同一顺序回答玩家最常问的五件事。下面是一份真实档案——{g.name}。
        </p>

        <div className="meta mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-3 text-2xs text-fg-3">
          <span className="text-foreground">档案 Nº {g.art?.appid ?? '—'}</span>
          <span>{g.genres.map(genreZh).join(' · ')}</span>
          <span>{g.os.map((o) => zh('os', o)).join(' / ')}</span>
          <span className="sm:ml-auto">核验 {g.checkedAt}</span>
        </div>

        <ol className="border-t border-border-strong">
          {DOSSIER_STEPS.map((s, i) => (
            <li key={s.no}>
              <details open className="group border-b border-border">
                <summary className="flex min-h-[64px] cursor-pointer list-none items-center gap-3 py-3 [&::-webkit-details-marker]:hidden">
                  <span className="meta w-6 shrink-0 text-2xs text-fg-3">{s.no}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                      <span className="font-serif text-2xl font-bold leading-[1.05] tracking-[-0.025em]">{s.title}</span>
                      <span className="meta text-2xs text-fg-3">{s.en}</span>
                    </span>
                  </span>
                  <span className="meta shrink-0 tabular text-2xs text-fg-3">{pad(stepCount(d, i))}</span>
                  <Plus aria-hidden className="size-4 shrink-0 text-fg-3 transition-transform duration-300 group-open:rotate-45" />
                </summary>
                <div className="hidden pb-6 pl-9 pr-1 group-open:block">
                  <p className="mb-3 max-w-[42ch] text-xs leading-[1.65] text-fg-3">{s.desc}</p>
                  <StepContent d={d} index={i} mode="stack" />
                </div>
              </details>
            </li>
          ))}
        </ol>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <span className="meta text-2xs text-fg-3">FIG.03 — 真实数据，非示意</span>
          <Link
            href={`/games/${g.slug}/`}
            className="group inline-flex min-h-11 items-center gap-2 border-b border-primary/70 text-base text-foreground hover:text-primary"
          >
            打开{g.name}完整档案
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
