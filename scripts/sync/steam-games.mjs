// 自动收录游戏：从 SteamSpy 榜单选出热门游戏，再用 Steam 商店公开接口取中文名、简介、类型、开发商、发售日期、
// 中文支持与系统要求，写入 data/auto/games/<id>.json。人工整理过的游戏（data/games）只用来补空缺字段。
//
// 用法：node scripts/sync/steam-games.mjs [--limit 20]
// 范围与频率在 config/sync.json 的 steam 段配置：每次最多新增 maxNewPerRun 款；已收录的超过 refreshDays 天才重新拉取。
import { config, getJson, readAuto, readHand, writeAuto, sleep, today, text, slugify } from './lib.mjs';
import { steamAppIdOf } from '../../src/lib/merge-auto.mjs';
import { applyGameName } from './zh-names.mjs';

const cfg = config().steam;
const limitArg = process.argv.indexOf('--limit');
const MAX_NEW = limitArg > 0 ? Number(process.argv[limitArg + 1]) : cfg.maxNewPerRun;
const FORCE = process.argv.includes('--force'); // 忽略刷新间隔，全部重新拉取（新增字段时用）

// Steam 类型编号 → 站内类型（src/lib/genre.ts）
const GENRE = { 1: 'action', 2: 'strategy', 3: 'rpg', 25: 'adventure', 28: 'simulation', 9: 'racing', 18: 'sports', 4: 'casual', 29: 'mmo', 23: 'indie' };
// 成人内容描述（Steam content_descriptors：3 成人内容、4 频繁暴力或血腥（不排除）——只排除 1 与 3）
const ADULT = new Set([1, 3]);

function zhSupportOf(langs = '') {
  const t = String(langs);
  const i = t.indexOf('简体中文');
  if (i < 0) return t.includes('繁体中文') ? 'traditional' : 'none';
  return /^简体中文\s*<strong>\*<\/strong>/.test(t.slice(i)) ? 'full-audio' : 'text';
}

/** 商店名去掉 ™ ® © 与整体包裹的书名号：「《战地风云™ 2042》」→「战地风云 2042」 */
const cleanName = (n = '') => n.replace(/[™®©]/g, '').replace(/^《(.+)》$/, '$1').replace(/\s+/g, ' ').trim();

function summaryOf(d) {
  let s = text(d.short_description || d.about_the_game || '').replace(/\s+/g, ' ');
  if (s.length > 140) { const cut = s.slice(0, 140); const end = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('！'), cut.lastIndexOf('.')); s = end > 60 ? cut.slice(0, end + 1) : cut + '…'; }
  return s;
}

/** 候选 appid：人工游戏 + 已自动收录的 + 榜单 + 额外指定 */
async function candidates(handApps, autoRecs) {
  const set = new Map(); // appid → 英文名（SteamSpy 提供）
  for (const a of handApps) set.set(a, null);
  for (const r of autoRecs.values()) if (r.steamAppId) set.set(String(r.steamAppId), r.name?.en ?? null);
  for (const list of cfg.lists) {
    const j = await getJson(`https://steamspy.com/api.php?request=${list}`);
    const n = Object.keys(j ?? {}).length;
    console.log(`  SteamSpy ${list}：${n ? n + " 款" : "获取失败（本次跳过该榜单）"}`);
    for (const v of Object.values(j ?? {})) set.set(String(v.appid), v.name);
    await sleep(1000);
  }
  for (let p = 0; p < (cfg.allPages ?? 0); p++) {
    const j = await getJson(`https://steamspy.com/api.php?request=all&page=${p}`);
    for (const v of Object.values(j ?? {})) set.set(String(v.appid), v.name);
    await sleep(61000); // SteamSpy 的 all 接口每分钟限 1 次
  }
  for (const a of cfg.extraAppIds ?? []) set.set(String(a), null);
  // 免费情报里的 Steam 游戏（热门免费、限时领取）也建档：免费卡片能点进档案，档案页能显示存档、配置、已知问题
  for (const o of [...readHand('offers'), ...readAuto('offers').values()]) {
    const a = o.steamAppId ?? /store\.steampowered\.com\/app\/(\d+)/.exec(o.url ?? '')?.[1];
    if (a && !set.has(String(a))) set.set(String(a), null);
  }
  for (const a of cfg.excludeAppIds ?? []) set.delete(String(a));
  return set;
}

