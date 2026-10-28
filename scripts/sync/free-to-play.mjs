// 自动收录热门免费游戏（F2P）：Steam 官方「当前最多人玩」榜单（ISteamChartsService/GetMostPlayedGames，前 100）
// 里免费开玩的游戏本体，写成「永久免费」情报，写入 data/auto/offers/auto-f2p-<appid>.json。
// 已有人工记录（同一 Steam appid）的跳过；跌出榜单或不再免费的自动记录会被移除。
// 不在 Steam 上的热门免费游戏（无畏契约、原神等）由人工维护在 data/offers/。
//
// 用法：node scripts/sync/free-to-play.mjs
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { AUTO, getJson, readAuto, readHand, writeAuto, today, sleep } from './lib.mjs';
import { applyOfferName } from './zh-names.mjs';

const ADULT = new Set([1, 3]);
const appOf = (u) => /store\.steampowered\.com\/app\/(\d+)/.exec(u ?? '')?.[1];
const handApps = new Set(readHand('offers').map((o) => o.steamAppId ?? appOf(o.url)).filter(Boolean).map(String));

const chart = await getJson('https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/');
const ranks = chart?.response?.ranks;
if (!Array.isArray(ranks) || !ranks.length) { console.log('Steam 在玩榜单暂时不可用，本次跳过（不影响已有数据）'); process.exit(0); }

const keep = new Set();
let written = 0, free = 0;
for (const { appid, rank } of ranks) {
  const id = `auto-f2p-${appid}`;
  if (handApps.has(String(appid))) continue;
  const d = (await getJson(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=schinese&cc=cn`))?.[appid]?.data;
  await sleep(1500);
  if (!d || d.type !== 'game' || !d.is_free || (d.content_descriptors?.ids ?? []).some((x) => ADULT.has(x))) continue;
  // 有的软件在 Steam 上也标成 game（OBS Studio 等）：带「实用工具 / 视频制作 / 设计」等软件类型（id 50–60）的排除
  if ((d.genres ?? []).some((g) => Number(g.id) >= 50 && Number(g.id) <= 60)) continue;
  free++;
  keep.add(id);
  const clean = (n) => String(n ?? '').replace(/[™®©]/g, '').replace(/^《(.+)》$/, '$1').trim();
  const title = clean(d.name);
  // 中文商店名之外再取英文名（中英切换用）：gameTitle 写成「英文名 中文名」，与人工整理的情报同一格式
  const enName = /[一-鿿]/.test(title) ? clean((await getJson(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=english&cc=us&filters=basic`))?.[appid]?.data?.name) : '';
  if (enName) await sleep(1500);
  const rec = {
    id,
    gameTitle: enName && enName !== title ? `${enName} ${title}` : title,
    ...(/[一-鿿]/.test(title) ? { titleZh: title } : {}),
    type: 'permanent',
    platform: 'steam',
    url: `https://store.steampowered.com/app/${appid}/`,
    claimNote: rank <= 20 ? '免费开玩 · Steam 在玩人数前 20' : '免费开玩 · Steam 在玩人数前 100',
    claimNoteEn: rank <= 20 ? 'Free to play · in Steam’s top 20 by players' : 'Free to play · in Steam’s top 100 by players',
    steamAppId: String(appid),
    checkedAt: today(),
    linkHealth: 'ok',
    note: '来自 Steam 官方「当前最多人玩」榜单，自动更新；游戏内可能有付费内容',
    createdAt: today(), updatedAt: today(),
    publishStatus: 'published',
  };
  applyOfferName(rec);
  if (writeAuto('offers', rec)) written++;
}

// 跌出榜单 / 不再免费的自动记录移除
let removed = 0;
for (const id of readAuto('offers').keys())
  if (id.startsWith('auto-f2p-') && !keep.has(id)) { rmSync(join(AUTO, 'offers', `${id}.json`)); removed++; }
console.log(`热门免费游戏同步完成：榜单前 ${ranks.length} 中免费 ${free} 款，写入 / 更新 ${written} 条，移除 ${removed} 条`);
