import { L } from '@/lib/labels-i18n';
import { T } from '@/lib/i18n';
import type { Metadata } from 'next';
import { loadData } from '@/lib/data.mjs';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { ToolsGuidesIndex } from '@/components/catalog/tools-guides-index';
import { GuideRow } from '@/components/catalog/guide-row';
export const metadata: Metadata = { title: '教程', description: '游戏安装、报错排查、MOD 安装、存档备份教程', alternates: { canonical: '/guides/' } };

export default function GuidesPage() {
  const data = loadData();
  const guides = [...data.guides].sort((a: any, b: any) => a.title.localeCompare(b.title, 'zh'));
  const cats = [...new Set<string>(guides.map((g: any) => g.category))];
  const gameNames = (ids: string[] = []) => ids.map((id) => data.games.find((x: any) => x.id === id)?.name.zh).filter(Boolean) as string[];

  return (
    <>
      <IndexMasthead
        title={<T zh="教程" en="Guides" />}
        count={guides.length}
        description={<T zh={`收录 ${guides.length} 篇实测排障与安装指南。从真实报错原文开始，分步验证，写明每一步的预期系统反馈。`} en={`${guides.length} step-by-step install and troubleshooting guides, starting from the real error message, with the expected result of every step.`} />}
      />
      <div className="container-x pb-20">
        <ToolsGuidesIndex
          param="cat"
          placeholder="标题或报错原文"
          placeholderEn="Title or error text"
          categories={cats.map((c) => ({ value: c, label: L('guideCategory', c) }))}
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