async function details(appid, lang) {
  const j = await getJson(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=${lang}&cc=cn`);
  const v = j?.[appid];
  return v?.success ? v.data : null;
}

const hand = readHand('games');
const handByApp = new Map(hand.map((g) => [steamAppIdOf(g), g]).filter(([k]) => k));
const auto = readAuto('games');
const autoByApp = new Map([...auto.values()].map((r) => [String(r.steamAppId), r]));
const ids = new Set([...hand.map((g) => g.id), ...auto.keys()]);
const pool = await candidates([...handByApp.keys()], auto);
console.log(`候选 ${pool.size} 款（人工 ${handByApp.size}，已自动收录 ${auto.size}）`);

const stale = (r) => !r?._auto?.syncedAt || (Date.now() - Date.parse(r._auto.syncedAt)) / 864e5 > cfg.refreshDays;
let added = 0, updated = 0, skipped = 0, fetched = 0;
for (const [appid, spyName] of pool) {
  const existing = autoByApp.get(appid);
  if (existing && !FORCE && !stale(existing)) continue;
  if (!existing && added >= MAX_NEW) continue;
  const d = await details(appid, 'schinese');
  await sleep(cfg.requestIntervalMs);
  fetched++;
  // 成人内容过滤只用于从榜单自动发现的游戏：人工收录的主流大作（博德之门 3、赛博朋克 2077、巫师 3……）
  // 在 Steam 上也带「部分裸露」标记，不能因此拿不到配置要求和中文名
  const adult = !handByApp.has(appid) && (d?.content_descriptors?.ids ?? []).some((x) => ADULT.has(x));
  if (!d || d.type !== 'game' || adult) { skipped++; continue; }
  // 商店名本身是英文时就用它（SteamSpy 的名字可能是旧名，例如 CS:GO → CS2）
  // 英文版商店信息：英文名、英文简介、英文配置要求（中英切换用，官方原文，不做机器翻译）
  const de = await details(appid, 'english');
  await sleep(cfg.requestIntervalMs);
  let en = /^[ -~]+$/.test(d.name) ? d.name : de?.name ?? spyName ?? existing?.name?.en ?? d.name;
  const handGame = handByApp.get(appid);
  // id：人工已有同一款游戏时沿用其 id（合并时按 id / appid 对上）；否则用英文名，冲突时加 appid
  let id = handGame?.id ?? existing?.id ?? (slugify(en) || `steam-${appid}`);
  if (!handGame && !existing && ids.has(id)) id = `${id}-${appid}`;
  ids.add(id);
  const summary = summaryOf(d);
  if (!summary) { skipped++; continue; }
  const url = `https://store.steampowered.com/app/${appid}/`;
  const rec = {
    id, slug: id,
    name: { zh: cleanName(d.name), ...(en && cleanName(en) !== cleanName(d.name) ? { en: cleanName(en) } : {}) },
    summary,
    ...(de ? { summaryEn: summaryOf(de) } : {}),
    genres: [...new Set((d.genres ?? []).map((g) => GENRE[g.id]).filter(Boolean))],
    os: [d.platforms?.windows && 'windows', d.platforms?.mac && 'macos', d.platforms?.linux && 'linux'].filter(Boolean),
    channels: [{
      platform: 'steam', type: d.is_free ? 'free' : 'buy', url,
      ...(d.is_free ? { priceNote: '免费开玩' } : d.price_overview?.final_formatted ? { priceNote: `参考价 ${d.price_overview.final_formatted}` } : {}),
      linkHealth: 'ok', checkedAt: today(),
    }],
    steamAppId: Number(appid),
    developers: d.developers ?? [],
    publishers: d.publishers ?? [],
    releaseDate: d.release_date?.coming_soon ? `即将推出（${d.release_date.date}）` : d.release_date?.date ?? '',
    zhSupport: zhSupportOf(d.supported_languages),
    requirements: { minimum: text(d.pc_requirements?.minimum ?? ''), recommended: text(d.pc_requirements?.recommended ?? '') },
    ...(de ? { requirementsEn: { minimum: text(de.pc_requirements?.minimum ?? ''), recommended: text(de.pc_requirements?.recommended ?? '') } } : {}),
    sources: [{ name: 'Steam 商店', url }],
    reviewStatus: 'unverified',
    checkedAt: today(), createdAt: today(), updatedAt: today(),
    publishStatus: 'published',
    _auto: { source: 'steam', syncedAt: new Date().toISOString(), ...(existing?._auto?.pcgw ? { pcgw: existing._auto.pcgw } : {}) },
  };
  // PCGamingWiki 同步写入的字段（存档 / 配置位置、已知问题）原样保留，Steam 同步只更新自己负责的字段
  for (const k of ['savePaths', 'configPaths', 'issues']) if (existing?.[k]) rec[k] = existing[k];
  if (existing?.sources) for (const s of existing.sources) if (!rec.sources.some((x) => x.url === s.url)) rec.sources.push(s);
  applyGameName(rec);
  if (writeAuto('games', rec)) existing ? updated++ : added++;
  if (fetched % 25 === 0) console.log(`  已请求 ${fetched}：新增 ${added}，更新 ${updated}，跳过 ${skipped}`);
}
console.log(`Steam 游戏同步完成：新增 ${added}，更新 ${updated}，跳过 ${skipped}（非游戏 / 成人内容 / 无简介）`);
