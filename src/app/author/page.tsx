import { T } from '@/lib/i18n';
import type { Metadata } from 'next';
import { ArrowUpRight, Coffee } from 'lucide-react';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { GithubMark } from '@/components/kit/github-mark';
import { PLATFORM_PATHS } from '@/components/ui/platform-icons';
import { AUTHOR } from '@/lib/author';
import { withBase } from '@/lib/base';
import { loadData } from '@/lib/data.mjs';

export const metadata: Metadata = {
  title: '作者',
  description: '玩机索引的作者：B 站主页、GitHub，以及想收录更多游戏时怎么联系。',
  alternates: { canonical: '/author/' },
};

function BilibiliMark({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" className={className}><path d={PLATFORM_PATHS.bilibili} /></svg>;
}

/** 一块联系方式卡：图标 + 名称 + 一句用途 + 地址 */
function LinkCard({ href, icon, title, desc, url }: { href: string; icon: React.ReactNode; title: React.ReactNode; desc: React.ReactNode; url: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="lift group flex h-full flex-col rounded-lg p-6 transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#161618] md:p-7">
      <span className="flex items-start justify-between gap-4">
        <span className="grid size-12 place-items-center rounded-[14px] bg-white/[0.08] text-foreground [&_svg]:size-6">{icon}</span>
        <ArrowUpRight aria-hidden className="size-5 text-fg-3 transition-[transform,color] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </span>
      <span className="mt-6 font-display text-2xl font-semibold tracking-[-0.015em]">{title}</span>
      <span className="mt-2 text-base leading-[1.7] text-fg-2">{desc}</span>
      <span className="tabular mt-auto pt-6 text-sm text-fg-3">{url.replace(/^https:\/\//, '')}</span>
      <span className="sr-only"><T zh="（在新窗口打开）" en="(opens in a new window)" /></span>
    </a>
  );
}

/** 左标题、右内容的两栏章节（与关于页同一版式） */
function Section({ id, title, children }: { id: string; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="grid scroll-mt-[calc(var(--sticky-top)+32px)] gap-6 border-t border-white/[0.08] py-12 md:py-16 lg:grid-cols-12 lg:gap-10">
      <h2 id={`${id}-title`} className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] md:text-[32px] lg:col-span-4">{title}</h2>
      <div className="min-w-0 lg:col-span-8">{children}</div>
    </section>
  );
}

// 作者页：联系方式 → 想收录更多游戏 → 请作者喝杯咖啡
export default function AuthorPage() {
  const games = loadData().games.length;
  return (
    <>
      <IndexMasthead
        title={<T zh="作者" en="Author" />}
        description={<T
          zh={<>玩机索引由 {AUTHOR.handle} 一个人独立设计、开发和维护，是一个仍在持续更新的个人作品。视频、动态和其他项目都在下面这两个地方。</>}
          en={<>Wanji Index is designed, built and maintained by {AUTHOR.handle} alone — a personal project that keeps growing. Videos, updates and other projects live at the two places below.</>}
        />}
        aside={(
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <LinkCard
              href={AUTHOR.bilibili}
              icon={<BilibiliMark />}
              title={<T zh="哔哩哔哩" en="Bilibili" />}
              desc={<T zh="视频与动态。想收录某款游戏、发现信息有误，都可以直接私信我。" en="Videos and updates. Message me there to request a game or report a mistake." />}
              url={AUTHOR.bilibili}
            />
            <LinkCard
              href={AUTHOR.github}
              icon={<GithubMark />}
              title="GitHub"
              desc={<T zh="代码与其他项目，包括本站配套的装机工具 wanji-kit。" en="Code and other projects, including the companion runtime installer wanji-kit." />}
              url={AUTHOR.github}
            />
          </div>
        )}
      />

      <div className="container-x pb-8">
        <Section id="more-games" title={<T zh="想收录更多游戏？" en="Want more games?" />}>
          <div className="prose-doc max-w-[62ch] text-foreground/90 [&_p+p]:mt-4">
            <T
              zh={<>
                <p>目前的 {games} 款游戏，是按热度和资料完整度挑出来的一部分：每一款都要找到正规渠道、存档位置和可信的 MOD 与排障来源，才会收录。所以数量不追求大而全，而是保证点进去的每一页都有用。</p>
                <p>如果你常玩的游戏还没有，或者希望某款游戏补充内容，欢迎在 B 站私信告诉我游戏名，我会优先补上。</p>
              </>}
              en={<>
                <p>The current {games} games were picked by popularity and how complete their information is: each needs official stores, save locations and trustworthy mod and fix sources before it is added. The goal isn’t size — it’s making every page worth opening.</p>
                <p>If a game you play is missing, or you’d like more detail on one, send me its name on Bilibili and I’ll prioritise it.</p>
              </>}
            />
          </div>
          <a href={AUTHOR.bilibili} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-cta px-6 text-[15px] font-medium text-cta-foreground transition-[background-color,transform] hover:bg-cta-hover active:scale-[0.97]">
            <BilibiliMark className="size-[1.1em]" />
            <T zh="去 B 站私信" en="Message on Bilibili" />
          </a>
        </Section>

        <Section id="coffee" title={<T zh="请作者喝杯咖啡" en="Buy me a coffee" />}>
          <p className="max-w-[62ch] text-[17px] leading-[1.75] text-foreground/90">
            <T
              zh="网站完全免费，没有广告，也不需要注册。如果它帮你省了时间，可以请我喝杯咖啡——这会让我更有动力继续更新。完全自愿，不赞赏也一样能用全部功能。"
              en="The site is free, ad-free and needs no account. If it saved you some time, you can buy me a coffee — it keeps the updates coming. Entirely optional; everything works the same either way."
            />
          </p>
          <div className="mt-8 grid max-w-[560px] grid-cols-2 gap-4">
            {AUTHOR.tips.map((t) => (
              <figure key={t.id} className="overflow-hidden rounded-lg bg-white p-3 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
                <img src={withBase(t.src)} width={t.w} height={t.h} alt={`${t.zh}赞赏码 / ${t.en} QR code`} loading="lazy" decoding="async" className="aspect-square w-full rounded-[10px] object-contain" />
                <figcaption className="flex items-center justify-center gap-1.5 pb-1 pt-3 text-sm font-medium text-ink">
                  <Coffee aria-hidden className="size-4 text-ink-3" />
                  <T zh={t.zh} en={t.en} />
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
