import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { loadData } from '@/lib/data.mjs';
import { zh } from '@/lib/labels.mjs';
import { IndexMasthead, MastNum } from '@/components/layout/page-masthead';
import { ErrorBand } from '@/components/layout/masthead-bands';
import { ToolsGuidesIndex } from '@/components/catalog/tools-guides-index';
export const metadata: Metadata = { title: '教程', description: '游戏安装、报错排查、MOD 安装、存档备份教程', alternates: { canonical: '/guides/' } };

/** 教程行：类型 · 分类 → 标题 → 问题描述 → 适用游戏 / 步骤数 / 核验日期 */
function GuideRow({ g, games }: { g: any; games: string[] }) {
  return (
    <Link href={`/guides/${g.slug}/`} className="group grid grid-cols-[minmax(0,1fr)_auto] gap-6 py-7 transition-colors hover:bg-card md:py-8">
      <div className="min-w-0">
        <p className="text-sm text-fg-3">{zh('guideKind', g.kind)} · {zh('guideCategory', g.category)}</p>
        <h2 className="mt-2 font-serif text-2xl font-bold leading-snug transition-colors group-hover:text-primary md:text-3xl">{g.title}</h2>
        {g.problem?.description && <p className="mt-3 max-w-[64ch] text-base leading-[1.75] text-fg-2">{g.problem.description}</p>}
        <p className="mt-4 text-sm text-fg-3">
          {[...games, `${g.steps.length} 个步骤`, `核验于 ${g.checkedAt}`].join(' · ')}
        </p>
      </div>
      <ArrowRight aria-hidden className="mt-8 size-5 text-fg-3 transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
    </Link>
  );
}

export default function GuidesPage() {
  const data = loadData();
  const guides = [...data.guides].sort((a: any, b: any) => a.title.localeCompare(b.title, 'zh'));
  const cats = [...new Set<string>(guides.map((g: any) => g.category))];
  // 刊头内容带：教程里收录的真实报错原文与缺失文件名
  const errorLines = [...new Set<string>(guides.flatMap((g: any) => [g.problem?.errorText, ...(g.keywords ?? []).filter((k: string) => /.(dll|exe)$/i.test(k))]).filter(Boolean))];
  const gameNames = (ids: string[] = []) => ids.map((id) => data.games.find((x: any) => x.id === id)?.name.zh).filter(Boolean) as string[];
  return (
    <>
      <IndexMasthead
        no="05"
        title="教程"
        description={<><MastNum>{guides.length}</MastNum> 篇教程，从报错原文开始。每一步写明怎么做、做完应该看到什么、不行再怎么办。</>}
        band={<ErrorBand lines={errorLines} />}
      />
      <div className="container-x pb-20">
        <ToolsGuidesIndex
          param="cat"
          placeholder="标题或报错原文"
          categories={cats.map((c) => ({ value: c, label: zh('guideCategory', c) }))}
          rows={guides.map((g: any) => ({
            id: g.id,
            query: [g.title, g.problem?.description, g.problem?.errorText, ...(g.keywords ?? [])].join(' '),
            category: g.category,
            content: <GuideRow g={g} games={gameNames(g.games)} />,
          }))}
        />
      </div>
    </>
  );
}
