// 自动收录数据（data/auto/，由 scripts/sync/* 生成）与人工数据（data/）的合并规则——构建期与校验脚本共用。
//
// 规则：
//   · 游戏：自动记录与人工记录是同一款（id 相同，或 Steam appid 相同）时，人工记录为准，
//     自动记录只补人工没填的字段（存档位置、配置位置、开发商、发售日期、中文支持……）；否则作为新游戏加入。
//   · 免费情报：同一平台、同名的活动已有人工记录时，跳过自动记录。
//   · 免费情报没写 gameId、但 Steam appid 与某款游戏相同：自动关联到那款游戏（免费卡片能进档案，档案页知道它免费）。
//   · 资源入口：同一款游戏、同一站点、同一类型已有人工条目时，跳过自动条目。
//   · 其余集合（资源站、工具、教程）暂不自动收录。

/** 补空用的字段：人工记录里缺失（或为空数组）时才用自动数据填 */
const FILLABLE = ['savePaths', 'configPaths', 'os', 'genres', 'steamAppId', 'developers', 'publishers', 'releaseDate', 'zhSupport', 'requirements', 'aliases', 'issues', 'summaryEn', 'requirementsEn'];

/** 从商店链接里取 Steam appid */
export function steamAppIdOf(game) {
  if (game.steamAppId) return String(game.steamAppId);
  for (const c of game.channels ?? []) {
    const m = /store\.steampowered\.com\/app\/(\d+)/.exec(c.url ?? '');
    if (m) return m[1];
  }
  return null;
}

const empty = (v) => v == null || (Array.isArray(v) && v.length === 0) || v === '';
const norm = (s) => String(s ?? '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''); // 只比字母与数字：书名号、弯引号、破折号都不影响去重

/**
 * @param raw  { games: [], offers: [], ... } 人工数据
 * @param auto { games: [], offers: [] }       自动数据
 * @returns 合并后的新对象（不修改入参）
 */
export function mergeAuto(raw, auto) {
  const out = { ...raw };
  const games = (raw.games ?? []).map((g) => ({ ...g }));
  const byId = new Map(games.map((g) => [g.id, g]));
  const byApp = new Map(games.map((g) => [steamAppIdOf(g), g]).filter(([k]) => k));
  for (const a of auto.games ?? []) {
    const hand = byId.get(a.id) ?? byApp.get(steamAppIdOf(a));
    if (hand) {
      for (const k of FILLABLE) if (empty(hand[k]) && !empty(a[k])) hand[k] = a[k];
      // 补上的存档位置来自第三方百科：来源一并记上（署名要求）
      if (a.sources) for (const s of a.sources) if (!(hand.sources ?? []).some((x) => x.url === s.url)) hand.sources = [...(hand.sources ?? []), s];
      if (a._auto) hand._auto = { ...a._auto, merged: true };
    } else {
      games.push(a);
      byId.set(a.id, a);
    }
  }
  out.games = games;

  const handOffers = raw.offers ?? [];
  const appOf = (o) => o.steamAppId ?? /store\.steampowered\.com\/app\/(\d+)/.exec(o.url ?? '')?.[1];
  const gameIdByApp = new Map(games.map((g) => [steamAppIdOf(g), g.id]).filter(([k]) => k));
  out.offers = [...handOffers, ...(auto.offers ?? []).filter((a) => !handOffers.some((h) => h.platform === a.platform && norm(h.gameTitle) === norm(a.gameTitle)))]
    .map((o) => (o.gameId || !appOf(o) || !gameIdByApp.has(String(appOf(o))) ? o : { ...o, gameId: gameIdByApp.get(String(appOf(o))) }));

  const handEntries = raw.entries ?? [];
  const entryKey = (e) => `${e.gameId}|${e.siteId}|${e.type}`;
  const handKeys = new Set(handEntries.map(entryKey));
  out.entries = [...handEntries, ...(auto.entries ?? []).filter((e) => !handKeys.has(entryKey(e)) && !handEntries.some((h) => h.url === e.url))];
  return out;
}
