// 站内搜索匹配（命令面板与 /search/ 共用同一算法）
// 规则：所有空格分词都需命中（AND）；标题前缀 > 标题包含 > 副标题/关键词/摘要
export type SearchItem = {
  type: 'game' | 'site' | 'tool' | 'guide';
  typeLabel: string;
  title: string;
  sub?: string;
  url: string;
  summary?: string;
  keywords?: string[];
  art?: string | null;
  seed?: string;
};

export const TYPE_ORDER = ['game', 'site', 'tool', 'guide'] as const;
export const TYPE_ZH: Record<string, string> = { game: '游戏', site: '资源站', tool: '工具', guide: '教程' };

export function tokenize(q: string) {
  return q.toLowerCase().split(/\s+/).filter(Boolean);
}

export function matchItems(items: SearchItem[], q: string): SearchItem[] {
  const words = tokenize(q);
  if (!words.length) return [];
  const scored: [SearchItem, number][] = [];
  for (const it of items) {
    const title = it.title.toLowerCase();
    const hay = [it.title, it.sub, it.summary, ...(it.keywords ?? [])].filter(Boolean).join(' ').toLowerCase();
    if (!words.every((w) => hay.includes(w))) continue;
    let s = 0;
    for (const w of words) s += title.startsWith(w) ? 4 : title.includes(w) ? 2 : (it.sub ?? '').toLowerCase().includes(w) ? 1.5 : 1;
    scored.push([it, s]);
  }
  return scored.sort((a, b) => b[1] - a[1]).map(([it]) => it);
}

export function groupByType(items: SearchItem[]) {
  return TYPE_ORDER.map((t) => ({ type: t, label: TYPE_ZH[t], items: items.filter((i) => i.type === t) })).filter((g) => g.items.length);
}
