// 统一发布资格判定（docs/04 §8.3）：可展示 = published ∧ 达标 ∧ 非 _demo
// M0a 已验证；全站唯一判定处——详情页/索引/关联/搜索索引/Sitemap 共用它

export const MIN_STANDARD = {
  game: (r) => !!(r.name?.zh && r.summary && r.channels?.length >= 1),
  site: (r) => !!(r.name && r.url && r.summary && r.category),
  entry: (r) => !!(r.name && r.siteId && r.url),
  tool: (r) => !!(r.name && r.summary && r.type && r.officialUrl),
  guide: (r) => !!(r.title && r.kind && r.category && r.steps?.length >= 1),
  offer: (r) => !!(r.gameTitle && r.type && r.platform && r.url && r.checkedAt),
};

export function isEligible(type, rec) {
  if (!rec || rec._demo === true) return false;
  if (rec.publishStatus !== 'published') return false;
  return MIN_STANDARD[type]?.(rec) ?? false;
}

export function filterEligible(type, records) {
  return records.filter((r) => isEligible(type, r));
}
