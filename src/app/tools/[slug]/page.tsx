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
    { label: '适用系统', value: (t.os ?? []).map((o: string) => zh('os', o)).join(' / ') },
    { label: '最新版本', value: t.version?.latest ? <code className="font-mono">{t.version.latest}</code> : <StatusBadge value="unchecked" /> },
    { label: '兼容性', value: t.compatibility },
    { label: '系统版本', value: t.osVersions?.join(' / ') },
    { label: '核验', value: <span className="flex flex-wrap items-center gap-2">{t.checkedAt}<StatusBadge value={t.reviewStatus} /></span> },
  ].filter((f) => f.value);

  const risks: string[] = [...(t.risks ?? []), ...(t.limitations ?? [])];
  const sections: (DetailSectionMeta & { body: React.ReactNode })[] = [
    // 只有详细描述与一句话简介不同才单独成章，避免与刊头重复
    ...(t.description && t.description !== t.summary ? [{ id: 'feature', title: '功能与用途', body: <p className="max-w-[62ch] text-lg leading-[1.85] text-fg-2">{t.description}</p> }] : []),
    ...(t.installNotes ? [{ id: 'install', title: '安装与使用', body: <p className="max-w-[62ch] whitespace-pre-line text-lg leading-[1.85] text-fg-2">{t.installNotes}</p> }] : []),
    ...(games.length ? [{
      id: 'games', title: '适用游戏', count: games.length, lead: '这些游戏的档案里收录了这个工具。',
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
      id: 'guides', title: '相关教程', count: guides.length,
      body: (
        <ul className="-mx-4 md:-mx-5">
          {guides.map((g: any) => (
            <li key={g.id} className="border-b border-border last:border-b-0">
              <ListRow href={`/guides/${g.slug}/`} title={fileTokens(g.title)} meta={`${g.steps?.length ?? 0} 个步骤`} />
            </li>
          ))}
        </ul>
      ),
    }] : []),
    ...(t.sources?.length ? [{
      id: 'sources', title: '参考来源', count: t.sources.length,
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
        crumbs={[['工具', '/tools/'], [t.name]]}
        mark={<ToolLogo id={t.id} name={t.name} size={52} />}
        kicker={zh('toolType', t.type)}
        title={t.name}
        summary={t.summary}
        action={<AcquireButton href={t.officialUrl} health={t.linkHealth} label="从官网获取" size="lg" className="w-full justify-between" />}
        facts={facts}
        notice={risks.length || t.uninstallNote ? (
          <Notice title="使用前须知">
            {risks.map((r) => <p key={r}>{r}</p>)}
            {t.uninstallNote && <p><span className="text-foreground">恢复 / 卸载：</span>{t.uninstallNote}</p>}
          </Notice>
        ) : undefined}
      />

      <div className="container-x">
        {sections.map(({ body, ...meta }, i) => (
          <DetailSection key={meta.id} meta={meta} index={i}>{body}</DetailSection>
        ))}

        <Reveal as="aside" className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border-strong py-8 text-sm text-fg-3">
          <span className="text-foreground">工具信息</span>
          <span>核验于 {t.checkedAt}</span>
          <FeedbackLink page={`${t.name}（/tools/${t.slug}/）`} className="ml-auto inline-flex min-h-11 items-center text-fg-2 underline underline-offset-4 hover:text-foreground">
            信息有误？反馈给我们
          </FeedbackLink>
        </Reveal>
      </div>
    </>
  );
}
