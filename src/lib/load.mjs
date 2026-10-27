// 数据加载：聚合 DATA_DIR 下各实体目录（M0a 验证模式）
// DATA_DIR 默认 'data'；测试构建注入 tests/fixtures-data（与正式数据隔离）
// _examples 与 pages 段不加载（docs/04 §7/§8.1）
import { DATA_DIR } from './config.mjs';
import { filterEligible } from './eligibility.mjs';
import { mergeAuto } from './merge-auto.mjs';

const COLLECTIONS = ['games', 'sites', 'entries', 'tools', 'guides', 'offers'];
const TYPE = { games: 'game', sites: 'site', entries: 'entry', tools: 'tool', guides: 'guide', offers: 'offer' };

export function loadData() {
  // import.meta.glob 只接受字面量；data 与 fixtures 两棵候选树，按 DATA_DIR 选择
  const prod = import.meta.glob('../../data/**/*.json', { eager: true });
  const test = import.meta.glob('../../tests/fixtures-data/**/*.json', { eager: true });
  const mods = DATA_DIR === 'data' ? prod : test;
  const prefix = DATA_DIR === 'data' ? '/data/' : '/fixtures-data/';

  const hand = Object.fromEntries(COLLECTIONS.map((c) => [c, []]));
  const auto = Object.fromEntries(COLLECTIONS.map((c) => [c, []]));
  for (const [path, mod] of Object.entries(mods)) {
    const parts = path.split(prefix)[1]?.split('/') ?? [];
    // data/auto/<集合>/ 是同步脚本生成的自动收录数据（见 merge-auto.mjs）
    const [bucket, seg] = parts[0] === 'auto' ? [auto, parts[1]] : [hand, parts[0]];
    if (!COLLECTIONS.includes(seg)) continue; // _examples / pages / 其他目录不加载
    bucket[seg].push(mod.default ?? mod);
  }
  const data = { raw: mergeAuto(hand, auto) };
  for (const [seg, t] of Object.entries(TYPE))
    data[seg] = filterEligible(t, data.raw[seg]);
  return data;
}

export function buildRelations(data) {
  const games = byId(data.games), sites = byId(data.sites);
  const rel = { entriesByGame: new Map(), gamesBySite: new Map(), entriesBySite: new Map(), toolsByGame: new Map(), guidesByGame: new Map(), offersByGame: new Map() };
  for (const e of data.entries) {
    if (!sites.has(e.siteId)) continue;
    push(rel.entriesBySite, e.siteId, e);
    if (e.gameId && games.has(e.gameId)) {
      push(rel.entriesByGame, e.gameId, e);
      push(rel.gamesBySite, e.siteId, games.get(e.gameId));
    }
  }
  for (const t of data.tools)
    for (const gid of t.supportedGames ?? []) if (games.has(gid)) push(rel.toolsByGame, gid, t);
  for (const g of data.guides)
    for (const gid of g.games ?? []) if (games.has(gid)) push(rel.guidesByGame, gid, g);
  for (const o of data.offers)
    if (o.gameId && games.has(o.gameId)) push(rel.offersByGame, o.gameId, o);
  return rel;
}

const byId = (rs) => new Map(rs.map((r) => [r.id, r]));
function push(m, k, v) { (m.get(k) ?? m.set(k, []).get(k)).push(v); }
