import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { NAV } from '@/lib/nav';
import { SITE } from '@/lib/present';
import { BASE } from '@/lib/base';
import { FooterBackToTop } from './footer-back-to-top';

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-b border-border-strong pb-3 text-sm text-fg-3">{children}</h2>;
}

/**
 * 片尾：三段式，每段只说一件事。
 *   1. 信息区 —— 原则（是什么、不做什么）/ 站内导航 / 收录数据
 *   2. 收尾 —— FIN 与「回到顶部」
 *   3. 字标 —— 用游戏美术填充、被页底裁切的「玩机索引」，下方一行版权信息
 */
export function SiteFooter({ arts, stats, build }: { arts?: (string | null | undefined)[]; stats: { label: string; value: number }[]; build: string }) {
  const domain = SITE.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const artList = (arts ?? []).filter((u): u is string => Boolean(u)).slice(0, 3);
  const artLayers = artList.length
    ? ['linear-gradient(180deg, rgba(12,11,10,0.02) 0%, rgba(12,11,10,0.22) 44%, rgba(12,11,10,0.84) 100%)', ...artList.map((u) => `url(${u})`)].join(', ')
    : null;
  const artSizes = artList.length ? ['100% 100%', ...artList.map(() => (artList.length === 1 ? '100% 100%' : '58% 100%'))].join(', ') : undefined;
  const artPositions = artList.length ? ['center', ...artList.map((_, i) => ['0% 38%', '50% 30%', '100% 44%'][i] ?? '50% 36%')].join(', ') : undefined;
  const artBlend = artList.length ? ['normal', ...artList.map(() => 'screen')].join(', ') : undefined;
  const wordmark = 'block whitespace-nowrap pr-[0.06em] font-serif text-[clamp(96px,20vw,220px)] font-black leading-[0.74] tracking-[-0.075em] md:text-[clamp(160px,20vw,360px)]';

  return (
    <footer className="relative overflow-hidden border-t border-border bg-shell">
      {/* 1 · 信息区 */}
      <div className="container-x grid gap-x-8 gap-y-12 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="font-serif text-[clamp(34px,4.2vw,60px)] font-black leading-[1.08] tracking-[-0.045em]">
            只整理，只引导，
            <br />
            <span className="text-outline [--stroke-c:var(--color-fg-2)] [--stroke-w:1px]">不托管任何文件。</span>
          </p>
          <p className="mt-7 max-w-[46ch] text-base leading-[1.85] text-fg-2">
            玩机索引为中文 PC 玩家整理游戏的获取渠道、免费情报、MOD 社区、实用工具与报错排查。所有外链都指向官方商店、正版平台、公认社区或工具官网，不收录破解与盗版资源。
          </p>
        </div>

        <nav aria-label="页脚导航" className="lg:col-span-3 lg:col-start-7">
          <ColumnTitle>浏览</ColumnTitle>
          <ul>
            {[...NAV, { href: '/about/', label: '关于与反馈' }].map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="group flex min-h-11 items-center justify-between border-b border-border/60 text-base text-fg-2 transition-colors hover:text-foreground">
                  {n.label}
                  <ArrowRight aria-hidden className="size-4 text-fg-3 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3 lg:col-start-10">
          <ColumnTitle>收录</ColumnTitle>
          <dl>
            {stats.map((s) => (
              <div key={s.label} className="flex min-h-11 items-center justify-between border-b border-border/60 text-base">
                <dt className="text-fg-2">{s.label}</dt>
                <dd className="font-mono tabular-nums text-foreground">{s.value}</dd>
              </div>
            ))}
            <div className="flex min-h-11 items-center justify-between border-b border-border/60 text-base">
              <dt className="text-fg-2">最近更新</dt>
              <dd className="font-mono text-sm tabular-nums text-foreground">{build}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* 2 · 收尾 */}
      <div className="container-x">
        <div className="flex flex-col items-center border-t border-border py-16 text-center md:py-20">
          <p aria-hidden className="font-serif text-[clamp(72px,8vw,128px)] font-black leading-[0.8] tracking-[-0.065em]">
            FIN<span className="text-primary">.</span>
          </p>
          <p className="mt-6 font-serif text-[clamp(18px,1.8vw,24px)] font-bold tracking-[-0.02em] text-fg-2">
            放映结束。<span className="text-foreground">下一场，从开映开始。</span>
          </p>
          <div className="mt-8">
            <FooterBackToTop />
          </div>
        </div>
      </div>

      {/* 3 · 字标：游戏美术填充 + 描边套印，被页底裁切 */}
      <div aria-hidden className="relative h-[clamp(120px,14.4vw,260px)] select-none overflow-hidden">
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <span
            className={`${wordmark} translate-y-[0.015em] bg-clip-text text-transparent`}
            style={{
              backgroundImage: artLayers ?? 'linear-gradient(155deg,#2B2926 0%,#1A1917 58%,#22201D 100%)',
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
          <span className={`${wordmark} translate-x-[0.045em] translate-y-[0.04em] text-outline [--stroke-c:rgba(237,235,229,0.3)] [--stroke-w:1px]`}>
            玩机索引
          </span>
        </div>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-shell to-transparent" />
      </div>

      <div className="container-x">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border py-5 text-sm text-fg-3">
          <span>© {build.slice(0, 4)} 玩机索引</span>
          <span>{domain}</span>
          <a href={`${BASE}/sitemap.xml`} className="underline-offset-4 transition-colors hover:text-foreground hover:underline">站点地图</a>
          <span className="sm:ml-auto">游戏美术版权归各自权利人所有</span>
        </div>
      </div>
    </footer>
  );
}
