import { T } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { gameVM } from '@/lib/present';
import { zh, en } from '@/lib/labels.mjs';
import { StatusBadge, Tag } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { ExtLink } from '@/components/ui/ext-link';
import { SiteLogo } from '@/components/ui/site-logo';
import { FeedbackLink } from '@/components/layout/feedback';
import { DetailMasthead, Notice, type DetailFact } from '@/components/layout/detail-masthead';
import { SafetyNote } from '@/components/layout/safety-note';
import { DetailSection } from '@/components/layout/detail-section';
import { PosterCard } from '@/components/game/poster-card';
import { Reveal } from '@/components/fx/reveal';
import { cn, domainOf } from '@/lib/utils';
import { ListRow } from '@/components/ui/list-row';

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
    { label: <T zh="主要用途" en="Used for" />, value: s.purposes?.join('；') },
    { label: <T zh="语言" en="Language" />, value: s.languages?.join(' / ') },
    { label: <T zh="费用" en="Cost" />, value: s.feeNote },
    { label: <T zh="别名" en="Also known as" />, value: s.aliases?.join('、') },
    { label: <T zh="核验" en="Checked" />, value: <span className="flex flex-wrap items-center gap-2">{s.checkedAt}<StatusBadge value={s.reviewStatus} /></span> },
  ].filter((f) => f.value);

  const sections = [
    { id: 'entries', title: <T zh="站内入口" en="Game pages" />, lead: <T zh="这个站点里与具体游戏相关的页面，点击直达原站。" en="Pages on this site for specific games — opens the original site." />, count: entries.length },
    ...(games.length ? [{ id: 'games', title: <T zh="关联游戏" en="Games" />, lead: <T zh="在本站有档案、并收录了这个站点入口的游戏。" en="Games in our index that link to this site." />, count: games.length }] : []),
  ];

  return (
    <>
      <DetailMasthead
        crumbs={[[<T key="r" zh="资源站" en="Sites" />, '/resources/'], [s.name]]}
        mark={<SiteLogo id={s.id} name={s.name} size={52} />}
        kicker={zh('siteCategory', s.category)}
        title={s.name}
        summary={s.summary}
        action={(
          <ExtLink href={s.url} health={s.linkHealth} className={cn(buttonVariants({ variant: 'solid', size: 'lg' }), 'w-full justify-between')}>
            <T zh="访问" en="Visit" /> {domainOf(s.url)}
          </ExtLink>
        )}
        facts={facts}
        notice={(
          <div className="grid gap-4 lg:grid-cols-2">
            {s.risks?.length ? <Notice title={<T zh="访问前须知" en="Before you go" />}>{s.risks.map((r: string) => <p key={r}>{r}</p>)}</Notice> : null}
            <SafetyNote />
          </div>
        )}
      />

      <div className="container-x">
        <DetailSection meta={sections[0]} index={0}>
          {entries.length ? (
            <ul className="-mx-4 md:-mx-5">
              {entries.map((e: any) => {
                const g = gameOf(e.gameId);
                return (
                  <li key={e.id} className="border-b border-border last:border-b-0">
                    <ListRow
                      href={e.url}
                      external
                      health={e.linkHealth}
                      title={e.nameEn ? <T zh={e.name} en={e.nameEn} /> : e.name}
                      badge={<><Tag><T zh={zh('entryType', e.type)} en={en('entryType', e.type)} /></Tag>{e.linkHealth !== 'ok' && e.linkHealth !== 'dead' && <StatusBadge value={e.linkHealth} />}</>}
                      description={e.note ? <T zh={e.note} en={e.noteEn ?? e.note} /> : undefined}
                      meta={<>{g ? <><T zh="游戏：" en="Game: " /><T zh={g.name.zh} en={g.name.en || g.name.zh} /> · </> : ''}<span className="tabular text-2xs"><T zh="核验于" en="Checked" /> {e.checkedAt}</span></>}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-base text-fg-2"><T zh="暂未收录具体游戏的入口，可以直接访问官网浏览。" en="No game pages collected yet — visit the site directly." /></p>
          )}
        </DetailSection>

        {games.length > 0 && (
          <DetailSection meta={sections[1]} index={1}>
            <div className="grid grid-cols-3 gap-x-5 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
              {games.map((g) => <PosterCard key={g.id} g={gameVM(g, rel)} />)}
            </div>
          </DetailSection>
        )}

        <Reveal as="aside" className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border-strong py-8 text-sm text-fg-3">
          <span className="text-foreground"><T zh="站点信息" en="About this site" /></span>
          <span><T zh="核验于" en="Checked" /> {s.checkedAt}</span>
          <FeedbackLink page={`${s.name}（/resources/${s.slug}/）`} className="ml-auto inline-flex min-h-11 items-center text-fg-2 underline underline-offset-4 hover:text-foreground">
            <T zh="信息有误？反馈给我们" en="Spot an error? Tell us" />
          </FeedbackLink>
        </Reveal>
      </div>
    </>
  );
}
