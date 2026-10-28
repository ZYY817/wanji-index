import { G } from '@/lib/labels-i18n';
import { T } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { gameDetail, gameMeta, gameSlugs, type GameDetail, type SectionId } from '@/lib/game-detail';
import { SITE_BASE } from '@/lib/present';
import { JsonLd } from '@/components/seo/json-ld';
import { StatusBadge } from '@/components/ui/badge';
import { FeedbackLink } from '@/components/layout/feedback';
import { PosterCard } from '@/components/game/poster-card';
import { Reveal } from '@/components/fx/reveal';
import { ClipReveal } from '@/components/fx/interact';
import { DetailHero } from '@/components/game/detail/detail-hero';
import { QuickFacts } from '@/components/game/detail/quick-facts';
import { SectionNav } from '@/components/game/detail/section-nav';
import { DetailSection } from '@/components/layout/detail-section';
import {
  ChannelList, EntryList, FaqList, IssueList, SpecsTable, GuideList, PathList, ToolList,
} from '@/components/game/detail/detail-sections';
import { RigVerdict } from '@/components/rig/rig';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return gameSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const m = gameMeta(slug);
  return m ? { title: m.name, description: m.summary, alternates: { canonical: `/games/${slug}/` } } : {};
}

/** 章节 id → 内容渲染。新增章节：game-detail.ts 加数据与 LEADS，再在这里加一行。 */
function sectionBody(d: GameDetail, id: SectionId) {
  switch (id) {
    case 'channels': return <ChannelList items={d.channels} />;
    case 'paths': return <PathList items={d.paths} />;
    case 'entries': return <EntryList items={d.entries} />;
    case 'tools': return <ToolList items={d.tools} />;
    case 'guides': return <GuideList items={d.guides} />;
    case 'issues': return <IssueList groups={d.issues} />;
    case 'specs': return <><RigVerdict reqs={d.reqs} />{d.specsEn.length ? <T zh={<SpecsTable rows={d.specs} />} en={<SpecsTable rows={d.specsEn} />} /> : <SpecsTable rows={d.specs} />}</>;
    case 'faq': return <FaqList items={d.faqs} />;
  }
}

// 游戏档案页：首屏（美术 + 片名）→ 速答条（四个最常见问题）→ 吸顶章节导航 → 两栏章节 → 档案信息 → 相关游戏
export default async function GamePage({ params }: Params) {
  const { slug } = await params;
  const d = gameDetail(slug);
  if (!d) notFound();
  const { vm } = d;
  const url = `${SITE_BASE}/games/${vm.slug}/`;

  return (
    <>
      <JsonLd
        data={[
          { '@context': 'https://schema.org', '@type': 'VideoGame', name: vm.name, alternateName: d.enName, description: d.summary, url, genre: d.genres, operatingSystem: d.os.join(', ') },
          {
            '@context': 'https://schema.org', '@type': 'BreadcrumbList',
            itemListElement: [['首页', '/'], ['游戏库', '/games/'], [vm.name, `/games/${vm.slug}/`]].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE_BASE + path })),
          },
        ]}
      />

      <DetailHero id={vm.id} name={vm.name} enName={d.enName} summary={d.summary} summaryEn={d.summaryEn} tags={[...d.genreKeys.map((k) => <span key={k}>{G(k)}</span>), ...d.os.map((o) => <span key={o}>{o}</span>)]} byline={d.byline} bylineEn={d.bylineEn} art={vm.art} />
      <QuickFacts d={d} />
      {d.sections.length > 1 && <SectionNav sections={d.sections} />}

      <div className="container-x">
        {d.sections.map((s, i) => (
          <DetailSection key={s.id} meta={{ ...s, title: <T zh={s.title} en={s.titleEn} />, lead: <T zh={s.lead} en={s.leadEn} /> }} index={i}>
            {sectionBody(d, s.id)}
          </DetailSection>
        ))}

        <Reveal as="aside" className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border py-8 text-sm text-fg-2">
          <span className="font-medium text-foreground"><T zh="档案信息" en="About this page" /></span>
          <StatusBadge value={d.reviewStatus} />
          <span className="font-mono text-2xs text-fg-3"><T zh="核验于" en="Checked" /> {d.checkedAt}</span>
          {d.autoSources.length > 0 && (
            <span className="basis-full text-sm text-fg-3 md:basis-auto">
              <T zh="部分信息自动收录自" en="Some details collected automatically from" />{' '}
              {d.autoSources.map((s, i) => (
                <span key={s.url}>{i > 0 && '、'}<a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-border-strong underline-offset-4 hover:text-foreground">{s.name === 'Steam 商店' ? <T zh={s.name} en="Steam Store" /> : s.name}</a></span>
              ))}
              {d.syncedAt && <><T zh="，更新于" en=", updated" /> <span className="font-mono text-2xs">{d.syncedAt}</span></>}
            </span>
          )}
          <FeedbackLink page={`${vm.name}（/games/${vm.slug}/）`} className="ml-auto inline-flex min-h-11 items-center text-fg-2 underline underline-offset-4 hover:text-foreground">
            <T zh="信息有误？反馈给我们" en="Spot an error? Tell us" />
          </FeedbackLink>
        </Reveal>
      </div>

      {d.related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t border-border py-16 md:py-24">
          <div className="container-x">
            <Reveal>
              <h2 id="related-title" className="font-serif text-3xl font-bold tracking-[-0.03em] md:text-4xl"><T zh="继续探索" en="Keep exploring" /></h2>
              <p className="mt-3 text-base text-fg-2"><T zh={`与${vm.name}相近的游戏档案。`} en={`Games similar to ${d.enName || vm.name}.`} /></p>
            </Reveal>
            <Reveal delay={0.08} className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-6">
              {d.related.map((g, i) => <ClipReveal key={g.id} delay={i * 0.06}><PosterCard g={g} /></ClipReveal>)}
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
