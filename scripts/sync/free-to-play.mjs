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
const chartOk = Array.isArray(ranks) && ranks.length > 0;
if (!chartOk) console.log('Steam 在玩榜单暂时不可用，跳过榜单部分（转免检测照常运行）');

const keep = new Set();
const chartWritten = new Set(); // 榜单部分写过的 id：在玩人数注记比目录的「免费开玩」信息量大，目录部分不覆盖
let written = 0, free = 0;
for (const { appid, rank } of chartOk ? ranks : []) {
  const id = `auto-f2p-${appid}`;
  if (handApps.has(String(appid))) continue;
  const d = (await getJson(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=schinese&cc=cn`))?.[appid]?.data;
  await sleep(1500);
  if (!d || d.type !== 'game' || !d.is_free || (d.content_descriptors?.ids ?? []).some((x) => ADULT.has(x))) continue;
  // 有的软件在 Steam 上也标成 game（OBS Studio 等）：带「实用工具 / 视频制作 / 设计」等软件类型（id 50–60）的排除
  if ((d.genres ?? []).some((g) => Number(g.id) >= 50 && Number(g.id) <= 60)) continue;
  free++;
  keep.add(id);
  chartWritten.add(id);
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

// —— 转免检测：站内目录里「通道已免费」的游戏 ——
// 付费转永久免费（转免）的游戏多数进不了在玩榜前 100，只靠榜单会漏。
// steam-games.mjs 刷新目录时已把商店页的 is_free 写进 channels[].type（最多落后 refreshDays 天），
// 这里直接复用：目录里 Steam 通道为 free、且没有人工记录的，补一条「永久免费」情报。
let converted = 0;
const catalogFree = new Map(); // appid → { zh, en }
for (const g of [...readHand('games'), ...readAuto('games').values()]) {
  const ch = (g.channels ?? []).find((c) => c.platform === 'steam');
  if (ch?.type !== 'free') continue;
  const appid = String(g.steamAppId ?? appOf(ch.url) ?? '');
  if (appid && !catalogFree.has(appid)) catalogFree.set(appid, { zh: g.name?.zh ?? '', en: g.name?.en ?? '' });
}
const existingOffers = readAuto('offers'); // 榜单部分写完后的快照，只读一次
for (const [appid, name] of catalogFree) {
  const id = `auto-f2p-${appid}`;
  if (handApps.has(appid)) continue;
  keep.add(id); // 目录确认仍免费就不下架，哪怕不在玩榜
  if (chartWritten.has(id)) continue; // 榜单部分已写过（在玩人数注记更好），不覆盖
  const cur = existingOffers.get(id);
  // 已有记录时只在一种情况下重写：它的注记还是「在玩人数前 N」，但本次榜单确认它已跌出——
  // 注记不更新就是失实。榜单不可用时无法判断跌出，一律不动已有记录（宁可滞后，不写错）。
  const staleChartNote = !!cur && chartOk && /在玩人数/.test(cur.claimNote ?? '');
  if (cur && !staleChartNote) continue;
  const gameTitle = name.en && name.zh && name.en !== name.zh ? `${name.en} ${name.zh}` : (name.zh || name.en);
  if (!gameTitle) continue;
  const rec = {
    id,
    gameTitle,
    ...(/[一-鿿]/.test(gameTitle) && !name.en ? { titleZh: name.zh } : /[一-鿿]/.test(name.zh) ? { titleZh: name.zh } : {}),
    type: 'permanent',
    platform: 'steam',
    url: `https://store.steampowered.com/app/${appid}/`,
    claimNote: '免费开玩',
    claimNoteEn: 'Free to play',
    steamAppId: appid,
    checkedAt: today(),
    linkHealth: 'ok',
    note: '来自站内目录收录游戏的商店页信息（含付费转免费），自动更新；游戏内可能有付费内容',
    createdAt: today(), updatedAt: today(),
    publishStatus: 'published',
  };
  applyOfferName(rec);
  if (writeAuto('offers', rec)) { written++; converted++; }
}

// 跌出榜单 / 不再免费的自动记录移除。
// 注意：榜单接口失败时 keep 不完整，跳过移除——宁可多留一天，不因一时网络问题误删。
let removed = 0;
if (chartOk) {
  for (const id of readAuto('offers').keys())
    if (id.startsWith('auto-f2p-') && !keep.has(id)) { rmSync(join(AUTO, 'offers', `${id}.json`)); removed++; }
} else console.log('  榜单不可用，本次不做下架清理');
console.log(`热门免费游戏同步完成：榜单中免费 ${free} 款，目录转免补录 ${converted} 款，写入 / 更新 ${written} 条，移除 ${removed} 条`);
