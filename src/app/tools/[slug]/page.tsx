import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadData } from '@/lib/data.mjs';
import { StatusBadge, Tag } from '@/components/badges';
import { AcquireButton } from '@/components/buttons';
import { zh } from '@/lib/labels.mjs';
import site from '../../../../config/site.json';

export function generateStaticParams() {
  return loadData().tools.map((t) => ({ slug: t.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = loadData().tools.find((x) => x.slug === slug);
  return t ? { title: t.name, description: t.summary, alternates: { canonical: `/tools/${t.slug}/` } } : {};
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = loadData();
  const t = data.tools.find((x) => x.slug === slug);
  if (!t) notFound();
  const games = (t.supportedGames ?? []).map((id: string) => data.games.find((g) => g.id === id)).filter(Boolean);
  const guides = data.guides.filter((g) => (g.tools ?? []).includes(t.id));

  return (
    <div className="wrap-doc py-10">
      <nav className="meta mb-4"><Link href="/">首页</Link> / <Link href="/tools/">工具</Link> / {t.name}</nav>
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-3xl font-black tracking-tight">{t.name}</h1>
          <AcquireButton href={t.officialUrl} label="官方获取" health={t.linkHealth} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Tag>{zh('toolType', t.type)}</Tag>
          {(t.os ?? []).map((o: string) => <Tag key={o}>{zh('os', o)}</Tag>)}
        </div>
        <p className="mt-3 text-[var(--color-txt-2)]">{t.summary}</p>
        <p className="meta mt-2 flex items-center gap-3">核验 {t.checkedAt}{t.reviewStatus !== 'verified' && <StatusBadge kind="unverified" />}</p>
      </header>

      {t.description && <section className="mb-8"><div className="sect"><h2>功能</h2></div><p className="text-[var(--color-txt-2)]">{t.description}</p></section>}
      {t.installNotes && <section className="mb-8"><div className="sect"><h2>安装与使用要点</h2></div><p className="whitespace-pre-line text-[var(--color-txt-2)]">{t.installNotes}</p></section>}

      <section className="mb-8">
        <div className="sect"><h2>兼容与版本</h2></div>
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[8em_1fr]">
          <dt className="meta">版本</dt>
          <dd>{t.version?.latest ? <code className="mono">{t.version.latest}</code> : <StatusBadge kind="unchecked" />}{t.version?.checkedAt && <span className="meta">（核验 {t.version.checkedAt}）</span>}</dd>
          <dt className="meta">兼容性</dt>
          <dd>{t.compatibility ?? <StatusBadge kind="unchecked" />}</dd>
          {t.osVersions?.length > 0 && <><dt className="meta">适用系统版本</dt><dd>{t.osVersions.join(' / ')}</dd></>}
          {t.limitations?.length > 0 && <><dt className="meta">已知限制</dt><dd>{t.limitations.join('；')}</dd></>}
        </dl>
      </section>

      {(t.risks?.length ?? 0) > 0 && (
        <div className="mb-6 rounded-[var(--radius-ctl)] border border-[var(--color-warn)] bg-[rgba(240,160,48,0.08)] px-4 py-3 text-sm">⚠ {t.risks.join('；')}</div>
      )}
      {t.uninstallNote && <p className="mb-8 text-sm text-[var(--color-txt-2)]">恢复/卸载：{t.uninstallNote}</p>}

      {games.length > 0 && (
        <section className="mb-8"><div className="sect"><h2>适用游戏</h2></div>
          <div className="flex flex-wrap gap-2">{games.map((g) => <Link key={g.id} href={`/games/${g.slug}/`} className="btn-line !h-9">{g.name.zh}</Link>)}</div>
        </section>
      )}
      {guides.length > 0 && (
        <section className="mb-8"><div className="sect"><h2>相关教程</h2></div>
          {guides.map((g) => <Link key={g.id} href={`/guides/${g.slug}/`} className="block py-1.5 text-[var(--color-amber-hi)] hover:underline">{g.title}</Link>)}
        </section>
      )}

      <footer className="meta border-t border-[var(--color-line-0)] pt-4 text-[13px]">本页核验于 {t.checkedAt} · <Link href="/about/#feedback" className="text-[var(--color-amber-hi)]">反馈</Link></footer>
    </div>
  );
}
