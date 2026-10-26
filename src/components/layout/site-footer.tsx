import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { NAV } from '@/lib/nav';
import { SITE } from '@/lib/present';
import { BASE } from '@/lib/base';
import { FooterBackToTop } from './footer-back-to-top';
import { hang } from '@/components/ui/hang';

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-b border-border-strong pb-3 text-sm text-fg-3">{children}</h2>;
}

/**
 * 片尾：只有一个结尾，在中轴上。
 *   1. 结语 —— 一句原则 + 一段说明 + 回到顶部（居中）
 *   2. 导航与收录 —— 两列，与结语同宽、同中轴
 *   3. 字标 —— 低透明度的实色「玩机索引」，被页底裁切；下方一行版权信息
 */
export function SiteFooter({ stats, build }: { stats: { label: string; value: number }[]; build: string }) {
  const domain = SITE.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <footer className="relative overflow-hidden bg-shell">
      {/* 1 · 结语 */}
      <div className="container-x flex flex-col items-center pt-24 text-center md:pt-32">
        <p className="font-serif text-[clamp(34px,4.2vw,60px)] font-black leading-[1.12] tracking-[-0.045em]">
          {hang('PC 游戏资源，一处收齐。')}
          <br />
          <span className="text-foreground/45">{hang('全部免费。')}</span>
        </p>
        <p className="mt-7 max-w-[44ch] text-base leading-[1.85] text-fg-2">
          玩机索引为 PC 玩家收集游戏的获取渠道、免费情报、MOD 社区、实用工具与报错排查，全部免费查阅，随时更新。
        </p>
        <div className="mt-10">
          <FooterBackToTop />
        </div>
      </div>

      {/* 2 · 导航与收录 */}
      <div className="container-x mt-20 md:mt-24">
        <div className="mx-auto grid max-w-[880px] gap-x-16 gap-y-12 md:grid-cols-2">
          <nav aria-label="页脚导航">
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

          <div>
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
      </div>

      {/* 3 · 字标：实色、低透明度，被页底裁切 */}
      <div aria-hidden className="relative mt-20 h-[clamp(96px,13vw,240px)] select-none overflow-hidden md:mt-28">
        <span className="absolute inset-x-0 top-0 block whitespace-nowrap text-center font-serif text-[clamp(96px,20vw,360px)] font-black leading-[0.74] tracking-[-0.075em] text-foreground/[0.07]">
          玩机索引
        </span>
      </div>

      <div className="container-x">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-border py-5 text-sm text-fg-3">
          <span>© {build.slice(0, 4)} 玩机索引</span>
          <span>{domain}</span>
          <a href={`${BASE}/sitemap.xml`} className="underline-offset-4 transition-colors hover:text-foreground hover:underline">站点地图</a>
          <span>游戏美术版权归各自权利人所有</span>
        </div>
      </div>
    </footer>
  );
}
