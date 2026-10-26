import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { loadData } from '@/lib/data.mjs';
import { zh } from '@/lib/labels.mjs';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { ToolsGuidesIndex } from '@/components/catalog/tools-guides-index';
import { StatusBadge } from '@/components/ui/badge';

export const metadata: Metadata = { title: '工具', description: 'MOD 管理、存档、性能监控等 PC 游戏工具索引', alternates: { canonical: '/tools/' } };

const OS: Record<string, string> = { windows: 'Windows', macos: 'macOS', linux: 'Linux' };

function ToolCard({ t }: { t: any }) {
  const healthy = t.linkHealth === 'ok';
  return (
    <Link href={`/tools/${t.slug}/`} className="group relative flex h-full flex-col p-5 md:p-6 transition-colors">
      
      <div className="flex items-center justify-between gap-3 text-sm text-fg-2">
        <span>{zh('toolType', t.type)}</span>
        {!healthy && <StatusBadge value={t.linkHealth} />}
      </div>

      <span className="mt-3.5 flex items-center justify-between gap-3 font-serif text-xl sm:text-2xl font-bold leading-tight transition-colors group-hover:text-primary">
        {t.name}
        <ArrowRight aria-hidden className="size-4 shrink-0 text-fg-3 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </span>

      <p className="mt-2.5 flex-1 text-sm sm:text-base leading-relaxed text-fg-2 text-pretty">
        {t.summary}
      </p>

      <p className="mt-5 border-t border-border pt-3 text-sm text-fg-2">{(t.os ?? ['windows']).map((o: string) => OS[o] ?? o).join(' / ')}</p>
    </Link>
  );
}

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
