import type { Metadata } from 'next';
import site from '../../../config/site.json';

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
  ['feedback', '反馈', <p>发现链接失效、信息错误或想推荐收录：到项目仓库提 Issue，或说明「什么页面 + 什么问题 + 正确来源链接」。</p>],
];

export default function AboutPage() {
  return (
    <div className="wrap-doc py-10">
      <h1 className="text-3xl font-black tracking-tight">关于</h1>
      <nav className="meta mt-4 flex flex-wrap gap-x-4">{SECTIONS.map(([id, t]) => <a key={id} href={`#${id}`} className="hover:text-[var(--color-amber-hi)]">{t}</a>)}</nav>
      {SECTIONS.map(([id, t, body]) => (
        <section key={id} id={id} className="mt-10">
          <div className="sect"><h2>{t}</h2></div>
          <div className="text-[var(--color-txt-2)]">{body}</div>
        </section>
      ))}
    </div>
  );
}
