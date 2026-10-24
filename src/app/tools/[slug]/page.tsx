import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadData } from '@/lib/data.mjs';
import { PageMasthead } from '@/components/layout/page-masthead';
import { FeedbackLink } from '@/components/layout/feedback';
import { SectionHeading } from '@/components/ui/section-label';
import { StatusBadge, Tag } from '@/components/ui/badge';
import { AcquireButton } from '@/components/ui/button';
import { ExtLink } from '@/components/ui/ext-link';
import { pad } from '@/lib/utils';
import { zh } from '@/lib/labels.mjs';
export function generateStaticParams() { return loadData().tools.map((t) => ({ slug: t.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const t = loadData().tools.find((x) => x.slug === slug);
  return t ? { title: t.name, description: t.summary, alternates: { canonical: `/tools/${t.slug}/` } } : {};
}
export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const data = loadData(); const t = data.tools.find((x) => x.slug === slug);
  if (!t) notFound();
  const games = data.games.filter((g) => (t.supportedGames ?? []).includes(g.id));
  const guides = data.guides.filter((g) => (g.tools ?? []).includes(t.id));
  // 可选章节不占编号：缺少安装说明 / 适用游戏时后续编号自动顺延
  const sections = (() => {
    let n = 0;
    return {
      feature: pad(++n),
      install: t.installNotes ? pad(++n) : undefined,
      compat: pad(++n),
      games: games.length ? pad(++n) : undefined,
      guides: guides.length ? pad(++n) : undefined,
    };
  })();
  return <>
    <PageMasthead no="04" en="TOOL DOSSIER" title={t.name} description={t.summary} crumbs={[["工具", "/tools/"], [t.name]]}><div className="flex flex-wrap items-center gap-3 pb-8"><Tag>{zh('toolType', t.type)}</Tag>{(t.os ?? []).map((o: string) => <Tag key={o}>{zh('os', o)}</Tag>)}<StatusBadge value={t.reviewStatus} /><span className="meta text-fg-3">核验 {t.checkedAt}</span></div></PageMasthead>
    <div className="container-x grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-20 lg:py-16">
      <div className="min-w-0 space-y-12">
        <section><SectionHeading no={sections.feature} title="功能与用途" /><p className="max-w-[70ch] leading-8 text-fg-2">{t.description || t.summary}</p></section>
        {t.installNotes && <section><SectionHeading no={sections.install} title="安装与使用" /><p className="whitespace-pre-line leading-8 text-fg-2">{t.installNotes}</p></section>}
        <section><SectionHeading no={sections.compat} title="兼容与版本" /><dl className="text-sm [&>div]:grid [&>div]:gap-2 [&>div]:border-b [&>div]:border-border [&>div]:py-5 sm:[&>div]:grid-cols-[140px_1fr] [&_dt]:text-fg-3 [&_dd]:min-w-0 [&_dd]:leading-7">
          <div><dt>版本</dt><dd>{t.version?.latest ? <code className="font-mono">{t.version.latest}</code> : <StatusBadge value="unchecked" />}{t.version?.checkedAt && <span className="meta ml-3 text-fg-3">核验 {t.version.checkedAt}</span>}</dd></div>
          <div><dt>兼容性</dt><dd>{t.compatibility || <StatusBadge value="unchecked" />}</dd></div>
          {t.osVersions?.length > 0 && <div><dt>适用系统版本</dt><dd>{t.osVersions.join(' / ')}</dd></div>}
          {t.limitations?.length > 0 && <div><dt>已知限制</dt><dd>{t.limitations.join('；')}</dd></div>}
        </dl></section>
        {((t.risks?.length ?? 0) > 0 || t.uninstallNote) && <section className="border-l-2 border-warn bg-surface-2 p-6"><h2 className="font-serif text-xl">使用前须知</h2>{t.risks?.map((risk: string, i: number) => <p key={i} className="mt-3 text-sm leading-7 text-fg-2">{risk}</p>)}{t.uninstallNote && <p className="mt-4 border-t border-border pt-4 text-sm leading-7 text-fg-2"><span className="text-foreground">恢复 / 卸载：</span>{t.uninstallNote}</p>}</section>}
        {games.length > 0 && <section><SectionHeading no={sections.games} title="适用游戏" count={games.length} /><div className="grid sm:grid-cols-2">{games.map((g) => <Link key={g.id} href={`/games/${g.slug}/`} className="flex min-h-14 items-center justify-between gap-4 border-b border-border py-3 hover:text-primary"><span className="font-serif text-lg">{g.name.zh}</span><span aria-hidden>↗</span></Link>)}</div></section>}
        {guides.length > 0 && <section><SectionHeading no={sections.guides} title="相关教程" count={guides.length} />{guides.map((g) => <Link key={g.id} href={`/guides/${g.slug}/`} className="block border-b border-border py-5 font-serif text-xl hover:text-primary">{g.title}<span aria-hidden className="ml-3">↗</span></Link>)}</section>}
      </div>
      <aside className="lg:sticky lg:top-[calc(var(--header-h)+28px)] lg:self-start"><div className="border-y border-border py-6"><p className="meta mb-5 text-fg-3">官方发行渠道</p><AcquireButton href={t.officialUrl} label="官方获取" health={t.linkHealth} size="lg" className="w-full" /><div className="mt-4"><StatusBadge value={t.linkHealth} /></div><p className="mt-4 text-sm leading-7 text-fg-2">获取前请核对系统兼容性与版本信息。</p></div>{t.sources?.length > 0 && <div className="py-6"><h2 className="meta mb-4 text-fg-3">参考来源</h2>{t.sources.map((s: any, i: number) => <ExtLink key={i} href={s.url} className="mb-3 min-h-11 break-words text-sm hover:text-primary">{s.name}</ExtLink>)}</div>}<FeedbackLink page={`${t.name}（/tools/${t.slug}/）`} className="meta inline-flex min-h-11 items-center text-fg-3 hover:text-foreground">反馈信息错误</FeedbackLink></aside>
    </div>
  </>;
}
