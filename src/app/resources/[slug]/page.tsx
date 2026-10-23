import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { StatusBadge, Tag } from '@/components/badges';
import { ExtLink } from '@/components/ext-link';
import { zh } from '@/lib/labels.mjs';
import site from '../../../../config/site.json';

export function generateStaticParams() {
  return loadData().sites.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = loadData().sites.find((x) => x.slug === slug);
  return s ? { title: s.name, description: s.summary, alternates: { canonical: `/resources/${s.slug}/` } } : {};
}

export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = loadData();
  const s = data.sites.find((x) => x.slug === slug);
  if (!s) notFound();
  const rel = buildRelations(data);
  const entries = rel.entriesBySite.get(s.id) ?? [];
  const games = [...new Map((rel.gamesBySite.get(s.id) ?? []).map((g: any) => [g.id, g])).values()];

  return (
    <div className="wrap-doc py-10">
      <nav className="meta mb-4"><Link href="/">首页</Link> / <Link href="/resources/">资源站</Link> / {s.name}</nav>
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">{s.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Tag>{zh('siteCategory', s.category)}</Tag>
          {s.aliases?.map((a: string) => <span key={a} className="meta">{a}</span>)}
          <ExtLink href={s.url} label="官网" site={s.name} health={s.linkHealth} />
        </div>
        <p className="mt-3 text-[var(--color-txt-2)]">{s.summary}</p>
        <p className="meta mt-2 flex items-center gap-3">核验 {s.checkedAt}{s.reviewStatus !== 'verified' && <StatusBadge kind="unverified" />}</p>
      </header>

      {(s.risks?.length ?? 0) > 0 && (
        <div className="mb-6 rounded-[var(--radius-ctl)] border border-[var(--color-warn)] bg-[rgba(240,160,48,0.08)] px-4 py-3 text-sm">⚠ {s.risks.join('；')}</div>
      )}

      <section className="mb-8">
        <div className="sect"><h2>站点信息</h2></div>
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[8em_1fr]">
          {s.purposes?.length > 0 && <><dt className="meta">主要用途</dt><dd>{s.purposes.join('；')}</dd></>}
          {s.languages?.length > 0 && <><dt className="meta">语言</dt><dd>{s.languages.join(' / ')}</dd></>}
          {s.feeNote && <><dt className="meta">费用</dt><dd>{s.feeNote}</dd></>}
          {s.restrictions?.length > 0 && <><dt className="meta">使用限制</dt><dd>{s.restrictions.join('；')}</dd></>}
        </dl>
      </section>

      {games.length > 0 && (
        <section className="mb-8">
          <div className="sect"><h2>关联游戏</h2></div>
          <div className="flex flex-wrap gap-2">
            {games.map((g: any) => <Link key={g.id} href={`/games/${g.slug}/`} className="btn-line !h-9">{g.name.zh}</Link>)}
          </div>
        </section>
      )}

      {entries.length > 0 && (
        <section className="mb-8">
          <div className="sect"><h2>站内入口</h2></div>
          {entries.map((e) => (
            <div key={e.id} className="irow">
              <ExtLink href={e.url} label={e.name} health={e.linkHealth} className="font-medium" />
              <Tag>{zh('entryType', e.type)}</Tag>
              {e.note && <span className="meta hidden flex-1 sm:block">{e.note}</span>}
              {e.linkHealth !== 'ok' && <StatusBadge kind={e.linkHealth} />}
            </div>
          ))}
        </section>
      )}

      <footer className="meta border-t border-[var(--color-line-0)] pt-4 text-[13px]">
        本页核验于 {s.checkedAt} · <Link href="/about/#feedback" className="text-[var(--color-amber-hi)]">反馈</Link>
      </footer>
    </div>
  );
}
