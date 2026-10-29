// 自动收录资源入口：为没有资源条目的游戏生成 data/auto/entries/<gameId>-<siteId>-<type>.json
// 来源：
//   1. Nexus Mods：https://data.nexusmods.com/file/nexus-data/games.json（mods >= 20）
//   2. Thunderstore：https://thunderstore.io/api/experimental/community/
//   3. Steam 创意工坊：Steam appdetails 的 categories 里有 id 30
//   4. PCGamingWiki：_auto.pcgw.page
//   5. SteamDB：所有有 Steam appid 的游戏
//
// 人工条目优先，同游戏、同站点、同类型或同 URL 时跳过自动条目（见 src/lib/merge-auto.mjs）。
// 用法：node scripts/sync/game-entries.mjs
import { readHand, readAuto, writeAuto, today, sleep, getJson } from './lib.mjs';
import { mergeAuto, steamAppIdOf } from '../../src/lib/merge-auto.mjs';

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

console.log('开始同步游戏资源入口...');

// 1. 加载游戏与已有的人工条目
const handGames = readHand('games');
const autoGames = [...readAuto('games').values()];
const merged = mergeAuto({ games: handGames }, { games: autoGames });
const games = merged.games;

const handEntries = readHand('entries');
const handKey = (e) => `${e.gameId}|${e.siteId}|${e.type}`;
const handKeys = new Set(handEntries.map(handKey));
const handUrls = new Set(handEntries.map((e) => e.url));

// 2. 获取 Nexus Mods 列表
console.log('  拉取 Nexus Mods 游戏列表...');
const nexusData = await getJson('https://data.nexusmods.com/file/nexus-data/games.json');
const nexusMap = new Map();
if (Array.isArray(nexusData)) {
  for (const g of nexusData) {
    if (g.mods >= 20) {
      if (g.name) nexusMap.set(norm(g.name), g);
      if (g.domain_name) nexusMap.set(norm(g.domain_name), g);
    }
  }
}
console.log(`  Nexus Mods 匹配库就绪（mods >= 20）：${nexusMap.size / 2 | 0} 款`);

// 3. 获取 Thunderstore 社区列表
console.log('  拉取 Thunderstore 社区列表...');
const tsMap = new Map();
let tsUrl = 'https://thunderstore.io/api/experimental/community/';
let tsCount = 0;
while (tsUrl) {
  const res = await getJson(tsUrl);
  if (!res?.results) break;
  for (const c of res.results) {
    if (c.name) tsMap.set(norm(c.name), c);
    if (c.identifier) tsMap.set(norm(c.identifier), c);
    tsCount++;
  }
  tsUrl = res.pagination?.next_link;
}
console.log(`  Thunderstore 社区列表就绪：${tsCount} 个`);

// 4. 查询 Steam 创意工坊支持（categories 包含 id 30）
console.log('  查询 Steam 创意工坊支持...');
const appids = [...new Set(games.map((g) => steamAppIdOf(g) || g.steamAppId).filter(Boolean).map(String))];
const workshopAppIds = new Set();
for (let i = 0; i < appids.length; i += 50) {
  const batch = appids.slice(i, i + 50);
  const input = {
    ids: batch.map((a) => ({ appid: Number(a) })),
    context: { language: 'schinese', country_code: 'CN' },
    data_request: { include_categories: true },
  };
  const res = await getJson(`https://api.steampowered.com/IStoreBrowseService/GetItems/v1/?input_json=${encodeURIComponent(JSON.stringify(input))}`);
  const items = res?.response?.store_items || [];
  for (const it of items) {
    if (it.categories?.feature_categoryids?.includes(30)) {
      workshopAppIds.add(String(it.id));
    }
  }
  await sleep(1000);
}
console.log(`  Steam 创意工坊匹配就绪：${workshopAppIds.size} 款`);

// 5. 为每款游戏生成候选资源入口
let written = 0, skipped = 0;
const checkDate = today();

