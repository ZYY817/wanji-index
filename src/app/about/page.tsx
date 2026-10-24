import type { Metadata } from 'next';
import { PageMastheadFrame } from '@/components/layout/page-masthead';
import { FeedbackChannels } from '@/components/layout/feedback';
import { SectionHeading } from '@/components/ui/section-label';
import { loadData } from '@/lib/data.mjs';
import { buildStamp } from '@/lib/present';
import { pad } from '@/lib/utils';
import site from '../../../config/site.json';
import pkg from '../../../package.json';

export const metadata: Metadata = { title: '关于', description: `${site.name} 是什么、收录什么、不收录什么`, alternates: { canonical: '/about/' } };

const SECTIONS: [string, string, React.ReactNode][] = [
  ['intro', '这是什么', <>
    <p>{site.name} 是一个面向中文 PC 玩家的<strong>资源与工具索引</strong>：游戏档案、免费情报、MOD/汉化资源站、实用工具、报错排查教程。</p>
    <p className="mt-3">它只整理<strong>可信来源入口</strong>——每条记录标注来源与核验日期，链接只指向官方或可信原始页面。</p>
  </>],
  ['standard', '收录标准', <ul className="list-disc pl-5 space-y-2">
    <li>只收录<strong>官方渠道</strong>或社区公认的可信站点</li>
    <li>每条记录必须有来源与核验日期；核验状态如实标注</li>
    <li>信息不足的内容保持「待核验」或直接不上线</li>
  </ul>],
  ['exclude', '不收录什么', <ul className="list-disc pl-5 space-y-2">
    <li>不托管、不提供任何游戏文件/安装包下载</li>
    <li>不收录破解、盗版、私服相关资源</li>
    <li>不做账号、社区、评论功能——这是索引，不是论坛</li>
  </ul>],
  ['check', '核验方式', <p>每条记录带「核验于」日期；超期未复查标注「久未核验」。链接状态分正常/疑似失效/已失效。免费活动状态由系统按日期自动判定。</p>],
  ['legal', '声明', <p>本站为个人维护的非商业项目，与收录的厂商、站点无隶属关系。商标归各自权利方。链接健康状态仅表示上次核验时可达，不构成安全承诺。</p>],
  ['feedback', '反馈', <FeedbackChannels />],
];

export default function AboutPage() {
  const data = loadData();
  const build = buildStamp();
  const colophon: [string, React.ReactNode][] = [
    ['版本 / EDITION', <>{pkg.version} · 初版 {build}</>],
    ['字体 / TYPEFACES', <>Noto Serif SC Variable / Geist Sans / Geist Mono</>],
    ['技术 / STACK', <>Next.js 16 · React 19 · Tailwind CSS v4 · Motion</>],
    ['收录 / HOLDINGS', <>{pad(data.games.length, 3)} 游戏 · {pad(data.sites.length, 3)} 资源站 · {pad(data.tools.length, 3)} 工具 · {pad(data.guides.length, 3)} 教程</>],
    ['原则 / PRINCIPLES', <>只指向官方与可信原始来源；不托管任何游戏文件。</>],
    ['维护 / MAINTAINED', <>个人非商业项目；与收录厂商、站点无隶属关系。</>],
  ];
  return <>
    <PageMastheadFrame no="07" en="COLOPHON & PRINCIPLES" crumbs={[['关于']]}>
      <div className="pb-9 pt-8 md:pb-12 md:pt-11">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h1 className="display-m">关于</h1>
          <p className="meta text-2xs text-fg-3">COLOPHON / BUILD {build}</p>
        </div>
        <p className="mt-4 max-w-[56ch] text-base leading-[1.8] text-fg-2">把分散的入口整理成档案。来源可追溯，状态可辨认，信息可纠正。</p>
        <dl className="mt-7 grid grid-cols-2 border-l border-t border-border lg:grid-cols-3">
          {colophon.map(([k, v]) => (
            <div key={k} className="border-b border-r border-border p-3 md:p-4">
              <dt className="meta text-2xs text-fg-3">{k}</dt>
              <dd className="mt-2 text-xs leading-[1.7] text-fg-2">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </PageMastheadFrame>
    <div className="container-x grid gap-12 py-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-20 lg:py-16">
      <nav aria-label="关于页目录" className="flex flex-wrap gap-x-6 lg:sticky lg:top-[calc(var(--header-h)+28px)] lg:flex-col lg:self-start">{SECTIONS.map(([id, title], i) => <a key={id} href={`#${id}`} className="flex min-h-12 items-center gap-4 border-b border-border text-sm text-fg-2 hover:text-foreground"><span className="font-mono text-xs text-fg-3">{String(i + 1).padStart(2, '0')}</span>{title}</a>)}</nav>
      <div className="max-w-3xl">{SECTIONS.map(([id, title, body], i) => <section key={id} id={id} className="mb-14 scroll-mt-28"><SectionHeading no={String(i + 1).padStart(2, '0')} title={title} /><div className="prose-doc text-fg-2">{body}</div></section>)}</div>
    </div>
  </>;
}
