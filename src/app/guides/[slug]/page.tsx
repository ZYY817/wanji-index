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
function Block({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="scroll-mt-28 border-t border-border py-12 first:border-t-0 first:pt-0">
      <h2 id={id} className="font-serif text-3xl font-bold tracking-[-0.03em]">{title}</h2>
      <div className="mt-6">{children}</div>
    </Reveal>
  );
}

// 教程详情：刊头 → 阅读区（确认问题 → 开始之前 → 逐步排查 → 补充说明 → 恢复方法）+ 吸顶侧栏（步骤目录 / 工具 / 来源 / 继续排查）
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
    { label: '分类', value: zh('guideCategory', g.category) },
    { label: '步骤', value: `${steps.length} 步` },
    { label: '适用游戏', value: games.length ? (
      <span className="flex flex-wrap gap-x-3">
        {games.map((x: any) => <Link key={x.id} href={`/games/${x.slug}/`} className="underline decoration-border-strong underline-offset-4 hover:text-primary">{x.name.zh}</Link>)}
      </span>
    ) : undefined },
    { label: '系统', value: [...(g.os ?? []).map((o: string) => zh('os', o)), ...(g.osVersions ?? [])].join(' / ') },
    { label: '核验', value: <span className="flex flex-wrap items-center gap-2">{g.checkedAt}<StatusBadge value={g.reviewStatus} /></span> },
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
        crumbs={[['教程', '/guides/'], [g.title]]}
        kicker={zh('guideKind', g.kind)}
        title={fileTokens(g.title)}
        summary={g.problem?.description}
        facts={facts}
      />

      <div className="container-x grid gap-12 py-14 md:py-20 lg:grid-cols-12 lg:gap-16">
        <article className="min-w-0 lg:col-span-8">
          {g.problem?.errorText && (
            <Block title="确认问题">
              <pre className="whitespace-pre-wrap break-words border-l-2 border-bad bg-surface-2 p-5 font-mono text-sm leading-[1.8] text-bad-text">{g.problem.errorText}</pre>
              {g.problem.conditions && <p className="mt-5 text-base leading-[1.8] text-fg-2"><span className="text-foreground">出现条件：</span>{g.problem.conditions}</p>}
            </Block>
          )}

          {g.prerequisites?.length > 0 && (
            <Block title="开始之前">
              <ul className="space-y-3 text-base leading-[1.8] text-foreground/90">
                {g.prerequisites.map((p: string) => (
                  <li key={p} className="flex gap-3"><span aria-hidden className="mt-[0.75em] size-1 shrink-0 bg-fg-3" />{p}</li>
                ))}
              </ul>
            </Block>
          )}

          <Block id="steps" title="逐步排查">
            <ol>
              {steps.map((s, i) => (
                <li key={i} id={`step-${i + 1}`} className="relative grid scroll-mt-28 grid-cols-[48px_minmax(0,1fr)] gap-4 pb-12 last:pb-0 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-6">
                  <div className="relative">
                    <span className="font-mono text-3xl leading-none tabular-nums text-primary">{String(i + 1).padStart(2, '0')}</span>
                    {i < steps.length - 1 && <span aria-hidden className="absolute bottom-[-8px] left-[0.6em] top-12 w-px bg-border" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="font-serif text-2xl font-bold leading-snug">{s.title || `步骤 ${i + 1}`}</h3>
                      {s.verified && s.verified !== 'verified' && <StatusBadge value={s.verified} />}
                    </div>
                    <p className="mt-4 whitespace-pre-line text-lg leading-[1.8] text-foreground/90">{s.action}</p>
                    <div className="mt-5 border-l-2 border-ok bg-ok/5 px-4 py-3">
                      <p className="text-sm font-medium text-ok">预期结果</p>
                      <p className="mt-1 text-base leading-[1.75] text-foreground/90">{s.expected}</p>
                    </div>
                    {s.ifFail && <p className="mt-4 text-base leading-[1.75] text-fg-2"><span className="text-foreground">如果没有解决：</span>{s.ifFail}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Block>

          {html && (
            <Block title="补充说明">
              <div className="prose-doc" dangerouslySetInnerHTML={{ __html: html }} />
            </Block>
          )}

          {g.recovery?.length > 0 && (
            <Block id="recovery" title="恢复方法">
              <ol className="space-y-4">
                {g.recovery.map((r: string, i: number) => (
                  <li key={r} className="flex gap-4 text-base leading-[1.8] text-foreground/90">
                    <span className="font-mono text-fg-3">{String(i + 1).padStart(2, '0')}</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ol>
            </Block>
          )}

          <footer className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-strong pt-6 text-sm text-fg-3">
            <span>本页核验于 {g.checkedAt}</span>
            <FeedbackLink page={`${g.title}（/guides/${g.slug}/）`} className="ml-auto inline-flex min-h-11 items-center text-fg-2 underline underline-offset-4 hover:text-foreground">
              信息有误？反馈给我们
            </FeedbackLink>
          </footer>
        </article>

        <aside className="space-y-10 lg:col-span-4 lg:sticky lg:top-[calc(var(--sticky-top)+32px)] lg:transition-[top] lg:duration-300 lg:self-start">
          <nav aria-label="步骤目录">
            <h2 className="border-b border-border-strong pb-3 text-sm text-fg-3">步骤目录</h2>
            <ol>
              {steps.map((s, i) => (
                <li key={i}>
                  <a href={`#step-${i + 1}`} className="flex gap-3 border-b border-border py-3 text-base text-fg-2 transition-colors hover:text-foreground">
                    <span className="font-mono text-sm tabular-nums text-fg-3">{String(i + 1).padStart(2, '0')}</span>
                    {s.title || `步骤 ${i + 1}`}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {tools.length > 0 && (
            <section>
              <h2 className="border-b border-border-strong pb-3 text-sm text-fg-3">用到的工具</h2>
              {tools.map((t: any) => (
                <Link key={t.id} href={`/tools/${t.slug}/`} className="group block border-b border-border py-4">
                  <span className="flex items-center justify-between font-serif text-xl font-bold transition-colors group-hover:text-primary">
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
              <h2 className="border-b border-border-strong pb-3 text-sm text-fg-3">参考来源</h2>
              <ul className="mt-3 space-y-2">
                {g.sources.map((s: any) => (
                  <li key={s.url}><ExtLink href={s.url} className="text-sm leading-[1.7] text-fg-2 hover:text-foreground">{s.name}</ExtLink></li>
                ))}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section>
              <h2 className="border-b border-border-strong pb-3 text-sm text-fg-3">继续排查</h2>
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
