import { L } from '@/lib/labels-i18n';
import { T } from '@/lib/i18n';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { SITE_BASE } from '@/lib/present';
import { problemDetail, problemSlugs } from '@/lib/problems';
import { StatusBadge } from '@/components/ui/badge';
import { ExtLink } from '@/components/ui/ext-link';
import { FeedbackLink } from '@/components/layout/feedback';
import { DetailMasthead, type DetailFact } from '@/components/layout/detail-masthead';
import { JsonLd } from '@/components/seo/json-ld';
import { Reveal } from '@/components/fx/reveal';
import { GameArt } from '@/components/game/game-art';
import { fileTokens } from '@/components/ui/file-tokens';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return problemSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = problemDetail(slug);
  return p ? { title: p.title, description: p.summary, alternates: { canonical: `/fixes/${p.slug}/` } } : {};
}

/** 阅读区小节：与教程页同一形制 */
function Block({ id, title, lead, children }: { id?: string; title: React.ReactNode; lead?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="scroll-mt-28 border-t border-border py-12 first:border-t-0 first:pt-0">
      <h2 id={id} className="font-display text-3xl font-semibold tracking-[-0.013em]">{title}</h2>
      {lead && <p className="mt-2 text-base text-fg-2">{lead}</p>}
      <div className="mt-6">{children}</div>
    </Reveal>
  );
}

