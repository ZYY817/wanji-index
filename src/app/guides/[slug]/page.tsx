import { L } from '@/lib/labels-i18n';
import { T } from '@/lib/i18n';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { marked } from 'marked';
import { ArrowRight } from 'lucide-react';
import { loadData } from '@/lib/data.mjs';
import { zh } from '@/lib/labels.mjs';
import { SITE_BASE } from '@/lib/present';
import { StatusBadge } from '@/components/ui/badge';
import { ExtLink } from '@/components/ui/ext-link';
import { FeedbackLink } from '@/components/layout/feedback';
import { DetailMasthead, type DetailFact } from '@/components/layout/detail-masthead';
import { JsonLd } from '@/components/seo/json-ld';
import { Reveal } from '@/components/fx/reveal';
import { fileTokens } from '@/components/ui/file-tokens';

type Params = { params: Promise<{ slug: string }> };
type Step = { title?: string; action: string; expected: string; ifFail?: string; verified?: string };

export function generateStaticParams() {
  return loadData().guides.map((g: any) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const g = loadData().guides.find((x: any) => x.slug === slug);
  return g ? { title: g.title, description: g.problem?.description ?? g.title, alternates: { canonical: `/guides/${g.slug}/` } } : {};
}

/** 阅读区里的小节标题：比详情页章节轻一级，保证步骤本身是视觉重心 */
function Block({ id, title, children }: { id?: string; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="scroll-mt-28 border-t border-border py-12 first:border-t-0 first:pt-0">
      <h2 id={id} className="font-display text-3xl font-semibold tracking-[-0.013em]">{title}</h2>
      <div className="mt-6">{children}</div>
    </Reveal>
  );
}

// 教程详情：刊头 → 阅读区（确认问题 → 开始之前 → 逐步排查 → 补充说明 → 恢复方法）+ 吸顶侧栏（步骤目录 / 工具 / 来源 / 继续排查）
/** 系统：Windows 有具体版本时写成「Windows 10 / 11」，不显示 win10 这类原始值 */
function osText(os: string[], versions: string[]) {
  const win = versions.map((v) => v.match(/^win(\d+)$/i)?.[1]).filter(Boolean);
  return os.map((o) => (o === 'windows' && win.length ? `Windows ${win.join(' / ')}` : zh('os', o))).join('、');
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const data = loadData();
  const g = data.guides.find((x: any) => x.slug === slug);
  if (!g) notFound();
  const steps: Step[] = g.steps ?? [];
  const games = data.games.filter((x: any) => (g.games ?? []).includes(x.id));
  const tools = data.tools.filter((x: any) => (g.tools ?? []).includes(x.id));
  const related = data.guides.filter((x: any) => (g.relatedGuides ?? []).includes(x.id));
  const html = g.body ? await marked.parse(g.body) : null;

  const facts: DetailFact[] = [
    { label: <T zh="分类" en="Category" />, value: L('guideCategory', g.category) },
    { label: <T zh="步骤" en="Steps" />, value: <T zh={`${steps.length} 步`} en={`${steps.length} steps`} /> },
    { label: <T zh="适用游戏" en="Games" />, value: games.length ? (
      <span className="flex flex-wrap gap-x-3">
        {games.map((x: any) => <Link key={x.id} href={`/games/${x.slug}/`} className="underline decoration-border-strong underline-offset-4 hover:text-primary">{x.name.zh}</Link>)}
      </span>
    ) : undefined },
    { label: <T zh="系统" en="OS" />, value: osText(g.os ?? [], g.osVersions ?? []) },
    { label: <T zh="核验" en="Checked" />, value: <span className="flex flex-wrap items-center gap-2">{g.checkedAt}<StatusBadge value={g.reviewStatus} /></span> },
  ].filter((f) => f.value);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org', '@type': g.kind === 'troubleshooting' ? 'Article' : 'HowTo',
          headline: g.title, name: g.title, description: g.problem?.description ?? g.title,
          url: `${SITE_BASE}/guides/${g.slug}/`, dateModified: g.updatedAt,
          ...(g.kind !== 'troubleshooting' && {
            step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title ?? `步骤 ${i + 1}`, text: `${s.action}（预期：${s.expected}）` })),
          }),
        }}
      />

      <DetailMasthead
        crumbs={[[<T key="g" zh="教程" en="Guides" />, '/guides/'], [g.title]]}
        kicker={L('guideKind', g.kind)}
        title={fileTokens(g.title)}
        summary={g.problem?.description}
        facts={facts}
      />

      <div className="container-x grid gap-12 py-14 md:py-20 lg:grid-cols-12 lg:gap-16">
        <article className="min-w-0 lg:col-span-8">
          {g.problem?.errorText && (
            <Block title={<T zh="确认问题" en="Confirm the problem" />}>
              <pre className="whitespace-pre-wrap break-words rounded-sm bg-bad/[0.07] p-5 ring-1 ring-bad/25 font-mono text-sm leading-[1.8] text-bad-text">{g.problem.errorText}</pre>
              {g.problem.conditions && <p className="mt-5 text-base leading-[1.8] text-fg-2"><span className="text-foreground"><T zh="出现条件：" en="When it happens: " /></span>{g.problem.conditions}</p>}
            </Block>
          )}

          {g.prerequisites?.length > 0 && (
            <Block title={<T zh="开始之前" en="Before you start" />}>
              <ul className="space-y-3 text-base leading-[1.8] text-foreground/90">
                {g.prerequisites.map((p: string) => (
                  <li key={p} className="flex gap-3"><span aria-hidden className="mt-[0.75em] size-1 shrink-0 bg-fg-3" />{p}</li>
                ))}
              </ul>
            </Block>
          )}

          <Block id="steps" title={<T zh="逐步排查" en="Steps" />}>
            <ol>
              {steps.map((s, i) => (
                <li key={i} id={`step-${i + 1}`} className="relative grid scroll-mt-28 grid-cols-[48px_minmax(0,1fr)] gap-4 pb-12 last:pb-0 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-6">
                  <div className="relative">
                    <span className="tabular text-3xl leading-none tabular-nums text-primary">{String(i + 1).padStart(2, '0')}</span>
                    {i < steps.length - 1 && <span aria-hidden className="absolute bottom-[-8px] left-[0.6em] top-12 w-px bg-border" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="text-xl font-semibold leading-snug md:text-[22px]">{s.title || <T zh={`步骤 ${i + 1}`} en={`Step ${i + 1}`} />}</h3>
                      {s.verified && s.verified !== 'verified' && <StatusBadge value={s.verified} />}
                    </div>
                    <p className="mt-4 whitespace-pre-line text-lg leading-[1.8] text-foreground/90">{s.action}</p>
                    <div className="mt-5 rounded-sm bg-ok/[0.06] px-4 py-3 ring-1 ring-ok/20">
                      <p className="text-sm font-medium text-ok"><T zh="预期结果" en="Expected result" /></p>
                      <p className="mt-1 text-base leading-[1.75] text-foreground/90">{s.expected}</p>
                    </div>
                    {s.ifFail && <p className="mt-4 text-base leading-[1.75] text-fg-2"><span className="text-foreground"><T zh="如果没有解决：" en="If that didn’t work: " /></span>{s.ifFail}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Block>

          {html && (
            <Block title={<T zh="补充说明" en="Notes" />}>
              <div className="prose-doc" dangerouslySetInnerHTML={{ __html: html }} />
            </Block>
          )}

          {g.recovery?.length > 0 && (
            <Block id="recovery" title={<T zh="恢复方法" en="How to undo" />}>
              <ol className="space-y-4">
                {g.recovery.map((r: string, i: number) => (
                  <li key={r} className="flex gap-4 text-base leading-[1.8] text-foreground/90">
                    <span className="tabular text-fg-3">{String(i + 1).padStart(2, '0')}</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ol>
            </Block>
          )}

          <footer className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-strong pt-6 text-sm text-fg-3">
            <span><T zh="本页核验于" en="Checked" /> {g.checkedAt}</span>
            <FeedbackLink page={`${g.title}（/guides/${g.slug}/）`} className="ml-auto inline-flex min-h-11 items-center text-fg-2 underline underline-offset-4 hover:text-foreground">
              <T zh="信息有误？反馈给我们" en="Spot an error? Tell us" />
            </FeedbackLink>
          </footer>
        </article>

        <aside className="space-y-10 lg:col-span-4 lg:sticky lg:top-[calc(var(--sticky-top)+32px)] lg:transition-[top] lg:duration-300 lg:self-start">
          <nav aria-label="Steps">
            <h2 className="border-b border-border-strong pb-3 text-sm text-fg-3"><T zh="步骤目录" en="Steps" /></h2>
            <ol>
              {steps.map((s, i) => (
                <li key={i}>
                  <a href={`#step-${i + 1}`} className="flex gap-3 border-b border-border py-3 text-base text-fg-2 transition-colors hover:text-foreground">
                    <span className="tabular text-sm tabular-nums text-fg-3">{String(i + 1).padStart(2, '0')}</span>
                    {s.title || <T zh={`步骤 ${i + 1}`} en={`Step ${i + 1}`} />}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {tools.length > 0 && (
            <section>
              <h2 className="border-b border-border-strong pb-3 text-sm text-fg-3"><T zh="用到的工具" en="Tools used" /></h2>
              {tools.map((t: any) => (
                <Link key={t.id} href={`/tools/${t.slug}/`} className="group block border-b border-border py-4">
                  <span className="flex items-center justify-between text-lg font-semibold transition-colors group-hover:text-primary">
                    {t.name}
                    <ArrowRight aria-hidden className="size-4 text-fg-3 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="mt-1 block text-sm leading-[1.7] text-fg-2">{t.summary}</span>
                </Link>
              ))}
            </section>
          )}

          {g.sources?.length > 0 && (
            <section>
              <h2 className="border-b border-border-strong pb-3 text-sm text-fg-3"><T zh="参考来源" en="Sources" /></h2>
              <ul className="mt-3 space-y-2">
                {g.sources.map((s: any) => (
                  <li key={s.url}><ExtLink href={s.url} className="text-sm leading-[1.7] text-fg-2 hover:text-foreground">{s.name}</ExtLink></li>
                ))}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section>
              <h2 className="border-b border-border-strong pb-3 text-sm text-fg-3"><T zh="继续排查" en="Keep troubleshooting" /></h2>
              {related.map((r: any) => (
                <Link key={r.id} href={`/guides/${r.slug}/`} className="block border-b border-border py-3 text-base text-fg-2 transition-colors hover:text-primary">{r.title}</Link>
              ))}
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
