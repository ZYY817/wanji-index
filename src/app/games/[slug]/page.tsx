// 游戏档案页：封面横幅 + 档案头 + 速查条 + 渠道 + FAQ + MOD/工具反查 + 相关区
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadData, buildRelations, steamCover } from '@/lib/data.mjs';
import { computeLifecycle } from '@/lib/lifecycle.mjs';
import { zh } from '@/lib/labels.mjs';
import { LifecycleBadge, StatusBadge, Tag } from '@/components/badges';
import { AcquireButton, OutlineButton } from '@/components/buttons';
import { ExtLink } from '@/components/ext-link';
import { CopyButton } from '@/components/copy-button';
import site from '../../../../config/site.json';
import { webSiteLd } from '@/lib/jsonld.mjs';
import { JsonLd } from '@/components/json-ld';

export function generateStaticParams() {
  return loadData().games.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = loadData().games.find((x) => x.slug === slug);
  return g ? { title: g.name.zh, description: g.summary, alternates: { canonical: `/games/${g.slug}/` } } : {};
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = loadData();
  const g = data.games.find((x) => x.slug === slug);
  if (!g) notFound();
  const rel = buildRelations(data);
  const entries = rel.entriesByGame.get(g.id) ?? [];
  const tools = rel.toolsByGame.get(g.id) ?? [];
  const guides = rel.guidesByGame.get(g.id) ?? [];
  const offers = rel.offersByGame.get(g.id) ?? [];
  const sitesMap = new Map(data.sites.map((s) => [s.id, s]));
  const now = Date.now();
  const activeOffer = offers.find((o) => ['active', 'upcoming'].includes(computeLifecycle(o, now, site.review.staleDays.offerTimed) ?? ''));
  const related = (g.relatedGameIds ?? []).map((id) => data.games.find((x) => x.id === id)).filter(Boolean);
  const quick = [...(g.savePaths ?? []).map((p: any) => ({ ...p, k: '存档' })), ...(g.configPaths ?? []).map((p: any) => ({ ...p, k: '配置' }))];
  const cover = steamCover(g);

  return (
    <div>
      <JsonLd data={[
        { '@context': 'https://schema.org', '@type': 'VideoGame', name: g.name.zh, alternateName: g.name.en, description: g.summary, url: `${site.url.replace(/\/$/, '')}/games/${g.slug}/`, ...(g.genres?.length && { genre: g.genres }), ...(g.os?.length && { operatingSystem: g.os.join(', ') }) },
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['首页', '/'], ['游戏库', '/games/'], [g.name.zh, `/games/${g.slug}/`]].map(([n, p], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: site.url.replace(/\/$/, '') + p })) },
      ]} />

      {/* 封面横幅（有 Steam 图时） */}
      {cover && (
        <div className="relative h-44 overflow-hidden md:h-60">
          <img src={cover} alt="" className="h-full w-full scale-110 object-cover blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-0)] via-[rgba(11,14,19,0.45)] to-transparent" />
        </div>
      )}

      <div className={`wrap-doc ${cover ? '-mt-16 relative' : 'pt-10'}`}>
        <nav className="meta mb-4"><Link href="/" className="hover:text-[var(--color-txt-2)]">首页</Link> / <Link href="/games/" className="hover:text-[var(--color-txt-2)]">游戏库</Link> / {g.name.zh}</nav>

        <header className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">{g.name.zh}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {g.name.en && <span className="text-[var(--color-txt-3)]">{g.name.en}</span>}
            {(g.genres ?? []).map((t: string) => <Tag key={t}>{t}</Tag>)}
            {(g.os ?? []).map((o: string) => <Tag key={o}>{zh('os', o)}</Tag>)}
          </div>
          <p className="mt-3 text-[var(--color-txt-2)]">{g.summary}</p>
          <p className="meta mt-2 flex items-center gap-3">
            核验 {g.checkedAt}
            {g.reviewStatus !== 'verified' && <StatusBadge kind="unverified" />}
            <Link href="/about/#feedback" className="hover:text-[var(--color-amber-hi)]">反馈</Link>
          </p>
        </header>

        {quick.length > 0 && (
          <div className="mb-8 rounded-[var(--radius-ctl)] bg-[var(--color-ink-1)] p-4">
            {quick.map((p, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 text-[13px]">
                <span className="shrink-0 text-[var(--color-txt-3)]">{p.k}{p.os ? `·${p.os}` : ''}</span>
                <code className="mono min-w-0 break-all">{p.path}</code>
                <CopyButton text={p.path} />
                {p.note && <span className="meta hidden lg:inline">{p.note}</span>}
              </div>
            ))}
          </div>
        )}

        <section className="mb-10">
          <div className="sect"><h2>获取渠道</h2></div>
          {activeOffer && (
            <div className="mb-4 flex items-center gap-2 rounded-[var(--radius-ctl)] border border-[var(--color-warn)] bg-[rgba(240,160,48,0.08)] px-4 py-3 text-sm">
              ⚠ 限免进行中{activeOffer.endDate ? `，截止 ${activeOffer.endDate}` : ''} —— <ExtLink href={activeOffer.url} label="前往活动页" />
            </div>
          )}
          <div className="space-y-2">
            {g.channels.map((c: any, i: number) => {
              const dead = c.linkHealth === 'dead';
              return (
                <div key={i} className={`card flex items-center gap-4 !rounded-[var(--radius-ctl)] px-4 py-3.5 ${dead ? 'opacity-60' : ''}`}>
                  <span className={`font-medium ${dead ? 'line-through text-[var(--color-txt-3)]' : ''}`}>{zh('platform', c.platform)}</span>
                  <span className="tag">{zh('channelType', c.type)}</span>
                  <span className="meta hidden flex-1 sm:block">{c.priceNote ?? '—'}</span>
                  <span className="mono meta hidden md:block">核验 {c.checkedAt}</span>
                  <AcquireButton href={c.url} health={c.linkHealth} />
                </div>
              );
            })}
          </div>
        </section>

        {(g.faqs?.length ?? 0) > 0 && (
          <section className="mb-10">
            <div className="sect"><h2>常见问题</h2></div>
            {g.faqs.map((f: any, i: number) => {
              const guide = f.guideId && data.guides.find((x) => x.id === f.guideId);
              return (
                <details key={i} className="group border-b border-[var(--color-line-0)] py-3">
                  <summary className="flex cursor-pointer items-center gap-2 font-medium list-none">
                    <span className="text-[var(--color-txt-3)] transition-transform group-open:rotate-90">▸</span>{f.question}
                  </summary>
                  <div className="ml-6 mt-2 text-sm text-[var(--color-txt-2)]">
                    {guide ? <Link href={`/guides/${guide.slug}/`} className="text-[var(--color-amber-hi)]">查看教程：{guide.title} →</Link> : <p>{f.answer}</p>}
                  </div>
                </details>
              );
            })}
          </section>
        )}

        {entries.length > 0 && (
          <section className="mb-10">
            <div className="sect"><h2>MOD 与汉化</h2></div>
            {entries.map((e) => {
              const s = sitesMap.get(e.siteId) as any;
              return (
                <div key={e.id} className="irow">
                  <ExtLink href={e.url} label={e.name} health={e.linkHealth} className="font-medium" />
                  {s && <Link href={`/resources/${s.slug}/`} className="tag hover:text-[var(--color-amber-hi)]">{s.name}</Link>}
                  {e.note && <span className="meta hidden flex-1 sm:block">{e.note}</span>}
                  {e.linkHealth !== 'ok' && <StatusBadge kind={e.linkHealth} />}
                </div>
              );
            })}
          </section>
        )}

        {tools.length > 0 && (
          <section className="mb-10">
            <div className="sect"><h2>工具与修改器</h2></div>
            {tools.map((t) => (
              <Link key={t.id} href={`/tools/${t.slug}/`} className="irow">
                <span className="font-medium">{t.name}</span>
                <span className="meta flex-1 hidden sm:block">{t.summary}</span>
                <span className="tag">{zh('toolType', t.type)}</span>
              </Link>
            ))}
          </section>
        )}

        {(guides.length > 0 || related.length > 0) && (
          <div className="mb-10 grid gap-8 sm:grid-cols-2">
            {guides.length > 0 && (
              <section><div className="sect"><h2>相关教程</h2></div>
                {guides.map((x) => <Link key={x.id} href={`/guides/${x.slug}/`} className="block py-1.5 text-[var(--color-amber-hi)] hover:underline">{x.title}</Link>)}
              </section>
            )}
            {related.length > 0 && (
              <section><div className="sect"><h2>相关游戏</h2></div>
                {related.map((x) => <Link key={x.id} href={`/games/${x.slug}/`} className="block py-1.5 text-[var(--color-amber-hi)] hover:underline">{x.name.zh}</Link>)}
              </section>
            )}
          </div>
        )}

        <footer className="meta border-t border-[var(--color-line-0)] pt-4 text-[13px]">
          本页核验于 {g.checkedAt} · 信息有误或已失效？<Link href="/about/#feedback" className="text-[var(--color-amber-hi)]">告诉我们</Link>
        </footer>
      </div>
    </div>
  );
}
