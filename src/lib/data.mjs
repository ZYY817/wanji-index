// 数据加载（Node/fs 版）—— 构建期在 Server Components / generateStaticParams 中调用
// DATA_DIR 默认 'data'；测试构建注入 tests/fixtures-data（与正式数据隔离）
// _examples 不加载；guides/*.md 同名长正文并入 rec.body
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_DIR, PROJECT_ROOT } from './config.mjs';
import { filterEligible } from './eligibility.mjs';

const COLLECTIONS = ['games', 'sites', 'entries', 'tools', 'guides', 'offers'];
const TYPE = { games: 'game', sites: 'site', entries: 'entry', tools: 'tool', guides: 'guide', offers: 'offer' };

/** @returns {any} 统一数据集合（TS 侧按 any 使用，结构由 schemas/ 约束） */
export function loadData() {
  const raw = Object.fromEntries(COLLECTIONS.map((c) => [c, []]));
  const root = join(PROJECT_ROOT, DATA_DIR);
  for (const coll of COLLECTIONS) {
    const dir = join(root, coll);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (f.endsWith('.json')) {
        try { raw[coll].push(JSON.parse(readFileSync(join(dir, f), 'utf8'))); }
        catch { /* 语法错误由 validate 层负责报告 */ }
      }
      // guides 的同名 .md 长正文
      if (coll === 'guides' && f.endsWith('.md')) {
        const slug = f.replace(/\.md$/, '');
        const rec = raw.guides.find((g) => g.slug === slug);
        if (rec) rec.body = readFileSync(join(dir, f), 'utf8');
      }
    }
  }
  const data = { raw };
  for (const [coll, t] of Object.entries(TYPE))
    data[coll] = filterEligible(t, raw[coll]);
  return data;
}

/** @returns {any} 反向关联 Map 集合 */
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

// Steam 封面：从渠道 URL 提取 appid → 官方 CDN header.jpg（合规热链，索引站惯例）
export function steamCover(game) {
  const ch = (game.channels ?? []).find((c) => c.platform === 'steam');
  const m = ch?.url?.match(/app\/(\d+)/);
  return m ? `https://steamcdn-a.akamaihd.net/steam/apps/${m[1]}/header.jpg` : null;
}
