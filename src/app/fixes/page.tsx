import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { loadData } from '@/lib/data.mjs';
import { zh } from '@/lib/labels.mjs';
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
        title="排障"
        count={problems.length + guides.length}
        description={<>游戏出问题了？先按症状选一个。每个问题整理了从易到难的几种解法并注明来源；另有 <MastNum>{withIssues}</MastNum> 款游戏附上了 PCGamingWiki 记录的已知问题。</>}
      />
      <div className="container-x pb-20">
        <DetailSection index={0} meta={{ id: 'problems', title: '按症状找', lead: '点进去先确认是不是这个问题，再从第一种解法开始试。', count: problems.length }}>
          <ul className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((p) => (
              <li key={p.id} className="bg-background">
                <Link href={`/fixes/${p.slug}/`} className="group flex h-full flex-col p-6 transition-colors hover:bg-card md:p-7">
                  <span className="text-sm text-fg-3">{zh('problemCategory', p.category)}</span>
                  <span className="mt-2 text-2xl font-semibold tracking-[-0.01em] transition-colors group-hover:text-primary">{fileTokens(p.short)}</span>
                  <span className="mt-3 line-clamp-3 text-base leading-[1.75] text-fg-2">{p.summary}</span>
                  <span className="mt-auto flex items-center justify-between gap-3 pt-6 text-sm text-fg-3">
                    <span>{p.fixes.length} 种解法{p.gameCount ? ` · ${p.gameCount} 款游戏有记录` : ''}</span>
                    <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection index={1} meta={{ id: 'guides', title: '分步教程', lead: '需要一步步照着做的，写成了教程：每一步写明预期结果，不行再看下一步。', count: guides.length }}>
          <ul className="-mx-4 md:-mx-5">
            {guides.map((g: any) => <li key={g.id} className="border-b border-border last:border-b-0"><GuideRow g={g} games={gameNames(g.games)} /></li>)}
          </ul>
        </DetailSection>
      </div>
    </>
  );
}
