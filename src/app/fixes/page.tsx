import { L } from '@/lib/labels-i18n';
import { T } from '@/lib/i18n';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { loadData } from '@/lib/data.mjs';
import { problemList } from '@/lib/problems';
import { IndexMasthead, MastNum } from '@/components/layout/page-masthead';
import { DetailSection } from '@/components/layout/detail-section';
import { GuideRow } from '@/components/catalog/guide-row';
import { fileTokens } from '@/components/ui/file-tokens';

export const metadata: Metadata = {
  title: '排障',
  description: '游戏闪退、打不开、缺少 dll、0xc000007b、黑屏、卡顿、存档丢失、手柄没反应、联机连不上：按症状找原因，从最常见的解法开始试。',
  alternates: { canonical: '/fixes/' },
};

// 排障入口：先按症状选问题（每个问题一页，多来源解法）→ 再往下是分步教程
export default function FixesPage() {
  const problems = problemList();
  const data = loadData();
  const guides = [...data.guides].sort((a: any, b: any) => a.title.localeCompare(b.title, 'zh'));
  const gameNames = (ids: string[] = []) => ids.map((id) => data.games.find((x: any) => x.id === id)?.name.zh).filter(Boolean) as string[];
  const withIssues = new Set(problems.flatMap((p) => p.games.map((g) => g.slug))).size;

  return (
    <>
      <IndexMasthead
        title={<T zh="排障" en="Fixes" />}
        count={problems.length + guides.length}
        description={<T zh={<>游戏打不开、闪退或者连不上网？先按症状对号入座。这里把常见的解法按从易到难理顺，并附带可信的来源出处；另有 <MastNum>{withIssues}</MastNum> 款游戏直接收录了对应专属的已知问题。</>} en={<>Game crashing, refusing to launch, or losing connection? Start with the symptom. Each issue breaks down fixes from easiest to hardest with verified sources, plus known issues for <MastNum>{withIssues}</MastNum> games.</>} />}
      />
      <div className="container-x pb-20">
        <DetailSection index={0} meta={{ id: 'problems', title: <T zh="按症状找" en="By symptom" />, lead: <T zh="点进去先对一对症状，确认符合再按步骤往下试。" en="Match your symptom first, then work through the fixes step by step." />, count: problems.length }}>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((p) => (
              <li key={p.id}>
                <Link href={`/fixes/${p.slug}/`} className="lift group flex h-full flex-col rounded-lg p-6 transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#161618] md:p-7">
                  <span className="text-sm text-fg-3">{L('problemCategory', p.category)}</span>
                  <span className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em]"><T zh={fileTokens(p.short)} en={p.shortEn} /></span>
                  <span className="mb-6 mt-3 line-clamp-3 text-base leading-[1.75] text-fg-2"><T zh={p.summary} en={p.summaryEn} /></span>
                  <span className="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4 text-sm text-fg-3">
                    <span><T zh={`${p.fixes.length} 种解法${p.gameCount ? ` · ${p.gameCount} 款游戏有记录` : ''}`} en={`${p.fixes.length} fixes${p.gameCount ? ` · ${p.gameCount} games affected` : ''}`} /></span>
                    <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection index={1} meta={{ id: 'guides', title: <T zh="分步教程" en="Step-by-step guides" />, lead: <T zh="对于稍微复杂一点的排障操作，我们拆成了详细图文步骤，每一步都写清了预期的正确反馈。" en="Detailed step-by-step guides for trickier setups, showing exactly what to expect at each stage." />, count: guides.length }}>
          <ul className="-mx-4 md:-mx-5">
            {guides.map((g: any) => <li key={g.id} className="border-b border-border last:border-b-0"><GuideRow g={g} games={gameNames(g.games)} /></li>)}
          </ul>
        </DetailSection>
      </div>
    </>
  );
}
