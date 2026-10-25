import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { gameVM } from '@/lib/present';
import { zh } from '@/lib/labels.mjs';
import { StatusBadge, Tag } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { ExtLink } from '@/components/ui/ext-link';
import { SiteLogo } from '@/components/ui/site-logo';
import { FeedbackLink } from '@/components/layout/feedback';
import { DetailMasthead, Notice, type DetailFact } from '@/components/layout/detail-masthead';
import { DetailSection } from '@/components/layout/detail-section';
import { PosterCard } from '@/components/game/poster-card';
import { Reveal } from '@/components/fx/reveal';
import { cn, domainOf } from '@/lib/utils';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return loadData().sites.map((s: any) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = loadData().sites.find((x: any) => x.slug === slug);
  return s ? { title: s.name, description: s.summary, alternates: { canonical: `/resources/${s.slug}/` } } : {};
}

// 资源站详情：刊头（是什么 + 访问按钮 + 关键事实）→ 站内游戏入口 → 关联游戏
export default async function SitePage({ params }: Params) {
  const { slug } = await params;
  const data = loadData();
  const s = data.sites.find((x: any) => x.slug === slug);
  if (!s) notFound();
  const rel = buildRelations(data);
  const entries = rel.entriesBySite.get(s.id) ?? [];
  const games = [...new Map((rel.gamesBySite.get(s.id) ?? []).map((g: any) => [g.id, g])).values()] as any[];
  const gameOf = (id?: string) => (id ? data.games.find((g: any) => g.id === id) : undefined);

  const facts: DetailFact[] = [
    { label: '主要用途', value: s.purposes?.join('；') },
    { label: '语言', value: s.languages?.join(' / ') },
    { label: '费用', value: s.feeNote },
    { label: '别名', value: s.aliases?.join('、') },
    { label: '核验', value: <span className="flex flex-wrap items-center gap-2">{s.checkedAt}<StatusBadge value={s.reviewStatus} /></span> },
  ].filter((f) => f.value);

  const sections = [
    { id: 'entries', title: '站内入口', lead: '这个站点里与具体游戏相关的页面，点击直达原站。', count: entries.length },
    ...(games.length ? [{ id: 'games', title: '关联游戏', lead: '在本站有档案、并收录了这个站点入口的游戏。', count: games.length }] : []),
  ];

  return (
    <>
      <DetailMasthead
        crumbs={[['资源站', '/resources/'], [s.name]]}
        mark={<SiteLogo id={s.id} name={s.name} size={52} />}
        kicker={zh('siteCategory', s.category)}
        title={s.name}
        summary={s.summary}
        action={(
          <ExtLink href={s.url} health={s.linkHealth} className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full justify-between')}>
            访问 {domainOf(s.url)}
          </ExtLink>
        )}
        facts={facts}
        notice={s.risks?.length ? <Notice title="访问前须知">{s.risks.map((r: string) => <p key={r}>{r}</p>)}</Notice> : undefined}
      />

      <div className="container-x">
        <DetailSection meta={sections[0]} index={0}>
          {entries.length ? (
            <ul className="border-t border-border-strong">
              {entries.map((e: any) => {
                const g = gameOf(e.gameId);
                return (
                  <li key={e.id} className="border-b border-border py-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <ExtLink href={e.url} health={e.linkHealth} className="font-serif text-2xl font-bold leading-tight transition-colors hover:text-primary">
                        {e.name}
                      </ExtLink>
                      <Tag>{zh('entryType', e.type)}</Tag>
                      {e.linkHealth !== 'ok' && <StatusBadge value={e.linkHealth} />}
                    </div>
                    {e.note && <p className="mt-2 text-base text-fg-2">{e.note}</p>}
                    <p className="mt-3 text-sm text-fg-3">
                      {g && (
                        <>
                          游戏档案{' '}
                          <Link href={`/games/${g.slug}/`} className="text-fg-2 underline decoration-border-strong underline-offset-4 transition-colors hover:text-foreground">
                            {g.name.zh}
                          </Link>
                          {' · '}
                        </>
                      )}
                      核验于 {e.checkedAt}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="border-t border-border-strong pt-6 text-base text-fg-2">暂未收录具体游戏的入口，可以直接访问官网浏览。</p>
          )}
        </DetailSection>

        {games.length > 0 && (
          <DetailSection meta={sections[1]} index={1}>
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">
              {games.map((g) => <PosterCard key={g.id} g={gameVM(g, rel)} />)}
            </div>
          </DetailSection>
        )}

        <Reveal as="aside" className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border-strong py-8 text-sm text-fg-3">
          <span className="text-foreground">站点信息</span>
          <span>核验于 {s.checkedAt}</span>
          <FeedbackLink page={`${s.name}（/resources/${s.slug}/）`} className="ml-auto inline-flex min-h-11 items-center text-fg-2 underline underline-offset-4 hover:text-foreground">
            信息有误？反馈给我们
          </FeedbackLink>
        </Reveal>
      </div>
    </>
  );
}
