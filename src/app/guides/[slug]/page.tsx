import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { marked } from 'marked';
import { loadData } from '@/lib/data.mjs';
import { StatusBadge, Tag } from '@/components/badges';
import { zh } from '@/lib/labels.mjs';
import { JsonLd } from '@/components/json-ld';
import site from '../../../../config/site.json';

export function generateStaticParams() {
  return loadData().guides.map((g) => ({ slug: g.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = loadData().guides.find((x) => x.slug === slug);
  return g ? { title: g.title, description: g.problem?.description ?? g.title, alternates: { canonical: `/guides/${g.slug}/` } } : {};
}

const V_LABEL: Record<string, string> = { self: '亲测', community: '社区验证', unchecked: '待核验' };

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = loadData();
  const g = data.guides.find((x) => x.slug === slug);
  if (!g) notFound();
  const games = (g.games ?? []).map((id: string) => data.games.find((x) => x.id === id)).filter(Boolean);
  const tools = (g.tools ?? []).map((id: string) => data.tools.find((x) => x.id === id)).filter(Boolean);
  const html = g.body ? marked.parse(g.body) : null;

  return (
    <div className="wrap-doc py-10">
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': g.kind === 'troubleshooting' ? 'Article' : 'HowTo',
        headline: g.title, description: g.problem?.description ?? g.title,
        url: `${site.url.replace(/\/$/, '')}/guides/${g.slug}/`, dateModified: g.updatedAt,
        ...(g.kind !== 'troubleshooting' && { step: g.steps.map((s: any, i: number) => ({ '@type': 'HowToStep', position: i + 1, name: s.title ?? `步骤 ${i + 1}`, text: `${s.action}（预期：${s.expected}）` })) }),
      }} />
      <nav className="meta mb-4"><Link href="/">首页</Link> / <Link href="/guides/">教程</Link> / {g.title}</nav>
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">{g.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Tag>{zh('guideKind', g.kind)}</Tag><Tag>{zh('guideCategory', g.category)}</Tag>
          {games.map((x) => <Link key={x.id} href={`/games/${x.slug}/`} className="tag hover:text-[var(--color-amber-hi)]">{x.name.zh}</Link>)}
          {(g.os ?? []).map((o: string) => <Tag key={o}>{zh('os', o)}</Tag>)}
        </div>
        <p className="meta mt-2 flex items-center gap-3">核验 {g.checkedAt}{g.reviewStatus !== 'verified' && <StatusBadge kind="unverified" />}</p>
      </header>

      {g.problem && (
        <div className="mb-6 rounded-[var(--radius-ctl)] bg-[var(--color-ink-1)] p-5">
          {g.problem.description && <p className="text-[var(--color-txt-2)]">{g.problem.description}</p>}
          {g.problem.errorText && <p className="mono mt-2 break-all text-[var(--color-bad)]">{g.problem.errorText}</p>}
          {g.problem.conditions && <p className="meta mt-2">适用：{g.problem.conditions}</p>}
        </div>
      )}
      {g.prerequisites?.length > 0 && <p className="mb-6 text-sm text-[var(--color-txt-2)]">前置：{g.prerequisites.join('；')}</p>}

      <section className="mb-8">
        <div className="sect"><h2>排查步骤</h2></div>
        <div className="space-y-3">
          {g.steps.map((s: any, i: number) => (
            <div key={i} className="card flex gap-4 !rounded-[var(--radius-ctl)] p-4">
              <span className="mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-amber-soft)] font-bold text-[var(--color-amber-hi)]">{i + 1}</span>
              <div className="min-w-0">
                {s.title && <h3 className="font-semibold">{s.title}</h3>}
                <p className="mt-1 text-sm text-[var(--color-txt-2)]">{s.action}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-[var(--color-ok)]">预期：{s.expected}</span>
                  {s.ifFail && <span className="meta">失败则：{s.ifFail}</span>}
                  <span className={`st st-${s.verified}`}>{V_LABEL[s.verified] ?? s.verified}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {html && <section className="mb-8"><div className="sect"><h2>补充说明</h2></div><div className="prose-invert text-[var(--color-txt-2)]" dangerouslySetInnerHTML={{ __html: html }} /></section>}

      {g.recovery?.length > 0 && (
        <section className="mb-8"><div className="sect"><h2>恢复方法</h2></div>
          <ul className="list-disc pl-5 text-[var(--color-txt-2)]">{g.recovery.map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>
        </section>
      )}

      {tools.length > 0 && (
        <section className="mb-8"><div className="sect"><h2>相关工具</h2></div>
          {tools.map((t) => <Link key={t.id} href={`/tools/${t.slug}/`} className="irow"><span className="font-medium">{t.name}</span><span className="meta flex-1 hidden sm:block">{t.summary}</span></Link>)}
        </section>
      )}

      {g.sources?.length > 0 && (
        <div className="meta mb-6">来源：{g.sources.map((s: any, i: number) => <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-[var(--color-amber-hi)]">{s.name}↗</a>)}</div>
      )}
      <footer className="meta border-t border-[var(--color-line-0)] pt-4 text-[13px]">本页核验于 {g.checkedAt} · <Link href="/about/#feedback" className="text-[var(--color-amber-hi)]">反馈</Link></footer>
    </div>
  );
}
