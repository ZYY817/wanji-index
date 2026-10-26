import { zh } from '@/lib/labels.mjs';
import { ListRow } from '@/components/ui/list-row';
import { fileTokens } from '@/components/ui/file-tokens';

/** 教程行（教程列表 / 搜索结果共用）：类型 · 分类 → 标题（文件名等宽）→ 问题描述 → 适用游戏 / 步骤数 / 核验日期 */
export function GuideRow({ g, games }: { g: any; games: string[] }) {
  return (
    <ListRow
      href={`/guides/${g.slug}/`}
      eyebrow={`${zh('guideKind', g.kind)} · ${zh('guideCategory', g.category)}`}
      title={fileTokens(g.title)}
      description={g.problem?.description}
      meta={[...games, `${g.steps.length} 个步骤`, `核验于 ${g.checkedAt}`].join(' · ')}
    />
  );
}
