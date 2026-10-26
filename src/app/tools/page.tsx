import type { Metadata } from 'next';
import { loadData } from '@/lib/data.mjs';
import { zh } from '@/lib/labels.mjs';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { ToolsGuidesIndex } from '@/components/catalog/tools-guides-index';
import { ToolCard } from '@/components/catalog/tool-card';

export const metadata: Metadata = { title: '工具', description: 'MOD 管理、存档、性能监控等 PC 游戏工具索引', alternates: { canonical: '/tools/' } };

export default function ToolsPage() {
  const tools = [...loadData().tools].sort((a: any, b: any) => a.name.localeCompare(b.name));
  const types = [...new Set<string>(tools.map((t: any) => t.type))];
  return (
    <>
      <IndexMasthead
        title="工具"
        count={tools.length}
        description={`收录 ${tools.length} 款常用工具：管理 MOD、备份存档、监控性能，附下载地址与安装要点。`}
      />
      <div className="container-x pb-20">
        <ToolsGuidesIndex
          param="type"
          placeholder="工具名或用途"
          grid
          categories={types.map((t) => ({ value: t, label: zh('toolType', t) }))}
          rows={tools.map((t: any) => ({
            id: t.id,
            query: [t.name, t.summary, ...(t.aliases ?? [])].join(' '),
            category: t.type,
            content: <ToolCard t={t} />,
          }))}
        />
      </div>
    </>
  );
}
