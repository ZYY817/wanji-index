// 搜索索引构建 —— 与页面共用同一资格集合（docs/06 §8）
// 规则：Game/Site/Tool/Guide 独立入索引；Entry 不入索引但其关键词并入关联 Game/Site；
//       FreeOffer 不入全站索引。仅填有数据支撑的字段。
import { zh } from './labels.mjs';

export function buildSearchIndex(data, rel) {
  const entriesByGame = rel?.entriesByGame ?? new Map();
  const entriesBySite = rel?.entriesBySite ?? new Map();

  const kw = (rec, extra = []) =>
    [...new Set([
      rec.name?.zh, rec.name?.en, rec.name, rec.title,
      ...(rec.aliases ?? []), ...(rec.keywords ?? []), ...extra,
    ].filter(Boolean))];

  const items = [];
  for (const g of data.games)
    items.push({
      type: 'game', typeLabel: '游戏', title: g.name.zh, sub: g.name.en,
      url: `/games/${g.slug}/`, summary: g.summary,
      keywords: kw(g, (entriesByGame.get(g.id) ?? []).flatMap((e) => [e.name, e.note].filter(Boolean))),
    });
  for (const s of data.sites)
    items.push({
      type: 'site', typeLabel: '资源站', title: s.name, sub: zh('siteCategory', s.category),
      url: `/resources/${s.slug}/`, summary: s.summary,
      keywords: kw(s, (entriesBySite.get(s.id) ?? []).flatMap((e) => [e.name, e.note].filter(Boolean))),
    });
  for (const t of data.tools)
    items.push({
      type: 'tool', typeLabel: '工具', title: t.name, sub: zh('toolType', t.type),
      url: `/tools/${t.slug}/`, summary: t.summary, keywords: kw(t),
    });
  for (const g of data.guides)
    items.push({
      type: 'guide', typeLabel: '教程', title: g.title, sub: `${zh('guideKind', g.kind)}·${zh('guideCategory', g.category)}`,
      url: `/guides/${g.slug}/`, summary: g.problem?.description ?? '',
      keywords: kw(g, [g.problem?.errorText].filter(Boolean)),
    });
  return { buildTime: new Date().toISOString(), items };
}
