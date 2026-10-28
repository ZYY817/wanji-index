import { T } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadData } from '@/lib/data.mjs';
import { zh } from '@/lib/labels.mjs';
import { StatusBadge } from '@/components/ui/badge';
import { AcquireButton } from '@/components/ui/button';
import { ExtLink } from '@/components/ui/ext-link';
import { FeedbackLink } from '@/components/layout/feedback';
import { DetailMasthead, Notice, type DetailFact } from '@/components/layout/detail-masthead';
import { DetailSection, type DetailSectionMeta } from '@/components/layout/detail-section';
import { Reveal } from '@/components/fx/reveal';
import { ToolLogo } from '@/components/ui/site-logo';
import { ListRow } from '@/components/ui/list-row';
import { fileTokens } from '@/components/ui/file-tokens';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return loadData().tools.map((t: any) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const t = loadData().tools.find((x: any) => x.slug === slug);
  return t ? { title: t.name, description: t.summary, alternates: { canonical: `/tools/${t.slug}/` } } : {};
}

// 工具详情：刊头（是什么 + 官方获取 + 版本/兼容事实）→ 功能 → 安装 → 适用游戏 → 相关教程 → 参考来源
export default async function ToolPage({ params }: Params) {
  const { slug } = await params;
  const data = loadData();
  const t = data.tools.find((x: any) => x.slug === slug);
  if (!t) notFound();
  const games = data.games.filter((g: any) => (t.supportedGames ?? []).includes(g.id));
  const guides = data.guides.filter((g: any) => (g.tools ?? []).includes(t.id));

  const facts: DetailFact[] = [
    { label: <T zh="适用系统" en="OS" />, value: (t.os ?? []).map((o: string) => zh('os', o)).join(' / ') },
    { label: <T zh="最新版本" en="Latest version" />, value: t.version?.latest ? <code className="font-mono">{t.version.latest}</code> : <StatusBadge value="unchecked" /> },
    { label: <T zh="兼容性" en="Compatibility" />, value: t.compatibility },
    { label: <T zh="系统版本" en="Windows versions" />, value: t.osVersions?.join(' / ') },
    { label: <T zh="核验" en="Checked" />, value: <span className="flex flex-wrap items-center gap-2">{t.checkedAt}<StatusBadge value={t.reviewStatus} /></span> },
  ].filter((f) => f.value);

  const risks: string[] = [...(t.risks ?? []), ...(t.limitations ?? [])];
  const sections: (DetailSectionMeta & { body: React.ReactNode })[] = [
    // 只有详细描述与一句话简介不同才单独成章，避免与刊头重复
    ...(t.description && t.description !== t.summary ? [{ id: 'feature', title: <T zh="功能与用途" en="What it does" />, body: <p className="max-w-[62ch] text-lg leading-[1.85] text-fg-2">{t.description}</p> }] : []),
    ...(t.installNotes ? [{ id: 'install', title: <T zh="安装与使用" en="Install & use" />, body: <p className="max-w-[62ch] whitespace-pre-line text-lg leading-[1.85] text-fg-2">{t.installNotes}</p> }] : []),
    ...(games.length ? [{
      id: 'games', title: <T zh="适用游戏" en="Works with" />, count: games.length, lead: <T zh="这些游戏的档案里收录了这个工具。" en="Games in our index that list this tool." />,
      body: (
        <ul className="-mx-4 grid sm:grid-cols-2 sm:gap-x-6 md:-mx-5">
          {games.map((g: any) => (
            <li key={g.id} className="border-b border-border">
              <ListRow href={`/games/${g.slug}/`} title={g.name.zh} meta={g.name.en} />
            </li>
          ))}
        </ul>
      ),
    }] : []),
    ...(guides.length ? [{
      id: 'guides', title: <T zh="相关教程" en="Guides" />, count: guides.length,
      body: (
        <ul className="-mx-4 md:-mx-5">
          {guides.map((g: any) => (
            <li key={g.id} className="border-b border-border last:border-b-0">
              <ListRow href={`/guides/${g.slug}/`} title={fileTokens(g.title)} meta={<T zh={`${g.steps?.length ?? 0} 个步骤`} en={`${g.steps?.length ?? 0} steps`} />} />
            </li>
          ))}
        </ul>
      ),
    }] : []),
    ...(t.sources?.length ? [{
      id: 'sources', title: <T zh="参考来源" en="Sources" />, count: t.sources.length,
      body: (
        <ul className="space-y-3">
          {t.sources.map((s: any) => (
            <li key={s.url}><ExtLink href={s.url} className="text-base text-fg-2 underline decoration-border-strong underline-offset-4 hover:text-foreground">{s.name}</ExtLink></li>
          ))}
        </ul>
      ),
    }] : []),
  ];

  return (
    <>
      <DetailMasthead
        crumbs={[[<T key="t" zh="工具" en="Tools" />, '/tools/'], [t.name]]}
        mark={<ToolLogo id={t.id} name={t.name} size={52} />}
        kicker={zh('toolType', t.type)}
        title={t.name}
        summary={t.summary}
        action={<AcquireButton href={t.officialUrl} health={t.linkHealth} label={<T zh="从官网获取" en="Get it from the official site" />} size="lg" className="w-full justify-between" />}
        facts={facts}
        notice={risks.length || t.uninstallNote ? (
          <Notice title={<T zh="使用前须知" en="Before you use it" />}>
            {risks.map((r) => <p key={r}>{r}</p>)}
            {t.uninstallNote && <p><span className="text-foreground"><T zh="恢复 / 卸载：" en="Undo / uninstall: " /></span>{t.uninstallNote}</p>}
          </Notice>
        ) : undefined}
      />

      <div className="container-x">
        {sections.map(({ body, ...meta }, i) => (
          <DetailSection key={meta.id} meta={meta} index={i}>{body}</DetailSection>
        ))}

        <Reveal as="aside" className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border-strong py-8 text-sm text-fg-3">
          <span className="text-foreground"><T zh="工具信息" en="About this tool" /></span>
          <span><T zh="核验于" en="Checked" /> {t.checkedAt}</span>
          <FeedbackLink page={`${t.name}（/tools/${t.slug}/）`} className="ml-auto inline-flex min-h-11 items-center text-fg-2 underline underline-offset-4 hover:text-foreground">
            <T zh="信息有误？反馈给我们" en="Spot an error? Tell us" />
          </FeedbackLink>
        </Reveal>
      </div>
    </>
  );
}