for (const game of games) {
  const appid = steamAppIdOf(game) || (game.steamAppId ? String(game.steamAppId) : null);
  const zh = game.name?.zh || game.name;
  const en = game.name?.en || zh;
  const candidates = [];

  // 来源 1：Nexus Mods
  const nexusMatch = [en, game.slug, ...(game.aliases || [])]
    .filter(Boolean)
    .map((n) => nexusMap.get(norm(n)))
    .find(Boolean);
  if (nexusMatch) {
    candidates.push({
      id: `${game.id}-nexus-mods-mod`,
      name: `${zh} Nexus Mods 专区`,
      nameEn: `${en} on Nexus Mods`,
      type: 'mod',
      siteId: 'nexus-mods',
      gameId: game.id,
      url: `https://www.nexusmods.com/${nexusMatch.domain_name}`,
      note: `Nexus 上的 MOD 专区，共 ${nexusMatch.mods.toLocaleString()} 个 MOD`,
      noteEn: `Nexus Mods hub with ${nexusMatch.mods.toLocaleString()} mods`,
      linkHealth: 'ok',
      checkedAt: checkDate,
      publishStatus: 'published',
      reviewStatus: 'unverified',
    });
  }

  // 来源 2：Thunderstore
  const tsMatch = [en, game.slug, ...(game.aliases || [])]
    .filter(Boolean)
    .map((n) => tsMap.get(norm(n)))
    .find(Boolean);
  if (tsMatch) {
    candidates.push({
      id: `${game.id}-thunderstore-mod`,
      name: `${zh} Thunderstore 社区 MOD`,
      nameEn: `${en} on Thunderstore`,
      type: 'mod',
      siteId: 'thunderstore',
      gameId: game.id,
      url: `https://thunderstore.io/c/${tsMatch.identifier}/`,
      note: '配合 r2modman 一键安装',
      noteEn: 'One-click install with r2modman',
      linkHealth: 'ok',
      checkedAt: checkDate,
      publishStatus: 'published',
      reviewStatus: 'unverified',
    });
  }

  // 来源 3：Steam 创意工坊
  if (appid && workshopAppIds.has(appid)) {
    candidates.push({
      id: `${game.id}-steam-mod`,
      name: `${zh} 创意工坊`,
      nameEn: `${en} Steam Workshop`,
      type: 'mod',
      siteId: 'steam',
      gameId: game.id,
      url: `https://steamcommunity.com/app/${appid}/workshop/`,
      note: 'Steam 内一键订阅，自动更新',
      noteEn: 'One-click subscribe and auto-update in Steam',
      linkHealth: 'ok',
      checkedAt: checkDate,
      publishStatus: 'published',
      reviewStatus: 'unverified',
    });
  }

  // 来源 4：PCGamingWiki
  if (game._auto?.pcgw?.page) {
    candidates.push({
      id: `${game.id}-pcgamingwiki-guide-page`,
      name: `${zh} 技术资料页`,
      nameEn: `${en} on PCGamingWiki`,
      type: 'guide-page',
      siteId: 'pcgamingwiki',
      gameId: game.id,
      url: `https://www.pcgamingwiki.com/wiki/${encodeURIComponent(game._auto.pcgw.page.replace(/ /g, '_'))}`,
      note: '存档与配置位置、画面设置、已知问题修复',
      noteEn: 'Save/config paths, display settings, and bug fixes',
      linkHealth: 'ok',
      checkedAt: checkDate,
      publishStatus: 'published',
      reviewStatus: 'unverified',
    });
  }

  // 来源 5：SteamDB
  if (appid) {
    candidates.push({
      id: `${game.id}-steamdb-other`,
      name: `${zh} 价格与版本史`,
      nameEn: `${en} on SteamDB`,
      type: 'other',
      siteId: 'steamdb',
      gameId: game.id,
      url: `https://steamdb.info/app/${appid}/`,
      note: '史低价格、更新补丁记录、在线人数',
      noteEn: 'All-time low price, update history, and player counts',
      linkHealth: 'ok',
      checkedAt: checkDate,
      publishStatus: 'published',
      reviewStatus: 'unverified',
    });
  }

  for (const c of candidates) {
    const key = `${c.gameId}|${c.siteId}|${c.type}`;
    if (handKeys.has(key) || handUrls.has(c.url)) {
      skipped++;
      continue;
    }
    if (writeAuto('entries', c)) {
      written++;
    }
  }
}

console.log(`资源入口同步完成：写入 ${written} 条，跳过人工已有 ${skipped} 条`);
