import Link from 'next/link';
import { NAV } from '@/lib/nav';
import { SITE } from '@/lib/present';
import { Marquee } from '@/components/fx/marquee';
import { BASE } from '@/lib/base';
import { FooterBackToTop } from './footer-back-to-top';

const PRINCIPLES: [string, string][] = [
  ['只整理', 'Curate'],
  ['只引导', 'Guide'],
  ['不托管任何文件', 'No files hosted'],
  ['只指向原始来源', 'Source first'],
];

function Eyebrow({ no, label, en }: { no: string; label: string; en: string }) {
  return (
    <div className="flex items-baseline gap-3 border-t border-border pt-3">
      <span className="meta text-2xs leading-none text-fg-3">{no}</span>
      <span className="meta text-2xs leading-none text-foreground">{label}</span>
      <span aria-hidden className="h-px flex-1 bg-border" />
      <span className="meta text-2xs leading-none text-fg-3">{en}</span>
    </div>
  );
}

// 片尾 / End Credits：原则声明、索引、数据戳按电影片尾排版；原则跑马灯 + 居中的 FIN + 被页底裁切的巨型字标
export function SiteFooter({ arts, stats, build }: { arts?: (string | null | undefined)[]; stats: { label: string; value: number }[]; build: string }) {
  const domain = SITE.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const artList = (arts ?? []).filter((u): u is string => Boolean(u)).slice(0, 3);
  const artLayers = artList.length
    ? [
        'linear-gradient(180deg, rgba(7,7,6,0.02) 0%, rgba(7,7,6,0.22) 44%, rgba(7,7,6,0.84) 100%)',
        ...artList.map((u) => `url(${u})`),
      ].join(', ')
    : null;
  const artSizes = artList.length
    ? ['100% 100%', ...artList.map(() => (artList.length === 1 ? '100% 100%' : '58% 100%'))].join(', ')
    : undefined;
  const artPositions = artList.length
    ? ['center', ...artList.map((_, i) => ['0% 38%', '50% 30%', '100% 44%'][i] ?? '50% 36%')].join(', ')
    : undefined;
  const artBlend = artList.length ? ['normal', ...artList.map(() => 'screen')].join(', ') : undefined;
  return (
    <footer className="relative overflow-hidden border-t border-border bg-shell">
      <div className="container-x">
        {/* 片尾字幕头：细线由 footer 的 border-t 承担，这里只放编号与 FIN. 对位 */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-6 md:pt-7">
          <p className="meta text-fg-3">
            <span className="text-foreground">Nº ∞</span> — 片尾 / Colophon
          </p>
          <p className="meta flex items-center gap-2.5 text-fg-3">
            卷终
            <span aria-hidden className="inline-block size-[7px] border border-fg-3" />
            <span className="text-foreground">END OF REEL</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 pb-12 pt-10 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-12 lg:pb-20 lg:pt-24">
          <div className="col-span-2 lg:col-span-6">
            <Eyebrow no="01" label="原则" en="Principles" />
            <p className="mt-6 font-serif text-[clamp(37px,4.6vw,66px)] font-black leading-[1.06] tracking-[-0.05em] md:mt-9">
              只整理，
              <br />
              只引导，
              <br />
              <span className="text-outline [--stroke-c:var(--color-fg-2)] [--stroke-w:1px]">不托管任何文件。</span>
            </p>
            <p className="mt-6 max-w-[47ch] text-sm leading-[1.9] text-fg-2 md:mt-9">
              玩机索引为中文 PC 玩家整理游戏的获取渠道、免费情报、MOD 社区、实用工具与报错排查，所有外链都指向官方商店、正版平台、公认社区或工具官网。我们不收录破解与盗版资源。
            </p>
            <div className="mt-7 hidden items-center gap-3 lg:flex">
              <span aria-hidden className="h-px w-8 bg-border-strong" />
              <span className="meta text-2xs leading-none text-fg-3">只指向原始来源 / Source first</span>
            </div>
          </div>

          <nav aria-label="页脚导航" className="lg:col-span-3 lg:col-start-7">
            <Eyebrow no="02" label="索引" en="Index" />
            <ul className="mt-4">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="group flex min-h-11 items-baseline gap-3 border-b border-border/60 py-2.5 md:min-h-9 md:py-2"
                  >
                    <span className="meta text-2xs leading-none text-fg-3 transition-colors group-hover:text-foreground">{n.no}</span>
                    <span className="text-sm text-fg-2 transition-colors group-hover:text-foreground">{n.label}</span>
                    <span aria-hidden className="leader" />
                    <span className="meta hidden text-2xs leading-none text-fg-3 sm:inline">{n.en}</span>
                    <span aria-hidden className="meta text-2xs leading-none text-fg-3 sm:hidden">→</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/about/"
                  className="group flex min-h-11 items-baseline gap-3 border-b border-border/60 py-2.5 md:min-h-9 md:py-2"
                >
                  <span className="meta text-2xs leading-none text-fg-3 transition-colors group-hover:text-foreground">07</span>
                  <span className="text-sm text-fg-2 transition-colors group-hover:text-foreground">关于与反馈</span>
                  <span aria-hidden className="leader" />
                  <span className="meta hidden text-2xs leading-none text-fg-3 sm:inline">Colophon</span>
                  <span aria-hidden className="meta text-2xs leading-none text-fg-3 sm:hidden">→</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3 lg:col-start-10">
            <Eyebrow no="03" label="数据戳" en="Data stamp" />
            <dl className="mt-4 font-mono text-xs tabular-nums">
              {stats.map((s) => (
                <div key={s.label} className="flex items-baseline gap-2 border-b border-border/60 py-2.5 text-fg-2">
                  <dt>{s.label}</dt>
                  <span aria-hidden className="leader" />
                  <dd className="text-foreground">{String(s.value).padStart(3, '0')}</dd>
                </div>
              ))}
              <div className="flex items-baseline gap-2 border-b border-border/60 py-2.5 text-fg-2">
                <dt>构建</dt>
                <span aria-hidden className="leader" />
                <dd className="text-foreground">{build}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="container-x">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border py-5">
          <span className="meta text-fg-3">© {build.slice(0, 4)} 玩机索引</span>
          <span className="meta text-fg-3">{domain}</span>
          <span className="meta text-fg-3">构建 {build}</span>
          <a href={`${BASE}/sitemap.xml`} className="meta text-fg-3 underline-offset-4 transition-colors hover:text-foreground hover:underline">
            Sitemap
          </a>
          <span className="hidden flex-1 sm:block" />
          <span className="meta text-fg-3">游戏美术版权归各自权利人所有</span>
        </div>
      </div>

      {/* 原则跑马灯：反向慢速，reduced-motion 下由 .marquee-track 规则静止 */}
      <div className="mt-12 md:mt-24">
        <div className="border-y border-border">
          <div className="flex items-stretch">
            <div className="hidden shrink-0 items-center gap-3 border-r border-border px-4 md:flex xl:px-6">
              <span className="meta text-2xs leading-none text-fg-3">原则 / Principles</span>
              <span aria-hidden className="h-3 w-px bg-border-strong" />
              <span className="meta text-2xs leading-none text-fg-3">∞</span>
            </div>
            <p className="sr-only">站点原则：只整理，只引导，不托管任何文件，只指向原始来源。</p>
            <div aria-hidden className="relative min-w-0 flex-1 overflow-hidden">
              <Marquee reverse duration={45} gap={32} className="py-5 md:py-6">
                {Array.from({ length: 4 }).flatMap((_, round) =>
                  PRINCIPLES.map(([zh, en]) => (
                    <span key={`${round}-${zh}`} className="flex items-center gap-3 whitespace-nowrap">
                      <span className="font-serif text-lg font-semibold tracking-[0.04em] text-fg-2 md:text-lg">{zh}</span>
                      <span className="meta text-2xs leading-none text-fg-3">{en}</span>
                      <span aria-hidden className="ml-4 h-3 w-px bg-border-strong" />
                    </span>
                  )),
                )}
              </Marquee>
              <span className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-shell via-shell/95 to-transparent md:w-40" />
              <span className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-shell via-shell/95 to-transparent md:w-40" />
            </div>
          </div>
        </div>
      </div>

      {/* FIN 收尾：居中巨型 FIN，替代角落小字 */}
      <div className="container-x">
        <div className="relative flex flex-col items-center border-t border-border py-16 text-center md:py-24">
          <span className="meta flex items-center gap-3 text-2xs text-fg-3">
            <span aria-hidden className="h-px w-8 bg-border-strong" />
            放映结束 / END OF REEL · Nº ∞
            <span aria-hidden className="h-px w-8 bg-border-strong" />
          </span>
          <p aria-hidden className="mt-6 font-serif text-[clamp(88px,10.5vw,164px)] font-black leading-[0.78] tracking-[-0.065em]">
            FIN<span className="text-primary">.</span>
          </p>
          <p className="mt-7 max-w-[30ch] font-serif text-[clamp(19px,2.1vw,28px)] font-bold leading-[1.4] tracking-[-0.025em] text-fg-2">
            放映结束。<span className="text-foreground">下一场，从开映开始。</span>
          </p>
          <div className="mt-9 flex w-full max-w-[720px] flex-col items-center justify-between gap-4 border-t border-border pt-5 sm:flex-row">
            <span className="meta text-2xs text-fg-3">FIG. ∞ — 玩机索引 / Wordmark</span>
            <FooterBackToTop />
          </div>
        </div>
      </div>

      {/* 巨型字标：三张游戏美术多重背景 + 描边套印，被页底裁切 */}
      <div aria-hidden className="relative h-[clamp(120px,14.4vw,260px)] select-none overflow-hidden">
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <span
            className="block translate-y-[0.015em] whitespace-nowrap bg-clip-text pr-[0.06em] font-serif text-[clamp(96px,20vw,220px)] font-black leading-[0.74] tracking-[-0.075em] text-transparent md:text-[clamp(160px,20vw,360px)]"
            style={{
              backgroundImage: artLayers ?? 'linear-gradient(155deg,#26261f 0%,#141412 58%,#1d1d19 100%)',
              backgroundSize: artSizes,
              backgroundPosition: artPositions,
              backgroundBlendMode: artBlend,
              filter: 'saturate(0.82) contrast(1.08)',
            }}
          >
            玩机索引
          </span>
        </div>
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <span className="block translate-x-[0.045em] translate-y-[0.04em] whitespace-nowrap pr-[0.06em] font-serif text-[clamp(96px,20vw,220px)] font-black leading-[0.74] tracking-[-0.075em] text-outline [--stroke-c:rgba(237,235,229,0.3)] [--stroke-w:1px] md:text-[clamp(160px,20vw,360px)]">
            玩机索引
          </span>
        </div>
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-shell to-transparent" />
      </div>
    </footer>
  );
}
