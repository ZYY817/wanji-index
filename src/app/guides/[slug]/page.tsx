import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { marked } from 'marked';
import { loadData } from '@/lib/data.mjs';
import { PageMasthead } from '@/components/layout/page-masthead';
import { FeedbackLink } from '@/components/layout/feedback';
import { SectionHeading } from '@/components/ui/section-label';
import { StatusBadge, Tag } from '@/components/ui/badge';
import { ExtLink } from '@/components/ui/ext-link';
import { JsonLd } from '@/components/seo/json-ld';
import { pad } from '@/lib/utils';
import { zh } from '@/lib/labels.mjs';
import site from '../../../../config/site.json';
export function generateStaticParams() { return loadData().guides.map((g) => ({ slug: g.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const g = loadData().guides.find((x) => x.slug === slug);
  return g ? { title: g.title, description: g.problem?.description ?? g.title, alternates: { canonical: `/guides/${g.slug}/` } } : {};
}
export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const data = loadData(); const g = data.guides.find((x) => x.slug === slug);
  if (!g) notFound();
  const games = data.games.filter((x) => (g.games ?? []).includes(x.id));
  const tools = data.tools.filter((x) => (g.tools ?? []).includes(x.id));
  const related = data.guides.filter((x) => (g.relatedGuides ?? []).includes(x.id));
  const html = g.body ? await marked.parse(g.body) : null;
  // 可选章节不占编号：没有正文时「恢复方法」顺延为 03
  const sections = (() => {
    let n = 0;
    return {
      problem: g.problem ? pad(++n) : undefined,
      steps: pad(++n),
      body: html ? pad(++n) : undefined,
      recovery: g.recovery?.length ? pad(++n) : undefined,
    };
  })();
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@type': g.kind === 'troubleshooting' ? 'Article' : 'HowTo', headline: g.title, name: g.title, description: g.problem?.description ?? g.title, url: `${site.url.replace(/\/$/, '')}/guides/${g.slug}/`, dateModified: g.updatedAt, ...(g.kind !== 'troubleshooting' && { step: g.steps.map((s: any, i: number) => ({ '@type': 'HowToStep', position: i + 1, name: s.title ?? `步骤 ${i + 1}`, text: `${s.action}（预期：${s.expected}）` })) }) }} />
    <PageMasthead no="05" en="FIELD NOTES" title={g.title} description={<><span className="meta block mb-3">{g.steps.length} 个步骤 · 核验 {g.checkedAt}</span><StatusBadge value={g.reviewStatus} /></>} crumbs={[["教程", "/guides/"], [g.title]]}><div className="flex flex-wrap items-center gap-2 pb-8"><Tag>{zh('guideKind', g.kind)}</Tag><Tag>{zh('guideCategory', g.category)}</Tag>{games.map((x) => <Link key={x.id} href={`/games/${x.slug}/`} className="inline-flex min-h-11 items-center px-2 text-sm hover:text-primary">{x.name.zh} ↗</Link>)}{(g.os ?? []).map((o: string) => <Tag key={o}>{zh('os', o)}</Tag>)}</div></PageMasthead>
    <div className="container-x grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-20 lg:py-16">
      <article className="min-w-0 space-y-12">
        {g.problem && <section><SectionHeading no={sections.problem} title="确认问题" />{g.problem.description && <p className="leading-8 text-fg-2">{g.problem.description}</p>}{g.problem.errorText && <pre className="mt-5 whitespace-pre-wrap break-words border-l-2 border-bad bg-surface-2 p-5 font-mono text-sm leading-7 text-bad-text">{g.problem.errorText}</pre>}{g.problem.conditions && <p className="mt-5 text-sm leading-7 text-fg-2"><span className="text-foreground">适用条件：</span>{g.problem.conditions}</p>}{g.osVersions?.length > 0 && <p className="meta mt-3 text-fg-3">系统版本 {g.osVersions.join(' / ')}</p>}</section>}
        {g.prerequisites?.length > 0 && <section className="border-y border-border py-6"><h2 className="font-serif text-xl">开始之前</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-fg-2">{g.prerequisites.map((p: string, i: number) => <li key={i}>{p}</li>)}</ul></section>}
        <section id="steps"><SectionHeading no={sections.steps} title="逐步排查" count={g.steps.length} /><ol>{g.steps.map((s: any, i: number) => <li key={i} className="relative grid grid-cols-[36px_minmax(0,1fr)] gap-4 pb-10 sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-6"><div className="relative"><span className="font-mono text-2xl text-fg-3">{String(i + 1).padStart(2, '0')}</span>{i < g.steps.length - 1 && <span aria-hidden className="absolute bottom-[-16px] left-3 top-12 w-px bg-border" />}</div><div className="min-w-0"><div className="flex flex-wrap items-start justify-between gap-3"><h3 className="font-serif text-xl font-semibold sm:text-2xl">{s.title || `步骤 ${i + 1}`}</h3><StatusBadge value={s.verified} /></div><p className="mt-4 whitespace-pre-line leading-8 text-fg-2">{s.action}</p><div className="mt-5 border-l border-ok pl-4 text-sm leading-7"><p className="text-ok">预期结果</p><p className="mt-1 text-fg-2">{s.expected}</p></div>{s.ifFail && <p className="mt-4 text-sm leading-7 text-fg-2"><span className="text-foreground">若未解决：</span>{s.ifFail}</p>}</div></li>)}</ol></section>
        {html && <section><SectionHeading no={sections.body} title="补充说明" /><div className="prose-doc" dangerouslySetInnerHTML={{ __html: html }} /></section>}
        {g.recovery?.length > 0 && <section id="recovery"><SectionHeading no={sections.recovery} title="恢复方法" /><ol className="space-y-4">{g.recovery.map((r: string, i: number) => <li key={i} className="flex gap-4 text-sm leading-7 text-fg-2"><span className="font-mono text-fg-3">{String(i + 1).padStart(2, '0')}</span><span>{r}</span></li>)}</ol></section>}
        <footer className="meta border-t border-border pt-6 text-fg-3">本页核验于 {g.checkedAt} · <FeedbackLink page={`${g.title}（/guides/${g.slug}/）`} className="inline-flex min-h-11 items-center hover:text-foreground">反馈信息错误</FeedbackLink></footer>
      </article>
      <aside className="space-y-8 lg:sticky lg:top-[calc(var(--header-h)+28px)] lg:self-start">
        {tools.length > 0 && <section><h2 className="meta border-b border-border pb-3 text-fg-3">相关工具</h2>{tools.map((t) => <Link key={t.id} href={`/tools/${t.slug}/`} className="block border-b border-border py-5 hover:text-primary"><span className="font-serif text-xl">{t.name} ↗</span><p className="mt-2 text-sm leading-6 text-fg-2">{t.summary}</p></Link>)}</section>}
        {g.sources?.length > 0 && <section><h2 className="meta mb-4 border-b border-border pb-3 text-fg-3">参考来源</h2>{g.sources.map((s: any, i: number) => <ExtLink key={i} href={s.url} className="mb-3 min-h-11 text-sm leading-7 hover:text-primary">{s.name}</ExtLink>)}</section>}
        {related.length > 0 && <section><h2 className="meta mb-4 border-b border-border pb-3 text-fg-3">继续排查</h2>{related.map((r) => <Link key={r.id} href={`/guides/${r.slug}/`} className="block py-3 text-sm leading-7 hover:text-primary">{r.title} ↗</Link>)}</section>}
      </aside>
    </div>
  </>;
}
