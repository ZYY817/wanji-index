import { T } from '@/lib/i18n';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AUTHOR } from '@/lib/author';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { FeedbackChannels } from '@/components/layout/feedback';
import { SAFETY_TIPS } from '@/components/layout/safety-note';
import { loadData } from '@/lib/data.mjs';
import { buildStamp } from '@/lib/present';
import site from '../../../config/site.json';
import pkg from '../../../package.json';

export const metadata: Metadata = { title: '关于', description: `${site.name} 是什么、收录什么、怎么核验`, alternates: { canonical: '/about/' } };

const SECTIONS: [string, React.ReactNode, React.ReactNode][] = [
  ['intro', <T key="t" zh="为什么做这个索引" en="Why we built this" />, <T key="b" zh={<>
    <p>平时玩 PC 游戏，找个汉化补丁、查个存档目录或者找正规购买渠道，常常要翻好几个论坛，一不小心还会点进满是捆绑软件的流氓下载站。我们做 {site.name}，就是想把这些散落在各处的靠谱入口整理成一份份清晰透明的档案。</p>
    <p className="mt-3">去哪买划算、MOD 和汉化在哪下、闪退怎么排查，你都能直接找到指向原作者和正规社区的链接。每条收录都注明了出处和最近核验日期，方便你一眼看清能不能用。所有内容完全免费开放查阅。</p>
  </>} en={<>
    <p>Playing PC games often means digging through cluttered forums or dodging ad-heavy repack sites just to find a translation patch, save path, or mod. We built Wanji Index to pull all those reliable links together into clean, transparent dossiers.</p>
    <p className="mt-3">Where to buy, where to find verified mods, and how to fix launch crashes — all pointing straight to official stores and recognized communities, with clear sources and recent check dates. Free for every player to browse.</p>
  </>} />],
  ['standard', <T key="t" zh="我们怎么挑选和收录" en="How we pick sources" />, <T key="b" zh={<ul className="list-disc pl-5 space-y-2">
    <li>只收录广大玩家真正常用、且能长期稳定访问的官方渠道和知名社区。</li>
    <li>每一条记录都必须写清来源出处和核验日期，链接健康状况如实呈现，绝不藏着掖着。</li>
    <li>如果某项信息缺少来源证实或测试未通过，宁愿先标为「待核验」或暂不上线，也不让玩家踩坑。</li>
  </ul>} en={<ul className="list-disc pl-5 space-y-2">
    <li>We only list official channels and reputable communities that players actually rely on.</li>
    <li>Every entry clearly states its source and last-checked date, showing real health status upfront.</li>
    <li>If details are incomplete or unverified, they stay flagged or unpublished so no one wastes time on broken links.</li>
  </ul>} />],
  ['exclude', <T key="t" zh="我们的原则与底线" en="Our principles" />, <T key="b" zh={<ul className="list-disc pl-5 space-y-2">
    <li>不自建网盘分流任何游戏本体或盗版安装包，只做合规、安全的指路索引。</li>
    <li>不搞复杂的账号系统、发帖水区或任务打卡——你来这里就是为了迅速找到答案，解决完问题就回去痛快玩游戏。</li>
  </ul>} en={<ul className="list-disc pl-5 space-y-2">
    <li>We never host or re-distribute game files, repacks, or pirated installers — strictly clean pointers only.</li>
    <li>No accounts, no karma points, and no forum clutter. You come here to find what you need quickly and get straight back to playing.</li>
  </ul>} />],
  ['check', <T key="t" zh="时效与链接维护" en="Keeping links fresh" />, <T key="b" zh={<p>互联网上的链接常常变质或失效，因此我们给每条记录都打上了核验时间戳。系统会自动跟踪限时免费活动的截止期，对久未复查或失效的链接也会如实标记，避免大家白跑一趟。</p>} en={<p>Web links break and shift constantly, so every entry is timestamped. Free giveaways are automatically tracked by expiration date, and links are re-verified regularly so you never hit a dead end unexpectedly.</p>} />],
  ['safety', <T key="t" zh="下载与访问安全" en="Download & browsing safety" />, <T key="b" zh={<>
    <p>本站只做链接整理与分享：不提供任何游戏、补丁或软件的文件下载，所有入口都指向官方商店、开发者官网或公认的社区平台。第三方网站上的内容、广告和软件不由本站控制，也与本站无关。</p>
    <ul className="mt-3 list-disc space-y-2 pl-5">{SAFETY_TIPS.map(([zh]) => <li key={zh}>{zh}</li>)}</ul>
    <p className="mt-3">如果发现某个链接被劫持、跳转到可疑页面或下载到了捆绑软件，请通过下面的方式告诉我，我会尽快核实并处理。</p>
  </>} en={<>
    <p>We only collect and share links: no game, patch or software files are hosted here, and every link points to an official store, the developer’s own site or a recognised community platform. Third-party sites, their ads and their software are outside our control.</p>
    <ul className="mt-3 list-disc space-y-2 pl-5">{SAFETY_TIPS.map(([zh, en]) => <li key={zh}>{en}</li>)}</ul>
    <p className="mt-3">If a link looks hijacked, redirects somewhere suspicious or serves bundled software, please tell me below and I’ll check it quickly.</p>
  </>} />],
  ['legal', <T key="t" zh="免责与权利声明" en="Disclaimer & rights" />, <T key="b" zh={<p>本站是由玩家维护的非商业公益项目，与所收录的游戏厂商及平台没有任何隶属关系。相关商标与版权归各自权利方所有；链接健康状态仅反映核验时的网络可达性，请在访问第三方外部站点时自行注意安全。</p>} en={<p>A community-maintained, non-commercial project with no affiliation to the game publishers or platforms listed. Trademarks belong to their respective owners. Link status reflects reachability at verification time; please exercise standard caution on external sites.</p>} />],
  ['feedback', <T key="t" zh="纠错与建议" en="Feedback & corrections" />, <FeedbackChannels key="f" />],
];

