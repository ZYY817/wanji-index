import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { loadData } from '@/lib/data.mjs';
import { zh } from '@/lib/labels.mjs';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { ToolsGuidesIndex } from '@/components/catalog/tools-guides-index';
import { fileTokens } from '@/components/ui/file-tokens';
export const metadata: Metadata = { title: '教程', description: '游戏安装、报错排查、MOD 安装、存档备份教程', alternates: { canonical: '/guides/' } };

function GuideRow({ g, games }: { g: any; games: string[] }) {
  return (
    <Link href={`/guides/${g.slug}/`} className="group grid grid-cols-[minmax(0,1fr)_auto] gap-6 py-7 transition-colors hover:bg-card md:py-8">
      <div className="min-w-0">
        <p className="text-sm text-fg-3">{zh('guideKind', g.kind)} · {zh('guideCategory', g.category)}</p>
        <h2 className="mt-2 font-serif text-2xl font-bold leading-snug transition-colors group-hover:text-primary md:text-3xl">{fileTokens(g.title)}</h2>
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
  const gameNames = (ids: string[] = []) => ids.map((id) => data.games.find((x: any) => x.id === id)?.name.zh).filter(Boolean) as string[];

  return (
    <>
      <IndexMasthead
        title="教程"
        count={guides.length}
        description={`收录 ${guides.length} 篇实测排障与安装指南。从真实报错原文开始，分步验证，写明每一步的预期系统反馈。`}
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
