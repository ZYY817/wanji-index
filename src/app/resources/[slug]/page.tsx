import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { gameVM, siteVM } from '@/lib/present';
import { StatusBadge, Tag } from '@/components/ui/badge';
import { ExtLink } from '@/components/ui/ext-link';
import { Monogram } from '@/components/ui/monogram';
import { SectionHeading } from '@/components/ui/section-label';
import { PageMasthead } from '@/components/layout/page-masthead';
import { FeedbackLink } from '@/components/layout/feedback';
import { PosterCard } from '@/components/game/poster-card';
import { zh } from '@/lib/labels.mjs';
export function generateStaticParams(){return loadData().sites.map(s=>({slug:s.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params;const s=loadData().sites.find(x=>x.slug===slug);return s?{title:s.name,description:s.summary,alternates:{canonical:`/resources/${s.slug}/`}}:{}}
export default async function SitePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; const data=loadData();const s=data.sites.find(x=>x.slug===slug);if(!s)notFound();const rel=buildRelations(data);const vm=siteVM(s,rel);const entries=rel.entriesBySite.get(s.id)??[];const games=[...new Map((rel.gamesBySite.get(s.id)??[]).map((g:any)=>[g.id,g])).values()] as any[];
 return <><PageMasthead no="03" en={vm.domain} title={s.name} description={s.summary} crumbs={[["资源站","/resources/"],[s.name]]}><div className="flex flex-wrap items-center gap-5 pb-8"><Monogram name={s.name} seed={s.id} size={72}/><div className="flex flex-1 flex-wrap gap-2"><Tag>{zh('siteCategory',s.category)}</Tag>{s.aliases?.map((a:string)=><Tag key={a}>{a}</Tag>)}<StatusBadge value={s.linkHealth}/><StatusBadge value={s.reviewStatus}/></div><ExtLink href={s.url} health={s.linkHealth} className="inline-flex min-h-12 items-center border border-border-strong px-5 text-sm hover:border-foreground">访问官网</ExtLink></div></PageMasthead>
 <div className="container-x grid gap-12 py-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-20 lg:py-20"><aside><div className="sticky top-[calc(var(--header-h)+24px)]"><p className="meta mb-5 text-fg-3">SOURCE RECORD</p><dl className="text-sm">{[['主要用途',s.purposes?.join('；')],['语言',s.languages?.join(' / ')],['费用',s.feeNote],['最近核验',s.checkedAt]].filter(([,v])=>v).map(([k,v])=><div key={k} className="border-t border-border py-4"><dt className="meta mb-2 text-fg-3">{k}</dt><dd className="leading-relaxed text-fg-2">{v}</dd></div>)}</dl><FeedbackLink page={`${s.name}（/resources/${s.slug}/）`} className="mt-4 inline-flex min-h-11 items-center text-sm underline underline-offset-4">反馈站点信息</FeedbackLink></div></aside><div className="min-w-0">
 {!!s.risks?.length&&<div className="mb-10 border-l-2 border-warn bg-warn/5 px-5 py-4 text-sm leading-relaxed"><p className="meta mb-2 text-warn">访问前须知</p>{s.risks.join('；')}</div>}
 <section><SectionHeading no="01" title="站内入口" count={entries.length}/>{entries.length?entries.map(e=><div key={e.id} className="border-b border-border py-5"><div className="flex flex-wrap items-center gap-3"><ExtLink href={e.url} health={e.linkHealth} className="font-serif text-lg font-bold">{e.name}</ExtLink><Tag>{zh('entryType',e.type)}</Tag><StatusBadge value={e.linkHealth}/></div>{e.note&&<p className="mt-2 text-sm text-fg-2">{e.note}</p>}<div className="mt-3 flex flex-wrap gap-3 text-xs text-fg-3">{(e.gameId?[e.gameId]:[]).map((id:string)=>{const g=data.games.find(g=>g.id===id);return g&&<Link key={id} href={`/games/${g.slug}/`} className="hover:text-primary">{g.name.zh}</Link>})}<span className="font-mono">核验 {e.checkedAt}</span></div></div>):<p className="text-sm text-fg-3">暂未收录独立游戏入口，可通过官网浏览。</p>}</section>
 {games.length>0&&<section className="mt-16"><SectionHeading no="02" title="关联游戏" count={games.length}/><div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">{games.map(g=><PosterCard key={g.id} g={gameVM(g,rel)}/>)}</div></section>}
 </div></div></>;
}

