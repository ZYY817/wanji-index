import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { zh } from '@/lib/labels.mjs';
import { fileTokens } from '@/components/ui/file-tokens';

/** 教程行（教程列表 / 搜索结果共用）：类型 · 分类 → 标题（文件名等宽）→ 问题描述 → 适用游戏 / 步骤数 / 核验日期 */
export function GuideRow({ g, games }: { g: any; games: string[] }) {
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