// 问题排查：刊头（一句话结论）→ 是不是这个问题 → 解法（从最常见的开始）→ 速查表 → 不建议的做法 → 记录过这类问题的游戏
export default async function FixPage({ params }: Params) {
  const { slug } = await params;
  const p = problemDetail(slug);
  if (!p) notFound();
  const issueCount = p.games.reduce((n, g) => n + g.issues.length, 0);

  const facts: DetailFact[] = [
    { label: <T zh="分类" en="Category" />, value: L('problemCategory', p.category) },
    { label: <T zh="解法" en="Fixes" />, value: <T zh={`${p.fixes.length} 种，按先试哪个排序`} en={`${p.fixes.length}, in the order to try them`} /> },
    { label: <T zh="相关游戏" en="Games" />, value: p.games.length ? <T zh={`${p.games.length} 款游戏记录过 ${issueCount} 个相关问题`} en={`${issueCount} related issues in ${p.games.length} games`} /> : undefined },
    { label: <T zh="核验" en="Checked" />, value: <span className="flex flex-wrap items-center gap-2">{p.checkedAt}<StatusBadge value={p.reviewStatus} /></span> },
  ].filter((f) => f.value);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org', '@type': 'HowTo', name: p.title, description: p.summary,
          url: `${SITE_BASE}/fixes/${p.slug}/`, dateModified: p.updatedAt,
          step: p.fixes.map((f, i) => ({ '@type': 'HowToStep', position: i + 1, name: f.title, text: f.detail })),
        }}
      />

      <DetailMasthead
        crumbs={[[<T key="f" zh="排障" en="Fixes" />, '/fixes/'], [<T key="s" zh={p.short} en={p.shortEn} />]]}
        kicker={<><T zh="问题排查" en="Troubleshooting" /> · {L('problemCategory', p.category)}</>}
        title={<T zh={fileTokens(p.title)} en={p.titleEn} />}
        summary={<T zh={p.summary} en={p.summaryEn ? <>{p.summaryEn}<span className="mt-3 block text-sm text-fg-3">The detailed steps below are in Chinese for now — an English version is on the way.</span></> : undefined} />}
        facts={facts}
      />

      <div className="container-x grid gap-12 py-14 md:py-20 lg:grid-cols-12 lg:gap-16">
        <article className="min-w-0 lg:col-span-8">
          {(p.symptoms.length > 0 || p.errorTexts.length > 0) && (
            <Block title={<T zh="是不是这个问题" en="Is this your problem?" />}>
              {p.symptoms.length > 0 && (
                <ul className="space-y-3 text-lg leading-[1.8] text-foreground/90">
                  {p.symptoms.map((s) => (
                    <li key={s} className="flex gap-3"><span aria-hidden className="mt-[0.8em] size-1 shrink-0 bg-fg-3" />{s}</li>
                  ))}
                </ul>
              )}
              {p.errorTexts.length > 0 && (
                <pre className="mt-6 whitespace-pre-wrap break-words rounded-sm bg-bad/[0.07] p-5 font-mono text-sm leading-[1.9] text-bad-text ring-1 ring-bad/25">{p.errorTexts.join('\n')}</pre>
              )}
            </Block>
          )}

          <Block id="fixes" title={<T zh="解法" en="Fixes" />} lead={<T zh="从最常见、最省事的开始，一个不行再试下一个。" en="Start with the most common, easiest fix; if it doesn’t work, try the next." />}>
            <ol>
              {p.fixes.map((f, i) => (
                <li key={f.title} id={`fix-${i + 1}`} className="relative grid scroll-mt-28 grid-cols-[48px_minmax(0,1fr)] gap-4 pb-12 last:pb-0 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-6">
                  <div className="relative">
                    <span className="tabular text-3xl leading-none tabular-nums text-primary">{String(i + 1).padStart(2, '0')}</span>
                    {i < p.fixes.length - 1 && <span aria-hidden className="absolute bottom-[-8px] left-[0.6em] top-12 w-px bg-border" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold leading-snug md:text-[22px]">{fileTokens(f.title)}</h3>
                    {f.when && <p className="mt-2 text-sm text-fg-3"><T zh="适合：" en="When: " />{f.when}</p>}
                    <p className="mt-4 text-lg leading-[1.8] text-foreground/90">{f.detail}</p>
                    {(f.guide || f.sources.length > 0) && (
                      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-base">
                        {f.guide && (
                          // 普通行内链接：教程标题里的长文件名要能折行（inline-flex 会把整行撑出屏幕）
                          <Link href={`/guides/${f.guide.slug}/`} className="group py-2.5 font-medium leading-[1.9] text-foreground underline decoration-primary underline-offset-[5px] hover:text-primary">
                            <T zh="分步教程：" en="Guide: " />{fileTokens(f.guide.title)}
                            <ArrowRight aria-hidden className="ml-1.5 inline size-4 align-[-0.15em] transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        )}
                        {f.sources.map((s) => (
                          <ExtLink key={s.url} href={s.url} className="inline-flex min-h-11 items-center text-fg-2 underline decoration-border-strong underline-offset-[5px] hover:text-foreground">{s.name}</ExtLink>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Block>

          {p.table && (
            <Block id="table" title={p.table.caption ?? <T zh="速查表" en="Quick reference" />}>
              <div className="overflow-x-auto rounded-xs border border-border">
                <table className="w-full min-w-[560px] border-collapse text-left text-base">
                  <thead className="bg-shell text-sm text-fg-2">
                    <tr>{p.table.columns.map((c) => <th key={c} scope="col" className="border-b border-border px-4 py-3 font-medium">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {p.table.rows.map((r) => (
                      <tr key={r[0]} className="border-b border-border last:border-b-0">
                        {r.map((c, j) => (
                          <td key={j} className={j === 0 ? 'px-4 py-3.5 align-top tabular text-sm leading-[1.7] text-foreground' : 'px-4 py-3.5 align-top leading-[1.7] text-foreground/90'}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Block>
          )}

          {p.avoid.length > 0 && (
            <Block title={<T zh="不建议这样做" en="Don’t do this" />}>
              <ul className="space-y-3 text-base leading-[1.8] text-foreground/90">
                {p.avoid.map((a) => (
                  <li key={a} className="flex gap-3"><span aria-hidden className="mt-[0.15em] shrink-0 font-semibold text-bad-text">×</span>{a}</li>
                ))}
              </ul>
            </Block>
          )}

          {p.games.length > 0 && (
            <Block id="games" title={<T zh="这些游戏记录过类似问题" en="Games with similar known issues" />} lead={<T zh="来自 PCGamingWiki 的已知问题记录（英文），点击查看原文里的具体解法。" en="Known issues recorded on PCGamingWiki — open one to see the fix." />}>
              <ul>
                {p.games.slice(0, 24).map((g) => (
                  <li key={g.slug} className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 border-b border-border py-4 last:border-b-0 md:grid-cols-[120px_minmax(0,1fr)]">
                    <Link href={`/games/${g.slug}/`} className="edge-light relative block aspect-[460/215] w-full self-start overflow-hidden rounded-xs">
                      <GameArt src={g.art} name={g.name} seed={g.slug} variant="wide" className="size-full" />
                    </Link>
                    <div className="min-w-0">
                      <Link href={`/games/${g.slug}/`} className="text-lg font-semibold transition-colors hover:text-primary">{g.name}</Link>
                      <ul className="mt-1.5 space-y-1">
                        {g.issues.map((i) => (
                          <li key={i.url}>
                            <ExtLink href={i.url} className="group inline-flex items-start gap-1.5 text-sm leading-[1.7] text-fg-2 hover:text-foreground">
                              <span className={i.fixed === false ? 'text-warn' : 'text-ok'}>{i.fixed === false ? <T zh="未解决" en="Unresolved" /> : <T zh="有解法" en="Fixed" />}</span>
                              <span>{i.title}</span>
                            </ExtLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          <footer className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-strong pt-6 text-sm text-fg-3">
            <span><T zh="本页核验于" en="Checked" /> {p.checkedAt}</span>
            <span><T zh="说明为本站整理，来源只做链接，不转载原文" en="Written by us; sources are linked, never copied" /></span>
            <FeedbackLink page={`${p.title}（/fixes/${p.slug}/）`} className="ml-auto inline-flex min-h-11 items-center text-fg-2 underline underline-offset-4 hover:text-foreground">
              <T zh="信息有误？反馈给我们" en="Spot an error? Tell us" />
            </FeedbackLink>
          </footer>
        </article>

        <aside className="space-y-10 lg:col-span-4 lg:sticky lg:top-[calc(var(--sticky-top)+32px)] lg:self-start lg:transition-[top] lg:duration-300">
          <nav aria-label="Fixes">
            <h2 className="border-b border-border-strong pb-3 text-sm text-fg-3"><T zh="解法目录" en="Fixes" /></h2>
            <ol>
              {p.fixes.map((f, i) => (
                <li key={f.title}>
                  <a href={`#fix-${i + 1}`} className="flex gap-3 border-b border-border py-3 text-base text-fg-2 transition-colors hover:text-foreground">
                    <span className="tabular text-sm tabular-nums text-fg-3">{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0">{fileTokens(f.title)}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {p.related.length > 0 && (
            <section>
              <h2 className="border-b border-border-strong pb-3 text-sm text-fg-3"><T zh="也可能是" en="Could also be" /></h2>
              {p.related.map((r) => (
                <Link key={r.slug} href={`/fixes/${r.slug}/`} className="group flex items-center justify-between gap-3 border-b border-border py-3 text-base text-fg-2 transition-colors hover:text-primary">
                  <T zh={fileTokens(r.title)} en={r.titleEn} />
                  <ArrowRight aria-hidden className="size-4 shrink-0 text-fg-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </section>
          )}

          {p.sources.length > 0 && (
            <section>
              <h2 className="border-b border-border-strong pb-3 text-sm text-fg-3"><T zh="参考来源" en="Sources" /></h2>
              <ul className="mt-3 space-y-2">
                {p.sources.map((s) => (
                  <li key={s.url}><ExtLink href={s.url} className="text-sm leading-[1.7] text-fg-2 hover:text-foreground">{s.name}</ExtLink></li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