// 关于：刊头（版本与收录）→ 六个两栏章节（是什么 / 收录标准 / 不收录 / 核验 / 声明 / 反馈）
export default function AboutPage() {
  const data = loadData();
  const build = buildStamp();
  const credits = (data.offers as any[]).filter((o) => o.art?.credit).map((o) => ({ id: o.id as string, title: o.gameTitle as string, ...(o.art.credit as { author?: string; license: string; source: string }) }));
  const facts: [React.ReactNode, React.ReactNode][] = [
    [<T key="v" zh="版本" en="Version" />, <T key="v2" zh={`${pkg.version}，最近构建 ${build}`} en={`${pkg.version}, built ${build}`} />],
    [<T key="c" zh="收录" en="In the index" />, <T key="c2" zh={`${data.games.length} 款游戏、${data.sites.length} 个资源站、${data.tools.length} 个工具、${data.problems.length} 个排障问题、${data.guides.length} 篇教程`} en={`${data.games.length} games, ${data.sites.length} sites, ${data.tools.length} tools, ${data.problems.length} fix pages, ${data.guides.length} guides`} />],
    [<T key="t" zh="技术" en="Built with" />, <>Next.js · React · Tailwind CSS · Motion</>],
    [<T key="f" zh="字体" en="Fonts" />, <>Source Han Sans · Geist</>],
    [<T key="a" zh="作者" en="Author" />, <Link key="a2" href="/author/" className="underline-offset-4 hover:underline">{AUTHOR.handle} ›</Link>],
  ];
  return (
    <>
      <IndexMasthead
        no="07"
        title={<T zh="关于" en="About" />}
        description={<T zh="把分散在各处的游戏实用信息整理成档案：来源交代清楚，状态明明白白，发现疏漏随时纠正。" en="Scattered PC gaming essentials organized into transparent files: verified sources, visible health, open to community corrections." />}
        aside={(
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {facts.map(([k, v], i) => (
              <div key={i} className="lift rounded-lg p-5">
                <dt className="text-sm text-fg-3">{k}</dt>
                <dd className="mt-2 text-[15px] leading-[1.6] text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      />
      <div className="container-x">
        {/* 两栏：标题在左（宽屏吸顶），正文在右——长文不再贴着左边、右侧大片留空 */}
        {SECTIONS.map(([id, title, body]) => (
          <section key={id} id={id} aria-labelledby={`${id}-title`} className="grid scroll-mt-[calc(var(--sticky-top)+32px)] gap-5 border-t border-white/[0.08] py-12 md:py-16 lg:grid-cols-12 lg:gap-10">
            <h2 id={`${id}-title`} className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] lg:sticky lg:top-[calc(var(--sticky-top)+32px)] lg:col-span-4 lg:self-start md:text-[32px]">{title}</h2>
            <div className="prose-doc max-w-[62ch] text-foreground/90 lg:col-span-8">{body}</div>
          </section>
        ))}

        {/* 图片署名：开源游戏的截图来自 Wikimedia Commons（CC BY-SA / GPL），按许可要求署名 */}
        {credits.length > 0 && (
          <section id="image-credits" aria-labelledby="image-credits-title" className="grid scroll-mt-[calc(var(--sticky-top)+32px)] gap-5 border-t border-white/[0.08] py-12 md:py-16 lg:grid-cols-12 lg:gap-10">
            <h2 id="image-credits-title" className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] md:text-[32px] lg:col-span-4"><T zh="图片署名" en="Image credits" /></h2>
            <div className="lg:col-span-8">
              <p className="max-w-[62ch] text-base leading-[1.75] text-fg-2"><T zh="游戏美术版权归各自权利方所有。以下开源游戏的截图来自 Wikimedia Commons，按其许可证署名：" en="Game art belongs to its respective owners. Screenshots of these open-source games come from Wikimedia Commons and are credited under their licenses:" /></p>
              <ul className="mt-5 divide-y divide-white/[0.06]">
                {credits.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3 text-sm">
                    <span className="font-medium text-foreground">{c.title}</span>
                    <a href={c.source} target="_blank" rel="noopener noreferrer" className="text-fg-2 underline-offset-4 hover:text-foreground hover:underline">{c.author} · {c.license}</a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
