import { T } from '@/lib/i18n';
import type { Metadata } from 'next';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { FeedbackChannels } from '@/components/layout/feedback';
import { DetailSection } from '@/components/layout/detail-section';
import { loadData } from '@/lib/data.mjs';
import { buildStamp } from '@/lib/present';
import site from '../../../config/site.json';
import pkg from '../../../package.json';

export const metadata: Metadata = { title: '关于', description: `${site.name} 是什么、收录什么、怎么核验`, alternates: { canonical: '/about/' } };

const SECTIONS: [string, React.ReactNode, React.ReactNode][] = [
  ['intro', <T key="t" zh="这是什么" en="What this is" />, <T key="b" zh={<>
    <p>{site.name} 是一个为 PC 玩家收集游戏资源的<strong>免费资源站</strong>：游戏档案、免费情报、MOD/汉化资源站、实用工具、报错排查教程。</p>
    <p className="mt-3">它把分散在各处的入口<strong>收集到一起</strong>——每条记录标注来源与核验日期，方便判断是否还能用。全部免费查阅。</p>
  </>} en={<>
    <p>Wanji Index is a <strong>free resource site for PC players</strong>: game files, free game offers, mod and translation sites, handy tools, and fixes for common errors.</p>
    <p className="mt-3">It <strong>gathers scattered links in one place</strong> — every entry shows its source and when it was last checked, so you can tell whether it still works. Free to browse.</p>
  </>} />],
  ['standard', <T key="t" zh="收录标准" en="What gets in" />, <T key="b" zh={<ul className="list-disc pl-5 space-y-2">
    <li>收录玩家常用、能长期访问的渠道与站点</li>
    <li>每条记录必须有来源与核验日期；核验状态如实标注</li>
    <li>信息不足的内容保持「待核验」或直接不上线</li>
  </ul>} en={<ul className="list-disc pl-5 space-y-2">
    <li>Stores and sites players actually use and that stay available</li>
    <li>Every entry needs a source and a check date, and its status is shown honestly</li>
    <li>Anything without enough information stays “unverified” or isn’t published</li>
  </ul>} />],
  ['exclude', <T key="t" zh="不做什么" en="What we don’t do" />, <T key="b" zh={<ul className="list-disc pl-5 space-y-2">
    <li>不托管、不提供任何游戏文件/安装包下载</li>
    <li>不做账号、社区、评论功能——这是索引，不是论坛</li>
  </ul>} en={<ul className="list-disc pl-5 space-y-2">
    <li>We don’t host or offer any game files or installers</li>
    <li>No accounts, community or comments — this is an index, not a forum</li>
  </ul>} />],
  ['check', <T key="t" zh="核验方式" en="How entries are checked" />, <T key="b" zh={<p>每条记录带「核验于」日期；超期未复查标注「久未核验」。链接状态分正常/疑似失效/已失效。免费活动状态由系统按日期自动判定。</p>} en={<p>Every entry carries a “checked” date; stale ones are flagged. Links are marked OK, maybe broken, or broken. Free game status is worked out automatically from the dates.</p>} />],
  ['legal', <T key="t" zh="声明" en="Disclaimer" />, <T key="b" zh={<p>本站为个人维护的非商业项目，与收录的厂商、站点无隶属关系。商标归各自权利方。链接健康状态仅表示上次核验时可达，不构成安全承诺。</p>} en={<p>A personal, non-commercial project with no affiliation to the publishers or sites listed. Trademarks belong to their owners. Link status only means a link worked when last checked; it is not a safety guarantee.</p>} />],
  ['feedback', <T key="t" zh="反馈" en="Feedback" />, <FeedbackChannels key="f" />],
];

// 关于：刊头（版本与收录）→ 六个两栏章节（是什么 / 收录标准 / 不收录 / 核验 / 声明 / 反馈）
export default function AboutPage() {
  const data = loadData();
  const build = buildStamp();
  const facts: [React.ReactNode, React.ReactNode][] = [
    [<T key="v" zh="版本" en="Version" />, <T key="v2" zh={`${pkg.version}，最近构建 ${build}`} en={`${pkg.version}, built ${build}`} />],
    [<T key="c" zh="收录" en="In the index" />, <T key="c2" zh={`${data.games.length} 款游戏、${data.sites.length} 个资源站、${data.tools.length} 个工具、${data.problems.length} 个排障问题、${data.guides.length} 篇教程`} en={`${data.games.length} games, ${data.sites.length} sites, ${data.tools.length} tools, ${data.problems.length} fix pages, ${data.guides.length} guides`} />],
    [<T key="t" zh="技术" en="Built with" />, <>Next.js · React · Tailwind CSS · Motion</>],
    [<T key="f" zh="字体" en="Fonts" />, <>Source Han Serif · Geist</>],
  ];
  return (
    <>
      <IndexMasthead
        no="07"
        title={<T zh="关于" en="About" />}
        description={<T zh="把分散的入口整理成档案：来源可追溯，状态可辨认，信息可纠正。" en="Scattered links, organized into files: traceable sources, visible status, open to correction." />}
        aside={(
          <dl className="border-t border-border-strong">
            {facts.map(([k, v], i) => (
              <div key={i} className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 border-b border-border py-3.5 text-sm">
                <dt className="text-fg-3">{k}</dt>
                <dd className="leading-[1.7] text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      />
      <div className="container-x">
        {SECTIONS.map(([id, title, body], i) => (
          <DetailSection key={id} index={i} meta={{ id, title }}>
            <div className="prose-doc max-w-[62ch] text-foreground/90">{body}</div>
          </DetailSection>
        ))}
      </div>
    </>
  );
}
